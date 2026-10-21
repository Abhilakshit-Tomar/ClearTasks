import type { CSSProperties } from "react";
import type { Milestone, Project, Task } from "@/types";

const projectPalettes = [
  { accent: "41 73% 58%", soft: "42 68% 91%", ink: "32 67% 26%" },
  { accent: "15 47% 58%", soft: "17 55% 92%", ink: "12 45% 30%" },
  { accent: "261 25% 62%", soft: "263 37% 93%", ink: "259 30% 33%" },
  { accent: "157 28% 49%", soft: "151 32% 91%", ink: "158 38% 26%" },
] as const;

export function projectStyle(id: string): CSSProperties {
  const hash = Array.from(id).reduce(
    (value, character) =>
      (Math.imul(value, 31) + character.charCodeAt(0)) >>> 0,
    0,
  );
  const palette = projectPalettes[hash % projectPalettes.length];
  return {
    "--project-accent": palette.accent,
    "--project-soft": palette.soft,
    "--project-ink": palette.ink,
  } as CSSProperties;
}

export function formatDate(
  value?: string,
  options?: Intl.DateTimeFormatOptions,
): string {
  if (!value) return "No date set";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "No date set"
    : date.toLocaleDateString(
        undefined,
        options || { month: "short", day: "numeric" },
      );
}

export function startOfDay(date: Date): number {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ).getTime();
}

export function isOverdue(
  task: Pick<Task, "status" | "due_date">,
  now = new Date(),
): boolean {
  return (
    task.status !== "DONE" &&
    !!task.due_date &&
    startOfDay(new Date(task.due_date)) < startOfDay(now)
  );
}

export function summarizeProject(
  project: Project,
  tasks: Task[],
  milestones: Milestone[],
  now = new Date(),
) {
  const completed = tasks.filter((task) => task.status === "DONE").length;
  const overdue = tasks.filter((task) => isOverdue(task, now));
  const incomplete = tasks.filter((task) => task.status !== "DONE");
  const upcoming = [...incomplete].sort(
    (a, b) =>
      (a.due_date ? new Date(a.due_date).getTime() : Infinity) -
      (b.due_date ? new Date(b.due_date).getTime() : Infinity),
  );
  const nextMilestone = [...milestones]
    .filter((m) => {
      const related = tasks.filter((task) => task.milestone_id === m.id);
      return (
        m.status !== "COMPLETED" &&
        !(related.length > 0 && related.every((task) => task.status === "DONE"))
      );
    })
    .sort(
      (a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime(),
    )[0];
  const pastDeadline = startOfDay(new Date(project.deadline)) < startOfDay(now);
  const health =
    project.status === "ARCHIVED"
      ? "Archived"
      : project.status === "COMPLETED" ||
          (tasks.length > 0 && completed === tasks.length)
        ? "Complete"
        : pastDeadline && (incomplete.length > 0 || tasks.length === 0)
          ? "Past deadline"
          : overdue.length > 0
            ? "Needs attention"
            : tasks.length === 0
              ? "Ready to plan"
              : "On track";
  return {
    total: tasks.length,
    completed,
    inProgress: tasks.filter((t) => t.status === "IN_PROGRESS").length,
    todo: tasks.filter((t) => t.status === "TODO").length,
    percent: tasks.length ? Math.round((completed / tasks.length) * 100) : 0,
    overdue,
    upcoming,
    nextMilestone,
    health,
  };
}

export function taskOwner(task: Task): string {
  return (
    task.assignee?.name ||
    task.planned_profile?.display_name ||
    task.assignee_name ||
    task.profile_name ||
    "Unassigned"
  );
}

/** Surface unfinished work first without mutating a cached response. */
export function sortTasksForAction(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const completion =
      Number(a.status === "DONE") - Number(b.status === "DONE");
    if (completion) return completion;
    const aDue = a.due_date ? new Date(a.due_date).getTime() : Infinity;
    const bDue = b.due_date ? new Date(b.due_date).getTime() : Infinity;
    return aDue - bDue || a.title.localeCompare(b.title);
  });
}
export function humanStatus(value: string): string {
  return (
    (
      {
        TODO: "To do",
        IN_PROGRESS: "In progress",
        DONE: "Done",
        ACTIVE: "Active",
        COMPLETED: "Complete",
        ARCHIVED: "Archived",
        PENDING: "Planned",
      } as Record<string, string>
    )[value] || value
  );
}
export function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}
