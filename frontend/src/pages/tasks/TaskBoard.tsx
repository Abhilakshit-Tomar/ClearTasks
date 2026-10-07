import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { taskService } from '@/services/api';
import { Task } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, Clock, Flag, Search, ChevronRight, User, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

  // Filters for All Tasks
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAssignee, setFilterAssignee] = useState<string>('ALL');
  const [filterMilestone, setFilterMilestone] = useState<string>('ALL');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

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

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 5000);
    return () => clearInterval(interval);
  }, [projectId]);

  const uniqueAssignees = useMemo(() => {
    const assignees = new Set<string>();
    tasks.forEach(t => {
      const name = t.assignee?.name || (t as any).planned_profile?.display_name || 'Unassigned';
      assignees.add(name);
    });
    return Array.from(assignees).sort();
  }, [tasks]);

  const uniqueMilestones = useMemo(() => {
    const milestones = new Set<string>();
    tasks.forEach(t => {
      milestones.add(t.milestone?.title || 'None');
    });
    return Array.from(milestones).sort();
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const assigneeName = t.assignee?.name || (t as any).planned_profile?.display_name || 'Unassigned';
      const milestoneTitle = t.milestone?.title || 'None';
      
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        if (!t.title.toLowerCase().includes(query) && 
            !(t.description || '').toLowerCase().includes(query)) {
          return false;
        }
      }
      
      if (filterAssignee !== 'ALL' && assigneeName !== filterAssignee) return false;
      if (filterMilestone !== 'ALL' && milestoneTitle !== filterMilestone) return false;
      if (filterPriority !== 'ALL' && t.priority !== filterPriority) return false;
      if (filterStatus !== 'ALL' && t.status !== filterStatus) return false;
      
      return true;
    }).sort((a, b) => {
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    });
  }, [tasks, searchQuery, filterAssignee, filterMilestone, filterPriority, filterStatus]);

  if (loading) return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-48" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-96" />)}
      </div>
    </div>
  );

  const getPriorityColorText = (p: string) => {
    switch (p) {
      case 'HIGH': return 'text-destructive';
      case 'MEDIUM': return 'text-amber-500';
      case 'LOW': return 'text-green-500';
      default: return 'text-muted-foreground';
    }
  };

  const getPriorityColorBadge = (p: string) => {
    switch (p) {
      case 'HIGH': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'MEDIUM': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'LOW': return 'bg-green-500/10 text-green-600 border-green-500/20';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getStatusColorBadge = (s: string) => {
    switch (s) {
      case 'TODO': return 'bg-secondary text-secondary-foreground border-border';
      case 'IN_PROGRESS': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'DONE': return 'bg-green-500/10 text-green-600 border-green-500/20';
      default: return 'bg-secondary';
    }
  };

  const formatStatus = (s: string) => s.replace('_', ' ');

  // KANBAN CARD
  const KanbanCard = ({ task }: { task: Task }) => {
    const assigneeName = task.assignee?.name || (task as any).planned_profile?.display_name || 'Unassigned';
    
    return (
      <Link to={`/projects/${projectId}/tasks/${task.id}`} className="block">
        <Card className="hover:border-primary/40 hover:shadow-sm transition-all cursor-pointer h-full border-muted-foreground/20 shadow-none">
          <CardContent className="p-4 space-y-3">
            <div className="flex justify-between items-start gap-2">
              <span className="font-semibold text-sm leading-tight text-foreground">{task.title}</span>
              <span className={`shrink-0 text-[10px] font-bold uppercase tracking-wider ${getPriorityColorText(task.priority)}`}>
                {task.priority}
              </span>
            </div>
            
            {task.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {task.description}
              </p>
            )}
            
            <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
              <div className="flex items-center gap-1.5 truncate max-w-[50%]">
                <Flag className="h-3.5 w-3.5 shrink-0 opacity-70" />
                <span className="truncate">{task.milestone?.title || 'No Milestone'}</span>
              </div>
              <div className="flex items-center gap-1.5 truncate">
                <Avatar className="h-4 w-4 shrink-0">
                  <AvatarImage src={task.assignee?.avatar_url} />
                  <AvatarFallback className="text-[8px] bg-primary/10 text-primary uppercase">
                    {assigneeName !== 'Unassigned' ? assigneeName[0] : '?'}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate">{assigneeName}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1 border-t border-border/40">
              <div className="flex items-center gap-1.5 mt-2">
                <Calendar className="h-3.5 w-3.5 opacity-70" />
                <span>{task.due_date ? new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'No date'}</span>
              </div>
              <div className="flex items-center gap-1.5 mt-2">
                <Clock className="h-3.5 w-3.5 opacity-70" />
                <span>{task.estimated_hours}h est.</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Tasks</h1>
          <p className="text-muted-foreground mt-1">Manage and track all project tasks</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="shrink-0">
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

      <Tabs defaultValue="board" className="flex-1 flex flex-col min-h-0">
        <TabsList className="w-fit mb-6 h-9">
          <TabsTrigger value="board" className="px-6 text-sm">Board</TabsTrigger>
          <TabsTrigger value="all" className="px-6 text-sm">All Tasks</TabsTrigger>
        </TabsList>

        {/* =========================================================================
            BOARD VIEW
            ========================================================================= */}
        <TabsContent value="board" className="flex-1 mt-0 min-h-0 outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)] min-h-[500px]">
            {COLUMNS.map(col => {
              const columnTasks = tasks.filter(t => t.status === col.id);
              return (
                <div key={col.id} className="flex flex-col bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 h-full overflow-hidden">
                  <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-800/60 bg-white/50 dark:bg-slate-900/50 shrink-0">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">{col.title}</h3>
                    <Badge variant="secondary" className="rounded-full px-2 py-0.5 text-xs font-semibold bg-slate-200/50 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {columnTasks.length}
                    </Badge>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-3 space-y-3">
                    {columnTasks.map(task => (
                      <KanbanCard key={task.id} task={task} />
                    ))}
                    {columnTasks.length === 0 && (
                      <div className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-400 dark:text-slate-500 m-2">
                        <span className="text-xl mb-1">...</span>
                        <p>No tasks {col.title.toLowerCase()}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* =========================================================================
            ALL TASKS VIEW
            ========================================================================= */}
        <TabsContent value="all" className="flex-1 mt-0 flex flex-col min-h-0 outline-none">
          
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-3 mb-6 shrink-0">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search tasks..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="pl-9 h-9 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800" 
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground hidden sm:block" />
                <Select value={filterAssignee} onValueChange={setFilterAssignee}>
                  <SelectTrigger className="h-9 w-[140px] text-xs bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"><SelectValue placeholder="All Members" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Members</SelectItem>
                    {uniqueAssignees.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Flag className="h-4 w-4 text-muted-foreground hidden sm:block" />
                <Select value={filterMilestone} onValueChange={setFilterMilestone}>
                  <SelectTrigger className="h-9 w-[160px] text-xs bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"><SelectValue placeholder="All Milestones" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Milestones</SelectItem>
                    {uniqueMilestones.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground font-medium text-xs hidden sm:block">Priority</span>
                <Select value={filterPriority} onValueChange={setFilterPriority}>
                  <SelectTrigger className="h-9 w-[130px] text-xs bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"><SelectValue placeholder="All Priorities" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Priorities</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="LOW">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground font-medium text-xs hidden sm:block">Status</span>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="h-9 w-[130px] text-xs bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"><SelectValue placeholder="All Statuses" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Statuses</SelectItem>
                    <SelectItem value="TODO">To Do</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="DONE">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden flex flex-col h-[calc(100vh-270px)] min-h-[400px]">
            {/* Table Header */}
            <div className="hidden lg:grid grid-cols-[2fr_1.5fr_1.2fr_1fr_1fr_1fr_1fr_40px] gap-4 px-6 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider shrink-0">
              <div>Task</div>
              <div>Milestone</div>
              <div>Assignee</div>
              <div>Priority</div>
              <div>Due Date</div>
              <div>Estimate</div>
              <div>Status</div>
              <div></div>
            </div>

            {/* Table Body */}
            <div className="flex-1 overflow-y-auto">
              {filteredTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-70 p-8 text-center">
                  <AlertCircle className="h-10 w-10 mb-4 opacity-50" />
                  <p className="font-medium text-lg">No tasks found</p>
                  <p className="text-sm mt-1">Try adjusting your search or filters.</p>
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredTasks.map(task => {
                    const assigneeName = task.assignee?.name || (task as any).planned_profile?.display_name || 'Unassigned';
                    return (
                      <Link key={task.id} to={`/projects/${projectId}/tasks/${task.id}`} className="group block">
                        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1.5fr_1.2fr_1fr_1fr_1fr_1fr_40px] gap-y-4 gap-x-4 px-6 py-4 items-center hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                          
                          {/* Task Title & Desc */}
                          <div className="min-w-0">
                            <p className="font-semibold text-sm text-foreground truncate pr-4">{task.title}</p>
                            {task.description && (
                              <p className="text-xs text-muted-foreground truncate pr-4 mt-0.5">{task.description}</p>
                            )}
                          </div>
                          
                          {/* Milestone */}
                          <div className="flex items-center gap-2 min-w-0 text-sm text-slate-600 dark:text-slate-300">
                            <Flag className="h-3.5 w-3.5 shrink-0 opacity-70 text-muted-foreground hidden lg:block" />
                            <span className="truncate">{task.milestone?.title || 'None'}</span>
                          </div>
                          
                          {/* Assignee */}
                          <div className="flex items-center gap-2 min-w-0">
                            <Avatar className="h-6 w-6 shrink-0 hidden lg:block">
                              <AvatarImage src={task.assignee?.avatar_url} />
                              <AvatarFallback className="text-[10px] bg-primary/10 text-primary uppercase font-medium">
                                {assigneeName !== 'Unassigned' ? assigneeName[0] : '?'}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-slate-600 dark:text-slate-300 truncate">{assigneeName}</span>
                          </div>
                          
                          {/* Priority */}
                          <div>
                            <Badge variant="outline" className={`text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider ${getPriorityColorBadge(task.priority)}`}>
                              {task.priority}
                            </Badge>
                          </div>
                          
                          {/* Due Date */}
                          <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
                            <Calendar className="h-3.5 w-3.5 shrink-0 opacity-70 text-muted-foreground hidden lg:block" />
                            <span className="truncate">{task.due_date ? new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'None'}</span>
                          </div>
                          
                          {/* Estimate */}
                          <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
                            <Clock className="h-3.5 w-3.5 shrink-0 opacity-70 text-muted-foreground hidden lg:block" />
                            <span className="truncate">{task.estimated_hours}h</span>
                          </div>
                          
                          {/* Status */}
                          <div>
                            <Badge variant="secondary" className={`text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider ${getStatusColorBadge(task.status)}`}>
                              {formatStatus(task.status)}
                            </Badge>
                          </div>
                          
                          {/* Chevron */}
                          <div className="hidden lg:flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </div>

                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TaskBoard;
