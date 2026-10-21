import { useCallback, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Calendar, ChevronLeft, Clock, Flag, Trash2, User } from "lucide-react";
import { toast } from "sonner";
import { taskService } from "@/services/api";
import type { TaskStatus } from "@/types";
import { useRemoteData } from "@/hooks/useRemoteData";
import {
  errorMessage,
  formatDate,
  humanStatus,
  isOverdue,
  taskOwner,
} from "@/lib/studio";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState, ErrorState, LoadingState } from "@/components/Feedback";

export default function TaskDetailsPage() {
  const { projectId = "", taskId = "" } = useParams();
  const navigate = useNavigate();
  const loader = useCallback(
    () => taskService.getTasks(projectId),
    [projectId],
  );
  const { data, loading, error, refresh, updateData } = useRemoteData(
    loader,
    5000,
  );
  const [pendingStatus, setPendingStatus] = useState<TaskStatus | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const mutationLock = useRef(false);
  const task = data?.find((item) => item.id === taskId);
  async function changeStatus(status: TaskStatus) {
    if (!task || mutationLock.current) return;
    mutationLock.current = true;
    setPendingStatus(status);
    try {
      await taskService.updateTaskStatus(task.id, status);
      updateData((previous) =>
        previous.map((item) =>
          item.id === task.id ? { ...item, status } : item,
        ),
      );
      toast.success(
        status === "DONE"
          ? "Task completed. Nice work!"
          : "Task status updated",
      );
    } catch (error) {
      toast.error(
        errorMessage(
          error,
          "Status couldn’t be saved. Your previous status has been restored.",
        ),
      );
    } finally {
      mutationLock.current = false;
      setPendingStatus(null);
    }
  }
  async function deleteTask() {
    if (!task || mutationLock.current) return;
    mutationLock.current = true;
    setDeleting(true);
    try {
      await taskService.deleteTask(task.id);
      toast.success("Task deleted");
      navigate(`/projects/${projectId}/tasks`);
    } catch (error) {
      toast.error(
        errorMessage(error, "Task couldn’t be deleted. Please try again."),
      );
    } finally {
      mutationLock.current = false;
      setDeleting(false);
    }
  }
  if (loading) return <LoadingState label="Loading task details…" />;
  if (!data)
    return (
      <ErrorState
        message={error || "Task details are unavailable."}
        retry={() => void refresh()}
      />
    );
  if (!task)
    return (
      <EmptyState
        title="This task isn’t here."
        description="It may have been deleted, or the link may be out of date."
      >
        <Button asChild variant="outline">
          <Link to={`/projects/${projectId}/tasks`}>Return to tasks</Link>
        </Button>
      </EmptyState>
    );
  return (
    <div className="page-shell max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="ghost">
          <Link to={`/projects/${projectId}/tasks`}>
            <ChevronLeft />
            Back to tasks
          </Link>
        </Button>
        <Button
          variant="outline"
          className="text-destructive hover:text-destructive"
          disabled={pendingStatus !== null}
          onClick={() => setDeleteOpen(true)}
        >
          <Trash2 />
          Delete task
        </Button>
      </div>
      {error && (
        <ErrorState compact message={error} retry={() => void refresh()} />
      )}
      <div className="grid gap-7 lg:grid-cols-[1.7fr_1fr]">
        <div>
          <div className="mb-4 flex flex-wrap gap-2">
            <span className="project-badge">{task.phase || "General"}</span>
            <span
              className={`status-badge ${task.priority === "HIGH" ? "status-danger" : ""}`}
            >
              {task.priority[0] + task.priority.slice(1).toLowerCase()} priority
            </span>
            {isOverdue(task) && (
              <span className="status-badge status-danger">Overdue</span>
            )}
          </div>
          <h1 className="break-words text-3xl font-semibold sm:text-4xl">
            {task.title}
          </h1>
          <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <User className="size-4" />
            {taskOwner(task)}
          </p>
          <section className="mt-8 border-t pt-6">
            <h2 className="text-lg font-semibold">The work</h2>
            <p className="mt-4 max-w-prose whitespace-pre-wrap break-words text-sm leading-7 text-muted-foreground">
              {task.description ||
                "No description has been added to this task."}
            </p>
          </section>
        </div>
        <aside className="surface self-start p-6">
          <label htmlFor="task-status" className="text-sm font-semibold">
            Status
          </label>
          <Select
            value={pendingStatus || task.status}
            onValueChange={(value) => void changeStatus(value as TaskStatus)}
            disabled={pendingStatus !== null || deleting}
          >
            <SelectTrigger
              id="task-status"
              className="mt-3 h-11"
              aria-busy={pendingStatus !== null}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(["TODO", "IN_PROGRESS", "DONE"] as const).map((status) => (
                <SelectItem key={status} value={status}>
                  {humanStatus(status)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p
            role="status"
            className="mt-2 min-h-5 text-xs text-muted-foreground"
          >
            {pendingStatus
              ? "Saving your change…"
              : "Changes save automatically."}
          </p>
          <dl className="mt-5 space-y-5 border-t pt-5">
            {[
              {
                label: "Due date",
                value: formatDate(task.due_date, {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                }),
                icon: Calendar,
              },
              {
                label: "Estimated effort",
                value:
                  task.estimated_hours === undefined
                    ? "Not estimated"
                    : `${task.estimated_hours} hours`,
                icon: Clock,
              },
              {
                label: "Milestone",
                value: task.milestone?.title || "No milestone",
                icon: Flag,
              },
            ].map((item) => (
              <div key={item.label}>
                <dt className="flex items-center gap-2 text-xs text-muted-foreground">
                  <item.icon className="size-4" />
                  {item.label}
                </dt>
                <dd className="mt-2 break-words text-sm font-medium">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </aside>
      </div>
      <Dialog
        open={deleteOpen}
        onOpenChange={(open) => {
          if (!deleting) setDeleteOpen(open);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this task?</DialogTitle>
            <DialogDescription>
              “{task.title}” will be permanently deleted. This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              disabled={deleting}
              onClick={() => setDeleteOpen(false)}
            >
              Keep task
            </Button>
            <Button
              variant="destructive"
              pending={deleting}
              pendingLabel="Deleting…"
              onClick={() => void deleteTask()}
            >
              Delete task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
