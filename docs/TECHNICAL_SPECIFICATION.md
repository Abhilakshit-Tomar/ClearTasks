# ClearTasks Technical Specification

## 1. Product Overview
ClearTasks is a lightweight, AI-powered task distribution and project management application tailored primarily for student group projects. 
The core objective is to answer: *"Who is doing what, and are we on track?"*

The application simplifies project planning for student teams, avoiding the steep learning curves of tools like Jira or Notion. It leverages AI to generate initial project plans, tasks, and milestones based on minimal user input. The app is responsive and designed to work seamlessly across desktop, tablet, and mobile browsers.

## 2. User Flow
The primary user flow for project creation and management is:
1. Landing Page
2. Sign Up / Login
3. All Projects Dashboard
4. Create New Project
5. Basic Project Information (Input)
6. AI Analysis (Loading/Progress state)
7. Initial AI Plan (Review)
8. Optional: "Improve My Plan"
9. AI Analysis — Improving Plan (Loading/Progress state)
10. Improved AI Plan (Review)
11. Review & Confirm
12. Project Created Success
13. Open New Project
14. Individual Project Dashboard

## 3. Figma Screen Mapping
The application will directly reproduce the approved Figma design (source of truth):
- Landing Page
- Sign Up
- Login
- Dashboard / All Projects
- Create Project
- AI Analysis
- Initial AI Plan
- Improve My Plan
- AI Analysis — Improving Plan
- Improved AI Plan
- Review & Confirm
- Project Created Success
- Project Dashboard / All Projects (Individual workspace)
- Task Board
- Task Details
- Team
- Milestones
- Notifications
- Settings
- Alerts & Popups

## 4. Functional Requirements
- **Project Creation:** Users provide minimal input (Title, Functionalities/Description, Team Size, Deadline). AI infers project type, difficulty, modules, phases, tasks, and milestones.
- **AI Plan Improvement:** Users can provide optional inputs (team skills, preferred technologies, instructor requirements, advanced features) to refine and rebalance the AI-generated plan.
- **Multiple Projects:** A user can participate in multiple projects. The "All Projects Dashboard" acts as a portfolio/overview.
- **Individual Project Workspace:** Displays project status, progress (calculated dynamically from tasks), deadlines, milestones, and task summaries.
- **Task Board:** Kanban-style board (TODO, IN PROGRESS, DONE) for task tracking.
- **Task Details:** Includes title, description, status, priority, assignee, due date, estimated hours, phase, milestone, and dependencies.
- **Team Management:** Track members, roles, skills, and preferred technologies.
- **Milestones:** Track project phases (e.g., Planning Complete, Development Complete) with statuses and due dates.
- **Notifications:** Alerts for task assignments, upcoming/overdue deadlines, project invitations, and milestone completions.

## 5. Database Architecture
Database: **PostgreSQL** (hosted on **Neon**).
Schema is pre-defined, utilizing `snake_case`, `UUID` primary keys (`gen_random_uuid()`), and `TIMESTAMP WITH TIME ZONE`.

**Tables:**
1. `users`: Stores user info (Clerk ID mapped). No passwords.
2. `projects`: Stores project metadata. Progress is calculated dynamically, not stored here.
3. `project_members`: Junction table (Many-to-Many) linking users and projects with roles.
4. `milestones`: Project milestones.
5. `tasks`: Core task data.
6. `task_dependencies`: Self-referencing M:M table for tasks.
7. `notifications`: User notifications.

**Relationships:**
- 1:M `users` -> `projects` (created_by)
- M:M `users` <-> `projects` (via `project_members`)
- 1:M `projects` -> `milestones`
- 1:M `projects` -> `tasks`
- 1:M `milestones` -> `tasks`
- 1:M `users` -> `tasks` (assigned_to, created_by)
- M:M `tasks` <-> `tasks` (via `task_dependencies`)
- 1:M `users` -> `notifications`
- 1:M `projects` -> `notifications`
- 1:M `tasks` -> `notifications`

## 6. Backend Architecture
Node.js + Express with TypeScript. A simple, layered architecture:
- `routes/`: Defines API endpoints and routes requests.
- `controllers/`: Handles HTTP requests/responses and maps data to services.
- `services/`: Contains core business logic (e.g., orchestrating AI calls, complex validations).
- `repositories/`: Abstracts database queries and `pg` driver interactions.
- `middleware/`: Handles authentication (Clerk), authorization, and error catching.
- `validators/`: Validates incoming request payloads.
- `types/`: Shared TypeScript definitions.
- `utils/`: Helper functions.

