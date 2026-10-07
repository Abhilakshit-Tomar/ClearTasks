import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Wand2, Code, Lightbulb, Users } from 'lucide-react';

interface Props {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const ImprovePlanForm = ({ onSubmit, onCancel }: Props) => {
  const [formData, setFormData] = useState({
    teamSkills: '',
    techPreferences: '',
    instructorRequirements: '',
    advancedFeatures: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 mb-3">
          Refine your plan
        </h2>
        <p className="text-lg text-slate-500 dark:text-slate-400">
          Your plan already works. You can improve it if you want, or just skip this.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="techPreferences" className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Code className="h-4 w-4 text-slate-400" />
              Preferred Technologies
            </Label>
            <Textarea 
              id="techPreferences" 
              placeholder="e.g. React, Express, PostgreSQL, Tailwind..." 
              rows={2}
              className="resize-none bg-slate-50 dark:bg-slate-900"
              value={formData.techPreferences}
              onChange={(e) => setFormData({...formData, techPreferences: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructorRequirements" className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-slate-400" />
              Specific Instructor Requirements
            </Label>
            <Textarea 
              id="instructorRequirements" 
              placeholder="e.g. Must include user authentication and a CI/CD pipeline..." 
              rows={2}
              className="resize-none bg-slate-50 dark:bg-slate-900"
              value={formData.instructorRequirements}
              onChange={(e) => setFormData({...formData, instructorRequirements: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="teamSkills" className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Users className="h-4 w-4 text-slate-400" />
              Team Skills & Strengths
            </Label>
            <Textarea 
              id="teamSkills" 
              placeholder="e.g. Alice is good at React, Bob prefers Backend Node.js..." 
              rows={2}
              className="resize-none bg-slate-50 dark:bg-slate-900"
              value={formData.teamSkills}
              onChange={(e) => setFormData({...formData, teamSkills: e.target.value})}
            />
          </div>

          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4 items-center justify-end">
            <Button type="button" variant="ghost" size="lg" onClick={onCancel} className="w-full sm:w-auto h-12 text-base font-medium">
              Cancel
            </Button>
            <Button type="submit" size="lg" className="w-full sm:w-auto h-12 text-base font-medium px-8">
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
