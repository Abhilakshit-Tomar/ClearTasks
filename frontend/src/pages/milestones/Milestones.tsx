import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { milestoneService } from '@/services/api';
import type { Milestone } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Flag } from 'lucide-react';
import { toast } from 'sonner';

const Milestones = () => {
  const { projectId } = useParams<{ projectId: string }>();
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
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Milestones</h1>
        <p className="text-muted-foreground">Track major phases and deadlines for your project.</p>
      </div>

      <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-muted before:to-transparent">
        {(milestones || []).length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">No milestones defined.</div>
        ) : (
          (milestones || []).map((milestone) => (
            <div key={milestone.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-primary/20 text-primary shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                <Flag className="h-4 w-4" />
              </div>
              <Card className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-lg">{milestone.title}</CardTitle>
                    <Badge variant={milestone.status === 'COMPLETED' ? 'default' : milestone.status === 'IN_PROGRESS' ? 'secondary' : 'outline'}>
                      {milestone.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">{milestone.description}</p>
                  <div className="flex items-center text-sm font-medium text-destructive">
                    <Calendar className="h-4 w-4 mr-2" />
                    {new Date(milestone.due_date).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Milestones;
