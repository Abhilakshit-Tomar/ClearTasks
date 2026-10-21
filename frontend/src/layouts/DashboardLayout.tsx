import { useEffect, useLayoutEffect, useState } from "react";
import { Link, Navigate, Outlet, useLocation } from "react-router-dom";
import {
  useAuth,
  useUser,
  UserButton,
  SignOutButton,
} from "@clerk/clerk-react";
import {
  Bell,
  CheckSquare,
  ChevronLeft,
  Flag,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Users,
  X,
} from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Brand, PendingLabel } from "@/components/Feedback";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { setTokenProvider } from "@/services/api";
import { projectStyle } from "@/lib/studio";

function Navigation({
  projectId,
  close,
}: {
  projectId: string | null;
  close: () => void;
}) {
  const { pathname } = useLocation();
  const groups = [
    ...(projectId
      ? [
          {
            label: "Project workspace",
            items: [
              {
                name: "Overview",
                path: `/projects/${projectId}`,
                icon: LayoutDashboard,
              },
              {
                name: "Tasks",
                path: `/projects/${projectId}/tasks`,
                icon: CheckSquare,
              },
              {
                name: "Milestones",
                path: `/projects/${projectId}/milestones`,
                icon: Flag,
              },
              {
                name: "Team",
                path: `/projects/${projectId}/team`,
                icon: Users,
              },
            ],
          },
        ]
      : []),
    {
      label: projectId ? "Your workspace" : "Workspace",
      items: [
        { name: "All projects", path: "/dashboard", icon: FolderKanban },
        { name: "Notifications", path: "/notifications", icon: Bell },
        { name: "Settings", path: "/settings", icon: Settings },
      ],
    },
  ];
  return (
    <nav aria-label="Workspace navigation" className="space-y-7 px-4">
      {projectId && (
        <Link
          to="/dashboard"
          onClick={close}
          className="flex min-h-11 items-center gap-1 rounded-md px-2 text-sm text-muted-foreground hover:text-primary"
        >
          <ChevronLeft className="size-4" />
          Back to projects
        </Link>
      )}
      {groups.map((group) => (
        <div key={group.label}>
          <p className="mb-2 flex items-center gap-2 px-3 text-xs font-semibold text-muted-foreground">
            {projectId && group.label === "Project workspace" && (
              <span className="project-dot" />
            )}
            {group.label}
          </p>
          <div className="space-y-1">
            {group.items.map((item) => {
              const active =
                pathname === item.path ||
                (item.name === "Tasks" && pathname.startsWith(`${item.path}/`));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={close}
                  aria-current={active ? "page" : undefined}
                  className="workspace-nav-link"
                >
                  <item.icon className="size-[18px]" aria-hidden="true" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

function AccountFooter() {
  const { user } = useUser();
  return (
    <div className="mt-auto border-t p-4">
      <div className="flex min-w-0 items-center gap-3 px-2 py-3">
        <UserButton afterSignOutUrl="/" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">
            {user?.fullName || user?.firstName || "Your account"}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {user?.primaryEmailAddress?.emailAddress}
          </p>
        </div>
      </div>
      <SignOutButton>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground"
        >
          <LogOut aria-hidden="true" />
          Sign out
        </Button>
      </SignOutButton>
    </div>
  );
}

export default function DashboardLayout() {
  const [isOpen, setOpen] = useState(false);
  const location = useLocation();
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const match = location.pathname.match(/\/projects\/([a-zA-Z0-9-]+)/);
  const projectId = match && match[1] !== "new" ? match[1] : null;
  const section =
    location.pathname.split("/").filter(Boolean).at(-1) || "Workspace";
  const title = location.pathname.includes("/tasks/")
    ? "Task details"
    : section === "dashboard"
      ? "Your workspace"
      : section === "new"
        ? "Create a project"
        : section === projectId
          ? "Project overview"
          : section.charAt(0).toUpperCase() + section.slice(1);
  useLayoutEffect(() => {
    setTokenProvider(getToken);
  }, [getToken]);
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = `${title} · ClearTasks`;
  }, [location.pathname, title]);
  if (!isLoaded)
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <PendingLabel>Opening your workspace…</PendingLabel>
      </div>
    );
  if (!isSignedIn) return <Navigate to="/login" replace />;
  return (
    <div
      className="workspace-shell"
      style={projectStyle(projectId || "cleartasks")}
    >
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <aside className="workspace-sidebar">
        <div className="px-6 py-7">
          <Brand />
        </div>
        <div className="flex-1 overflow-y-auto pb-6">
          <Navigation projectId={projectId} close={() => setOpen(false)} />
        </div>
        <AccountFooter />
      </aside>
      <div className="min-w-0">
        <header className="workspace-topbar">
          <div className="hidden items-center gap-2 text-sm md:flex">
            <Link
              to="/dashboard"
              className="rounded-md py-2 text-muted-foreground hover:text-primary"
            >
              Workspace
            </Link>
            <span className="text-muted-foreground/60">/</span>
            <span className="font-medium">{title}</span>
          </div>
          <div className="md:hidden">
            <Brand />
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden text-xs text-muted-foreground md:block">
              A little more clarity.
            </span>
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="hidden md:inline-flex"
            >
              <Link to="/notifications" aria-label="View notifications">
                <Bell aria-hidden="true" />
              </Link>
            </Button>
            <DialogPrimitive.Root open={isOpen} onOpenChange={setOpen}>
              <DialogPrimitive.Trigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  aria-label="Open navigation"
                  aria-expanded={isOpen}
                >
                  <Menu aria-hidden="true" />
                </Button>
              </DialogPrimitive.Trigger>
              <DialogPrimitive.Portal>
                <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-foreground/35" />
                <DialogPrimitive.Content className="fixed inset-y-0 left-0 z-50 flex w-[min(85vw,320px)] flex-col bg-background shadow-xl">
                  <div className="flex items-center justify-between px-6 py-6">
                    <DialogPrimitive.Title className="text-xl font-bold">
                      ClearTasks
                    </DialogPrimitive.Title>
                    <DialogPrimitive.Close asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Close navigation"
                      >
                        <X aria-hidden="true" />
                      </Button>
                    </DialogPrimitive.Close>
                  </div>
                  <DialogPrimitive.Description className="sr-only">
                    Choose a project page or open your account settings.
                  </DialogPrimitive.Description>
                  <div className="flex-1 overflow-y-auto">
                    <Navigation
                      projectId={projectId}
                      close={() => setOpen(false)}
                    />
                  </div>
                  <AccountFooter />
                </DialogPrimitive.Content>
              </DialogPrimitive.Portal>
            </DialogPrimitive.Root>
          </div>
        </header>
        <main
          id="main-content"
          tabIndex={-1}
          className="workspace-content outline-none"
        >
          <ErrorBoundary key={location.pathname}>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
