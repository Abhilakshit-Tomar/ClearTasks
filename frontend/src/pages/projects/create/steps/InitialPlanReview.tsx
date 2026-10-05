import { AIProjectPlan } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Wand2 } from 'lucide-react';

interface Props {
  plan: AIProjectPlan;
  onImprove: () => void;
  onProceed: () => void;
  isImproved?: boolean;
}

const InitialPlanReview = ({ plan, onImprove, onProceed, isImproved = false }: Props) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-2">
          {isImproved ? 'Improved AI Plan' : 'Initial AI Plan'}
        </h2>
        <p className="text-muted-foreground">
          Review the generated plan. You can proceed with this or ask the AI to refine it.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Project Type</CardDescription>
            <CardTitle className="text-lg">{plan.projectType}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Difficulty</CardDescription>
            <CardTitle className="text-lg">{plan.difficulty}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Timeline</CardDescription>
            <CardTitle className="text-lg">{plan.timelineDays} Days</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Phases & Modules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Suggested Phases</h4>
            <div className="flex flex-wrap gap-2">
              {plan.phases.map(p => <Badge key={p.name} variant="secondary">{p.name}</Badge>)}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-2">Identified Modules</h4>
            <div className="flex flex-wrap gap-2">
              {plan.modules.map(m => <Badge key={m.name} variant="outline" title={m.description}>{m.name}</Badge>)}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Generated Tasks</CardTitle>
          <CardDescription>Sample of tasks generated for the board.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {plan.phases.flatMap(p => p.tasks.map(t => ({...t, phase: p.name}))).slice(0, 4).map((t, idx) => (
              <li key={idx} className="flex justify-between items-center p-3 rounded-lg border bg-muted/30">
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{t.phase}</Badge>
                  <span className="font-medium">{t.title}</span>
                </div>
                <div className="text-sm text-muted-foreground">{t.estimatedHours}h</div>
              </li>
            ))}
            {plan.estimatedTasks > 4 && (
              <li className="text-center text-sm text-muted-foreground pt-2">
                + {plan.estimatedTasks - 4} more tasks
              </li>
            )}
          </ul>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-4 justify-end pt-4">
        {!isImproved && (
          <Button variant="outline" size="lg" onClick={onImprove}>
            <Wand2 className="h-4 w-4 mr-2" />
            Improve My Plan
          </Button>
        )}
        <Button size="lg" onClick={onProceed}>
          Proceed to Review
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default InitialPlanReview;