## 7. Frontend Architecture
React + TypeScript using Tailwind CSS, shadcn/ui, and Lucide icons.
- `components/`: Reusable UI elements (buttons, inputs, cards).
- `pages/`: Top-level route components representing Figma screens.
- `layouts/`: Shared wrappers (e.g., Sidebar + Topbar layout).
- `features/`: Domain-specific components (e.g., `TaskBoard`, `ProjectSettings`).
- `hooks/`: Custom React hooks for state and API data fetching.
- `services/`: API client wrappers for communicating with the Express backend.
- `types/`: Frontend TypeScript interfaces.
- `utils/` & `lib/`: Utility functions and configuration (e.g., shadcn utils).

## 8. API Specification
RESTful API design.

**Authentication:** Handled via Clerk middleware (no password endpoints).

**Projects:**
- `GET /api/projects`
- `POST /api/projects`
- `GET /api/projects/:id`
- `PUT /api/projects/:id`
- `DELETE /api/projects/:id`

**AI Project Planning:**
- `POST /api/projects/analyze`
- `POST /api/projects/improve-plan`

**Project Confirmation:**
- `POST /api/projects/:id/confirm`

**Tasks:**
- `GET /api/projects/:id/tasks`
- `POST /api/projects/:id/tasks`
- `GET /api/tasks/:id`
- `PUT /api/tasks/:id`
- `DELETE /api/tasks/:id`

**Team:**
- `GET /api/projects/:id/members`
- `POST /api/projects/:id/members`
- `PUT /api/projects/:id/members/:userId`
- `DELETE /api/projects/:id/members/:userId`

**Milestones:**
- `GET /api/projects/:id/milestones`
- `POST /api/projects/:id/milestones`
- `PUT /api/milestones/:id`
- `DELETE /api/milestones/:id`

**Notifications:**
- `GET /api/notifications`
- `PUT /api/notifications/:id/read`

## 9. AI Architecture
**Flow:** React Frontend → Express Backend → OpenAI API → Structured JSON → Backend Validation → PostgreSQL.
- The AI **never** accesses the database directly.
- The backend prompts OpenAI, enforces a JSON schema response, validates all data (e.g., checking logic, dates, placeholders), and prepares it for the frontend to review.
- The frontend AI Loading Screen uses a simulated progress UI based on backend generation states, not exact token processing metrics.

## 10. AI JSON Structure
Expected structured output from OpenAI:
```json
{
  "projectType": "string",
  "difficulty": "string",
  "estimatedTasks": "number",
  "timeline": "string",
  "modules": ["string"],
  "phases": ["string"],
  "milestones": [
    {
      "id": "placeholder_uuid",
      "title": "string",
      "description": "string",
      "dueDateOffsetDays": "number"
    }
  ],
  "tasks": [
    {
      "id": "placeholder_uuid",
      "title": "string",
      "description": "string",
      "phase": "string",
      "priority": "LOW|MEDIUM|HIGH",
      "estimatedHours": "number",
      "milestoneId": "placeholder_uuid"
    }
  ],
  "dependencies": [
    {
      "taskId": "placeholder_uuid",
      "dependsOnTaskId": "placeholder_uuid"
    }
  ],
  "assignments": [
    {
      "taskId": "placeholder_uuid",
      "roleOrSkillRequired": "string" 
    }
  ]
}
```
*(Note: Real user UUID mapping happens on the backend during the "Confirm" step based on frontend mapping).*

## 11. Authentication/Security Architecture
- **Auth:** Clerk handles user registration, login, and session tokens.
- **Middleware:** Backend verifies Clerk JWTs on protected routes.
- **Data Validation:** All incoming request bodies and parameters are validated (e.g., using Zod).
- **SQL Injection:** Parameterized queries via the `pg` library prevent SQLi.
- **Secrets:** DB credentials and OpenAI keys remain server-side via `.env` variables; never exposed to the frontend.
- **CORS:** Configured to strictly allow the frontend `CLIENT_URL`.
- **Errors:** Generic error messages are sent to the client; stack traces are logged internally.

## 12. Authorization Model
- **PROJECT OWNER:** Can create/edit the project, manage team members, create/edit/delete tasks, manage milestones, and confirm the AI plan.
- **PROJECT MEMBER:** Can view the project, view all tasks, update statuses of *assigned* tasks, view the team, and view milestones.

