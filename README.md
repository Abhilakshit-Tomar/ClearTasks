# ClearTasks

**AI Assisted Project Planning and Task Management for Student Teams**

[Live application](https://cleartasks-eny.pages.dev) · [Source repository](https://github.com/Abhilakshit-Tomar/ClearTasks)

ClearTasks helps a student team turn a project brief into a plan, review responsibilities and track the work that follows. It combines guided planning with a persistent project workspace, task tracking, milestones, invitations and calculated progress.

Gemini proposes an initial plan or a requested revision. Application code validates the proposal, manages review and confirmation, saves project records and calculates ongoing project state. Team members carry out the actual project work and update their tasks themselves.

## Project design and contributions

This is an individual academic project by **Abhilakshit Tomar** for **Usability Design of Software Applications**.

My contributions include:

- Designing the system architecture and the boundaries between the frontend, authentication, API, planning service and database.
- Defining the rules for how the AI should construct a useful plan, including project constraints, named owners, practical task descriptions and feasible schedules.
- Adding team invitations so planned profiles can be connected to real accounts.
- Adding the generation fallback flow for provider failures and invalid planning responses.
- Designing the UI/UX approach, including staged setup, review before confirmation, workspace navigation and responsive task views.

React, Express, PostgreSQL, Clerk and Google's Gemini SDK provide the underlying tools and services. The application-specific work connects them through the workflows and rules below.

## Division of work

| Responsibility | How it works in ClearTasks |
|---|---|
| User decisions | The coordinator enters the brief, deadline and team profiles, reviews the allocation, requests refinements and confirms the project. |
| AI assistance | Gemini suggests phases, tasks, estimated effort, owners, dependencies and milestones during generation or refinement. |
| Application automation | TypeScript and SQL handle validation, state transitions, record creation, account/profile linking, progress, overdue detection, sorting and recovery. |
| Team execution | Members perform their project's research, design, coding, writing or other work, then record task status in the workspace. |

Normal task reads, status changes, progress calculations, milestone summaries and team views use application APIs and stored records. They do not call Gemini. The two AI endpoints are `POST /api/ai/analyze` and `POST /api/ai/improve-plan`.

## Main workflow

1. Sign in and open the project directory.
2. Enter a project brief, deadline and team size.
3. Add planned members, skills and preferences, and identify the owner.
4. Request a plan. The server checks the response before showing it.
5. Review tasks, owners and dates; request improvements if needed.
6. Confirm the plan. A separate API request creates the persistent workspace.
7. Invite teammates, perform the work and update task statuses.
8. Use the overview, task board and milestones to follow progress.

Generation produces a draft. **The coordinator's confirmation creates the project records.**

## Application engineering and automation

| Implemented behaviour | Application logic | Source |
|---|---|---|
| Guided creation and draft recovery | Explicit creation steps, session-storage drafts, cancellation and confirmation locks. | [CreateProjectFlow.tsx](frontend/src/pages/projects/create/CreateProjectFlow.tsx) |
| Planning quality checks | Schema validation, unique titles, known owners, valid references, dependency-cycle detection and deadline checks. | [planning.ts](server/src/ai/planning.ts), [schema.ts](server/src/ai/schema.ts) |
| Effort and scheduling checks | Checks effort against task windows and assumed member capacity; detects overlapping allocations that exceed capacity. | [validateProjectPlan](server/src/ai/planning.ts#L154) |
| Bounded correction and fallback | One correction attempt per model for invalid candidates, provider/model fallback and a shared generation time budget. | [generateWithFallback](server/src/routes/ai.ts#L28) |
| Project creation | A database transaction creates the project, owner membership, profiles, milestones and tasks; maps temporary names/IDs to records and converts due-day offsets to dates. | [projects.ts](server/src/routes/projects.ts#L53) |
| Progress and attention indicators | Counts completed work, calculates percentages, identifies overdue tasks, orders upcoming work and derives project health. | [studio.ts](frontend/src/lib/studio.ts), [ProjectDashboard.tsx](frontend/src/pages/projects/ProjectDashboard.tsx) |
| Milestone and workload summaries | Groups related tasks, calculates completion and displays assigned/completed work for members. | [Milestones.tsx](frontend/src/pages/milestones/Milestones.tsx), [ProjectDashboard.tsx](frontend/src/pages/projects/ProjectDashboard.tsx) |
| Invitations and member identity | Stores invitation state, connects accepted profiles to users and remaps tasks; preserves useful planned names and skills. | [invitations.ts](server/src/routes/invitations.ts), [team.ts](frontend/src/lib/team.ts) |
| Data fetching and recovery | Authenticated requests, timeouts, cancellation, readable errors, periodic refresh and retention of the last successful response. | [api.ts](frontend/src/services/api.ts), [useRemoteData.ts](frontend/src/hooks/useRemoteData.ts) |
| Direct task interaction | Manual task creation, status updates, search, filters, board/list views and pending-state guards. | [TaskBoard.tsx](frontend/src/pages/tasks/TaskBoard.tsx), [TaskDetailsPage.tsx](frontend/src/pages/tasks/TaskDetailsPage.tsx) |

The scheduling validator currently assumes two focused hours per person per day. This is a planning rule rather than measured member availability.

### A concrete example

For a campus garden project, Gemini can propose research, mapping, budgeting and proposal tasks. The coordinator decides whether the plan fits the brief. Students still inspect the site, compare species, obtain prices and prepare the proposal themselves.

When members mark six of ten tasks as `DONE`, the application calculates `round(6 / 10 × 100) = 60%`. An unfinished task becomes overdue when its due date is before the local current day. Both results come from program logic and stored task data.

## Technology and data

- **Frontend:** React, TypeScript, React Router, Vite, Tailwind CSS and Radix UI components.
- **Backend:** Node.js, Express, Zod and the `pg` PostgreSQL client.
- **Authentication:** Clerk components and backend session middleware.
- **Planning provider:** Google Gemini through `@google/genai`.
- **Database:** PostgreSQL, with [SQL migrations](migrations) for nine application tables.

The database stores users, projects, memberships, planned profiles, tasks, dependencies, milestones, invitations and notifications. The frontend exchanges JSON with Express. The server calls Gemini for planning requests and PostgreSQL for persistent application operations.

## Run locally

Use Node.js/npm, PostgreSQL and your own Clerk and Gemini configuration. The frontend test script uses Node's built-in TypeScript stripping.

From the repository root, install the locked dependencies:

```sh
npm ci
npm ci --prefix frontend
npm ci --prefix server
```

Configure these environment variables:

| Location | Variables |
|---|---|
| Root `.env.local`, loaded by the backend database module | `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY`, `GEMINI_API_KEY` |
| Optional backend configuration | `GEMINI_MODEL`, `PORT` (default `5000`), `APP_URL` (frontend URL for invitation redirects) |
| `frontend/.env.local` | `VITE_CLERK_PUBLISHABLE_KEY`, `VITE_API_BASE_URL` (locally, `http://localhost:5000/api`) |

Use credentials for your own services; environment files are excluded from version control. Create the schema from the root:

```sh
npm run migrate:up
```

Start the API and frontend in separate terminals:

```sh
npm run dev --prefix server
```

```sh
npm run dev --prefix frontend
```

For production builds, run `npm run build --prefix frontend` and `npm run build --prefix server`. The frontend build is in `frontend/dist/`; the compiled server starts with `npm start --prefix server`.

## Verification and demonstration

```sh
npm test --prefix frontend
npm test --prefix server
```

The suites contain **17 frontend tests** and **12 backend planning tests**. During report preparation, all 29 passed. Coverage includes API handling, summaries, dates, member identity, planning constraints, correction, fallback and time budgets. The planning tests use controlled provider responses.

To explore the interface with local sample data:

```sh
npm run preview:fixtures --prefix frontend
```

Open `http://127.0.0.1:5180/dashboard?case=demo&fixture=normal`. This separate compiler renders application components with in-memory sample data and a test authentication adapter. Use the regular development server to check real Clerk, database and Gemini integration. More scenarios are in the [frontend verification guide](frontend/tests/README.md).

## Current follow-up work

Generated dependencies are validated during planning but are not yet persisted by confirmation. Consistent resource-membership checks, background-change announcements, field-specific server errors and participant usability testing are further work. Workspace data currently refreshes through HTTP polling; automatic deadline-notification delivery is also a follow-up.

## Further documentation

- [Frontend guide](frontend/README.md)
- [Current planning integration and validation](docs/AI_IMPLEMENTATION.md)
- [Planning contract and rules](docs/AI_PLANNING.md)
- [Automated frontend tests and preview scenarios](frontend/tests/README.md)
- [Backend planning regression tests](server/tests/planning.test.ts)

The [technical specification](docs/TECHNICAL_SPECIFICATION.md) retains the original design proposal. The current integration description is in `docs/AI_IMPLEMENTATION.md`.
