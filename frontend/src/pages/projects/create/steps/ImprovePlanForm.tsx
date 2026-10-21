import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Wand2, Code, Lightbulb, Users } from "lucide-react";

interface Props {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  initialValues?: Record<string, string>;
}

const ImprovePlanForm = ({ onSubmit, onCancel, initialValues }: Props) => {
  const [formData, setFormData] = useState({
    teamSkills: "",
    techPreferences: "",
    instructorRequirements: "",
    advancedFeatures: "",
    ...initialValues,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-3">
          Refine your plan
        </h1>
        <p className="text-lg text-muted-foreground">
          Tell us what should change. Review the new suggestion before creating
          your workspace.
        </p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 ">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label
              htmlFor="techPreferences"
              className="text-sm font-semibold text-foreground/85 flex items-center gap-2"
            >
              <Code className="h-4 w-4 text-muted-foreground" />
              Preferred Technologies
            </Label>
            <Textarea
              id="techPreferences"
              placeholder="e.g. React, Express, PostgreSQL, Tailwind..."
              rows={2}
              className="resize-none bg-muted/50"
              value={formData.techPreferences}
              onChange={(e) =>
                setFormData({ ...formData, techPreferences: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="instructorRequirements"
              className="text-sm font-semibold text-foreground/85 flex items-center gap-2"
            >
              <Lightbulb className="h-4 w-4 text-muted-foreground" />
              Specific Instructor Requirements
            </Label>
            <Textarea
              id="instructorRequirements"
              placeholder="e.g. Must include user authentication and a CI/CD pipeline..."
              rows={2}
              className="resize-none bg-muted/50"
              value={formData.instructorRequirements}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  instructorRequirements: e.target.value,
                })
              }
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="teamSkills"
              className="text-sm font-semibold text-foreground/85 flex items-center gap-2"
            >
              <Users className="h-4 w-4 text-muted-foreground" />
              Team Skills & Strengths
            </Label>
            <Textarea
              id="teamSkills"
              placeholder="e.g. Alice is good at React, Bob prefers Backend Node.js..."
              rows={2}
              className="resize-none bg-muted/50"
              value={formData.teamSkills}
              onChange={(e) =>
                setFormData({ ...formData, teamSkills: e.target.value })
              }
            />
          </div>

          <div className="pt-6 border-t border-border flex flex-col sm:flex-row gap-4 items-center justify-end">
            <Button
              type="button"
              variant="ghost"
              size="lg"
              onClick={onCancel}
              className="w-full sm:w-auto h-12 text-base font-medium"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="lg"
              className="w-full sm:w-auto h-12 text-base font-medium px-8"
            >
              <Wand2 className="h-4 w-4 mr-2" />
              Improve Plan
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ImprovePlanForm;
