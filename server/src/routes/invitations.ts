import { Router } from 'express';
import { query } from '../db';
import { z } from 'zod';
import { clerkClient, getAuth } from '@clerk/express';

const router = Router();

const inviteSchema = z.object({
  projectId: z.string().uuid(),
  teamProfileId: z.string().uuid(),
  email: z.string().email(),
});

// POST /api/invitations
router.post('/', async (req, res) => {
  try {
    const parsed = inviteSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { message: 'Invalid data', details: parsed.error.issues } });
    
    const { projectId, teamProfileId, email } = parsed.data;
    const userId = req.dbUser!.id;

    // Verify ownership
    const memberCheck = await query(`SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2`, [projectId, userId]);
    if (memberCheck.rows.length === 0 || memberCheck.rows[0].role !== 'OWNER') {
      return res.status(403).json({ success: false, error: { message: 'Forbidden: Requires OWNER role' }});
    }

    // Create Clerk Invitation
    const redirectUrl = process.env.APP_URL ? `${process.env.APP_URL}/accept-invitation?email=${encodeURIComponent(email)}` : `http://localhost:5173/accept-invitation?email=${encodeURIComponent(email)}`;
    
    // Check if the user is already a member of the project
    const existingMemberCheck = await query(`
      SELECT pm.id FROM project_members pm
      JOIN users u ON pm.user_id = u.id
      WHERE pm.project_id = $1 AND u.email = $2
    `, [projectId, email]);
    if (existingMemberCheck.rows.length > 0) {
      return res.status(400).json({ success: false, error: { message: 'Already a member of this project.' }});
    }

    // Check if there is already a pending invitation for this project/team profile/email
    const existingInviteCheck = await query(`
      SELECT id FROM project_invitations
      WHERE project_id = $1 AND team_profile_id = $2 AND email = $3 AND accepted_at IS NULL AND expires_at > CURRENT_TIMESTAMP
    `, [projectId, teamProfileId, email]);
    if (existingInviteCheck.rows.length > 0) {
      return res.status(400).json({ success: false, error: { message: 'An invitation is already pending for this team member.' }});
    }

    const clerkInv = await clerkClient.invitations.createInvitation({
      emailAddress: email,
      redirectUrl: redirectUrl,
      publicMetadata: {
        projectId,
        teamProfileId
      },
      ignoreExisting: true
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Approximation for Clerk's expiration

    // Insert into project_invitations, reusing the token column for the Clerk invitation ID
    const result = await query(
      `INSERT INTO project_invitations (project_id, team_profile_id, email, token, invited_by, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING token`,
      [projectId, teamProfileId, email, clerkInv.id, userId, expiresAt]
    );

    res.status(201).json({ success: true, token: result.rows[0].token });
  } catch (error: any) {
    console.error('Error creating invitation:', error.errors || error);
    res.status(500).json({ success: false, error: { message: error.errors?.[0]?.message || 'Internal server error' } });
  }
});

