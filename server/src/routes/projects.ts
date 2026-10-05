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

// POST /api/projects
router.get('/', async (req, res) => {
  // Already defined GET above, moving to POST
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

    // Auto-add creator as OWNER
    await client.query(
      `INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, 'OWNER')`,
      [project.id, data.created_by]
    );

    // Insert milestones if provided
    if (req.body.milestones && Array.isArray(req.body.milestones)) {
      for (const m of req.body.milestones) {
        await client.query(
          `INSERT INTO milestones (project_id, title, description, due_date, status) VALUES ($1, $2, $3, $4, $5)`,
          [project.id, m.title, m.description || null, data.deadline, 'PENDING']
        );
      }
    }

    // Insert tasks if provided
    if (req.body.tasks && Array.isArray(req.body.tasks)) {
      for (const t of req.body.tasks) {
        await client.query(
          `INSERT INTO tasks (project_id, created_by, title, description, phase, status, priority, estimated_hours) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [project.id, data.created_by, t.title, t.description || null, t.phase || 'General', t.status || 'TODO', t.priority || 'MEDIUM', t.estimated_hours || 0]
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
    let sql = 'SELECT * FROM tasks WHERE project_id = $1';
    const params: any[] = [req.params.id];
    let paramCount = 2;

    if (status) { sql += ` AND status = $${paramCount++}`; params.push(status); }
    if (assignedTo) { sql += ` AND assigned_to = $${paramCount++}`; params.push(assignedTo); }
    if (milestoneId) { sql += ` AND milestone_id = $${paramCount++}`; params.push(milestoneId); }

    sql += ' ORDER BY created_at DESC';
    const result = await query(sql, params);
    res.json({ success: true, data: result.rows });
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
    const result = await query('SELECT * FROM milestones WHERE project_id = $1 ORDER BY due_date ASC', [req.params.id]);
    res.json({ success: true, data: result.rows });
  } catch (error) {
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

export default router;
