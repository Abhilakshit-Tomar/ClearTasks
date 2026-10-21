import test from "node:test";
import assert from "node:assert/strict";
import { sortTasksForAction } from "../src/lib/studio.ts";
import {
  projectStyle,
  formatDate,
  isOverdue,
  summarizeProject,
  taskOwner,
} from "../src/lib/studio.ts";

const today = new Date(2026, 9, 21, 12);
const project = { id: "garden", status: "ACTIVE", deadline: "2026-11-12" };
const task = (
  id,
  status = "TODO",
  due_date = "2026-10-24",
  milestone_id = "m1",
) => ({ id, status, due_date, milestone_id, title: id });

test("project accents are stable across calls, including long IDs", () => {
  for (const id of ["garden", "student-project", "f".repeat(250)])
    assert.deepEqual(projectStyle(id), projectStyle(id));
  assert.notDeepEqual(projectStyle("a"), projectStyle("b"));
});
test("overdue means an incomplete task before the local calendar day", () => {
  assert.equal(isOverdue(task("past", "TODO", "2026-10-19"), today), true);
  assert.equal(isOverdue(task("today", "TODO", "2026-10-21"), today), false);
  assert.equal(isOverdue(task("done", "DONE", "2026-10-19"), today), false);
  assert.equal(isOverdue({ status: "TODO" }, today), false);
});
test("empty active projects do not claim completion or imply measured progress", () => {
  const summary = summarizeProject(project, [], [], today);
  assert.equal(summary.health, "Ready to plan");
  assert.equal(summary.percent, 0);
  assert.equal(summary.total, 0);
});
test("health, counts and next work reflect actual tasks rather than ACTIVE", () => {
  const tasks = [
    task("future"),
    task("late", "IN_PROGRESS", "2026-10-19"),
    task("done", "DONE"),
  ];
  const summary = summarizeProject(project, tasks, [], today);
  assert.equal(summary.health, "Needs attention");
  assert.equal(summary.percent, 33);
  assert.equal(summary.completed, 1);
  assert.equal(summary.overdue.length, 1);
  assert.equal(summary.upcoming[0].id, "late");
  assert.equal(
    summarizeProject({ ...project, deadline: "2026-10-18" }, tasks, [], today)
      .health,
    "Past deadline",
  );
});
test("completed milestones are excluded even if their stored status is stale", () => {
  const tasks = [
    task("one", "DONE", "2026-10-24", "m1"),
    task("two", "TODO", "2026-10-28", "m2"),
  ];
  const milestones = [
    { id: "m1", status: "PENDING", due_date: "2026-10-24" },
    { id: "m2", status: "PENDING", due_date: "2026-10-28" },
  ];
  assert.equal(
    summarizeProject(project, tasks, milestones, today).nextMilestone.id,
    "m2",
  );
  assert.deepEqual(
    tasks.map((t) => t.id),
    ["one", "two"],
  );
});
test("completed and archived projects retain meaningful lifecycle status", () => {
  assert.equal(
    summarizeProject(project, [task("one", "DONE")], [], today).health,
    "Complete",
  );
  assert.equal(
    summarizeProject(
      { ...project, status: "ARCHIVED" },
      [task("one")],
      [],
      today,
    ).health,
    "Archived",
  );
});
test("owners and dates tolerate incomplete API joins", () => {
  assert.equal(
    taskOwner({ planned_profile: { display_name: "Alex" } }),
    "Alex",
  );
  assert.equal(taskOwner({ assignee_name: "Riya" }), "Riya");
  assert.equal(taskOwner({}), "Unassigned");
  assert.equal(formatDate("broken"), "No date set");
  assert.equal(formatDate(undefined), "No date set");
});

test("action lists put unfinished dated work first and leave the cached order intact", () => {
  const values = [
    task("done", "DONE", "2026-10-17"),
    task("future", "TODO", "2026-10-26"),
    task("late", "IN_PROGRESS", "2026-10-19"),
    { ...task("undated"), due_date: undefined },
  ];
  assert.deepEqual(
    sortTasksForAction(values).map((item) => item.id),
    ["late", "future", "undated", "done"],
  );
  assert.deepEqual(
    values.map((item) => item.id),
    ["done", "future", "late", "undated"],
  );
});
