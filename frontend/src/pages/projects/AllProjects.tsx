import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Calendar,
  FolderOpen,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { projectService, taskService, milestoneService } from "@/services/api";
import type { Project } from "@/types";
import { useRemoteData } from "@/hooks/useRemoteData";
import {
  errorMessage,
  formatDate,
  humanStatus,
  projectStyle,
  summarizeProject,
  taskOwner,
} from "@/lib/studio";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState, ErrorState, LoadingState } from "@/components/Feedback";

type ProjectEntry = {
  project: Project;
  summary: ReturnType<typeof summarizeProject> | null;
};

async function loadProjects(): Promise<ProjectEntry[]> {
  const projects = await projectService.getProjects();
  const entries: ProjectEntry[] = new Array(projects.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(4, projects.length) }, async () => {
      while (next < projects.length) {
        const index = next++;
        const project = projects[index];
        const result = await Promise.allSettled([
          taskService.getTasks(project.id),
          milestoneService.getMilestones(project.id),
        ]);
        entries[index] = {
          project,
          summary:
            result[0].status === "fulfilled" && result[1].status === "fulfilled"
              ? summarizeProject(project, result[0].value, result[1].value)
              : null,
        };
      }
    }),
  );
  return entries;
}

export default function AllProjects() {
  const { data, loading, error, refresh, updateData } =
    useRemoteData(loadProjects);
  const [query, setQuery] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [selected, setSelected] = useState<Project | null>(null);
  const filtered = useMemo(
    () =>
      (data || []).filter(({ project }) =>
        `${project.name} ${project.description} ${project.project_type || ""}`
          .toLowerCase()
          .includes(query.trim().toLowerCase()),
      ),
    [data, query],
  );
  async function deleteProject() {
    if (!selected || deleting) return;
    setDeleting(true);
    try {
      await projectService.deleteProject(selected.id);
      updateData((entries) =>
        entries.filter((entry) => entry.project.id !== selected.id),
      );
      setSelected(null);
      toast.success("Project deleted");
    } catch (error) {
      toast.error(
        errorMessage(error, "Project couldn’t be deleted. Please try again."),
      );
    } finally {
      setDeleting(false);
    }
  }
  if (loading)
    return <LoadingState label="Loading your projects and their next steps…" />;
  return (
    <div className="page-shell">
      <div className="page-heading">
        <div>
          <h1 className="!font-editorial !text-4xl">
            A little progress, together.
          </h1>
          <p>Your projects, your people, and the next thing to move forward.</p>
        </div>
        <Button asChild>
          <Link to="/projects/new">
            <Plus aria-hidden="true" />
            New project
          </Link>
        </Button>
      </div>
      {error && (
        <ErrorState
          compact={!!data}
          message={error}
          retry={() => void refresh()}
        />
      )}
      {data?.some((entry) => !entry.summary) && (
        <ErrorState
          compact
          message="Some project details aren’t available. Your projects are still here; retry to load their latest progress."
          retry={() => void refresh()}
        />
      )}
      {data?.length === 0 ? (
        <EmptyState
          title="Your next good idea starts here."
          description="Tell us what you’re building, bring your team, and turn the big idea into a shared plan."
        >
          <Button asChild>
            <Link to="/projects/new">
              Create your first project
              <ArrowRight />
            </Link>
          </Button>
        </EmptyState>
      ) : (
        data && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-5">
              <h2 className="text-lg font-semibold">
                Your projects{" "}
                <span className="ml-1 text-sm font-normal text-muted-foreground">
                  {data.length}
                </span>
              </h2>
              <div className="relative w-full sm:w-64">
                <Search
                  className="absolute left-3 top-3.5 size-4 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  aria-label="Search projects"
                  placeholder="Find a project…"
                  className="h-11 pl-10"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-5">
              {filtered.map(({ project, summary }) => (
                <article
                  key={project.id}
                  style={projectStyle(project.id)}
                  className="surface overflow-hidden"
                >
                  <div className="project-cover grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 px-5 py-5 sm:px-7">
                    <div className="min-w-0">
                      <span className="project-badge">
                        <span className="project-dot" />
                        {project.project_type || "Team project"}
                      </span>
                      <h3 className="mt-3 break-words text-xl font-semibold">
                        <Link
                          to={`/projects/${project.id}`}
                          className="rounded-md hover:text-primary"
                        >
                          {project.name}
                        </Link>
                      </h3>
                      <p className="mt-2 line-clamp-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                        {project.description}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Actions for ${project.name}`}
                        >
                          <MoreHorizontal aria-hidden="true" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to={`/projects/${project.id}`}>
                            <FolderOpen className="mr-2 size-4" />
                            Open project
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onSelect={() => setSelected(project)}
                        >
                          <Trash2 className="mr-2 size-4" />
                          Delete project
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="grid gap-6 px-5 py-5 sm:px-7 lg:grid-cols-[1.1fr_1fr_auto] lg:items-center">
                    <div>
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <span
                          className={`status-badge ${summary?.overdue.length || summary?.health === "Past deadline" ? "status-warning" : "status-good"}`}
                        >
                          {summary?.health || "Progress unavailable"}
                        </span>
                        <span className="tabular-nums text-muted-foreground">
                          {summary
                            ? `${summary.completed} of ${summary.total} tasks complete`
                            : humanStatus(project.status)}
                        </span>
                      </div>
                      {summary && (
                        <Progress
                          value={summary.percent}
                          aria-label={`${project.name} progress`}
                          className="h-1.5"
                        />
                      )}
                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="size-3.5" />
                          Due {formatDate(project.deadline)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Users className="size-3.5" />
                          {project.team_size} members
                        </span>
                      </div>
                    </div>
                    <div className="min-w-0 lg:border-l lg:pl-6">
                      <p className="text-xs font-medium text-muted-foreground">
                        {summary?.upcoming[0] ? "Next move" : "Next milestone"}
                      </p>
                      <p className="mt-2 truncate text-sm font-semibold">
                        {summary?.upcoming[0]?.title ||
                          summary?.nextMilestone?.title ||
                          (summary
                            ? "Open the workspace to plan what’s next."
                            : "Retry to see the latest next step.")}
                      </p>
                      {summary?.upcoming[0] && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {taskOwner(summary.upcoming[0])} ·{" "}
                          {formatDate(summary.upcoming[0].due_date)}
                        </p>
                      )}
                    </div>
                    <Button variant="outline" asChild>
                      <Link to={`/projects/${project.id}`}>
                        Open project
                        <ArrowRight aria-hidden="true" />
                      </Link>
                    </Button>
                  </div>
                </article>
              ))}
            </div>
            {filtered.length === 0 && (
              <EmptyState
                title="No matching projects"
                description="Try a different name or clear your search."
              >
                <Button variant="outline" onClick={() => setQuery("")}>
                  Clear search
                </Button>
              </EmptyState>
            )}
          </>
        )
      )}
      <Dialog
        open={!!selected}
        onOpenChange={(open) => {
          if (!open && !deleting) setSelected(null);
        }}
      >
        <DialogContent
          onEscapeKeyDown={(event) => {
            if (deleting) event.preventDefault();
          }}
          onInteractOutside={(event) => {
            if (deleting) event.preventDefault();
          }}
        >
          <DialogHeader>
            <DialogTitle>Delete {selected?.name}?</DialogTitle>
            <DialogDescription>
              This permanently deletes the project, tasks, milestones, members,
              and related notifications. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              disabled={deleting}
              onClick={() => setSelected(null)}
            >
              Keep project
            </Button>
            <Button
              variant="destructive"
              pending={deleting}
              pendingLabel="Deleting…"
              onClick={() => void deleteProject()}
            >
              Delete project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
