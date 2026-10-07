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
import aiRouter from './routes/ai';
import invitationsRouter from './routes/invitations';

import fs from 'fs';

if (fs.existsSync('.env.local')) {
  dotenv.config({ path: '.env.local' });
}
dotenv.config();

const app = express();

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json({ limit: '5mb' }));

import { clerkMiddleware, requireAuth } from '@clerk/express';
import { attachDbUser } from './middleware/auth';

app.use(clerkMiddleware());

app.use('/api/health', healthRouter);
app.use('/api/users', requireAuth(), attachDbUser, usersRouter);
app.use('/api/projects', requireAuth(), attachDbUser, projectsRouter);
app.use('/api/tasks', requireAuth(), attachDbUser, tasksRouter);
app.use('/api/milestones', requireAuth(), attachDbUser, milestonesRouter);
app.use('/api/notifications', requireAuth(), attachDbUser, notificationsRouter);
app.use('/api/ai', requireAuth(), attachDbUser, aiRouter);
app.use('/api/invitations', requireAuth(), attachDbUser, invitationsRouter);

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
