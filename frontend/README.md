# ClearTasks frontend

The frontend provides guided planning and the shared project workspace. For the project purpose, developer contributions and system-wide setup, see the [main README](../README.md).

## User interactions

- Enter the project brief, deadline and team profiles through a staged form.
- Review a suggested plan, request refinements and confirm creation.
- Open project overviews, inspect tasks and change task statuses.
- Create tasks, search and filter the board, and switch between board and list views.
- Inspect milestones, workload, planned members and invitation states.
- Use the responsive task-card layout on narrow screens.

Gemini generation and refinement are requested through the backend. Progress calculations, overdue detection, sorting, draft storage, filters and status controls run as application logic.

## Implementation map

| Area | Main files |
|---|---|
| Routing and entry | [App.tsx](src/App.tsx), [main.tsx](src/main.tsx) |
| Planning state machine, draft retention and confirmation | [CreateProjectFlow.tsx](src/pages/projects/create/CreateProjectFlow.tsx) |
| Task interaction | [TaskBoard.tsx](src/pages/tasks/TaskBoard.tsx), [TaskDetailsPage.tsx](src/pages/tasks/TaskDetailsPage.tsx) |
| Calculated project state | [studio.ts](src/lib/studio.ts), [ProjectDashboard.tsx](src/pages/projects/ProjectDashboard.tsx) |
| Member display and profile identity | [team.ts](src/lib/team.ts), [Team.tsx](src/pages/team/Team.tsx) |
| API and refresh handling | [api.ts](src/services/api.ts), [useRemoteData.ts](src/hooks/useRemoteData.ts) |
| Feedback and controls | [Feedback.tsx](src/components/Feedback.tsx), [UI components](src/components/ui) |

## Development

From this directory:

```sh
npm ci
npm run dev
```

Set `VITE_CLERK_PUBLISHABLE_KEY` and `VITE_API_BASE_URL` in `frontend/.env.local`. For local development, the API URL is normally `http://localhost:5000/api`. Start Express separately as described in the main README.

```sh
npm test
npm run lint
npm run build
```

The 17 frontend regression tests exercise API handling, project-state calculations and member identity. For an isolated demonstration, run `npm run preview:fixtures`; see [preview scenarios](tests/README.md) for details.
