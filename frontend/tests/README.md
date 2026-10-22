# Studio verification

Run `npm test` from `frontend/` for regression tests against the actual project-summary helpers and API service. The API tests use an ephemeral local HTTP server; they never use the project database.

Run `npm run preview:fixtures` for a **separate local-only test compiler** at `http://127.0.0.1:5180/dashboard`. It renders the real application components, aliases Clerk only in this compiler, and serves isolated in-memory API fixtures. The production Vite configuration and authentication remain unchanged.

Start a fresh case with `?case=unique-name&fixture=normal`. Supported fixture modes: `normal`, `empty`, `error`, `retry`, `slow`, `status-error`, `summary-error`, `create-error`, `team-connected`. Query values persist in the tab's session storage so navigation keeps the same test case. In-memory request counts are available at `/api/__stats?case=unique-name` to check repeated-submission guards.

The `team-connected` scenario uses the real flat member-response shape and a linked profile whose account name is an email fallback. Verify the planned name and skills remain visible after connection and that member cards render no email address. Identity regression tests run with the rest of `npm test`.

Check the real Clerk sign-in, reset-password, and verification views on the normal development server, not the fixture compiler. Do not submit real invitations or destructive actions during visual QA.
