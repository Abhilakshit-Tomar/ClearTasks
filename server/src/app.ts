import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Routes
import healthRouter from './routes/health';
import usersRouter from './routes/users';
import projectsRouter from './routes/projects';
import tasksRouter from './routes/tasks';
import milestonesRouter from './routes/milestones';
import notificationsRouter from './routes/notifications';

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json({ limit: '5mb' }));

app.use('/api/health', healthRouter);
app.use('/api/users', usersRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/milestones', milestonesRouter);
app.use('/api/notifications', notificationsRouter);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, error: { message: 'Internal server error' } });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: { message: 'Endpoint not found' } });
});

export default app;
