import { useCallback, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Check, UserPlus, UserRound, Users } from "lucide-react";
import { toast } from "sonner";
import { teamService, invitationService } from "@/services/api";
import type { TeamProfile } from "@/types";
import { useRemoteData } from "@/hooks/useRemoteData";
import { errorMessage, projectStyle } from "@/lib/studio";
import { teamMemberIdentity } from "@/lib/team";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState, ErrorState, LoadingState } from "@/components/Feedback";

export default function Team() {
  const { projectId = "" } = useParams();
  const loader = useCallback(async () => {
    const [members, profiles] = await Promise.all([
      teamService.getTeam(projectId),
      teamService.getTeamProfiles(projectId),
    ]);
    return { members, profiles };
  }, [projectId]);
  const { data, loading, error, refresh, updateData } = useRemoteData(
    loader,
    10000,
  );
  const [inviting, setInviting] = useState<TeamProfile | null>(null);
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const sendingLock = useRef(false);
  const inviteTrigger = useRef<HTMLButtonElement | null>(null);
  const heading = useRef<HTMLHeadingElement | null>(null);
  async function invite(event: React.FormEvent) {
    event.preventDefault();
    if (!inviting || sendingLock.current) return;
    sendingLock.current = true;
    setSending(true);
    try {
      await invitationService.createInvitation({
        projectId,
        teamProfileId: inviting.id,
        email: email.trim(),
      });
      updateData((previous) => ({
        ...previous,
        profiles: previous.profiles.map((profile) =>
          profile.id === inviting.id
            ? { ...profile, has_pending_invitation: true }
            : profile,
        ),
      }));
      toast.success(`Invitation sent to ${email.trim()}`);
      setInviting(null);
      setEmail("");
    } catch (error) {
      toast.error(
        errorMessage(
          error,
          "The invitation couldn’t be sent. Check the address and try again.",
        ),
      );
    } finally {
      sendingLock.current = false;
      setSending(false);
    }
  }
  if (loading)
    return <LoadingState label="Loading the people on your project…" />;
  return (
    <div className="page-shell">
      <div className="page-heading">
        <div>
          <h1 ref={heading} tabIndex={-1}>
            The people behind the project.
          </h1>
          <p>Different strengths. One shared goal.</p>
        </div>
        <Users
          className="hidden size-7 text-primary/60 sm:block"
          aria-hidden="true"
        />
      </div>
      {error && (
        <ErrorState
          compact={!!data}
          message={error}
          retry={() => void refresh()}
        />
      )}
      {data && (
        <>
          {data.members.length === 0 && data.profiles.length === 0 ? (
            <EmptyState
              title="Your team has room to grow."
              description="Team profiles appear here when they’re included in your project plan."
            />
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {data.members.map((member) => {
                const identity = teamMemberIdentity(member, data.profiles);
                return (
                  <article
                    key={member.id}
                    className="surface p-6"
                    style={projectStyle(member.user_id)}
                  >
                    <Avatar className="size-12">
                      <AvatarImage src={identity.avatarUrl} alt="" />
                      <AvatarFallback className="bg-primary/10 font-semibold text-primary">
                        {identity.initials || (
                          <UserRound className="size-5" aria-hidden="true" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <h2 className="mt-4 break-words text-lg font-semibold">
                      {identity.name}
                    </h2>
                    {identity.preferredWork && (
                      <p className="mt-1 break-words text-sm text-muted-foreground">
                        {identity.preferredWork}
                      </p>
                    )}
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="status-badge status-good">
                        <Check className="size-3" />
                        Connected
                      </span>
                      <span className="project-badge">
                        {member.role === "OWNER"
                          ? "Project owner"
                          : "Team member"}
                      </span>
                    </div>
                    {(identity.skills || identity.description) && (
                      <p className="mt-5 border-t pt-4 text-sm leading-relaxed text-muted-foreground">
                        {identity.skills || identity.description}
                      </p>
                    )}
                  </article>
                );
              })}
              {data.profiles
                .filter((profile) => !profile.linked_user_id)
                .map((profile) => (
                  <article
                    key={profile.id}
                    className="surface flex flex-col border-dashed p-6"
                    style={projectStyle(profile.id)}
                  >
                    <Avatar className="size-12">
                      <AvatarFallback
                        className="font-semibold"
                        style={{
                          background: "hsl(var(--project-soft))",
                          color: "hsl(var(--project-ink))",
                        }}
                      >
                        {profile.display_name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <h2 className="mt-4 break-words text-lg font-semibold">
                      {profile.display_name}
                    </h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {profile.preferred_work || "Planned team member"}
                    </p>
                    <p className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">
                      {profile.skills ||
                        profile.description ||
                        "Ready to bring their strengths to the project."}
                    </p>
                    <div className="mt-5 border-t pt-4">
                      {profile.has_pending_invitation ? (
                        <p className="flex min-h-11 items-center gap-2 text-sm text-primary">
                          <Check className="size-4" />
                          Invitation sent
                        </p>
                      ) : (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={(event) => {
                            inviteTrigger.current = event.currentTarget;
                            setEmail("");
                            setInviting(profile);
                          }}
                        >
                          <UserPlus />
                          Invite {profile.display_name}
                        </Button>
                      )}
                    </div>
                  </article>
                ))}
            </div>
          )}
        </>
      )}
      <Dialog
        open={!!inviting}
        onOpenChange={(open) => {
          if (!open && !sending) setInviting(null);
        }}
      >
        <DialogContent
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            if (inviteTrigger.current?.isConnected)
              inviteTrigger.current.focus();
            else heading.current?.focus();
          }}
        >
          <DialogHeader>
            <DialogTitle>
              Bring {inviting?.display_name} into the project.
            </DialogTitle>
            <DialogDescription>
              Send an invitation to connect their account to this planned team
              profile.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-5" onSubmit={(event) => void invite(event)}>
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email address</Label>
              <Input
                type="email"
                id="invite-email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                disabled={sending}
                placeholder="teammate@example.com"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={sending}
                onClick={() => setInviting(null)}
              >
                Cancel
              </Button>
              <Button type="submit" pending={sending} pendingLabel="Sending…">
                Send invitation
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
