import { Router } from 'express';
import { query } from '../db';
import { taskUpdateSchema } from '../utils/validators';

const router = Router();

// GET /api/tasks/:id
router.get('/:id', async (req, res) => {
  try {
    const userId = req.dbUser!.id;
    const result = await query(
      `SELECT t.* FROM tasks t
       JOIN projects p ON t.project_id = p.id
       LEFT JOIN project_members pm ON p.id = pm.project_id
       WHERE t.id = $1 AND (p.created_by = $2 OR pm.user_id = $2)`,
      [req.params.id, userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ success: false, error: { message: 'Task not found or unauthorized' } });
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

// PUT /api/tasks/:id
router.put('/:id', async (req, res) => {
  try {
    const parsed = taskUpdateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { message: 'Invalid data' } });

    const updates = parsed.data;
    if (Object.keys(updates).length === 0) return res.json({ success: true, data: {} });

    const setCols = Object.keys(updates).map((k, i) => `${k} = $${i + 2}`).join(', ');
    const values = Object.values(updates);

    const userId = req.dbUser!.id;
    // verify authorization
    const authCheck = await query(
      `SELECT t.id FROM tasks t
       JOIN projects p ON t.project_id = p.id
       LEFT JOIN project_members pm ON p.id = pm.project_id
       WHERE t.id = $1 AND (p.created_by = $2 OR pm.user_id = $2)`,
      [req.params.id, userId]
    );
    if (authCheck.rows.length === 0) return res.status(403).json({ success: false, error: { message: 'Unauthorized' } });

    const result = await query(
      `UPDATE tasks SET ${setCols}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      [req.params.id, ...values]
    );

    if (result.rows.length === 0) return res.status(404).json({ success: false, error: { message: 'Task not found' } });
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await query('DELETE FROM tasks WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, error: { message: 'Task not found' } });
    res.json({ success: true, data: { id: result.rows[0].id } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

// GET /api/tasks/:taskId/dependencies
router.get('/:taskId/dependencies', async (req, res) => {
  try {
    const result = await query('SELECT * FROM task_dependencies WHERE task_id = $1', [req.params.taskId]);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

// POST /api/tasks/:taskId/dependencies
router.post('/:taskId/dependencies', async (req, res) => {
  try {
    const { depends_on_task_id } = req.body;
    if (!depends_on_task_id || req.params.taskId === depends_on_task_id) {
      return res.status(400).json({ success: false, error: { message: 'Invalid dependency' } });
    }

    const result = await query(
      'INSERT INTO task_dependencies (task_id, depends_on_task_id) VALUES ($1, $2) RETURNING *',
      [req.params.taskId, depends_on_task_id]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    if (error.code === '23505') return res.status(409).json({ success: false, error: { message: 'Dependency already exists' } });
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

// DELETE /api/tasks/:taskId/dependencies/:dependsOnTaskId
router.delete('/:taskId/dependencies/:dependsOnTaskId', async (req, res) => {
  try {
    const result = await query(
      'DELETE FROM task_dependencies WHERE task_id = $1 AND depends_on_task_id = $2 RETURNING id',
      [req.params.taskId, req.params.dependsOnTaskId]
    );
    if (result.rows.length === 0) return res.status(404).json({ success: false, error: { message: 'Dependency not found' } });
    res.json({ success: true, data: { deleted: true } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

export default router;
