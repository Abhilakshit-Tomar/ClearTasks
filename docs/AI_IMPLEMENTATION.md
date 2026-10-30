# Planning integration and application validation

ClearTasks uses Google Gemini through `@google/genai` to propose and refine project plans. The integration sits inside a user-controlled workflow: collect a brief, generate a draft, validate it, present it for review, and create records after confirmation.

## Runtime responsibilities

| Responsibility | Implementation |
|---|---|
| Collect the goal, deadline, team names and preferences | User input in [CreateProjectFlow.tsx](../frontend/src/pages/projects/create/CreateProjectFlow.tsx) and its form steps. |
| Propose task descriptions, allocation and a schedule | Gemini generation through [ai.ts](../server/src/routes/ai.ts). |
| Construct the planning contract and check the candidate | Application code in [planning.ts](../server/src/ai/planning.ts) and [schema.ts](../server/src/ai/schema.ts). |
| Decide whether to refine or confirm | The coordinator's review actions. |
| Create the project, profiles, tasks and milestones | A separate request handled by [projects.ts](../server/src/routes/projects.ts). |
| Track current work and calculate progress | Task APIs and frontend [summary helpers](../frontend/src/lib/studio.ts). |

Gemini is called by the two planning endpoints. Workspace reads, status updates, progress calculations and invitations use their own application logic and stored records.

## Planning endpoints

- `POST /api/ai/analyze` accepts the title, description, team size, deadline and planned team profiles.
- `POST /api/ai/improve-plan` also accepts the existing plan and the coordinator's refinement requirements.

[Request validators](../server/src/utils/validators.ts) check the input shape. `buildPlanningRequest` adds available planning days, exact assignee names and planning rules. The backend requests structured JSON using the response schema.

The candidate includes `projectType`, `difficulty`, `estimatedTasks`, `timelineDays`, `modules`, `phases`, `milestones` and `assignments`. Each task includes its description, priority, estimated hours, prerequisites, planned owner, milestone and relative start/due days.

## Application-owned quality checks

`validateProjectPlan` runs TypeScript checks against the candidate:

- Required fields, task counts, unique titles and milestone IDs.
- Concrete task outcomes and descriptions containing a deliverable, steps and completion criteria.
- Exact matches to supplied team names and consistent assignment entries.
- Existing prerequisite and milestone references, dependency cycles and prerequisite timing.
- Task and milestone dates within the planning horizon and deadline.
- Estimated effort within task windows and assumed member capacity.
- Conflicting allocations that exceed capacity within scheduled dates.

The capacity rule currently assumes two focused hours per person per day. These calculations check the model's candidate using application code. See [planning.ts](../server/src/ai/planning.ts) for the rules and graph traversal.

## Correction, fallback and cancellation

[generateWithFallback](../server/src/routes/ai.ts#L28) allows one correction attempt per model when parsing or validation fails. It supplies the issues and previous candidate to the next attempt. Provider failures move directly to the next configured model. Attempts share a 50-second budget, with each provider request capped at 20 seconds or the remaining budget.

The model list uses `GEMINI_MODEL` when supplied, then the fallback names declared in `ai.ts`. A missing `GEMINI_API_KEY` returns a configuration error. Exhausted or invalid generation returns an error to the interface, where the draft can be retained for retry. This is a provider/model fallback flow; there is no production `generateFallbackPlan` that silently creates a generic replacement project.

The frontend API combines its timeout with the caller's cancellation signal. Returning to editing aborts the browser's pending request. These controls are in [api.ts](../frontend/src/services/api.ts) and [CreateProjectFlow.tsx](../frontend/src/pages/projects/create/CreateProjectFlow.tsx).

## Human confirmation and persistence

Generation and refinement return draft JSON. They do not create project records. The coordinator reviews the proposed work and chooses whether to proceed to final confirmation.

Confirmation calls `POST /api/projects`. A backend transaction creates the project, owner membership, team profiles, milestones and tasks. It maps temporary names and milestone identifiers to database IDs and converts relative due days into dates.

The confirmation flow currently omits generated dependency links, and relative start days are not stored as dedicated task fields. The relevant follow-up is to persist this planning information alongside existing tasks.

## Configuration and verification

- `GEMINI_API_KEY`: backend planning credential.
- `GEMINI_MODEL`: optional first model; fallback names are defined in the route.
- `npm test --prefix server`: 12 planning regression tests, including validation, correction, provider fallback and time budgets.
- `npm test --prefix frontend`: 17 API, summary and team-identity tests.

Planning tests use controlled provider responses. Legacy `server/test-*.ts` and `server/test-*.js` probes are separate from `server/tests/planning.test.ts`; some reflect earlier provider experiments. The [main README](../README.md) describes the rest of the application engineering and user workflow.
