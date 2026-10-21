import { AIProjectPlan } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Rocket,
  FileEdit,
  Users,
  CalendarDays,
  CheckCircle2,
  Flag,
} from "lucide-react";

interface Props {
  plan: AIProjectPlan;
  projectData: any;
  onConfirm: () => void;
  onBack: () => void;
  isSubmitting?: boolean;
}

const ReviewConfirm = ({
  plan,
  projectData,
  onConfirm,
  onBack,
  isSubmitting = false,
}: Props) => {
  const totalTasks = plan.phases.reduce(
    (acc, phase) => acc + phase.tasks.length,
    0,
  );

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-3">
          Final Review
        </h1>
        <p className="text-lg text-muted-foreground">
          Everything is ready. Confirm the details below to create your
          workspace.
        </p>
      </div>

      <div className="space-y-6 mb-12">
        {/* Project Info */}
        <div className="bg-card border border-border rounded-2xl p-6 ">
          <h3 className="text-xl font-bold text-foreground mb-4">
            {projectData.title}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <CalendarDays className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Deadline
                </p>
                <p className="text-sm text-muted-foreground">
                  {new Date(projectData.deadline).toLocaleDateString(
                    undefined,
                    {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    },
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-foreground">Team</p>
                <p className="text-sm text-muted-foreground">
                  {projectData.teamSize} members
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Plan Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-muted/50 border border-border rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Flag className="h-5 w-5 text-foreground/85" />
              <h4 className="font-bold text-foreground">
                Milestones ({plan.milestones.length})
              </h4>
            </div>
            <ul className="space-y-3">
              {plan.milestones.slice(0, 3).map((m, i) => (
                <li
                  key={i}
                  className="text-sm text-muted-foreground flex justify-between"
                >
                  <span className="truncate pr-2">{m.title}</span>
                  <span className="shrink-0 font-medium">
                    Day {m.relativeDay}
                  </span>
                </li>
              ))}
              {plan.milestones.length > 3 && (
                <li className="text-sm text-muted-foreground italic">
                  +{plan.milestones.length - 3} more
                </li>
              )}
            </ul>
          </div>

          <div className="bg-muted/50 border border-border rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="h-5 w-5 text-foreground/85" />
              <h4 className="font-bold text-foreground">
                Tasks ({totalTasks})
              </h4>
            </div>
            <div className="space-y-3">
              {plan.phases.slice(0, 3).map((p, i) => (
                <div
                  key={i}
                  className="text-sm text-muted-foreground flex justify-between"
                >
                  <span className="truncate pr-2">{p.name}</span>
                  <span className="shrink-0 font-medium">
                    {p.tasks.length} tasks
                  </span>
                </div>
              ))}
              {plan.phases.length > 3 && (
                <div className="text-sm text-muted-foreground italic">
                  +{plan.phases.length - 3} more phases
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-center pt-6 border-t border-border">
        <Button
          variant="ghost"
          size="lg"
          onClick={onBack}
          disabled={isSubmitting}
          className="w-full sm:w-auto h-12 text-base font-medium"
        >
          <FileEdit className="h-4 w-4 mr-2" />
          Back to plan
        </Button>
        <Button
          size="lg"
          onClick={onConfirm}
          pending={isSubmitting}
          pendingLabel="Creating your workspace…"
          className="w-full sm:w-auto h-12 text-base font-medium px-8 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Rocket className="h-4 w-4 mr-2" />
          Create Project
        </Button>
      </div>
    </div>
  );
};

export default ReviewConfirm;
