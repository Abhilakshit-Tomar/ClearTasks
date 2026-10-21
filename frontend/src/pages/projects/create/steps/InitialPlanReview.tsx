import { AIProjectPlan } from "@/types";
import { Button } from "@/components/ui/button";
import { ArrowRight, Wand2, Info, Circle } from "lucide-react";

interface Props {
  plan: AIProjectPlan;
  onImprove: () => void;
  onProceed: () => void;
  isImproved?: boolean;
}

const InitialPlanReview = ({
  plan,
  onImprove,
  onProceed,
  isImproved = false,
}: Props) => {
  const totalTasks = plan.phases.reduce(
    (acc, phase) => acc + phase.tasks.length,
    0,
  );

  return (
    <div className="max-w-3xl mx-auto py-8">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-3">
          {isImproved ? "Your improved plan" : "Your plan is ready"}
        </h1>
        <p className="text-lg text-muted-foreground">
          Review the AI-generated timeline and task distribution.
        </p>
      </div>

      {/* Summary Banner */}
      <div className="bg-muted/50 rounded-2xl p-6 mb-10 border border-border text-center">
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-foreground/85 font-semibold text-lg">
          <span>{totalTasks} tasks</span>
          <span className="text-muted-foreground">&bull;</span>
          <span>{plan.milestones.length} milestones</span>
          <span className="text-muted-foreground">&bull;</span>
          <span>{plan.timelineDays} days</span>
        </div>
        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
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
            <h3 className="text-lg font-bold text-foreground mb-4 pb-2 border-b border-border">
              {phase.name}
            </h3>
            <div className="space-y-2">
              {phase.tasks.map((task, tIdx) => (
                <div
                  key={tIdx}
                  className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 py-3 px-3 hover:bg-slate-50 dark:hover:bg-slate-900/50 rounded-lg transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Circle className="h-4 w-4 text-muted-foreground group-hover:text-emerald-500 transition-colors shrink-0" />
                    <span className="font-medium text-foreground/85 break-words">
                      {task.title}
                      <span className="mt-1 block text-xs font-normal text-muted-foreground">
                        {task.estimatedHours}h estimated · Due day{" "}
                        {task.relativeDueDay}
                        {task.dependsOn.length
                          ? ` · After: ${task.dependsOn.join(", ")}`
                          : ""}
                      </span>
                    </span>
                  </div>
                  <div className="text-sm font-medium text-muted-foreground shrink-0 ml-4 flex items-center gap-2">
                    <ArrowRight className="h-3 w-3 text-slate-300 hidden sm:block" />
                    {task.assignedToProfile || "Unassigned"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-center pt-8 border-t border-border">
        {
          <Button
            variant="outline"
            size="lg"
            onClick={onImprove}
            className="w-full sm:w-auto h-12 text-base font-medium"
          >
            <Wand2 className="h-4 w-4 mr-2" />
            Improve My Plan
          </Button>
        }
        <Button
          size="lg"
          onClick={onProceed}
          className="w-full sm:w-auto h-12 text-base font-medium px-8"
        >
          Looks Good, Proceed
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default InitialPlanReview;
