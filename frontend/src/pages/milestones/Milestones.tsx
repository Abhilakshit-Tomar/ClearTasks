import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { milestoneService } from '@/services/api';
import type { Milestone } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, Flag, Clock, CheckCircle2, Circle } from 'lucide-react';
import { toast } from 'sonner';

const Milestones = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMilestones = async () => {
    if (!projectId) return;
    try {
      const data = await milestoneService.getMilestones(projectId);
      setMilestones(data);
    } catch (error) {
      toast.error("Failed to load milestones");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMilestones();
    const interval = setInterval(fetchMilestones, 5000);
    return () => clearInterval(interval);
  }, [projectId]);

  if (loading) return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-48" />
      <div className="space-y-4">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-24" />)}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Milestones</h1>
        <p className="text-muted-foreground">Track major phases and deadlines for your project.</p>
      </div>

      <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-muted before:to-transparent">
        {(milestones || []).length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">No milestones defined.</div>
        ) : (
          (milestones || []).map((milestone) => {
            const tasks = milestone.tasks || [];
            const totalTasks = tasks.length;
            const completedTasks = tasks.filter(t => t.status === 'DONE').length;
            const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
            const totalHours = tasks.reduce((sum, t) => sum + (t.estimated_hours || 0), 0);
            
            // Dynamic status based on tasks
            let dynamicStatus = milestone.status;
            if (totalTasks > 0) {
              if (completedTasks === totalTasks) dynamicStatus = 'COMPLETED';
              else if (completedTasks > 0) dynamicStatus = 'IN_PROGRESS';
              else dynamicStatus = 'PENDING';
            }

            return (
              <div key={milestone.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-primary/20 text-primary shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                  <Flag className="h-4 w-4" />
                </div>
                <Card className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start gap-2">
                      <CardTitle className="text-lg leading-tight">{milestone.title}</CardTitle>
                      <Badge variant={dynamicStatus === 'COMPLETED' ? 'default' : dynamicStatus === 'IN_PROGRESS' ? 'secondary' : 'outline'}>
                        {dynamicStatus.replace('_', ' ')}
                      </Badge>
                    </div>
                    {milestone.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{milestone.description}</p>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap items-center gap-4 text-sm font-medium">
                      <div className="flex items-center text-destructive">
                        <Calendar className="h-4 w-4 mr-1.5" />
                        {new Date(milestone.due_date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Clock className="h-4 w-4 mr-1.5" />
                        {totalHours} hrs estimated
                      </div>
                    </div>

                    {totalTasks > 0 && (
                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs font-medium">
                            <span>{completedTasks} of {totalTasks} tasks complete</span>
                            <span>{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                        
                        <div className="space-y-2 mt-4 pt-4 border-t">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tasks</p>
                          <div className="flex flex-col gap-2">
                            {tasks.map(task => {
                              // assignee formatting from backend query which returns json_agg -> assignee_name, profile_name
                              const assignedTo = (task as any).assignee_name || (task as any).profile_name || 'Unassigned';
                              const isDone = task.status === 'DONE';
                              return (
                                <div 
                                  key={task.id} 
                                  onClick={() => navigate(`/projects/${projectId}/tasks/${task.id}`)}
                                  className="flex items-start gap-2 p-2 -mx-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors group/task"
                                >
                                  {isDone ? (
                                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                  ) : (
                                    <Circle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5 group-hover/task:text-primary transition-colors" />
                                  )}
                                  <div className="flex flex-col flex-1 min-w-0">
                                    <span className={`text-sm truncate font-medium ${isDone ? 'text-muted-foreground line-through' : ''}`}>
                                      {task.title}
                                    </span>
                                    <span className="text-xs text-muted-foreground truncate">
                                      Assigned to: {assignedTo}
                                    </span>
                                  </div>
                                  <Badge variant="outline" className="text-[10px] uppercase shrink-0">
                                    {task.status.replace('_', ' ')}
                                  </Badge>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Milestones;
