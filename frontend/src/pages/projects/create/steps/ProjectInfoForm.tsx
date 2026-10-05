import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

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
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Create New Project</CardTitle>
        <CardDescription>Tell us about your project. Our AI will automatically generate a project plan and distribute tasks.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Project Title</Label>
            <Input 
              id="title" 
              required 
              placeholder="e.g. Smart Campus Portal" 
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Main Functionalities & Description</Label>
            <Textarea 
              id="description" 
              required 
              placeholder="Describe what you want to build and its core features..." 
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="teamSize">Team Size</Label>
              <Input 
                id="teamSize" 
                type="number" 
                min="1" 
                max="20" 
                required 
                placeholder="e.g. 4"
                value={formData.teamSize}
                onChange={(e) => setFormData({...formData, teamSize: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline</Label>
              <Input 
                id="deadline" 
                type="date" 
                required 
                value={formData.deadline}
                onChange={(e) => setFormData({...formData, deadline: e.target.value})}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button type="submit" size="lg">
            <Sparkles className="h-4 w-4 mr-2" />
            Generate AI Plan
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ProjectInfoForm;
