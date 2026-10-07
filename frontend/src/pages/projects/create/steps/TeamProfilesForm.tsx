import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, ArrowRight, ArrowLeft, Users, UserCircle } from 'lucide-react';
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

  const [ownerIndex, setOwnerIndex] = useState<number>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
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

    const outputProfiles = profiles.map((p, idx) => ({ ...p, isOwner: idx === ownerIndex }));
    onSubmit(outputProfiles);
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 mb-3">
          Who is on the team?
        </h2>
        <p className="text-lg text-slate-500 dark:text-slate-400">
          Define your team's skills to help AI distribute tasks efficiently.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-6">
          {profiles.map((profile, index) => (
            <div key={index} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm relative">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                  <UserCircle className="h-5 w-5 text-indigo-500" />
                  Team Member {index + 1}
                </h3>
                {profiles.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeProfile(index)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Display Name *</Label>
                  <Input 
                    placeholder="e.g. John Doe" 
                    className="h-11 bg-slate-50 dark:bg-slate-900"
                    value={profile.displayName}
                    onChange={(e) => updateProfile(index, 'displayName', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Experience Level</Label>
                  <Input 
                    placeholder="e.g. Intermediate, Beginner" 
                    className="h-11 bg-slate-50 dark:bg-slate-900"
                    value={profile.experienceLevel}
                    onChange={(e) => updateProfile(index, 'experienceLevel', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Skills & Technologies</Label>
                  <Input 
                    placeholder="e.g. React, Node.js" 
                    className="h-11 bg-slate-50 dark:bg-slate-900"
                    value={profile.skills}
                    onChange={(e) => updateProfile(index, 'skills', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Preferred Work Area</Label>
                  <Input 
                    placeholder="e.g. Frontend UI" 
                    className="h-11 bg-slate-50 dark:bg-slate-900"
                    value={profile.preferredWork}
                    onChange={(e) => updateProfile(index, 'preferredWork', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Role Description</Label>
                <Textarea 
                  placeholder="e.g. Full-stack developer handling core integrations" 
                  className="resize-none bg-slate-50 dark:bg-slate-900"
                  value={profile.description}
                  onChange={(e) => updateProfile(index, 'description', e.target.value)}
                  rows={2}
                />
              </div>
            </div>
          ))}
        </div>

        {profiles.length < teamSize && (
          <Button type="button" variant="outline" className="w-full h-14 border-dashed border-2 text-slate-500 font-medium rounded-2xl" onClick={addProfile}>
            <Plus className="h-5 w-5 mr-2" />
            Add Another Member
          </Button>
        )}

        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <h3 className="font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2 mb-2">
            <Users className="h-5 w-5 text-indigo-500" />
            Project Owner Selection
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Select which of the above members represents you (the creator).
          </p>
          <div className="space-y-3">
            {profiles.map((profile, index) => (
              <div key={index} className="flex items-center space-x-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl cursor-pointer hover:border-indigo-300 transition-colors" onClick={() => setOwnerIndex(index)}>
                <input
                  type="radio"
                  id={`owner-${index}`}
                  name="projectOwner"
                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  checked={ownerIndex === index}
                  readOnly
                />
                <Label htmlFor={`owner-${index}`} className="font-medium cursor-pointer flex-1">
                  {profile.displayName || `Member ${index + 1}`} {profile.skills ? <span className="font-normal text-slate-400 ml-2">— {profile.skills}</span> : ''}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-6 items-center">
          <Button type="button" variant="ghost" size="lg" className="w-full sm:w-auto h-12 text-base font-medium" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button type="submit" size="lg" className="w-full sm:flex-1 h-12 text-base font-medium bg-slate-900 hover:bg-slate-800 text-white dark:bg-indigo-600 dark:hover:bg-indigo-700">
            Generate Plan
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TeamProfilesForm;
