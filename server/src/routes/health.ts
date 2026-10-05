import { Router } from 'express';
import { query } from '../db';

const router = Router();

router.get('/', async (req, res) => {
  try {
    await query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    console.error('Database connection failed:', error);
    res.status(503).json({ status: 'error', database: 'disconnected' });
  }
});

export default router;
