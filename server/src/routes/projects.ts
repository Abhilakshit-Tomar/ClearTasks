import { Router } from 'express';
import { query, getClient } from '../db';
import { projectSchema, projectUpdateSchema, projectMemberSchema, taskSchema, milestoneSchema } from '../utils/validators';
import { z } from 'zod';

const router = Router();

// GET /api/projects
router.get('/', async (req, res) => {
  try {
    const userId = req.dbUser!.id;
    
    let sql = `
      SELECT DISTINCT p.* 
      FROM projects p
      LEFT JOIN project_members pm ON p.id = pm.project_id
      WHERE p.created_by = $1 OR pm.user_id = $1
      ORDER BY p.created_at DESC
    `;
    const params: any[] = [userId];

    const result = await query(sql, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

// GET /api/projects/:id
router.get('/:id', async (req, res) => {
  try {
    const userId = req.dbUser!.id;
    const result = await query(
      `SELECT DISTINCT p.* 
       FROM projects p
       LEFT JOIN project_members pm ON p.id = pm.project_id
       WHERE p.id = $1 AND (p.created_by = $2 OR pm.user_id = $2)`, 
      [req.params.id, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: { message: 'Project not found or unauthorized' } });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});



router.post('/', async (req, res) => {
  const client = await getClient();
  try {
    req.body.created_by = req.dbUser!.id; // Inject authenticated user before validation

    const parsed = projectSchema.safeParse(req.body);
    if (!parsed.success) {
      console.error('Validation failed:', parsed.error.issues);
      return res.status(400).json({ success: false, error: { message: 'Invalid data', details: parsed.error.issues } });
    }

    const data = parsed.data;

    await client.query('BEGIN');
    
    const projectResult = await client.query(
      `INSERT INTO projects (name, description, project_type, difficulty, status, deadline, created_by, team_size, preferred_technologies, instructor_requirements, advanced_features)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [
        data.name, 
        data.description, 
        data.project_type || null, 
        data.difficulty || null, 
        data.status, 
        data.deadline, 
        data.created_by, 
        data.team_size, 
        data.preferred_technologies || null, 
        data.instructor_requirements || null, 
        data.advanced_features || null
      ]
    );
    const project = projectResult.rows[0];

    let ownerSkills = null;
    let ownerPreferredTech = null;
    if (data.teamProfiles && Array.isArray(data.teamProfiles)) {
      const ownerProfile = data.teamProfiles.find((p: any) => p.isOwner);
      if (ownerProfile) {
        ownerSkills = ownerProfile.skills || null;
        ownerPreferredTech = ownerProfile.preferredWork || null;
      }
    }

    // Auto-add creator as OWNER
    await client.query(
      `INSERT INTO project_members (project_id, user_id, role, skills, preferred_technologies) VALUES ($1, $2, 'OWNER', $3, $4)`,
      [project.id, data.created_by, ownerSkills, ownerPreferredTech]
    );

    // Insert team profiles if provided
    const profileIdMap: Record<string, string> = {};
    if (data.teamProfiles && Array.isArray(data.teamProfiles)) {
      for (const profile of data.teamProfiles) {
        const isOwnerProfile = profile.isOwner === true;
        const linkedUserId = isOwnerProfile ? data.created_by : null;

        const result = await client.query(
          `INSERT INTO project_team_profiles (project_id, display_name, description, skills, experience_level, preferred_work, linked_user_id)
           VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
          [project.id, profile.displayName, profile.description || null, profile.skills || null, profile.experienceLevel || null, profile.preferredWork || null, linkedUserId]
        );
        profileIdMap[profile.displayName] = result.rows[0].id;
      }
    }

    // Insert milestones if provided
    const milestoneIdMap: Record<string, string> = {};
    const startDate = new Date();
    // Use end of day for deadline
    const deadlineDate = new Date(`${data.deadline}T23:59:59Z`);

    if (req.body.milestones && Array.isArray(req.body.milestones)) {
      for (const m of req.body.milestones) {
        let mDateStr = data.deadline;
        
        // Coerce relativeDay to number if it's a string, or check properly
        const relDay = Number(m.relativeDay);
        if (!isNaN(relDay)) {
          let mDate = new Date(startDate);
          mDate.setDate(mDate.getDate() + relDay);
          if (mDate > deadlineDate) mDate = deadlineDate;
          mDateStr = mDate.toISOString().split('T')[0];
        }

        const parsedM = milestoneSchema.safeParse({
          title: m.title ? String(m.title).substring(0, 200) : 'Untitled Milestone',
          description: m.description,
          due_date: mDateStr,
          status: 'PENDING'
        });
        if (!parsedM.success) {
          console.error('MILESTONE VALIDATION FAILED:', parsedM.error);
          throw new Error('Milestone validation failed: ' + JSON.stringify(parsedM.error.issues));
        }
        const mResult = await client.query(
          `INSERT INTO milestones (project_id, title, description, due_date, status) VALUES ($1, $2, $3, $4, $5) RETURNING id`,
          [project.id, parsedM.data.title, parsedM.data.description || null, parsedM.data.due_date, parsedM.data.status]
        );
        if (m.id) {
          milestoneIdMap[m.id] = mResult.rows[0].id;
        }
      }
    }

    // Insert tasks if provided
    if (req.body.tasks && Array.isArray(req.body.tasks)) {
      for (const t of req.body.tasks) {
        let tDateStr = data.deadline;
        const relDue = Number(t.relativeDueDay);
        if (!isNaN(relDue)) {
          let tDate = new Date(startDate);
          tDate.setDate(tDate.getDate() + relDue);
          if (tDate > deadlineDate) tDate = deadlineDate;
          tDateStr = tDate.toISOString().split('T')[0];
        }

        const parsedT = taskSchema.safeParse({
          milestone_id: t.milestoneId && milestoneIdMap[t.milestoneId] ? milestoneIdMap[t.milestoneId] : null,
          created_by: data.created_by,
          title: t.title ? String(t.title).substring(0, 200) : 'Untitled Task',
          description: t.description,
          phase: t.phase ? String(t.phase).substring(0, 100) : 'General',
          status: t.status || 'TODO',
          priority: t.priority || 'MEDIUM',
          due_date: tDateStr,
          estimated_hours: t.estimated_hours || 0,
          assignedToProfile: t.assignedToProfile,
        });
        if (!parsedT.success) {
          console.error('TASK VALIDATION FAILED:', parsedT.error, 'FOR TASK:', t);
          throw new Error('Task validation failed: ' + JSON.stringify(parsedT.error.issues));
        }

        let assignedProfileId = null;
        let assignedToUser = null;

        if (parsedT.data.assignedToProfile) {
          const profileName = parsedT.data.assignedToProfile;
          if (profileIdMap[profileName]) {
            assignedProfileId = profileIdMap[profileName];
            // Check if this profile was the owner's profile
            const profileData = data.teamProfiles?.find((p: any) => p.displayName === profileName);
            if (profileData && profileData.isOwner) {
              assignedToUser = data.created_by;
            }
          }
        }

        await client.query(
          `INSERT INTO tasks (project_id, milestone_id, created_by, title, description, phase, status, priority, due_date, estimated_hours, assigned_profile_id, assigned_to) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
          [project.id, parsedT.data.milestone_id, parsedT.data.created_by, parsedT.data.title, parsedT.data.description || null, parsedT.data.phase, parsedT.data.status, parsedT.data.priority, parsedT.data.due_date, parsedT.data.estimated_hours, assignedProfileId, assignedToUser]
        );
      }
    }

    await client.query('COMMIT');
    res.status(201).json({ success: true, data: project });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating project:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  } finally {
    client.release();
  }
});

// PUT /api/projects/:id
router.put('/:id', async (req, res) => {
  try {
    const parsed = projectUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { message: 'Invalid data', details: parsed.error.issues } });
    }

    const userId = req.dbUser!.id;
    const memberCheck = await query(`SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2`, [req.params.id, userId]);
    if (memberCheck.rows.length === 0 || memberCheck.rows[0].role !== 'OWNER') {
      return res.status(403).json({ success: false, error: { message: 'Forbidden: Requires OWNER role' }});
    }

    const updates = parsed.data;
    if (Object.keys(updates).length === 0) return res.json({ success: true, data: {} });

    const setCols = Object.keys(updates).map((k, i) => `${k} = $${i + 2}`).join(', ');
    const values = Object.values(updates);

    const result = await query(
      `UPDATE projects SET ${setCols}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      [req.params.id, ...values]
    );

    if (result.rows.length === 0) return res.status(404).json({ success: false, error: { message: 'Project not found' } });
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

// DELETE /api/projects/:id
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.dbUser!.id;
    const memberCheck = await query(`SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2`, [req.params.id, userId]);
    if (memberCheck.rows.length === 0 || memberCheck.rows[0].role !== 'OWNER') {
      return res.status(403).json({ success: false, error: { message: 'Forbidden: Requires OWNER role' }});
    }

    const result = await query('DELETE FROM projects WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, error: { message: 'Project not found' } });
    res.json({ success: true, data: { id: result.rows[0].id } });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

// GET members
router.get('/:id/members', async (req, res) => {
  try {
    const result = await query(`
      SELECT pm.*, u.name, u.email, u.avatar_url 
      FROM project_members pm
      JOIN users u ON pm.user_id = u.id
      WHERE pm.project_id = $1
    `, [req.params.id]);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

// POST members
router.post('/:id/members', async (req, res) => {
  try {
    const parsed = projectMemberSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { message: 'Invalid data' } });
    
    const d = parsed.data;
    const result = await query(
      `INSERT INTO project_members (project_id, user_id, role, skills, preferred_technologies)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.params.id, d.user_id, d.role, d.skills, d.preferred_technologies]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    if (error.code === '23505') return res.status(409).json({ success: false, error: { message: 'User is already a member' } });
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

// DELETE member
router.delete('/:id/members/:userId', async (req, res) => {
  try {
    const result = await query('DELETE FROM project_members WHERE project_id = $1 AND user_id = $2 RETURNING id', [req.params.id, req.params.userId]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, error: { message: 'Member not found' } });
    res.json({ success: true, data: { deleted: true } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

// GET tasks
router.get('/:id/tasks', async (req, res) => {
  try {
    const { status, assignedTo, milestoneId } = req.query;
    let sql = `
      SELECT t.*,
             row_to_json(u.*) as assignee,
             row_to_json(ptp.*) as planned_profile,
             row_to_json(m.*) as milestone
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      LEFT JOIN project_team_profiles ptp ON t.assigned_profile_id = ptp.id
      LEFT JOIN milestones m ON t.milestone_id = m.id
      WHERE t.project_id = $1
    `;
    const params: any[] = [req.params.id];
    let paramCount = 2;

    if (status) { sql += ` AND t.status = $${paramCount++}`; params.push(status); }
    if (assignedTo) { sql += ` AND t.assigned_to = $${paramCount++}`; params.push(assignedTo); }
    if (milestoneId) { sql += ` AND t.milestone_id = $${paramCount++}`; params.push(milestoneId); }

    sql += ' ORDER BY t.created_at DESC';
    const result = await query(sql, params);
    
    // We need to clean up the joined JSON
    const data = result.rows.map(row => ({
      ...row,
      assignee: row.assignee?.id ? row.assignee : undefined,
      planned_profile: row.planned_profile?.id ? row.planned_profile : undefined,
      milestone: row.milestone?.id ? row.milestone : undefined
    }));
    
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

// POST task
router.post('/:id/tasks', async (req, res) => {
  try {
    req.body.created_by = req.dbUser!.id; // Inject authenticated user before validation
    const parsed = taskSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { message: 'Invalid data', details: parsed.error.issues } });
    
    const d = parsed.data;
    const userId = req.dbUser!.id;
    const result = await query(
      `INSERT INTO tasks (project_id, milestone_id, assigned_to, created_by, title, description, phase, status, priority, due_date, estimated_hours)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [req.params.id, d.milestone_id, d.assigned_to, userId, d.title, d.description, d.phase, d.status, d.priority, d.due_date, d.estimated_hours]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

// GET milestones
router.get('/:id/milestones', async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        m.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', t.id,
              'title', t.title,
              'description', t.description,
              'status', t.status,
              'priority', t.priority,
              'estimated_hours', t.estimated_hours,
              'due_date', t.due_date,
              'assigned_profile_id', t.assigned_profile_id,
              'assigned_to', t.assigned_to,
              'assignee_name', u.name,
              'profile_name', ptp.display_name
            )
          ) FILTER (WHERE t.id IS NOT NULL), 
          '[]'
        ) as tasks
      FROM milestones m
      LEFT JOIN tasks t ON m.id = t.milestone_id
      LEFT JOIN users u ON t.assigned_to = u.id
      LEFT JOIN project_team_profiles ptp ON t.assigned_profile_id = ptp.id
      WHERE m.project_id = $1
      GROUP BY m.id
      ORDER BY m.due_date ASC
    `, [req.params.id]);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching milestones:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

// POST milestone
router.post('/:id/milestones', async (req, res) => {
  try {
    const parsed = milestoneSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { message: 'Invalid data' } });
    
    const d = parsed.data;
    const result = await query(
      `INSERT INTO milestones (project_id, title, description, due_date, status)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.params.id, d.title, d.description, d.due_date, d.status]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

// GET team profiles
router.get('/:id/team-profiles', async (req, res) => {
  try {
    const result = await query(`
      SELECT ptp.*,
             EXISTS (
               SELECT 1 FROM project_invitations pi 
               WHERE pi.team_profile_id = ptp.id 
                 AND pi.accepted_at IS NULL 
                 AND pi.expires_at > CURRENT_TIMESTAMP
             ) as has_pending_invitation
      FROM project_team_profiles ptp
      WHERE ptp.project_id = $1 
      ORDER BY ptp.created_at ASC
    `, [req.params.id]);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

export default router;
