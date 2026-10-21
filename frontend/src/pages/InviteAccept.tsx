import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { invitationService } from "@/services/api";
import { ProjectInvitation } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  useAuth,
  useSignUp,
  useSignIn,
  useUser,
  useClerk,
} from "@clerk/clerk-react";
import { toast } from "sonner";

const InviteAccept = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const accepting = useRef(false);
  const clerkTicket = searchParams.get("__clerk_ticket");
  const clerkStatus = searchParams.get("__clerk_status");
  const searchParamsEmail = searchParams.get("email");

  const { isLoaded: isAuthLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const { signOut } = useClerk();
  const {
    isLoaded: isSignUpLoaded,
    signUp,
    setActive: setSignUpActive,
  } = useSignUp();
  const {
    isLoaded: isSignInLoaded,
    signIn,
    setActive: setSignInActive,
  } = useSignIn();

  const [invites, setInvites] = useState<ProjectInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [authProcessing, setAuthProcessing] = useState(!!clerkTicket);
  const [error, setError] = useState<string | null>(null);

  const currentUserEmail = user?.emailAddresses[0]?.emailAddress;
  const isMismatchedSession =
    isSignedIn &&
    searchParamsEmail &&
    currentUserEmail &&
    currentUserEmail !== searchParamsEmail;

  // Authenticate using the ticket if present
  useEffect(() => {
    const authenticateWithTicket = async () => {
      if (!clerkTicket) {
        setAuthProcessing(false);
        return;
      }
      if (!isSignUpLoaded || !isSignInLoaded || !isAuthLoaded) return;
      if (isMismatchedSession) {
        setAuthProcessing(false);
        return; // Let the UI handle the mismatch
      }

      try {
        if (clerkStatus === "sign_up") {
          const result = await signUp.create({
            strategy: "ticket",
            ticket: clerkTicket,
          });
          if (result.status === "complete") {
            await setSignUpActive({ session: result.createdSessionId });
            const { projectId } =
              await invitationService.acceptTicketInvitation();
            toast.success("Invitation accepted successfully!");
            navigate(`/projects/${projectId}`);
            return;
          } else {
            navigate("/signup");
          }
        } else if (clerkStatus === "sign_in") {
          const result = await signIn.create({
            strategy: "ticket",
            ticket: clerkTicket,
          });
          if (result.status === "complete") {
            await setSignInActive({ session: result.createdSessionId });
            const { projectId } =
              await invitationService.acceptTicketInvitation();
            toast.success("Invitation accepted successfully!");
            navigate(`/projects/${projectId}`);
            return;
          } else {
            navigate("/login");
          }
        }
      } catch (err: any) {
        console.error("Clerk ticket error:", err);
        // If we get an error but we are already signed in as the correct user,
        // it means we don't need to consume the ticket, we can just accept it!
        if (isSignedIn && !isMismatchedSession) {
          try {
            const { projectId } =
              await invitationService.acceptTicketInvitation();
            toast.success("Invitation accepted successfully!");
            navigate(`/projects/${projectId}`);
            return;
          } catch (backendErr: any) {
            setError(
              backendErr.message || "Invalid or expired invitation ticket",
            );
          }
        } else {
          setError(
            err.errors?.[0]?.message || "Invalid or expired invitation ticket",
          );
        }
      } finally {
        setAuthProcessing(false);
      }
    };

    authenticateWithTicket();
  }, [
    clerkTicket,
    clerkStatus,
    isAuthLoaded,
    isSignUpLoaded,
    isSignInLoaded,
    signUp,
    signIn,
    setSignUpActive,
    setSignInActive,
    navigate,
    isSignedIn,
    isMismatchedSession,
  ]);

  // Fallback: If no ticket or ticket failed, just load pending invites if signed in
  useEffect(() => {
    const fetchInvites = async () => {
      if (authProcessing) return;
      if (!isAuthLoaded || !isSignedIn) {
        setLoading(false);
        return;
      }
      try {
        const data = await invitationService.getPendingInvitations();
        setInvites(data);
      } catch (err: any) {
        if (!error) setError(err.message || "Failed to load invitations");
      } finally {
        setLoading(false);
      }
    };
    fetchInvites();
  }, [authProcessing, isAuthLoaded, isSignedIn, error]);

  const handleAccept = async (inviteId: string) => {
    if (accepting.current) return;
    accepting.current = true;
    setAcceptingId(inviteId);
    try {
      const { projectId } = await invitationService.acceptInvitation(inviteId);
      toast.success("Invitation accepted successfully!");
      navigate(`/projects/${projectId}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to accept invitation");
    } finally {
      accepting.current = false;
      setAcceptingId(null);
    }
  };

  if (!isAuthLoaded || loading || authProcessing) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (isMismatchedSession) {
    return (
      <div className="flex h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Session Mismatch</CardTitle>
            <CardDescription>
              You are currently signed in as <strong>{currentUserEmail}</strong>
              .<br />
              <br />
              This invitation is for <strong>{searchParamsEmail}</strong>.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              className="w-full"
              onClick={async () => {
                await signOut();
                // After signing out, authProcessing will kick back in through useEffect if we reset it
                setAuthProcessing(true);
              }}
            >
              Sign out and accept invitation
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/dashboard")}
            >
              Cancel
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => navigate("/")}>
              Return Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Sign in Required</CardTitle>
            <CardDescription>
              You need to sign in to view and accept your invitations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => navigate("/login")}>
              Sign in
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-screen items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Project Invitations</CardTitle>
          <CardDescription>
            You have been invited to join the following projects.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {invites.length === 0 ? (
            <div className="text-center text-muted-foreground py-4">
              You have no pending invitations.
            </div>
          ) : (
            invites.map((invite) => (
              <div key={invite.id} className="p-4 border rounded-lg space-y-4">
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Project</span>
                  <p className="font-medium text-lg">{invite.project_name}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">
                    Your Role / Profile
                  </span>
                  <p className="font-medium">{invite.display_name}</p>
                  {invite.preferred_work && (
                    <p className="text-sm">{invite.preferred_work}</p>
                  )}
                </div>
                <Button
                  className="w-full"
                  pending={acceptingId === invite.id}
                  pendingLabel="Joining the project…"
                  disabled={!!acceptingId && acceptingId !== invite.id}
                  onClick={() => handleAccept(invite.id)}
                >
                  Accept Invitation
                </Button>
              </div>
            ))
          )}
          {invites.length === 0 && (
            <Button className="w-full" onClick={() => navigate("/dashboard")}>
              Go to Dashboard
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InviteAccept;
