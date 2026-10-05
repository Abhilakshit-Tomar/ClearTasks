-- Up Migration

-- =====================================================================
-- ClearTasks — initial schema
-- UUID primary keys via built-in gen_random_uuid() (PostgreSQL 13+).
-- Status / role / priority / type values are enforced at application level.
-- =====================================================================

-- 1. users ------------------------------------------------------------
-- No password column: authentication is delegated to Clerk.
CREATE TABLE users (
    id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_user_id  VARCHAR(255) NOT NULL UNIQUE,
    name           VARCHAR(100) NOT NULL,
    email          VARCHAR(255) NOT NULL UNIQUE,
    avatar_url     TEXT,
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. projects ---------------------------------------------------------
-- status: ACTIVE | COMPLETED | ARCHIVED
-- Progress is NOT stored; it is derived from tasks (done / total * 100).
CREATE TABLE projects (
    id                       UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    name                     VARCHAR(200) NOT NULL,
    description              TEXT         NOT NULL,
    project_type             VARCHAR(100),
    difficulty               VARCHAR(30),
    status                   VARCHAR(30)  NOT NULL DEFAULT 'ACTIVE',
    deadline                 DATE         NOT NULL,
    created_by               UUID         NOT NULL REFERENCES users (id),
    team_size                INTEGER      NOT NULL,
    preferred_technologies   TEXT,
    instructor_requirements  TEXT,
    advanced_features        TEXT,
    created_at               TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at               TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_projects_created_by ON projects (created_by);
CREATE INDEX idx_projects_status     ON projects (status);
CREATE INDEX idx_projects_deadline   ON projects (deadline);

-- 3. project_members --------------------------------------------------
-- role: OWNER | MEMBER
CREATE TABLE project_members (
    id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id              UUID        NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
    user_id                 UUID        NOT NULL REFERENCES users (id)    ON DELETE CASCADE,
    role                    VARCHAR(30) NOT NULL DEFAULT 'MEMBER',
    skills                  TEXT,
    preferred_technologies  TEXT,
    joined_at               TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_project_members_project_user UNIQUE (project_id, user_id)
);

CREATE INDEX idx_project_members_project_id ON project_members (project_id);
CREATE INDEX idx_project_members_user_id    ON project_members (user_id);

-- 4. milestones -------------------------------------------------------
-- status: PENDING | IN_PROGRESS | COMPLETED
CREATE TABLE milestones (
    id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id   UUID         NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
    title        VARCHAR(200) NOT NULL,
    description  TEXT,
    due_date     DATE         NOT NULL,
    status       VARCHAR(30)  NOT NULL DEFAULT 'PENDING',
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_milestones_project_id ON milestones (project_id);
CREATE INDEX idx_milestones_due_date   ON milestones (due_date);

-- 5. tasks ------------------------------------------------------------
-- status:   TODO | IN_PROGRESS | DONE
-- priority: LOW | MEDIUM | HIGH
CREATE TABLE tasks (
    id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id       UUID          NOT NULL REFERENCES projects (id)   ON DELETE CASCADE,
    milestone_id     UUID          REFERENCES milestones (id)          ON DELETE SET NULL,
    assigned_to      UUID          REFERENCES users (id)               ON DELETE SET NULL,
    created_by       UUID          NOT NULL REFERENCES users (id),
    title            VARCHAR(200)  NOT NULL,
    description      TEXT,
    phase            VARCHAR(100)  NOT NULL,
    status           VARCHAR(30)   NOT NULL DEFAULT 'TODO',
    priority         VARCHAR(30)   NOT NULL DEFAULT 'MEDIUM',
    due_date         DATE,
    estimated_hours  DECIMAL(6, 2),
    created_at       TIMESTAMPTZ   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMPTZ   NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tasks_project_id   ON tasks (project_id);
CREATE INDEX idx_tasks_milestone_id ON tasks (milestone_id);
CREATE INDEX idx_tasks_assigned_to  ON tasks (assigned_to);
CREATE INDEX idx_tasks_status       ON tasks (status);
CREATE INDEX idx_tasks_due_date     ON tasks (due_date);

-- 6. task_dependencies ------------------------------------------------
-- Row means: task_id depends on depends_on_task_id.
-- Cycle detection beyond self-reference is handled by the backend.
CREATE TABLE task_dependencies (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id             UUID NOT NULL REFERENCES tasks (id) ON DELETE CASCADE,
    depends_on_task_id  UUID NOT NULL REFERENCES tasks (id) ON DELETE CASCADE,
    CONSTRAINT uq_task_dependencies_pair UNIQUE (task_id, depends_on_task_id),
    CONSTRAINT chk_task_dependencies_not_self CHECK (task_id <> depends_on_task_id)
);

CREATE INDEX idx_task_dependencies_task_id            ON task_dependencies (task_id);
CREATE INDEX idx_task_dependencies_depends_on_task_id ON task_dependencies (depends_on_task_id);

-- 7. notifications ----------------------------------------------------
-- type: TASK_ASSIGNED | TASK_DUE_SOON | TASK_OVERDUE |
--       PROJECT_INVITATION | MILESTONE_COMPLETED
CREATE TABLE notifications (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID         NOT NULL REFERENCES users (id)    ON DELETE CASCADE,
    project_id  UUID         REFERENCES projects (id)          ON DELETE CASCADE,
    task_id     UUID         REFERENCES tasks (id)             ON DELETE CASCADE,
    type        VARCHAR(50)  NOT NULL,
    title       VARCHAR(200) NOT NULL,
    message     TEXT         NOT NULL,
    is_read     BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user_id    ON notifications (user_id);
CREATE INDEX idx_notifications_project_id ON notifications (project_id);
CREATE INDEX idx_notifications_task_id    ON notifications (task_id);
CREATE INDEX idx_notifications_is_read    ON notifications (is_read);

-- Down Migration
-- WARNING: destructive. Only run intentionally via `npm run migrate:down`.

DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS task_dependencies;
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS milestones;
DROP TABLE IF EXISTS project_members;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS users;