import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, ArrowRight, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export interface TeamProfileInput {
  displayName: string;
  description: string;
  skills: string;
  experienceLevel: string;
  preferredWork: string;
}

interface Props {
  initialProfiles: TeamProfileInput[];
  teamSize: number;
  onSubmit: (profiles: TeamProfileInput[]) => void;
  onBack: () => void;
}

const TeamProfilesForm = ({ initialProfiles, teamSize, onSubmit, onBack }: Props) => {
  const [profiles, setProfiles] = useState<TeamProfileInput[]>(
    initialProfiles.length > 0 ? initialProfiles : [{ displayName: '', description: '', skills: '', experienceLevel: '', preferredWork: '' }]
  );

  const updateProfile = (index: number, field: keyof TeamProfileInput, value: string) => {
    const newProfiles = [...profiles];
    newProfiles[index] = { ...newProfiles[index], [field]: value };
    setProfiles(newProfiles);
  };

  const addProfile = () => {
    if (profiles.length >= teamSize) {
      toast.error(`You have already added ${teamSize} members (your defined team size).`);
      return;
    }
    setProfiles([...profiles, { displayName: '', description: '', skills: '', experienceLevel: '', preferredWork: '' }]);
  };

  const removeProfile = (index: number) => {
    const newProfiles = [...profiles];
    newProfiles.splice(index, 1);
    setProfiles(newProfiles);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const emptyNames = profiles.some(p => !p.displayName.trim());
    if (emptyNames) {
      toast.error('All planned members must have a display name.');
      return;
    }

    const uniqueNames = new Set(profiles.map(p => p.displayName.trim().toLowerCase()));
    if (uniqueNames.size !== profiles.length) {
      toast.error('Each planned member must have a unique display name.');
      return;
    }

    onSubmit(profiles);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold tracking-tight mb-2">Plan Team Members</h2>
        <p className="text-muted-foreground">
          Define the roles, skills, and names for your team members. AI will assign tasks to them. (Optional but recommended)
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          {profiles.map((profile, index) => (
            <Card key={index} className="relative">
              <CardContent className="pt-6 space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-lg">Member {index + 1}</h3>
                  {profiles.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeProfile(index)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Display Name <span className="text-destructive">*</span></Label>
                    <Input 
                      placeholder="e.g. John Doe" 
                      value={profile.displayName}
                      onChange={(e) => updateProfile(index, 'displayName', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Experience Level</Label>
                    <Input 
                      placeholder="e.g. Intermediate, Beginner" 
                      value={profile.experienceLevel}
                      onChange={(e) => updateProfile(index, 'experienceLevel', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Skills & Technologies</Label>
                  <Input 
                    placeholder="e.g. React, Node.js, Python" 
                    value={profile.skills}
                    onChange={(e) => updateProfile(index, 'skills', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Preferred Work Area</Label>
                  <Input 
                    placeholder="e.g. Frontend UI, Backend API, Database" 
                    value={profile.preferredWork}
                    onChange={(e) => updateProfile(index, 'preferredWork', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Short Description / Role</Label>
                  <Textarea 
                    placeholder="e.g. Full-stack developer handling core API integrations" 
                    value={profile.description}
                    onChange={(e) => updateProfile(index, 'description', e.target.value)}
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {profiles.length < teamSize && (
          <Button type="button" variant="outline" className="w-full border-dashed" onClick={addProfile}>
            <Plus className="h-4 w-4 mr-2" />
            Add Another Member
          </Button>
        )}

        <div className="flex gap-4 pt-4">
          <Button type="button" variant="outline" className="flex-1" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button type="submit" className="flex-1">
            Generate Plan
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TeamProfilesForm;
