import { useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  Check,
  CheckCircle2,
  Circle,
  Flag,
  Users,
} from "lucide-react";
import {
  projectService,
  taskService,
  milestoneService,
  teamService,
} from "@/services/api";
import { useRemoteData } from "@/hooks/useRemoteData";
import {
  formatDate,
  humanStatus,
  isOverdue,
  projectStyle,
  summarizeProject,
  taskOwner,
} from "@/lib/studio";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ErrorState, LoadingState, ProjectLink } from "@/components/Feedback";

export default function ProjectDashboard() {
  const { projectId = "" } = useParams<{ projectId: string }>();
  const loader = useCallback(async () => {
    const [project, tasks, milestones, teamProfiles] = await Promise.all([
      projectService.getProject(projectId),
      taskService.getTasks(projectId),
      milestoneService.getMilestones(projectId),
      teamService.getTeamProfiles(projectId),
    ]);
    return { project, tasks, milestones, teamProfiles };
  }, [projectId]);
  const { data, error, loading, refresh } = useRemoteData(loader, 10000);
  if (loading)
    return (
      <LoadingState label="Loading project progress, milestones, and team workload…" />
    );
  if (!data)
    return (
      <ErrorState
        message={
          error ||
          "This project is unavailable. Check the link and your access."
        }
        retry={() => void refresh()}
      />
    );
  const { project, tasks, milestones, teamProfiles } = data;
  const summary = summarizeProject(project, tasks, milestones);
  const upcoming = summary.upcoming
    .filter((task) => !isOverdue(task))
    .slice(0, 5);
  const attention = summary.overdue;
  const nextTasks = [...attention, ...upcoming].slice(0, 6);
  return (
    <div className="page-shell" style={projectStyle(projectId)}>
      {error && (
        <ErrorState compact message={error} retry={() => void refresh()} />
      )}
      <section
        className="project-cover surface p-6 sm:p-8"
        aria-labelledby="project-title"
      >
        <div className="flex flex-col justify-between gap-6 xl:flex-row xl:items-end">
          <div className="min-w-0 flex-1">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <span className="project-badge">
                <span className="project-dot" />
                {project.project_type || "Team project"}
              </span>
              <span
                className={`status-badge ${attention.length || summary.health === "Past deadline" ? "status-warning" : "status-good"}`}
              >
                {attention.length ? (
                  <AlertTriangle className="size-3" />
                ) : (
                  <CheckCircle2 className="size-3" />
                )}
                {summary.health}
              </span>
            </div>
            <h1
              id="project-title"
              className="font-editorial break-words text-4xl sm:text-5xl"
            >
              {project.name}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              {project.description}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-5 text-sm">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="size-4" />
                Due{" "}
                {formatDate(project.deadline, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <Link
                to={`/projects/${projectId}/team`}
                className="flex items-center gap-2 rounded-md"
              >
                <span className="flex -space-x-2">
                  {teamProfiles.slice(0, 4).map((profile) => (
                    <Avatar
                      key={profile.id}
                      className="size-8 border-2 border-card"
                    >
                      <AvatarFallback className="bg-secondary text-[11px] font-semibold">
                        {profile.display_name[0]}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </span>
                <span className="text-xs text-muted-foreground">
                  {teamProfiles.length || project.team_size} members
                </span>
              </Link>
            </div>
          </div>
          <Button asChild className="self-start xl:self-auto">
            <Link to={`/projects/${projectId}/tasks`}>
              Open task board
              <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>
      <div className="grid gap-6 lg:grid-cols-[1.65fr_1fr]">
        <section
          className="surface overflow-hidden"
          aria-labelledby="next-heading"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b px-5 py-4">
            <h2 id="next-heading" className="text-lg font-semibold">
              Up next
            </h2>
            <ProjectLink to={`/projects/${projectId}/tasks`}>
              View all tasks
            </ProjectLink>
          </div>
          {nextTasks.length ? (
            nextTasks.map((task) => (
              <div key={task.id} className="task-row">
                <Circle
                  className={`size-5 shrink-0 ${isOverdue(task) ? "text-destructive" : "text-muted-foreground/60"}`}
                  aria-hidden="true"
                />
                <Link
                  className="task-row-link"
                  to={`/projects/${projectId}/tasks/${task.id}`}
                >
                  <p className="break-words text-sm font-semibold">
                    {task.title}
                  </p>
                  <p className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span>{taskOwner(task)}</span>
                    <span className={isOverdue(task) ? "text-destructive" : ""}>
                      {isOverdue(task) ? "Overdue · " : "Due "}
                      {formatDate(task.due_date)}
                    </span>
                    <span>{humanStatus(task.status)}</span>
                    {task.priority === "HIGH" && (
                      <span className="text-destructive">High priority</span>
                    )}
                  </p>
                </Link>
                <ArrowRight
                  className="size-4 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
              </div>
            ))
          ) : (
            <div className="p-10 text-center">
              <CheckCircle2
                className="mx-auto mb-3 size-8 text-primary"
                aria-hidden="true"
              />
              <p className="font-semibold">
                {summary.total ? "All caught up." : "A fresh start."}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {summary.total
                  ? "Your team has completed every task."
                  : "Add the first task to start making progress."}
              </p>
              <ProjectLink to={`/projects/${projectId}/tasks`}>
                Open tasks
              </ProjectLink>
            </div>
          )}
        </section>
        <section className="surface p-6" aria-labelledby="progress-heading">
          <h2 id="progress-heading" className="text-lg font-semibold">
            Project progress
          </h2>
          <p className="mt-5 text-3xl font-semibold tabular-nums">
            {summary.percent}
            <span className="text-xl text-muted-foreground">%</span>
          </p>
          <Progress
            value={summary.percent}
            aria-label="Project completion"
            className="mt-3 h-2"
          />
          <p className="mt-3 text-sm text-muted-foreground">
            {summary.completed} of {summary.total} tasks complete
          </p>
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span>{summary.inProgress} in progress</span>
            <span>{summary.todo} to do</span>
            <span className={attention.length ? "text-destructive" : ""}>
              {attention.length} overdue
            </span>
          </div>
          <div className="mt-7 border-t pt-6">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <Flag className="size-4 text-primary" />
              Next milestone
            </h3>
            {summary.nextMilestone ? (
              <Link
                to={`/projects/${projectId}/milestones`}
                className="mt-3 block rounded-lg py-1 hover:text-primary"
              >
                <p className="font-editorial text-2xl">
                  {summary.nextMilestone.title}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Due {formatDate(summary.nextMilestone.due_date)}
                </p>
              </Link>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">
                {milestones.length
                  ? "Every milestone is complete."
                  : "No milestones planned yet."}
              </p>
            )}
          </div>
        </section>
      </div>
      <section
        className="surface p-6 sm:p-7"
        aria-labelledby="milestones-heading"
      >
        <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
          <h2 id="milestones-heading" className="text-lg font-semibold">
            Milestone progress
          </h2>
          <ProjectLink to={`/projects/${projectId}/milestones`}>
            View milestones
          </ProjectLink>
        </div>
        <div className="milestone-track">
          {milestones.length ? (
            milestones.map((milestone, index) => {
              const related = tasks.filter(
                (task) => task.milestone_id === milestone.id,
              );
              const complete = related.filter(
                (task) => task.status === "DONE",
              ).length;
              const finished =
                related.length > 0
                  ? complete === related.length
                  : milestone.status === "COMPLETED";
              return (
                <Link
                  key={milestone.id}
                  to={`/projects/${projectId}/milestones`}
                  className="milestone-node rounded-md"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex size-8 shrink-0 items-center justify-center rounded-full border ${finished ? "border-primary bg-primary text-primary-foreground" : "border-input bg-background"}`}
                    >
                      {finished ? (
                        <Check className="size-4" aria-label="Complete" />
                      ) : (
                        <span className="text-xs font-semibold">
                          {index + 1}
                        </span>
                      )}
                    </span>
                    <span className="h-px flex-1 bg-border" />
                  </div>
                  <h3 className="mt-3 text-sm font-semibold">
                    {milestone.title}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDate(milestone.due_date)} · {complete}/
                    {related.length} tasks
                  </p>
                  <Progress
                    value={
                      related.length
                        ? (complete / related.length) * 100
                        : finished
                          ? 100
                          : 0
                    }
                    aria-label={`${milestone.title} progress`}
                    className="mt-3 h-1"
                  />
                </Link>
              );
            })
          ) : (
            <p className="text-sm text-muted-foreground">
              No milestones planned for this project.
            </p>
          )}
        </div>
      </section>
      <section aria-labelledby="workload-heading">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 id="workload-heading" className="text-lg font-semibold">
              The people moving it forward.
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              See how the work is shared across your team.
            </p>
          </div>
          <ProjectLink to={`/projects/${projectId}/team`}>
            Manage team
          </ProjectLink>
        </div>
        <div className="surface divide-y">
          {teamProfiles.length ? (
            teamProfiles.map((profile) => {
              const assigned = tasks.filter(
                (task) =>
                  task.assigned_profile_id === profile.id ||
                  (profile.linked_user_id &&
                    task.assigned_to === profile.linked_user_id),
              );
              const done = assigned.filter(
                (task) => task.status === "DONE",
              ).length;
              return (
                <div
                  key={profile.id}
                  className="flex flex-wrap items-center gap-3 p-5"
                >
                  <Avatar className="size-10">
                    <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                      {profile.display_name[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {profile.display_name}
                    </p>
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {profile.skills ||
                        profile.preferred_work ||
                        "Team member"}
                    </p>
                  </div>
                  <div className="w-28 text-right">
                    <p className="mb-2 text-xs tabular-nums text-muted-foreground">
                      {done}/{assigned.length} complete
                    </p>
                    <Progress
                      value={
                        assigned.length ? (done / assigned.length) * 100 : 0
                      }
                      aria-label={`${profile.display_name} task completion`}
                      className="h-1.5"
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <p className="p-6 text-sm text-muted-foreground">
              <Users className="mr-2 inline size-4" />
              No planned team members yet.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
