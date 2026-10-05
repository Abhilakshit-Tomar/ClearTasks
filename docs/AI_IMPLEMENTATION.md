# AI Implementation

## AI Architecture
The ClearTasks application integrates with OpenAI's API to dynamically generate structured project plans based on basic project information.
We use the **OpenAI Node.js SDK** directly in the Express backend, keeping the architecture simple and avoiding unnecessary middleware frameworks like LangChain.

## Endpoints
1. `POST /api/ai/analyze`
2. `POST /api/ai/improve-plan`

## Input Schema
The backend accepts inputs validated via **Zod**:
- `projectTitle` (string)
- `description` (string)
- `teamSize` (number)
- `deadline` (ISO string date)
For the `improve-plan` endpoint, it also accepts:
- `originalPlan` (the previous AIProjectPlan object)
- `improvements` (optional fields like `assignByStrengths`, `teamSkills`, etc.)

## Output Schema
We utilize the `zodResponseFormat` feature of OpenAI SDK to guarantee that the response adheres to a strict JSON schema:
```json
{
  "projectType": "Web Application",
  "difficulty": "Medium",
  "estimatedTasks": 20,
  "timelineWeeks": 4,
  "modules": [ { "name": "Auth", "description": "User login" } ],
  "phases": [
    {
      "name": "Planning",
      "order": 1,
      "tasks": [
        {
          "title": "Define requirements",
          "description": "...",
          "priority": "HIGH",
          "estimatedHours": 4,
          "dependsOn": []
        }
      ]
    }
  ],
  "milestones": [ { "title": "Planning Complete", "description": "...", "relativeDay": 5 } ],
  "assignments": [ { "taskTitle": "Define requirements", "memberPlaceholder": "Member 1" } ]
}
```

## Prompt Strategy
The AI is prompted to act as an expert technical project manager for student projects. It is explicitly told to create reasonable tasks, avoid enterprise bloat, and balance workloads according to the given team size and constraints.
When improving the plan, the AI is instructed to preserve existing context while making precise changes requested by the user.

## Validation
Incoming requests are validated using `zod` schemas (`aiAnalyzeSchema`, `aiImproveSchema`) within `validators.ts`.

## Fallback Behavior
If the OpenAI API key is missing or an error occurs during the API call, a deterministic `generateFallbackPlan` function is triggered to ensure the frontend still receives a valid plan to display, without breaking the UI flow. A `fallback: true` flag is included in the payload.

## Assignment Logic
Tasks are assigned to placeholders (`Member 1`, `Member 2`, etc.) based on the requested team size. If `teamSkills` are provided during the improvement phase, the AI will align assignments with specific member strengths.

## Security Considerations
- The OpenAI API key (`OPENAI_API_KEY`) is kept exclusively in the server environment. It is **never** exposed to the frontend or sent over the network.
- Zod is used to safely parse input limits, preventing excessively large strings from reaching the LLM and avoiding potential DOS through long queries.
- Database writes are **not** performed by the AI endpoints. The endpoints purely return JSON to the frontend for user review.

## Environment Variables
- `OPENAI_API_KEY`: Required.
- `OPENAI_MODEL`: Optional (defaults to `gpt-4o-mini`).

## Testing Procedure
1. Verify frontend can hit `POST /api/ai/analyze` and successfully receive a mocked fallback plan if `OPENAI_API_KEY` is not set.
2. Provide a valid `OPENAI_API_KEY` in `server/.env.local` and restart the backend.
3. Validate that creating a new project with title/desc appropriately leverages OpenAI and returns dynamic content.
4. Go through the Improve Plan flow, provide an improvement prompt, and confirm the AI adjusts the plan intelligently without losing the fundamental structure.
5. Review the plan and confirm creation. Verify the database stores the tasks and milestones accurately.
