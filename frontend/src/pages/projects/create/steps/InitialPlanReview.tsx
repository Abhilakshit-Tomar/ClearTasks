import { AIProjectPlan } from '@/types';
import { Button } from '@/components/ui/button';
import { ArrowRight, Wand2, Info, CheckCircle2 } from 'lucide-react';

interface Props {
  plan: AIProjectPlan;
  onImprove: () => void;
  onProceed: () => void;
  isImproved?: boolean;
}

const InitialPlanReview = ({ plan, onImprove, onProceed, isImproved = false }: Props) => {
  const totalTasks = plan.phases.reduce((acc, phase) => acc + phase.tasks.length, 0);

  return (
    <div className="max-w-3xl mx-auto py-8">
      
      {/* Header */}
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 mb-3">
          {isImproved ? 'Your improved plan' : 'Your plan is ready'}
        </h2>
        <p className="text-lg text-slate-500 dark:text-slate-400">
          Review the AI-generated timeline and task distribution.
        </p>
      </div>

      {/* Summary Banner */}
      <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 mb-10 border border-slate-200 dark:border-slate-800 text-center">
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-slate-700 dark:text-slate-300 font-semibold text-lg">
          <span>{totalTasks} tasks</span>
          <span className="text-slate-300 dark:text-slate-700">&bull;</span>
          <span>{plan.milestones.length} milestones</span>
          <span className="text-slate-300 dark:text-slate-700">&bull;</span>
          <span>{plan.timelineDays} days</span>
        </div>
        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <Info className="h-4 w-4 shrink-0" />
          {isImproved 
            ? "Plan updated based on your feedback."
            : "Tasks distributed logically based on your project description and team size."}
        </div>
      </div>

      {/* Task List by Phase */}
      <div className="space-y-8 mb-12">
        {plan.phases.map((phase, pIdx) => (
          <div key={pIdx}>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
              {phase.name}
            </h3>
            <div className="space-y-2">
              {phase.tasks.map((task, tIdx) => (
                <div key={tIdx} className="flex justify-between items-center py-2 px-3 hover:bg-slate-50 dark:hover:bg-slate-900/50 rounded-lg transition-colors group">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <CheckCircle2 className="h-4 w-4 text-slate-300 dark:text-slate-700 group-hover:text-emerald-500 transition-colors shrink-0" />
                    <span className="font-medium text-slate-700 dark:text-slate-300 truncate">
                      {task.title}
                    </span>
                  </div>
                  <div className="text-sm font-medium text-slate-500 dark:text-slate-400 shrink-0 ml-4 flex items-center gap-2">
                    <ArrowRight className="h-3 w-3 text-slate-300 hidden sm:block" />
                    {task.assignedToProfile || 'Unassigned'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-center pt-8 border-t border-slate-100 dark:border-slate-800">
        {!isImproved && (
          <Button variant="outline" size="lg" onClick={onImprove} className="w-full sm:w-auto h-12 text-base font-medium">
            <Wand2 className="h-4 w-4 mr-2" />
            Improve My Plan
          </Button>
        )}
        <Button size="lg" onClick={onProceed} className="w-full sm:w-auto h-12 text-base font-medium px-8">
          Looks Good, Proceed
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
      
    </div>
  );
};

export default InitialPlanReview;
