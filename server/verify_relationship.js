require('dotenv').config({ path: '../.env.local' });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
(async () => {
  const mRes = await pool.query('SELECT id, project_id, title FROM milestones LIMIT 3');
  console.log('MILESTONES:', mRes.rows);
  const tRes = await pool.query('SELECT id, project_id, milestone_id, title FROM tasks WHERE milestone_id IS NOT NULL LIMIT 5');
  console.log('TASKS:', tRes.rows);
  
  // Show the requested table format
  const query = `
    SELECT m.title as milestone, m.id as milestone_id, t.title as task, t.id as task_id, t.milestone_id as task_milestone_id 
    FROM tasks t
    JOIN milestones m ON t.milestone_id = m.id
    ORDER BY m.created_at DESC
    LIMIT 10
  `;
  const jRes = await pool.query(query);
  console.log('JOIN RESULTS:');
  console.table(jRes.rows);
  process.exit(0);
})();
