-- Up Migration

-- 1. project_team_profiles
CREATE TABLE project_team_profiles (
    id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id       UUID         NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
    display_name     VARCHAR(200) NOT NULL,
    description      TEXT,
    skills           TEXT,
    experience_level VARCHAR(100),
    preferred_work   VARCHAR(100),
    linked_user_id   UUID         REFERENCES users (id) ON DELETE SET NULL,
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_project_team_profiles_project_id ON project_team_profiles (project_id);

-- 2. project_invitations
CREATE TABLE project_invitations (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id      UUID         NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
    team_profile_id UUID         NOT NULL REFERENCES project_team_profiles (id) ON DELETE CASCADE,
    email           VARCHAR(255) NOT NULL,
    token           VARCHAR(255) NOT NULL UNIQUE,
    invited_by      UUID         NOT NULL REFERENCES users (id),
    expires_at      TIMESTAMPTZ  NOT NULL,
    accepted_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_project_invitations_token ON project_invitations (token);

-- 3. Update tasks table to support assigned_profile_id
ALTER TABLE tasks ADD COLUMN assigned_profile_id UUID REFERENCES project_team_profiles (id) ON DELETE SET NULL;
CREATE INDEX idx_tasks_assigned_profile_id ON tasks (assigned_profile_id);

-- Down Migration
ALTER TABLE tasks DROP COLUMN IF EXISTS assigned_profile_id;
DROP TABLE IF EXISTS project_invitations;
DROP TABLE IF EXISTS project_team_profiles;