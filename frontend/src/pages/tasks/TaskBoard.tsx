import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { taskService } from '@/services/api';
import { Task } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
const COLUMNS = [
  { id: 'TODO', title: 'To Do' },
  { id: 'IN_PROGRESS', title: 'In Progress' },
  { id: 'DONE', title: 'Done' }
] as const;

const TaskBoard = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !newTaskTitle.trim()) return;
    try {
      const task = await taskService.createTask(projectId, { 
        title: newTaskTitle, 
        phase: 'General', 
        status: 'TODO', 
        priority: 'MEDIUM',
        estimated_hours: 1
      });
      setTasks([...tasks, task]);
      setNewTaskTitle('');
      setIsDialogOpen(false);
      toast.success('Task created');
    } catch (error) {
      toast.error('Failed to create task');
    }
  };
  useEffect(() => {
    const fetchTasks = async () => {
      if (!projectId) return;
      try {
        const data = await taskService.getTasks(projectId);
        setTasks(data);
      } catch (error) {
        console.error("Failed to load tasks", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [projectId]);

  if (loading) return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-48" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-96" />)}
      </div>
    </div>
  );

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'HIGH': return 'bg-destructive text-destructive-foreground';
      case 'MEDIUM': return 'bg-amber-500 text-white';
      case 'LOW': return 'bg-green-500 text-white';
      default: return 'bg-secondary';
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Task Board</h1>
          <p className="text-muted-foreground">Manage your project tasks</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Task</DialogTitle>
              <DialogDescription>Add a new task to your project.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateTask} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Task Title</Label>
                <Input 
                  id="title" 
                  value={newTaskTitle} 
                  onChange={(e) => setNewTaskTitle(e.target.value)} 
                  placeholder="E.g., Design database schema" 
                  required 
                />
              </div>
              <div className="flex justify-end pt-4">
                <Button type="submit">Create</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-6 min-w-max h-full">
          {COLUMNS.map(col => (
            <div key={col.id} className="w-80 flex flex-col bg-muted/30 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-sm uppercase tracking-wider">{col.title}</h3>
                <Badge variant="secondary">{tasks.filter(t => t.status === col.id).length}</Badge>
              </div>
              
              <div className="flex-1 space-y-3 overflow-y-auto min-h-[500px]">
                {tasks.filter(t => t.status === col.id).map(task => (
                  <Link key={task.id} to={`/projects/${projectId}/tasks/${task.id}`} className="block">
                    <Card className="hover:border-primary transition-colors cursor-pointer">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex justify-between items-start gap-2">
                          <span className="font-medium text-sm leading-snug line-clamp-2">{task.title}</span>
                          <Badge variant="outline" className={`shrink-0 text-[10px] h-5 px-1 ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </Badge>
                        </div>
                        {task.phase && (
                          <Badge variant="secondary" className="text-xs font-normal">
                            {task.phase}
                          </Badge>
                        )}
                        <div className="flex justify-between items-center pt-2">
                          <span className="text-xs text-muted-foreground">
                            {task.estimated_hours}h
                          </span>
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={task.assignee?.avatar_url} />
                            <AvatarFallback>{task.assignee?.name?.[0] || '?'}</AvatarFallback>
                          </Avatar>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TaskBoard;
