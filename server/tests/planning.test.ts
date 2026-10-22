import test from "node:test";
import assert from "node:assert/strict";
import type { GoogleGenAI } from "@google/genai";
import {
  buildPlanningRequest,
  PlanQualityError,
  validateProjectPlan,
  type ProjectPlan,
} from "../src/ai/planning";
import { generateWithFallback } from "../src/routes/ai";

const brief = {
  projectTitle: "Courtyard native garden",
  description:
    "Create a practical native planting proposal for a shaded university courtyard.",
  teamSize: 2,
  deadline: "2026-11-10",
  teamProfiles: [
    {
      displayName: "Alex Morgan",
      skills: "Research",
      experienceLevel: "Beginner",
      preferredWork: "Site research",
    },
    {
      displayName: "Riya Kapoor",
      skills: "Design",
      preferredWork: "Planting layout",
    },
  ],
};
const constraints = {
  availableDays: 5,
  assignees: ["Alex Morgan", "Riya Kapoor"],
};
function goodPlan(): ProjectPlan {
  const tasks = [
    {
      title: "Compare native plants for the shaded courtyard",
      description:
        "Deliverable: A plant comparison table.\nSteps: Record light conditions, compare local native plants, and note maintenance needs.\nDone when: Three recommendations include shade tolerance, a source, and a clear reason for selection.",
      priority: "HIGH" as const,
      estimatedHours: 4,
      dependsOn: [],
      assignedToProfile: "Alex Morgan",
      milestoneId: "m1",
      relativeStartDay: 0,
      relativeDueDay: 1,
    },
    {
      title: "Draft the courtyard planting layout",
      description:
        "Deliverable: An annotated planting layout.\nSteps: Use the plant recommendations, mark access paths, and request a team review.\nDone when: Plant positions and spacing are labeled and paths remain clear.",
      priority: "MEDIUM" as const,
      estimatedHours: 4,
      dependsOn: ["Compare native plants for the shaded courtyard"],
      assignedToProfile: "Riya Kapoor",
      milestoneId: "m1",
      relativeStartDay: 2,
      relativeDueDay: 4,
    },
  ];
  return {
    projectType: "Community garden",
    difficulty: "Intermediate",
    estimatedTasks: 2,
    timelineDays: 5,
    modules: [
      {
        name: "Planting proposal",
        description: "Site evidence and a reviewed planting layout.",
      },
    ],
    phases: [{ name: "Develop the planting proposal", order: 1, tasks }],
    milestones: [
      {
        id: "m1",
        title: "Planting proposal ready for campus review",
        description: "Plant choices and layout have been reviewed by the team.",
        relativeDay: 5,
      },
    ],
    assignments: tasks.map((task) => ({
      taskTitle: task.title,
      memberPlaceholder: task.assignedToProfile,
    })),
  };
}

