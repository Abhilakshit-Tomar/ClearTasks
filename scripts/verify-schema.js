// Read-only schema verification for the ClearTasks database.
// Loads credentials from .env.local; never prints connection strings.
// The default-value smoke test runs inside a transaction that is always rolled back.

require('dotenv').config({ path: '.env.local', quiet: true });
const { Client } = require('pg');

const EXPECTED_TABLES = [
  'users', 'projects', 'project_members', 'milestones',
  'tasks', 'task_dependencies', 'notifications',
];

const EXPECTED_INDEXES = [
  'idx_projects_created_by', 'idx_projects_status', 'idx_projects_deadline',
  'idx_project_members_project_id', 'idx_project_members_user_id',
  'idx_milestones_project_id', 'idx_milestones_due_date',
  'idx_tasks_project_id', 'idx_tasks_milestone_id', 'idx_tasks_assigned_to',
  'idx_tasks_status', 'idx_tasks_due_date',
  'idx_task_dependencies_task_id', 'idx_task_dependencies_depends_on_task_id',
  'idx_notifications_user_id', 'idx_notifications_project_id',
  'idx_notifications_task_id', 'idx_notifications_is_read',
];

let failures = 0;
const check = (ok, label) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}`);
  if (!ok) failures++;
};

async function main() {
  const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL(_UNPOOLED) not set in .env.local');

  const client = new Client({ connectionString: url });
  await client.connect();

  const { rows: [info] } = await client.query(
    'SELECT current_database() AS db, version() AS version'
  );
  check(true, `Connected to database "${info.db}" (${info.version.split(' on ')[0]})`);

  // Tables
  const { rows: tables } = await client.query(
    `SELECT table_name FROM information_schema.tables
     WHERE table_schema = 'public' AND table_type = 'BASE TABLE'`
  );
  const tableNames = tables.map((r) => r.table_name);
  for (const t of EXPECTED_TABLES) check(tableNames.includes(t), `table ${t}`);
  const extra = tableNames.filter((t) => !EXPECTED_TABLES.includes(t) && t !== 'pgmigrations');
  check(extra.length === 0, `no unexpected tables${extra.length ? ` (found: ${extra.join(', ')})` : ''}`);

  // Constraints
  const { rows: cons } = await client.query(
    `SELECT conrelid::regclass::text AS tbl, conname, contype,
            pg_get_constraintdef(oid) AS def
     FROM pg_constraint
     WHERE connamespace = 'public'::regnamespace AND conrelid::regclass::text <> 'pgmigrations'
     ORDER BY tbl, contype, conname`
  );
  for (const t of EXPECTED_TABLES) {
    check(cons.some((c) => c.tbl === t && c.contype === 'p'), `primary key on ${t}`);
  }
  const fks = cons.filter((c) => c.contype === 'f');
  console.log(`\nForeign keys (${fks.length}):`);
  fks.forEach((c) => console.log(`  ${c.tbl}: ${c.def}`));
  check(fks.length === 13, 'expected 13 foreign keys');

  const uniques = cons.filter((c) => c.contype === 'u');
  console.log(`\nUnique constraints (${uniques.length}):`);
  uniques.forEach((c) => console.log(`  ${c.tbl}: ${c.def}`));
  const hasUnique = (tbl, cols) => uniques.some((c) => c.tbl === tbl && c.def === `UNIQUE (${cols})`);
  check(hasUnique('users', 'clerk_user_id'), 'UNIQUE users(clerk_user_id)');
  check(hasUnique('users', 'email'), 'UNIQUE users(email)');
  check(hasUnique('project_members', 'project_id, user_id'), 'UNIQUE project_members(project_id, user_id)');
  check(hasUnique('task_dependencies', 'task_id, depends_on_task_id'), 'UNIQUE task_dependencies(task_id, depends_on_task_id)');
  check(
    cons.some((c) => c.tbl === 'task_dependencies' && c.contype === 'c' && c.def.includes('<>')),
    'CHECK task_dependencies task_id <> depends_on_task_id'
  );

  // Indexes
  const { rows: idx } = await client.query(
    `SELECT indexname FROM pg_indexes WHERE schemaname = 'public'`
  );
  const idxNames = idx.map((r) => r.indexname);
  console.log('');
  for (const i of EXPECTED_INDEXES) check(idxNames.includes(i), `index ${i}`);

  // No password-like columns
  const { rows: pw } = await client.query(
    `SELECT table_name, column_name FROM information_schema.columns
     WHERE table_schema = 'public' AND column_name ILIKE '%pass%'`
  );
  check(pw.length === 0, 'no password columns');

  // Default smoke test (rolled back — leaves no data behind)
  console.log('');
  await client.query('BEGIN');
  try {
    const { rows: [u] } = await client.query(
      `INSERT INTO users (clerk_user_id, name, email)
       VALUES ('verify_tmp', 'Verify', 'verify_tmp@example.invalid')
       RETURNING id, created_at, updated_at`
    );
    check(/^[0-9a-f-]{36}$/.test(u.id), 'users.id UUID default works');
    check(u.created_at instanceof Date && u.updated_at instanceof Date, 'timestamp defaults work');

    const { rows: [p] } = await client.query(
      `INSERT INTO projects (name, description, deadline, created_by, team_size)
       VALUES ('Verify', 'tmp', CURRENT_DATE, $1, 1) RETURNING id, status`, [u.id]
    );
    check(p.status === 'ACTIVE', 'projects.status default ACTIVE');

    const { rows: [t] } = await client.query(
      `INSERT INTO tasks (project_id, created_by, title, phase)
       VALUES ($1, $2, 'Verify', 'Planning') RETURNING id, status, priority`, [p.id, u.id]
    );
    check(t.status === 'TODO' && t.priority === 'MEDIUM', 'tasks status/priority defaults');

    await client.query('SAVEPOINT self_dep');
    let blocked = false;
    try {
      await client.query(
        'INSERT INTO task_dependencies (task_id, depends_on_task_id) VALUES ($1, $1)', [t.id]
      );
    } catch { blocked = true; }
    await client.query('ROLLBACK TO SAVEPOINT self_dep');
    check(blocked, 'self-dependency rejected');
  } finally {
    await client.query('ROLLBACK');
  }

  await client.end();
  console.log(`\n${failures === 0 ? 'ALL CHECKS PASSED' : `${failures} CHECK(S) FAILED`}`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error('Verification error:', err.message);
  process.exit(1);
});
