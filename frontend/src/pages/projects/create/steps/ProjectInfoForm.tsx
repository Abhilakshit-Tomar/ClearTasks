import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Calendar, Users, Briefcase } from 'lucide-react';

interface Props {
  onSubmit: (data: any) => void;
}

const ProjectInfoForm = ({ onSubmit }: Props) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    teamSize: '',
    deadline: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 mb-3">
          What are you building?
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg">
          Give us a few details and ClearTasks will build the plan.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-slate-400" />
              Project Title
            </Label>
            <Input 
              id="title" 
              required 
              placeholder="e.g., Campus Event Management System" 
              className="h-11 bg-slate-50 dark:bg-slate-900"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Project Description
            </Label>
            <Textarea 
              id="description" 
              required 
              placeholder="Describe the main features, target audience, and what makes it special..." 
              rows={5}
              className="resize-none bg-slate-50 dark:bg-slate-900"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="teamSize" className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Users className="h-4 w-4 text-slate-400" />
                Team Size
              </Label>
              <Input 
                id="teamSize" 
                type="number" 
                min="1" 
                max="20" 
                required 
                placeholder="e.g., 4"
                className="h-11 bg-slate-50 dark:bg-slate-900"
                value={formData.teamSize}
                onChange={(e) => setFormData({...formData, teamSize: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deadline" className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-400" />
                Deadline
              </Label>
              <Input 
                id="deadline" 
                type="date" 
                required 
                className="h-11 bg-slate-50 dark:bg-slate-900"
                value={formData.deadline}
                onChange={(e) => setFormData({...formData, deadline: e.target.value})}
              />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
            <Button type="submit" size="lg" className="w-full h-12 text-base font-semibold">
              <Sparkles className="h-5 w-5 mr-2" />
              Build My Plan
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectInfoForm;
