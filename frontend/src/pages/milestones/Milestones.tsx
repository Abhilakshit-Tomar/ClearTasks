import { useCallback, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Calendar, Check, CheckCircle2, Circle, Clock } from "lucide-react";
import { milestoneService } from "@/services/api";
import { useRemoteData } from "@/hooks/useRemoteData";
import { formatDate, humanStatus, startOfDay, taskOwner } from "@/lib/studio";
import { Progress } from "@/components/ui/progress";
import { EmptyState, ErrorState, LoadingState } from "@/components/Feedback";

export default function Milestones() {
  const [today] = useState(() => new Date());
  const { projectId = "" } = useParams();
  const loader = useCallback(
    () => milestoneService.getMilestones(projectId),
    [projectId],
  );
  const { data, loading, error, refresh } = useRemoteData(loader, 10000);
  if (loading) return <LoadingState label="Loading project milestones…" />;
  return (
    <div className="page-shell max-w-4xl">
      <div className="page-heading">
        <div>
          <h1>The bigger picture.</h1>
          <p>
            Small steps become shared milestones. Here’s where you’re headed.
          </p>
        </div>
      </div>
      {error && (
        <ErrorState
          compact={!!data}
          message={error}
          retry={() => void refresh()}
        />
      )}
      {data && (
        <>
          {data.length === 0 ? (
            <EmptyState
              title="A little room for the bigger picture."
              description="Milestones from your project plan will appear here with their tasks and deadlines."
            />
          ) : (
            <ol className="space-y-6">
              {data.map((milestone, index) => {
                const tasks = milestone.tasks || [];
                const done = tasks.filter(
                  (task) => task.status === "DONE",
                ).length;
                const percent = tasks.length
                  ? Math.round((done / tasks.length) * 100)
                  : milestone.status === "COMPLETED"
                    ? 100
                    : 0;
                const status =
                  percent === 100
                    ? "COMPLETED"
                    : done > 0
                      ? "IN_PROGRESS"
                      : milestone.status;
                const overdue =
                  status !== "COMPLETED" &&
                  startOfDay(new Date(milestone.due_date)) < startOfDay(today);
                return (
                  <li key={milestone.id} className="flex gap-4 sm:gap-6">
                    <div className="flex flex-col items-center gap-3">
                      <span
                        className={`flex size-9 items-center justify-center rounded-full border text-sm font-semibold ${status === "COMPLETED" ? "border-primary bg-primary text-primary-foreground" : "bg-card"}`}
                      >
                        {status === "COMPLETED" ? (
                          <Check className="size-4" aria-label="Complete" />
                        ) : (
                          index + 1
                        )}
                      </span>
                      {index < data.length - 1 && (
                        <span className="w-px flex-1 bg-border" />
                      )}
                    </div>
                    <article className="surface min-w-0 flex-1 p-5 sm:p-6">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <h2 className="font-editorial break-words text-2xl">
                          {milestone.title}
                        </h2>
                        <span
                          className={`status-badge ${status === "COMPLETED" ? "status-good" : overdue ? "status-warning" : ""}`}
                        >
                          {overdue ? "Past deadline" : humanStatus(status)}
                        </span>
                      </div>
                      {milestone.description && (
                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                          {milestone.description}
                        </p>
                      )}
                      <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
                        <span
                          className={`flex items-center gap-1.5 ${overdue ? "text-destructive" : ""}`}
                        >
                          <Calendar className="size-3.5" />
                          Due {formatDate(milestone.due_date)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="size-3.5" />
                          {tasks.reduce(
                            (sum, task) => sum + (task.estimated_hours || 0),
                            0,
                          )}{" "}
                          hours estimated
                        </span>
                      </div>
                      <div className="mt-5">
                        <div className="mb-2 flex justify-between gap-3 text-xs text-muted-foreground">
                          <span>
                            {done} of {tasks.length} tasks complete
                          </span>
                          <span className="tabular-nums">{percent}%</span>
                        </div>
                        <Progress
                          value={percent}
                          aria-label={`${milestone.title} progress`}
                          className="h-1.5"
                        />
                      </div>
                      {tasks.length > 0 && (
                        <details className="mt-5 border-t pt-4">
                          <summary className="cursor-pointer rounded-md text-sm font-medium">
                            See the {tasks.length} tasks
                          </summary>
                          <div className="mt-3 divide-y">
                            {tasks.map((task) => (
                              <Link
                                key={task.id}
                                to={`/projects/${projectId}/tasks/${task.id}`}
                                className="flex items-start gap-3 rounded-md py-4 hover:text-primary"
                              >
                                {task.status === "DONE" ? (
                                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                                ) : (
                                  <Circle className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                                )}
                                <div className="min-w-0 flex-1">
                                  <p
                                    className={`break-words text-sm font-medium ${task.status === "DONE" ? "text-muted-foreground line-through" : ""}`}
                                  >
                                    {task.title}
                                  </p>
                                  <p className="mt-1 text-xs text-muted-foreground">
                                    {taskOwner(task)} ·{" "}
                                    {humanStatus(task.status)}
                                  </p>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </details>
                      )}
                    </article>
                  </li>
                );
              })}
            </ol>
          )}
        </>
      )}
    </div>
  );
}
