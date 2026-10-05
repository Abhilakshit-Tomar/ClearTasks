import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projectService, taskService, milestoneService } from '@/services/api';
import { Project, Task, Milestone } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Calendar, CheckSquare, Users, Flag, ArrowRight } from 'lucide-react';

const ProjectDashboard = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!projectId) return;
      setLoading(true);
      try {
        const [proj, t, m] = await Promise.all([
          projectService.getProject(projectId),
          taskService.getTasks(projectId),
          milestoneService.getMilestones(projectId)
        ]);
        setProject(proj || null);
        setTasks(t || []);
        setMilestones(m || []);
      } catch (error) {
        console.error("Error fetching project data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [projectId]);

  if (loading) return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-1/3" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Skeleton className="h-24" /><Skeleton className="h-24" />
        <Skeleton className="h-24" /><Skeleton className="h-24" />
      </div>
      <Skeleton className="h-64" />
    </div>
  );

  if (!project) return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="text-center space-y-4 max-w-md p-8 border border-red-500 bg-red-50 rounded-xl">
        <h2 className="text-2xl font-bold text-red-700">Project Not Found</h2>
        <p className="text-red-600">The project could not be loaded. Please ensure you have the correct link and permissions.</p>
        <Button onClick={() => window.location.href = '/dashboard'}>Return to Dashboard</Button>
      </div>
    </div>
  );

  const completedTasks = (tasks || []).filter(t => t?.status === 'DONE').length;
  const totalTasks = (tasks || []).length;
  const progressPercent = totalTasks === 0 ? 0 : (Math.round((completedTasks / totalTasks) * 100) || 0);

  const upcomingMilestone = (milestones || [])
    .filter(m => m?.status !== 'COMPLETED' && m?.due_date)
    .sort((a, b) => {
      const timeA = new Date(a.due_date).getTime();
      const timeB = new Date(b.due_date).getTime();
      return (isNaN(timeA) ? 0 : timeA) - (isNaN(timeB) ? 0 : timeB);
    })[0];
    
  const safeDate = (dateStr: any) => {
    try {
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? 'Invalid Date' : d.toLocaleDateString();
    } catch {
      return 'Invalid Date';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
          <p className="text-muted-foreground">{project.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
            {project.status}
          </span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Overall Progress</p>
              <h3 className="text-2xl font-bold">{progressPercent}%</h3>
            </div>
            <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              <CheckSquare className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Deadline</p>
              <h3 className="text-xl font-bold">{safeDate(project.deadline)}</h3>
            </div>
            <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              <Calendar className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Team Size</p>
              <h3 className="text-2xl font-bold">{project.team_size} Members</h3>
            </div>
            <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tasks</p>
              <h3 className="text-2xl font-bold">{completedTasks} / {totalTasks}</h3>
            </div>
            <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              <CheckSquare className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Project Progress</CardTitle>
              <CardDescription>Based on completed tasks</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to={`/projects/${projectId}/tasks`}>Go to Board</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={progressPercent} className="h-4" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>0%</span>
              <span>100%</span>
            </div>
            
            <div className="mt-8">
              <h4 className="font-semibold mb-3">AI Insights</h4>
              <div className="p-4 bg-muted/50 rounded-lg text-sm">
                <p>Based on your current velocity, you are <strong>on track</strong> to complete the project by the deadline. The Design phase has 2 bottleneck tasks assigned to Bob.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flag className="h-5 w-5 text-primary" />
              Upcoming Milestone
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingMilestone ? (
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">{upcomingMilestone.title}</h3>
                <p className="text-sm text-muted-foreground">{upcomingMilestone.description}</p>
                <div className="flex justify-between text-sm pt-4">
                  <span className="font-medium text-destructive">
                    Due: {safeDate(upcomingMilestone.due_date)}
                  </span>
                  <span className="text-muted-foreground">{upcomingMilestone.status}</span>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No upcoming milestones.</p>
            )}
            <div className="pt-6">
              <Button variant="ghost" className="w-full justify-between" asChild>
                <Link to={`/projects/${projectId}/milestones`}>
                  View all milestones <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProjectDashboard;
