import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { teamService } from '@/services/api';
import { ProjectMember } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserPlus, Mail } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const Team = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      if (!projectId) return;
      try {
        const data = await teamService.getTeam(projectId);
        setMembers(data);
      } catch (error) {
        toast.error("Failed to load team members");
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
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
        
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite a member</DialogTitle>
              <DialogDescription>Send an invitation email to add a student to this project.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input id="email" type="email" placeholder="student@example.com" />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => toast.success('Invitation sent!')}>Send Invite</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {members.map(member => (
          <Card key={member.id}>
            <CardContent className="p-6 flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={member.user?.avatar_url} />
                <AvatarFallback className="text-xl">{member.user?.name?.[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center sm:text-left space-y-1">
                <h3 className="font-semibold text-lg">{member.user?.name}</h3>
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
      </div>
    </div>
  );
};

export default Team;