// GET /api/invitations/pending
router.get('/pending', async (req, res) => {
  try {
    const userEmail = req.dbUser!.email;
    
    // Find all pending invitations for this user's email
    const result = await query(`
      SELECT i.*, p.name as project_name, ptp.display_name, ptp.skills, ptp.preferred_work
      FROM project_invitations i
      JOIN projects p ON i.project_id = p.id
      JOIN project_team_profiles ptp ON i.team_profile_id = ptp.id
      WHERE i.email = $1 AND i.accepted_at IS NULL AND i.expires_at > CURRENT_TIMESTAMP
      ORDER BY i.created_at DESC
    `, [userEmail]);

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching pending invitations:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

// POST /api/invitations/accept (from ticket flow)
router.post('/accept', async (req, res) => {
  try {
    const userId = req.dbUser!.id;
    const userEmail = req.dbUser!.email;

    // Fetch user from Clerk to get publicMetadata
    const clerkUser = await clerkClient.users.getUser(getAuth(req).userId!);
    const { projectId, teamProfileId } = clerkUser.publicMetadata as any || {};

    await query('BEGIN');
    
    let invite;

    if (projectId && teamProfileId) {
      // Find the pending invitation that matches this email, projectId, and teamProfileId
      const result = await query(`
        SELECT * FROM project_invitations 
        WHERE project_id = $1 AND team_profile_id = $2 AND email = $3 FOR UPDATE
      `, [projectId, teamProfileId, userEmail]);

      if (result.rows.length === 0) {
        await query('ROLLBACK');
        return res.status(404).json({ success: false, error: { message: 'Invitation not found or unauthorized' } });
      }
      invite = result.rows[0];
    } else {
      // Fallback: If no metadata is present (e.g., existing signed-in user didn't consume ticket for signup),
      // lookup by email in the server-side invitation record.
      const result = await query(`
        SELECT * FROM project_invitations 
        WHERE email = $1 AND accepted_at IS NULL AND expires_at > CURRENT_TIMESTAMP FOR UPDATE
      `, [userEmail]);

      if (result.rows.length === 0) {
        await query('ROLLBACK');
        return res.status(404).json({ success: false, error: { message: 'No pending invitation found for this user.' } });
      } else if (result.rows.length > 1) {
        await query('ROLLBACK');
        return res.status(400).json({ success: false, error: { message: 'Multiple pending invitations found. Please accept them individually from the dashboard.' } });
      }
      invite = result.rows[0];
    }
    if (invite.accepted_at) {
      await query('ROLLBACK');
      return res.status(400).json({ success: false, error: { message: 'Invitation already accepted' } });
    }
    if (new Date(invite.expires_at) < new Date()) {
      await query('ROLLBACK');
      return res.status(400).json({ success: false, error: { message: 'Invitation expired' } });
    }

    // Mark accepted
    await query(`UPDATE project_invitations SET accepted_at = CURRENT_TIMESTAMP WHERE id = $1`, [invite.id]);

    // Link profile
    const profileUpdate = await query(`
      UPDATE project_team_profiles 
      SET linked_user_id = $1 
      WHERE id = $2 AND linked_user_id IS NULL
      RETURNING id
    `, [userId, invite.team_profile_id]);

    if (profileUpdate.rows.length > 0) {
      // Update task assignments
      await query(`
        UPDATE tasks 
        SET assigned_to = $1 
        WHERE assigned_profile_id = $2
      `, [userId, invite.team_profile_id]);
    }

    // Add to project_members
    await query(`
      INSERT INTO project_members (project_id, user_id, role) 
      VALUES ($1, $2, 'MEMBER')
      ON CONFLICT (project_id, user_id) DO NOTHING
    `, [invite.project_id, userId]);

    // Clear the metadata from Clerk so it can't be reused for other logic (optional, but good practice)
    try {
      await clerkClient.users.updateUser(getAuth(req).userId!, {
        publicMetadata: {
          ...clerkUser.publicMetadata,
          projectId: null,
          teamProfileId: null
        }
      });
    } catch (e) {
      console.error('Failed to clear metadata', e);
    }

    await query('COMMIT');

    res.json({ success: true, data: { projectId: invite.project_id } });
  } catch (error) {
    await query('ROLLBACK');
    console.error('Error accepting ticket invitation:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

// POST /api/invitations/:id/accept
router.post('/:id/accept', async (req, res) => {
  try {
    const inviteId = req.params.id;
    const userId = req.dbUser!.id;
    const userEmail = req.dbUser!.email;

    await query('BEGIN');

    // Only allow accepting if the invitation email matches the authenticated user's email
    const result = await query(`SELECT * FROM project_invitations WHERE id = $1 AND email = $2 FOR UPDATE`, [inviteId, userEmail]);
    if (result.rows.length === 0) {
      await query('ROLLBACK');
      return res.status(404).json({ success: false, error: { message: 'Invitation not found or unauthorized' } });
    }

    const invite = result.rows[0];
    if (invite.accepted_at) {
      await query('ROLLBACK');
      return res.status(400).json({ success: false, error: { message: 'Invitation already accepted' } });
    }
    if (new Date(invite.expires_at) < new Date()) {
      await query('ROLLBACK');
      return res.status(400).json({ success: false, error: { message: 'Invitation expired' } });
    }

    // Mark accepted
    await query(`UPDATE project_invitations SET accepted_at = CURRENT_TIMESTAMP WHERE id = $1`, [invite.id]);

    // Link profile - ensuring it hasn't been linked to someone else already
    const profileUpdate = await query(`
      UPDATE project_team_profiles 
      SET linked_user_id = $1 
      WHERE id = $2 AND linked_user_id IS NULL
      RETURNING id
    `, [userId, invite.team_profile_id]);

    if (profileUpdate.rows.length === 0) {
      // It was either deleted or already linked.
      // We will still add them to the project, but we can't link the profile.
    } else {
      // Update task assignments associated with the profile
      await query(`
        UPDATE tasks 
        SET assigned_to = $1 
        WHERE assigned_profile_id = $2
      `, [userId, invite.team_profile_id]);
    }

    // Add to project_members (ignore if already member)
    await query(`
      INSERT INTO project_members (project_id, user_id, role) 
      VALUES ($1, $2, 'MEMBER')
      ON CONFLICT (project_id, user_id) DO NOTHING
    `, [invite.project_id, userId]);

    // Optionally revoke the Clerk invitation so it can't be reused, though our DB is the source of truth
    try {
      if (invite.token.startsWith('inv_')) {
        await clerkClient.invitations.revokeInvitation(invite.token);
      }
    } catch (err) {
      console.error('Failed to revoke clerk invitation, ignoring', err);
    }

    await query('COMMIT');

    res.json({ success: true, data: { projectId: invite.project_id } });
  } catch (error) {
    await query('ROLLBACK');
    console.error('Error accepting invitation:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

export default router;
