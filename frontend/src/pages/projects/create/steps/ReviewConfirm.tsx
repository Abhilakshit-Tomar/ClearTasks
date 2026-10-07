import { AIProjectPlan } from '@/types';
import { Button } from '@/components/ui/button';
import { Rocket, FileEdit, Users, CalendarDays, CheckCircle2, Flag } from 'lucide-react';

interface Props {
  plan: AIProjectPlan;
  projectData: any;
  onConfirm: () => void;
  onBack: () => void;
}

const ReviewConfirm = ({ plan, projectData, onConfirm, onBack }: Props) => {
  const totalTasks = plan.phases.reduce((acc, phase) => acc + phase.tasks.length, 0);

  return (
    <div className="max-w-3xl mx-auto py-8">
      
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 mb-3">
          Final Review
        </h2>
        <p className="text-lg text-slate-500 dark:text-slate-400">
          Everything is ready. Confirm the details below to create your workspace.
        </p>
      </div>

      <div className="space-y-6 mb-12">
        {/* Project Info */}
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-4">{projectData.title}</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <CalendarDays className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Deadline</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {new Date(projectData.deadline).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Team</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {projectData.teamSize} members
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Plan Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Flag className="h-5 w-5 text-slate-700 dark:text-slate-300" />
              <h4 className="font-bold text-slate-900 dark:text-slate-50">Milestones ({plan.milestones.length})</h4>
            </div>
            <ul className="space-y-3">
              {plan.milestones.slice(0, 3).map((m, i) => (
                <li key={i} className="text-sm text-slate-600 dark:text-slate-400 flex justify-between">
                  <span className="truncate pr-2">{m.title}</span>
                  <span className="shrink-0 font-medium">Day {m.relativeDay}</span>
                </li>
              ))}
              {plan.milestones.length > 3 && (
                <li className="text-sm text-slate-400 italic">+{plan.milestones.length - 3} more</li>
              )}
            </ul>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="h-5 w-5 text-slate-700 dark:text-slate-300" />
              <h4 className="font-bold text-slate-900 dark:text-slate-50">Tasks ({totalTasks})</h4>
            </div>
            <div className="space-y-3">
              {plan.phases.slice(0, 3).map((p, i) => (
                <div key={i} className="text-sm text-slate-600 dark:text-slate-400 flex justify-between">
                  <span className="truncate pr-2">{p.name}</span>
                  <span className="shrink-0 font-medium">{p.tasks.length} tasks</span>
                </div>
              ))}
              {plan.phases.length > 3 && (
                <div className="text-sm text-slate-400 italic">+{plan.phases.length - 3} more phases</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-center pt-6 border-t border-slate-100 dark:border-slate-800">
        <Button variant="ghost" size="lg" onClick={onBack} className="w-full sm:w-auto h-12 text-base font-medium">
          <FileEdit className="h-4 w-4 mr-2" />
          Edit Plan
        </Button>
        <Button size="lg" onClick={onConfirm} className="w-full sm:w-auto h-12 text-base font-medium px-8 bg-slate-900 hover:bg-slate-800 text-white dark:bg-indigo-600 dark:hover:bg-indigo-700">
          <Rocket className="h-4 w-4 mr-2" />
          Create Project
        </Button>
      </div>

    </div>
  );
};

export default ReviewConfirm;
