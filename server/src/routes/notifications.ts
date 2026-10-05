import { Router } from 'express';
import { query } from '../db';

const router = Router();

// GET /api/notifications
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query; // Temporary auth
    if (!userId) return res.status(400).json({ success: false, error: { message: 'userId query parameter is required for now' } });

    const result = await query('SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

// PUT /api/notifications/:id/read
router.put('/:id/read', async (req, res) => {
  try {
    const result = await query('UPDATE notifications SET is_read = TRUE WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, error: { message: 'Notification not found' } });
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

export default router;
