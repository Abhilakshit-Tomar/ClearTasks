import express from 'express';
import aiRouter from './src/routes/ai';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

const app = express();
app.use(express.json());
app.use('/api/ai', aiRouter);

const server = app.listen(5001, async () => {
  console.log('Test server running on port 5001');
  
  try {
    const res = await fetch('http://localhost:5001/api/ai/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectTitle: 'Test Project', description: 'Just testing', teamSize: 3, deadline: '2026-12-31' })
    });
    const data = await res.json();
    console.log('Result:', JSON.stringify(data, null, 2));
  } catch(e) {
    console.error('Fetch error:', e);
  } finally {
    server.close();
  }
});
