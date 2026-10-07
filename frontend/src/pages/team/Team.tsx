import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { teamService } from '@/services/api';
import { ProjectMember } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserPlus, Mail, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { TeamProfile } from '@/types';
import { invitationService } from '@/services/api';

const Team = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [profiles, setProfiles] = useState<TeamProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Invite state
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitingProfile, setInvitingProfile] = useState<TeamProfile | null>(null);


  const fetchTeam = async () => {
    if (!projectId) return;
    try {
      const [membersData, profilesData] = await Promise.all([
        teamService.getTeam(projectId),
        teamService.getTeamProfiles(projectId)
      ]);
      setMembers(membersData);
      setProfiles(profilesData);
    } catch (error) {
      toast.error("Failed to load team members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
    // Setup polling for cross-member updates (every 5 seconds)
    const interval = setInterval(fetchTeam, 5000);
    return () => clearInterval(interval);
  }, [projectId]);

  if (loading) return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-48" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-32" />)}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team</h1>
          <p className="text-muted-foreground">Manage your project members and their roles.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {members.map(member => (
          <Card key={member.id} className="border-primary/20 bg-primary/5">
            <CardContent className="p-6 flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={member.user?.avatar_url} />
                <AvatarFallback className="text-xl">{member.user?.name?.[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center sm:text-left space-y-1">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h3 className="font-semibold text-lg">{member.user?.name}</h3>
                  <Badge variant="outline" className="bg-background">Connected</Badge>
                </div>
                <p className="text-sm text-muted-foreground flex items-center justify-center sm:justify-start gap-1">
                  <Mail className="h-3 w-3" />
                  {member.user?.email}
                </p>
                <div className="flex flex-wrap justify-center sm:justify-start gap-2 pt-2">
                  <Badge variant={member.role === 'OWNER' ? 'default' : 'secondary'}>
                    {member.role}
                  </Badge>
                  {member.skills && (
                    <span className="text-xs text-muted-foreground mt-0.5">
                      Skills: {member.skills}
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {profiles.filter(p => !p.linked_user_id).map(profile => (
          <Card key={profile.id} className="border-dashed border-2">
            <CardContent className="p-6 flex flex-col items-center sm:items-start gap-4">
              <div className="flex-1 text-center sm:text-left space-y-1 w-full">
                <div className="flex items-center justify-between w-full">
                  <h3 className="font-semibold text-lg text-muted-foreground">{profile.display_name}</h3>
                  <Badge variant="outline" className="text-muted-foreground">
                    {profile.has_pending_invitation ? 'Pending invitation' : 'Not connected'}
                  </Badge>
                </div>
                {profile.preferred_work && (
                  <p className="text-sm text-muted-foreground">Role: {profile.preferred_work}</p>
                )}
                <div className="flex flex-wrap justify-center sm:justify-start gap-2 pt-2 pb-4">
                  {profile.skills && (
                    <span className="text-xs text-muted-foreground mt-0.5">
                      Skills: {profile.skills}
                    </span>
                  )}
                </div>
                <div className="w-full">
                  {profile.has_pending_invitation ? (
                    <Button variant="secondary" className="w-full" disabled>
                      <Check className="h-4 w-4 mr-2" />
                      Invitation sent
                    </Button>
                  ) : (
                    <Dialog onOpenChange={(open) => { if(!open) { setInviteEmail(''); } }}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full" onClick={() => setInvitingProfile(profile)}>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Invite Member
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Invite {invitingProfile?.display_name}</DialogTitle>
                          <DialogDescription>Send an email invitation to join this project.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="email">Email address</Label>
                            <Input 
                              id="email" 
                              type="email" 
                              placeholder="student@example.com" 
                              value={inviteEmail}
                              onChange={(e) => setInviteEmail(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <Button onClick={async () => {
                            if (!inviteEmail || !projectId || !invitingProfile) return;
                            try {
                              await invitationService.createInvitation({
                                projectId,
                                teamProfileId: invitingProfile.id,
                                email: inviteEmail
                              });
                              toast.success('Invitation sent via email!');
                              // Trigger a refetch immediately
                              fetchTeam();
                            } catch (e: any) {
                              toast.error(e.message || "Failed to create invite");
                            }
                          }}>Send Invitation</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Team;
