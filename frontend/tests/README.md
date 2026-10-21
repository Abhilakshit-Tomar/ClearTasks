# Studio verification

Run `npm test` from `frontend/` for regression tests against the actual project-summary helpers and API service. The API tests use an ephemeral local HTTP server; they never use the project database.

Run `npm run preview:fixtures` for a **separate local-only test compiler** at `http://127.0.0.1:5180/dashboard`. It renders the real application components, aliases Clerk only in this compiler, and serves isolated in-memory API fixtures. The production Vite configuration and authentication remain unchanged.

Start a fresh case with `?case=unique-name&fixture=normal`. Supported fixture modes: `normal`, `empty`, `error`, `retry`, `slow`, `status-error`, `summary-error`, `create-error`. Query values persist in the tab's session storage so navigation keeps the same test case. In-memory request counts are available at `/api/__stats?case=unique-name` to check repeated-submission guards.

Check the real Clerk sign-in, reset-password, and verification views on the normal development server, not the fixture compiler. Do not submit real invitations or destructive actions during visual QA.
