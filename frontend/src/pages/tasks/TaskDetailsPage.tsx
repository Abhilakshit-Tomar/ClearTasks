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
import { ChevronLeft, Calendar, Clock, Flag, AlignLeft, Trash } from 'lucide-react';
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

  if (loading) return <div className="space-y-4"><Skeleton className="h-10 w-32" /><Skeleton className="h-64" /></div>;
  if (!task) return <div>Task not found</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
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
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">{task.phase}</Badge>
              <Badge variant="secondary" className={
                task.priority === 'HIGH' ? 'bg-destructive/10 text-destructive' :
                task.priority === 'MEDIUM' ? 'bg-amber-500/10 text-amber-600' : 'bg-green-500/10 text-green-600'
              }>{task.priority} PRIORITY</Badge>
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-4">{task.title}</h1>
            
            <div className="flex items-center gap-6 text-sm text-muted-foreground border-b pb-6">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={task.assignee?.avatar_url} />
                  <AvatarFallback>{task.assignee ? task.assignee.name[0] : (task as any).planned_profile ? (task as any).planned_profile.display_name[0] : '?'}</AvatarFallback>
                </Avatar>
                <span>{task.assignee?.name || (task as any).planned_profile?.display_name || 'Unassigned'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{task.estimated_hours}h estimated</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold flex items-center gap-2 mb-3">
              <AlignLeft className="h-5 w-5" />
              Description
            </h3>
            <div className="prose dark:prose-invert text-sm text-muted-foreground">
              {task.description || 'No description provided.'}
            </div>
          </div>
        </div>

        <div className="w-full md:w-80 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={task.status} onValueChange={handleStatusChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODO">To Do</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="DONE">Done</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm">
                  <p className="text-muted-foreground">Due Date</p>
                  <p className="font-medium">{task.due_date ? new Date(task.due_date).toLocaleDateString() : 'None'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Flag className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm">
                  <p className="text-muted-foreground">Milestone</p>
                  <p className="font-medium">{task.milestone?.title || 'None'}</p>
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
