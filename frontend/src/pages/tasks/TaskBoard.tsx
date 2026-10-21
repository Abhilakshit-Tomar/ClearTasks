import { useCallback, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowRight,
  Calendar,
  CheckSquare,
  Circle,
  Clock,
  LayoutList,
  Columns3,
  Plus,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import { taskService } from "@/services/api";
import type { Task, TaskStatus } from "@/types";
import { useRemoteData } from "@/hooks/useRemoteData";
import {
  errorMessage,
  formatDate,
  isOverdue,
  taskOwner,
  sortTasksForAction,
} from "@/lib/studio";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState, ErrorState, LoadingState } from "@/components/Feedback";

const columns = [
  { id: "TODO", label: "To do" },
  { id: "IN_PROGRESS", label: "In progress" },
  { id: "DONE", label: "Done" },
] as const;

function StatusControl({
  task,
  pending,
  change,
}: {
  task: Task;
  pending: boolean;
  change: (status: TaskStatus) => void;
}) {
  return (
    <Select
      value={task.status}
      onValueChange={(value) => change(value as TaskStatus)}
      disabled={pending}
    >
      <SelectTrigger
        aria-label={`Status for ${task.title}`}
        aria-busy={pending || undefined}
        className="h-10 w-[145px] text-xs"
      >
        <SelectValue />
        {pending && <span className="sr-only">Saving…</span>}
      </SelectTrigger>
      <SelectContent>
        {columns.map((column) => (
          <SelectItem key={column.id} value={column.id}>
            {column.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default function TaskBoard() {
  const { projectId = "" } = useParams();
  const loader = useCallback(
    () => taskService.getTasks(projectId),
    [projectId],
  );
  const { data, loading, error, refresh, updateData } = useRemoteData(
    loader,
    5000,
  );
  const [view, setView] = useState<"board" | "list">("board");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");
  const [assignee, setAssignee] = useState("ALL");
  const [milestone, setMilestone] = useState("ALL");
  const [priority, setPriority] = useState("ALL");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const createLock = useRef(false);
  const [pendingIds, setPendingIds] = useState<string[]>([]);
  const statusLocks = useRef(new Set<string>());
  const tasks = data || [];
  const activeFilters = [assignee, milestone, priority].filter(
    (value) => value !== "ALL",
  ).length;
  const filtered = sortTasksForAction(tasks).filter(
    (task) =>
      (!query.trim() ||
        `${task.title} ${task.description || ""}`
          .toLowerCase()
          .includes(query.toLowerCase().trim())) &&
      (status === "ALL" || task.status === status) &&
      (assignee === "ALL" || taskOwner(task) === assignee) &&
      (milestone === "ALL" ||
        (task.milestone?.title || "No milestone") === milestone) &&
      (priority === "ALL" || task.priority === priority),
  );
  const clear = () => {
    setQuery("");
    setStatus("ALL");
    setAssignee("ALL");
    setMilestone("ALL");
    setPriority("ALL");
  };
  async function createTask(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim() || createLock.current) return;
    createLock.current = true;
    setCreating(true);
    try {
      const task = await taskService.createTask(projectId, {
        title: title.trim(),
        phase: "General",
        status: "TODO",
        priority: "MEDIUM",
        estimated_hours: 1,
      });
      updateData((previous) => [...previous, task]);
      setTitle("");
      setDialogOpen(false);
      toast.success("Task created");
    } catch (error) {
      toast.error(
        errorMessage(error, "Task couldn’t be created. Please try again."),
      );
    } finally {
      createLock.current = false;
      setCreating(false);
    }
  }
  async function changeStatus(task: Task, value: TaskStatus) {
    if (statusLocks.current.has(task.id)) return;
    statusLocks.current.add(task.id);
    setPendingIds((previous) => [...previous, task.id]);
    try {
      await taskService.updateTaskStatus(task.id, value);
      updateData((previous) =>
        previous.map((item) =>
          item.id === task.id ? { ...item, status: value } : item,
        ),
      );
      toast.success(
        value === "DONE"
          ? "Task completed. A little more progress!"
          : "Task status updated",
      );
    } catch (error) {
      toast.error(
        errorMessage(
          error,
          "Status couldn’t be saved. Your previous status is unchanged.",
        ),
      );
    } finally {
      statusLocks.current.delete(task.id);
      setPendingIds((previous) => previous.filter((id) => id !== task.id));
    }
  }
  if (loading) return <LoadingState label="Loading project tasks…" />;
  return (
    <div className="page-shell">
      <div className="page-heading">
        <div>
          <h1>One step at a time.</h1>
          <p>Your team’s work, from the first idea to the final check.</p>
        </div>
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            if (!creating) setDialogOpen(open);
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus />
              New task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>A new next step</DialogTitle>
              <DialogDescription>
                Give the task a clear name. You can track its status from your
                board.
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(event) => void createTask(event)}
              className="space-y-5"
            >
              <div className="space-y-2">
                <Label htmlFor="new-task-title">Task title</Label>
                <Input
                  id="new-task-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="e.g. Review the first prototype"
                  required
                  maxLength={300}
                  disabled={creating}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={creating}
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  pending={creating}
                  pendingLabel="Creating…"
                >
                  Create task
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
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
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[180px] flex-1 sm:max-w-xs">
                <Search
                  className="absolute left-3 top-3.5 size-4 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  aria-label="Search tasks"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Find a task…"
                  className="pl-10"
                />
              </div>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger
                  aria-label="Filter by task status"
                  className="h-11 w-[145px]"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All statuses</SelectItem>
                  {columns.map((column) => (
                    <SelectItem key={column.id} value={column.id}>
                      {column.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => setFiltersOpen(!filtersOpen)}
                aria-expanded={filtersOpen}
                aria-controls="task-filters"
              >
                <SlidersHorizontal />
                Filters
                {activeFilters > 0 && (
                  <span className="ml-1 text-xs">({activeFilters})</span>
                )}
              </Button>
              <div
                className="ml-auto hidden gap-1 rounded-lg border p-1 lg:flex"
                role="group"
                aria-label="Task view"
              >
                <Button
                  size="sm"
                  variant={view === "board" ? "secondary" : "ghost"}
                  aria-pressed={view === "board"}
                  onClick={() => setView("board")}
                >
                  <Columns3 />
                  Board
                </Button>
                <Button
                  size="sm"
                  variant={view === "list" ? "secondary" : "ghost"}
                  aria-pressed={view === "list"}
                  onClick={() => setView("list")}
                >
                  <LayoutList />
                  List
                </Button>
              </div>
            </div>
            {filtersOpen && (
              <div id="task-filters" className="filter-panel surface p-4">
                <div className="space-y-2">
                  <Label htmlFor="filter-assignee">Assigned to</Label>
                  <Select value={assignee} onValueChange={setAssignee}>
                    <SelectTrigger id="filter-assignee">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Everyone</SelectItem>
                      {Array.from(new Set(tasks.map(taskOwner)))
                        .sort()
                        .map((owner) => (
                          <SelectItem key={owner} value={owner}>
                            {owner}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="filter-milestone">Milestone</Label>
                  <Select value={milestone} onValueChange={setMilestone}>
                    <SelectTrigger id="filter-milestone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All milestones</SelectItem>
                      {Array.from(
                        new Set(
                          tasks.map(
                            (task) => task.milestone?.title || "No milestone",
                          ),
                        ),
                      )
                        .sort()
                        .map((value) => (
                          <SelectItem key={value} value={value}>
                            {value}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="filter-priority">Priority</Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger id="filter-priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All priorities</SelectItem>
                      {["HIGH", "MEDIUM", "LOW"].map((value) => (
                        <SelectItem key={value} value={value}>
                          {value[0] + value.slice(1).toLowerCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button className="self-end" variant="ghost" onClick={clear}>
                  Clear all filters
                </Button>
              </div>
            )}
            <p role="status" className="text-xs text-muted-foreground">
              {filtered.length} of {tasks.length} tasks
              {pendingIds.length > 0 ? " · Saving changes…" : ""}
            </p>
          </div>
          {tasks.length === 0 ? (
            <EmptyState
              title="Make room for the first step."
              description="Add a task your team can take on. Every good project starts somewhere."
            >
              <Button onClick={() => setDialogOpen(true)}>
                <Plus />
                Create a task
              </Button>
            </EmptyState>
          ) : (
            <>
              {view === "board" && (
                <div className="hidden grid-cols-3 items-start gap-5 lg:grid">
                  {columns.map((column) => (
                    <section
                      key={column.id}
                      className="rounded-xl bg-muted/50 p-3"
                      aria-label={column.label}
                    >
                      <div className="flex items-center justify-between px-2 pb-4 pt-2">
                        <h2 className="flex items-center gap-2 text-sm font-semibold">
                          <span
                            className={`size-2 rounded-full ${column.id === "DONE" ? "bg-primary" : column.id === "IN_PROGRESS" ? "bg-amber-500" : "bg-muted-foreground/50"}`}
                          />
                          {column.label}
                        </h2>
                        <span className="text-xs tabular-nums text-muted-foreground">
                          {
                            filtered.filter((task) => task.status === column.id)
                              .length
                          }
                        </span>
                      </div>
                      <div className="space-y-3">
                        {filtered
                          .filter((task) => task.status === column.id)
                          .map((task) => (
                            <article key={task.id} className="surface p-4">
                              <Link
                                className="block rounded-md"
                                to={`/projects/${projectId}/tasks/${task.id}`}
                              >
                                <p className="break-words text-sm font-semibold hover:text-primary">
                                  {task.title}
                                </p>
                                {task.description && (
                                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                                    {task.description}
                                  </p>
                                )}
                              </Link>
                              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary text-[10px] font-bold">
                                  {taskOwner(task)[0]}
                                </span>
                                <span className="truncate">
                                  {taskOwner(task)}
                                </span>
                                {task.priority === "HIGH" && (
                                  <span className="ml-auto text-destructive">
                                    High
                                  </span>
                                )}
                              </div>
                              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t pt-3">
                                <span
                                  className={`flex items-center gap-1 text-xs ${isOverdue(task) ? "text-destructive" : "text-muted-foreground"}`}
                                >
                                  <Calendar className="size-3" />
                                  {formatDate(task.due_date)}
                                </span>
                                <StatusControl
                                  task={task}
                                  pending={pendingIds.includes(task.id)}
                                  change={(value) =>
                                    void changeStatus(task, value)
                                  }
                                />
                              </div>
                            </article>
                          ))}
                        {!filtered.some(
                          (task) => task.status === column.id,
                        ) && (
                          <p className="rounded-lg border border-dashed p-7 text-center text-xs text-muted-foreground">
                            No tasks here yet.
                          </p>
                        )}
                      </div>
                    </section>
                  ))}
                </div>
              )}
              <div
                className={`surface overflow-hidden ${view === "board" ? "lg:hidden" : ""}`}
              >
                {filtered.map((task) => (
                  <article
                    key={task.id}
                    className="border-b p-5 last:border-b-0"
                  >
                    <div className="flex items-start gap-3">
                      {task.status === "DONE" ? (
                        <CheckSquare
                          className="mt-1 size-5 shrink-0 text-primary"
                          aria-hidden="true"
                        />
                      ) : task.status === "IN_PROGRESS" ? (
                        <Clock
                          className="mt-1 size-5 shrink-0 text-primary"
                          aria-hidden="true"
                        />
                      ) : (
                        <Circle
                          className="mt-1 size-5 shrink-0 text-muted-foreground"
                          aria-hidden="true"
                        />
                      )}
                      <Link
                        to={`/projects/${projectId}/tasks/${task.id}`}
                        className="min-w-0 flex-1 rounded-md"
                      >
                        <h2 className="break-words text-sm font-semibold hover:text-primary">
                          {task.title}
                        </h2>
                        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                          {task.description}
                        </p>
                      </Link>
                      <ArrowRight
                        className="mt-1 size-4 shrink-0 text-muted-foreground"
                        aria-hidden="true"
                      />
                    </div>
                    <dl className="ml-8 mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-xs sm:grid-cols-4">
                      <div>
                        <dt className="text-muted-foreground">Assigned to</dt>
                        <dd className="mt-1 break-words font-medium">
                          {taskOwner(task)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Due date</dt>
                        <dd
                          className={`mt-1 font-medium ${isOverdue(task) ? "text-destructive" : ""}`}
                        >
                          {formatDate(task.due_date)}
                          {isOverdue(task) ? " · Overdue" : ""}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Milestone</dt>
                        <dd className="mt-1 break-words font-medium">
                          {task.milestone?.title || "No milestone"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">
                          Priority / estimate
                        </dt>
                        <dd className="mt-1 font-medium">
                          {task.priority[0] +
                            task.priority.slice(1).toLowerCase()}{" "}
                          · {task.estimated_hours ?? "—"}h
                        </dd>
                      </div>
                    </dl>
                    <div className="ml-8 mt-4">
                      <StatusControl
                        task={task}
                        pending={pendingIds.includes(task.id)}
                        change={(value) => void changeStatus(task, value)}
                      />
                    </div>
                  </article>
                ))}
              </div>
              {filtered.length === 0 && (
                <EmptyState
                  title="No tasks match these filters."
                  description="Clear the filters to see all of your team’s work."
                >
                  <Button variant="outline" onClick={clear}>
                    Clear filters
                  </Button>
                </EmptyState>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
