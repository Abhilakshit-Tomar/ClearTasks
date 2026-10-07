import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';

// Layouts
import DashboardLayout from '@/layouts/DashboardLayout';

// Pages
import LandingPage from '@/pages/LandingPage';
import Login from '@/pages/auth/Login';
import SignUp from '@/pages/auth/SignUp';
import AllProjects from '@/pages/projects/AllProjects';
import CreateProjectFlow from '@/pages/projects/create/CreateProjectFlow';
import ProjectDashboard from '@/pages/projects/ProjectDashboard';
import TaskBoard from '@/pages/tasks/TaskBoard';
import Team from '@/pages/team/Team';
import Milestones from '@/pages/milestones/Milestones';
import Notifications from '@/pages/notifications/Notifications';
import Settings from '@/pages/settings/Settings';
import TaskDetailsPage from '@/pages/tasks/TaskDetailsPage';
import InviteAccept from '@/pages/InviteAccept';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/accept-invitation" element={<InviteAccept />} />

        {/* Protected routes wrapped in Dashboard Layout */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<AllProjects />} />
          <Route path="/projects/new" element={<CreateProjectFlow />} />
          
          <Route path="/projects/:projectId" element={<ProjectDashboard />} />
          <Route path="/projects/:projectId/tasks" element={<TaskBoard />} />
          <Route path="/projects/:projectId/tasks/:taskId" element={<TaskDetailsPage />} />
          <Route path="/projects/:projectId/team" element={<Team />} />
          <Route path="/projects/:projectId/milestones" element={<Milestones />} />
          
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
