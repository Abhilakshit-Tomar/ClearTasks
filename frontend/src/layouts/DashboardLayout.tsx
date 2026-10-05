import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, CheckSquare, Users, Flag, Bell, Settings, Menu, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { useAuth, useUser, UserButton } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';
import { setTokenProvider } from '@/services/api';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const DashboardLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    setTokenProvider(getToken);
  }, [getToken]);

  // Extract project ID from URL if inside a project
  const match = location.pathname.match(/\/projects\/([a-zA-Z0-9-]+)/);
  const projectId = match && match[1] !== 'new' ? match[1] : null;

  // Reset scroll on navigate
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  if (isLoaded && !isSignedIn) {
    return <Navigate to="/login" replace />;
  }

  if (!isLoaded) {
    return <div className="h-screen w-full flex items-center justify-center">Loading...</div>;
  }

  const closeSidebar = () => setSidebarOpen(false);

  const navItems = projectId ? [
    { name: 'Overview', path: `/projects/${projectId}`, icon: LayoutDashboard },
    { name: 'Tasks', path: `/projects/${projectId}/tasks`, icon: CheckSquare },
    { name: 'Milestones', path: `/projects/${projectId}/milestones`, icon: Flag },
    { name: 'Team', path: `/projects/${projectId}/team`, icon: Users },
  ] : [];

  const globalNavItems = [
    { name: 'All Projects', path: '/dashboard', icon: FolderKanban },
    { name: 'Notifications', path: '/notifications', icon: Bell },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const NavLinks = () => (
    <div className="flex flex-col gap-1">
      {projectId && (
        <div className="mb-6">
          <Link to="/dashboard" onClick={closeSidebar} className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Projects
          </Link>
          <div className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2 px-3">Project Workspace</div>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.name === 'Tasks' && location.pathname.includes('/tasks'));
            const Icon = item.icon;
            return (
              <Link key={item.path} to={item.path} onClick={closeSidebar}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${isActive ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Link>
            )
          })}
        </div>
      )}

      <div className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2 px-3">Global</div>
      {globalNavItems.map((item) => {
        const isActive = location.pathname.startsWith(item.path);
        const Icon = item.icon;
        return (
          <Link key={item.path} to={item.path} onClick={closeSidebar}
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${isActive ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
          >
            <Icon className="h-4 w-4" />
            {item.name}
          </Link>
        )
      })}
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-card shadow-sm h-full">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <CheckSquare className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl tracking-tight">ClearTasks</span>
          </Link>
        </div>
        <nav className="flex-1 px-4 overflow-y-auto">
          <NavLinks />
        </nav>
        <div className="p-4 border-t">
          <div className="flex items-center gap-3 px-3 py-2">
            <UserButton afterSignOutUrl="/" />
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{user?.fullName || user?.firstName || 'User'}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.primaryEmailAddress?.emailAddress}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b bg-card">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center">
              <CheckSquare className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg tracking-tight">ClearTasks</span>
          </Link>
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!isSidebarOpen)}>
            <Menu className="h-5 w-5" />
          </Button>
        </header>

        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={closeSidebar} />
            <div className="fixed inset-y-0 left-0 w-3/4 max-w-sm bg-card border-r shadow-lg flex flex-col">
              <div className="p-6">
                <span className="font-bold text-xl tracking-tight">ClearTasks</span>
              </div>
              <nav className="flex-1 px-4 overflow-y-auto">
                <NavLinks />
              </nav>
              <div className="p-4 border-t">
                <div className="flex items-center gap-3 px-3 py-2">
                  <UserButton afterSignOutUrl="/" />
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium truncate">{user?.fullName || user?.firstName || 'User'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