test("the planning request carries the complete brief, exact owners, and date budget as data", () => {
  const request = buildPlanningRequest(brief, new Date("2026-11-05T12:00:00Z"));
  const data = JSON.parse(request.prompt);
  assert.equal(request.availableDays, 5);
  assert.deepEqual(data.project.teamProfiles, brief.teamProfiles);
  assert.deepEqual(
    data.planningConstraints.allowedAssignees,
    constraints.assignees,
  );
  assert.equal(data.project.description, brief.description);
  assert.match(request.systemInstruction, /actual domain/);
  assert.match(request.systemInstruction, /Deliverable:/);
  assert.match(request.systemInstruction, /Done when:/);
});
test("refinement retains original work and requested constraints in the same planning contract", () => {
  const request = buildPlanningRequest({
    ...brief,
    originalPlan: goodPlan(),
    improvements: {
      instructorRequirements: "Include an accessible path",
      preferredTechnology: "Paper site map",
    },
  });
  const data = JSON.parse(request.prompt);
  assert.deepEqual(data.originalPlan, goodPlan());
  assert.equal(
    data.improvements.instructorRequirements,
    "Include an accessible path",
  );
  assert.match(request.systemInstruction, /REVISION RULES/);
});
test("valid practical plans keep their tasks and dates intact", () => {
  const plan = goodPlan();
  assert.deepEqual(validateProjectPlan(plan, constraints), plan);
});
test("incomplete or vague tasks are rejected before they reach review", () => {
  const missing = goodPlan();
  delete (
    missing.phases[0].tasks[0] as Partial<ProjectPlan["phases"][0]["tasks"][0]>
  ).estimatedHours;
  assert.throws(
    () => validateProjectPlan(missing, constraints),
    /estimatedHours/,
  );
  const vague = goodPlan();
  vague.phases[0].tasks[0].title = "Implement Core Features";
  vague.phases[0].tasks[0].description =
    "Build the main features and make sure that the project works correctly for the users.";
  assert.throws(
    () => validateProjectPlan(vague, constraints),
    /concrete outcome|completion criteria/,
  );
});
test("deadline violations are rejected rather than hidden by scaling dates", () => {
  const plan = goodPlan();
  plan.timelineDays = 20;
  plan.phases[0].tasks[1].relativeDueDay = 19;
  assert.throws(
    () => validateProjectPlan(plan, constraints),
    /deadline|date range/,
  );
  assert.equal(plan.phases[0].tasks[1].relativeDueDay, 19);
});
test("unknown owners, missing prerequisites, invalid milestones, and contradictory assignments fail", () => {
  const plan = goodPlan();
  plan.phases[0].tasks[0].assignedToProfile = "Someone invented";
  plan.phases[0].tasks[1].dependsOn = ["A task that does not exist"];
  plan.phases[0].tasks[1].milestoneId = "unknown";
  assert.throws(
    () => validateProjectPlan(plan, constraints),
    (error: unknown) => {
      assert.ok(error instanceof PlanQualityError);
      assert.ok(error.issues.some((issue) => issue.includes("unknown owner")));
      assert.ok(
        error.issues.some((issue) => issue.includes("missing prerequisite")),
      );
      assert.ok(
        error.issues.some((issue) => issue.includes("unknown milestone")),
      );
      assert.ok(error.issues.some((issue) => issue.includes("assignments")));
      return true;
    },
  );
});
test("cycles and impossible effort are detected even when individual dates are in bounds", () => {
  const plan = goodPlan();
  plan.phases[0].tasks[0].dependsOn = [plan.phases[0].tasks[1].title];
  plan.phases[0].tasks.forEach((task) => {
    task.assignedToProfile = "Alex Morgan";
    task.estimatedHours = 8;
  });
  assert.throws(
    () => validateProjectPlan(plan, constraints),
    (error: unknown) => {
      assert.ok(error instanceof PlanQualityError);
      assert.ok(error.issues.some((issue) => issue.includes("cycle")));
      assert.ok(error.issues.some((issue) => issue.includes("capacity")));
      assert.ok(error.issues.some((issue) => issue.includes("more time")));
      return true;
    },
  );
});
test("a person cannot be double-booked in a narrow window despite spare time later", () => {
  const plan = goodPlan();
  plan.phases[0].tasks.forEach((task) => {
    task.assignedToProfile = "Alex Morgan";
    task.relativeStartDay = 0;
    task.relativeDueDay = 1;
    task.dependsOn = [];
  });
  plan.assignments.forEach((assignment) => {
    assignment.memberPlaceholder = "Alex Morgan";
  });
  assert.throws(() => validateProjectPlan(plan, constraints), /double-booked/);
});
test("a bad model response gets actionable correction feedback before a valid plan is returned", async () => {
  const calls: any[] = [];
  const bad = goodPlan();
  bad.phases[0].tasks[0].assignedToProfile = "Invented owner";
  const client = {
    models: {
      generateContent: async (request: any) => {
        calls.push(request);
        return { text: JSON.stringify(calls.length === 1 ? bad : goodPlan()) };
      },
    },
  } as unknown as GoogleGenAI;
  const result = await generateWithFallback(
    client,
    "Planning contract",
    "Original brief",
    "/analyze",
    constraints,
  );
  assert.deepEqual(result, goodPlan());
  assert.equal(calls.length, 2);
  assert.equal(calls[0].model, calls[1].model);
  assert.match(calls[1].contents, /unknown owner/);
  const taskFields =
    calls[0].config.responseSchema.properties.phases.items.properties.tasks
      .items.required;
  assert.ok(
    taskFields.includes("description") &&
      taskFields.includes("assignedToProfile") &&
      taskFields.includes("estimatedHours"),
  );
});
test("provider failure switches models directly, without treating it as a plan-quality repair", async () => {
  const models: string[] = [];
  const client = {
    models: {
      generateContent: async (request: any) => {
        models.push(request.model);
        if (models.length === 1) throw new Error("Provider unavailable");
        return { text: JSON.stringify(goodPlan()) };
      },
    },
  } as unknown as GoogleGenAI;
  await generateWithFallback(
    client,
    "Contract",
    "Brief",
    "/improve-plan",
    constraints,
  );
  assert.equal(models.length, 2);
  assert.notEqual(models[0], models[1]);
});
test("consistently invalid responses fail instead of returning a generic fallback plan", async () => {
  let calls = 0;
  const client = {
    models: {
      generateContent: async () => {
        calls++;
        return { text: JSON.stringify({ phases: [] }) };
      },
    },
  } as unknown as GoogleGenAI;
  await assert.rejects(
    generateWithFallback(client, "Contract", "Brief", "/analyze", constraints),
    PlanQualityError,
  );
  assert.ok(calls >= 2 && calls <= 6);
});

test("fallback requests stop when the shared generation budget is spent", async (context) => {
  let clock = 0;
  let calls = 0;
  context.mock.method(Date, "now", () => clock);
  const client = {
    models: {
      generateContent: async () => {
        calls++;
        clock = 50001;
        throw new Error("Provider request timed out");
      },
    },
  } as unknown as GoogleGenAI;
  await assert.rejects(
    generateWithFallback(client, "Contract", "Brief", "/analyze", constraints),
    /time budget expired/,
  );
  assert.equal(calls, 1);
});
