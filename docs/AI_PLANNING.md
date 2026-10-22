# Practical AI planning

The shared prompt is in [planning.ts](../server/src/ai/planning.ts). Both initial analysis and plan refinement use it, with the existing REST and saved-task field names.

The prompt uses the project's actual domain, requested outcome, constraints, deadline, and exact planned team names. Tasks have an action-and-object title and descriptions containing **Deliverable**, **Steps**, and **Done when**. It asks for reviewable 1–8-hour pieces, realistic skill-based ownership, relevant verification and handover, explicit assumptions, and coverage of the supplied requirements. Unspecified availability uses a conservative two focused hours per person per day; this is a planning assumption, not measured team availability.

[The response schema](../server/src/ai/schema.ts) requires every task field. Before returning a plan, the server checks structure, counts, unique titles, valid owners/milestones, prerequisite references and cycles, date ordering, milestone coverage, deadline fit, and person-level effort/date-window capacity. Invalid output receives one correction attempt per model within a shared 50-second generation budget. Provider failures use the existing model fallback list. Repeatedly invalid output returns a useful error and leaves the user's draft intact; dates are never silently squeezed to hide an infeasible schedule.

Run `npm test` and `npm run build` in `server/`. The regression suite uses a stubbed provider and makes no paid AI requests. Frontend identity tests run with `npm test` in `frontend/`.

Two illustrative live responses, one software and one community project, are saved in [AI_PLAN_EXAMPLES.json](AI_PLAN_EXAMPLES.json). They passed the output checks. They illustrate the response format and still need the team's review of assumptions, local requirements, and implementation choices. Existing saved tasks are unchanged; the improved prompt applies to newly generated and refined plans.

Team identity regression checks cover the flat REST response, linked profile preservation, older nested responses, missing names, and email-name privacy. The server members endpoint omits its former email column. Browser fixtures at 390, 768, and 1440 px confirm named connected cards without email rows; see the `team-fixed-*` captures in [.impeccable/review](../.impeccable/review/).
