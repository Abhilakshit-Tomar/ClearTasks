import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { taskService } from '@/services/api';
import { Task } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChevronLeft, Calendar, Clock, Flag, AlignLeft, Trash, CalendarDays, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const TaskDetailsPage = () => {
  const { projectId, taskId } = useParams<{ projectId: string, taskId: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTask = async () => {
    if (!projectId || !taskId) return;
    try {
      const tasks = await taskService.getTasks(projectId);
      const t = tasks.find(x => x.id === taskId);
      setTask(t || null);
    } catch (error) {
      toast.error("Failed to load task");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTask();
    const interval = setInterval(fetchTask, 5000);
    return () => clearInterval(interval);
  }, [projectId, taskId]);

  const handleStatusChange = async (newStatus: string) => {
    if (!task) return;
    setTask({ ...task, status: newStatus as any });
    await taskService.updateTaskStatus(task.id, newStatus as any);
    toast.success('Task status updated');
  };

  const handleDelete = async () => {
    if (!task || !projectId) return;
    try {
      await taskService.deleteTask(task.id);
      toast.success('Task deleted');
      navigate(`/projects/${projectId}/tasks`);
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  if (loading) return <div className="space-y-4 max-w-4xl mx-auto"><Skeleton className="h-10 w-32" /><Skeleton className="h-64" /></div>;
  if (!task) return <div className="text-center py-20">Task not found</div>;

  const assigneeName = task.assignee?.name || (task as any).planned_profile?.display_name || 'Unassigned';

  const getPriorityInfo = (p: string) => {
    switch (p) {
      case 'HIGH': return { color: 'bg-destructive/10 text-destructive', text: 'Important! Blocks other work and should be completed early.' };
      case 'MEDIUM': return { color: 'bg-amber-500/10 text-amber-600', text: 'Normal project priority.' };
      case 'LOW': return { color: 'bg-green-500/10 text-green-600', text: 'Can be completed later without blocking major work.' };
      default: return { color: 'bg-secondary', text: '' };
    }
  };

  const priorityInfo = getPriorityInfo(task.priority);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div className="flex justify-between items-center">
        <Button variant="ghost" onClick={() => navigate(`/projects/${projectId}/tasks`)}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Board
        </Button>
        <Button variant="destructive" size="sm" onClick={handleDelete}>
          <Trash className="h-4 w-4 mr-2" />
          Delete Task
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              {task.phase && <Badge variant="outline">{task.phase}</Badge>}
              <Badge variant="secondary" className={priorityInfo.color}>
                {task.priority} PRIORITY
              </Badge>
              <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary">
                {task.status.replace('_', ' ')}
              </Badge>
            </div>
            
            <h1 className="text-3xl font-bold tracking-tight mb-6">{task.title}</h1>
            
            <div className="flex flex-wrap items-center gap-x-8 gap-y-4 text-sm text-muted-foreground border-b pb-6">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={task.assignee?.avatar_url} />
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    {assigneeName !== 'Unassigned' ? assigneeName[0] : '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wider opacity-70">Assignee</span>
                  <span className="font-medium text-foreground">{assigneeName}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="h-8 w-8 p-1.5 rounded-full bg-muted text-muted-foreground" />
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wider opacity-70">Estimated Effort</span>
                  <span className="font-medium text-foreground">{task.estimated_hours} Hours</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <AlignLeft className="h-5 w-5 text-muted-foreground" />
              Description
            </h3>
            <Card className="shadow-sm">
              <CardContent className="p-6">
                <div className="prose dark:prose-invert max-w-none text-sm text-foreground/90 whitespace-pre-wrap">
                  {task.description || <span className="italic text-muted-foreground">No description provided.</span>}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="w-full md:w-80 space-y-6 shrink-0">
          <Card className="shadow-sm">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Current Status</label>
                <Select value={task.status} onValueChange={handleStatusChange}>
                  <SelectTrigger className="w-full font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TODO">To Do</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="DONE">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base font-semibold">Properties</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-5">
              
              <div className="flex items-start gap-3">
                <Flag className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div className="text-sm">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Milestone</p>
                  <p className="font-medium leading-snug">{task.milestone?.title || 'None'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div className="text-sm">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Due Date</p>
                  <p className="font-medium leading-snug">{task.due_date ? new Date(task.due_date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' }) : 'None'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CalendarDays className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div className="text-sm">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Start Date (Created)</p>
                  <p className="font-medium leading-snug">{new Date(task.created_at).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 pt-2 border-t">
                <AlertTriangle className={`h-4 w-4 mt-0.5 ${task.priority === 'HIGH' ? 'text-destructive' : task.priority === 'MEDIUM' ? 'text-amber-500' : 'text-green-500'}`} />
                <div className="text-sm">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Priority Meaning</p>
                  <p className="leading-snug text-muted-foreground">{priorityInfo.text}</p>
                </div>
              </div>
              
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailsPage;
