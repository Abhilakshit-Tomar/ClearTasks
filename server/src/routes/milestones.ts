import { Router } from 'express';
import { query } from '../db';
import { milestoneUpdateSchema } from '../utils/validators';

const router = Router();

// PUT /api/milestones/:id
router.put('/:id', async (req, res) => {
  try {
    const parsed = milestoneUpdateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { message: 'Invalid data' } });

    const updates = parsed.data;
    if (Object.keys(updates).length === 0) return res.json({ success: true, data: {} });

    const setCols = Object.keys(updates).map((k, i) => `${k} = $${i + 2}`).join(', ');
    const values = Object.values(updates);

    const result = await query(
      `UPDATE milestones SET ${setCols}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      [req.params.id, ...values]
    );

    if (result.rows.length === 0) return res.status(404).json({ success: false, error: { message: 'Milestone not found' } });
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

// DELETE /api/milestones/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await query('DELETE FROM milestones WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, error: { message: 'Milestone not found' } });
    res.json({ success: true, data: { id: result.rows[0].id } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

export default router;