## 13. Loading, Error, and Empty States
- **Loading:** AI analysis (custom progress steps UI), project data fetching, task board rendering.
- **Empty:** "No active projects" (Dashboard), "No tasks in this phase" (Task board), "No unread notifications", "No team members added yet".
- **Error:** AI generation failure (timeout/rate limit), Database connection errors, Unauthorized access attempts, Form validation errors.
- **Success:** Project successfully created (redirects to dashboard), Task updated (toast/alert), Member invited successfully.

## 14. Responsive Behavior
- **Desktop:** Full sidebar navigation, multi-column Kanban board, grid layouts for project cards.
- **Tablet:** Collapsible sidebar, adjusted grid sizes.
- **Mobile:** Sidebar converts to a bottom nav or hamburger menu. Task board becomes vertically stacked or uses horizontal swipe for columns. Dialogs convert to full-screen or bottom sheets.

## 15. Project Folder Structure
```text
ClearTasks/
├── frontend/             # React + Vite + TypeScript
│   ├── public/
│   └── src/
│       ├── components/
│       ├── features/
│       ├── hooks/
│       ├── layouts/
│       ├── lib/
│       ├── pages/
│       ├── services/
│       ├── types/
│       └── utils/
├── backend/              # Node.js + Express + TypeScript
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── repositories/
│       ├── routes/
│       ├── services/
│       ├── types/
│       ├── utils/
│       ├── validators/
│       ├── app.ts
│       └── server.ts
├── migrations/           # Database migration files (existing)
├── scripts/              # DB verifications (existing)
└── docs/                 # Documentation (TECHNICAL_SPECIFICATION.md)
```

## 16. Environment Variables
*(Do not commit actual values to version control)*
**Backend:**
- `DATABASE_URL` (Pooled connection for app queries)
- `DATABASE_URL_UNPOOLED` (For migrations)
- `CLERK_SECRET_KEY`
- `OPENAI_API_KEY`
- `CLIENT_URL` (Frontend URL for CORS)
- `PORT`

**Frontend:**
- `VITE_CLERK_PUBLISHABLE_KEY`
- `VITE_API_BASE_URL`

## 17. Development Phases
1. **Frontend Project Setup:** Init React/Vite, Tailwind, shadcn, routing.
2. **Backend Express Setup:** Init server, basic structure, error handling.
3. **Database Connection:** Connect `pg` pool to Neon using existing schema.
4. **Authentication:** Integrate Clerk on frontend and backend middleware.
5. **Project APIs:** Basic CRUD for projects.
6. **Frontend Project Flow:** UI for Dashboard and Project Creation forms.
7. **AI Project Analysis:** Integrate OpenAI service, generate structured plans.
8. **AI Plan Improvement:** UI and logic for refining the AI plan.
9. **Task Management:** Kanban board UI, Task CRUD APIs.
10. **Team Management:** Member lists, roles, and invitation UI/API.
11. **Milestones:** UI and APIs for tracking project milestones.
12. **Notifications:** System alerts for assignments/deadlines.
13. **Responsive Polish:** Final mobile/tablet adjustments.
14. **Testing:** End-to-end flows.
15. **Deployment:** Pushing to production environments.

## 18. Deployment Architecture
- **Frontend:** Vercel (Auto-deploys from Git, seamless environment variables).
- **Backend:** Render or Heroku (Simple Node.js hosting).
- **Database:** Neon PostgreSQL (Already provisioned).

## 19. Technical Decisions
- **No ORM:** Using raw SQL queries with `pg` to keep the architecture simple, transparent, and aligned precisely with the existing schema.
- **Clerk:** Offloads the complexity of password hashing, session management, and JWTs.
- **Lightweight:** Avoiding Redis, Kubernetes, or microservices to maintain a manageable scope appropriate for a college project.

## 20. Assumptions and Open Questions
- **OPEN DECISION:** How are users invited to a project? (e.g., generating a unique join link, searching by email, or entering a project code).
- **OPEN DECISION:** Real-time updates. WebSockets are excluded for now; the UI will rely on state updates, refetching, or polling (if necessary) to show task changes.
- **OPEN DECISION:** How strictly does the frontend enforce the AI's "placeholder" assignments before actual users join the team? (e.g., mapping "Frontend Developer" task to a real user during or after project creation).
- **Assumption:** The AI loading UI uses a deterministic timer/step-sequence on the frontend while waiting for the single OpenAI HTTP request to resolve, rather than a true streaming progress socket.
