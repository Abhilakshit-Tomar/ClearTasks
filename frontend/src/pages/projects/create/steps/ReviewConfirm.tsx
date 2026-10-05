import { AIProjectPlan } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, ChevronLeft } from 'lucide-react';

interface Props {
  plan: AIProjectPlan;
  projectData: any;
  onConfirm: () => void;
  onBack: () => void;
}

const ReviewConfirm = ({ plan, projectData, onConfirm, onBack }: Props) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">Review & Confirm</h2>
          <p className="text-muted-foreground">Please review the final project plan before creating the workspace.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Title</p>
              <p className="font-medium">{projectData.title}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Description</p>
              <p className="font-medium">{projectData.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Team Size</p>
                <p className="font-medium">{projectData.teamSize} Members</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Deadline</p>
                <p className="font-medium">{new Date(projectData.deadline).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Plan Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Project Type</p>
                <p className="font-medium">{plan.projectType}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Difficulty</p>
                <p className="font-medium">{plan.difficulty}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Tasks</p>
                <p className="font-medium">{plan.estimatedTasks}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Milestones</p>
                <p className="font-medium">{plan.milestones.length}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phases</p>
              <p className="font-medium">{plan.phases.map(p => p.name).join(', ')}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="ghost" onClick={onBack}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button size="lg" onClick={onConfirm} className="bg-green-600 hover:bg-green-700 text-white">
          <Check className="h-4 w-4 mr-2" />
          Confirm & Create Project
        </Button>
      </div>
    </div>
  );
};

export default ReviewConfirm;
