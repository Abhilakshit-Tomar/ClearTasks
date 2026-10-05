import { Router } from 'express';
import { query } from '../db';

const router = Router();

// GET /api/users/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT id, clerk_user_id, name, email, avatar_url, created_at FROM users WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: { message: 'User not found' } });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

export default router;
