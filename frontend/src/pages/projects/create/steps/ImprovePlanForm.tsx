import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Wand2 } from 'lucide-react';

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
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Refine AI Plan (Optional)</CardTitle>
        <CardDescription>Provide more details to help the AI better distribute tasks and balance the workload.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="teamSkills">Team Skills & Strengths</Label>
            <Textarea 
              id="teamSkills" 
              placeholder="e.g. Alice is good at React, Bob prefers Backend Node.js..." 
              value={formData.teamSkills}
              onChange={(e) => setFormData({...formData, teamSkills: e.target.value})}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="techPreferences">Preferred Technologies</Label>
            <Textarea 
              id="techPreferences" 
              placeholder="e.g. React, Express, PostgreSQL, Tailwind..." 
              value={formData.techPreferences}
              onChange={(e) => setFormData({...formData, techPreferences: e.target.value})}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="instructorRequirements">Specific Instructor Requirements</Label>
            <Textarea 
              id="instructorRequirements" 
              placeholder="e.g. Must include user authentication and a CI/CD pipeline..." 
              value={formData.instructorRequirements}
              onChange={(e) => setFormData({...formData, instructorRequirements: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="advancedFeatures">Advanced Features desired</Label>
            <Textarea 
              id="advancedFeatures" 
              placeholder="e.g. WebSockets, File Uploads, Notifications..." 
              value={formData.advancedFeatures}
              onChange={(e) => setFormData({...formData, advancedFeatures: e.target.value})}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-4">
          <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button type="submit">
            <Wand2 className="h-4 w-4 mr-2" />
            Improve Plan
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ImprovePlanForm;
