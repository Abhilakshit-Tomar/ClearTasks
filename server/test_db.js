require('dotenv').config({path: '.env.local'}); 
const { Client } = require('pg'); 
const c = new Client({ connectionString: process.env.DATABASE_URL }); 
c.connect().then(() => 
  c.query('SELECT * FROM projects ORDER BY created_at DESC LIMIT 1').then(r => {
    console.log("PROJECT:", r.rows[0]); 
    return c.query('SELECT * FROM milestones WHERE project_id = $1', [r.rows[0].id]).then(m => { 
      console.log("MILESTONES:", m.rows); 
      return c.query('SELECT * FROM tasks WHERE project_id = $1', [r.rows[0].id]).then(t => { 
        console.log("TASKS COUNT:", t.rows.length); 
        console.log("FIRST TASK:", t.rows[0]);
        c.end(); 
      });
    });
  })
);
