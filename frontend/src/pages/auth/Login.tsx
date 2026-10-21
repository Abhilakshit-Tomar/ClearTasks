import { useRef, useState } from "react";
import { SignIn, useAuth, useSignIn } from "@clerk/clerk-react";
import { Navigate, useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PendingLabel } from "@/components/Feedback";
import AuthLayout from "./AuthLayout";
import { authAppearance } from "./appearance";

function clerkMessage(error: unknown): string {
  const response = error as {
    errors?: { longMessage?: string; message?: string }[];
  };
  return (
    response.errors?.[0]?.longMessage ||
    response.errors?.[0]?.message ||
    "We couldn’t complete that step. Please try again."
  );
}

export default function Login() {
  const { isLoaded, isSignedIn } = useAuth();
  const { isLoaded: signInReady, signIn, setActive } = useSignIn();
  const { resolvedTheme } = useTheme();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"sign-in" | "request" | "reset">("sign-in");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const lock = useRef(false);
  if (isLoaded && isSignedIn) return <Navigate to="/dashboard" replace />;
  async function recover(event: React.FormEvent) {
    event.preventDefault();
    if (!signInReady || lock.current) return;
    lock.current = true;
    setPending(true);
    setError(null);
    try {
      if (mode === "request") {
        await signIn.create({
          strategy: "reset_password_email_code",
          identifier: email.trim(),
        });
        setMode("reset");
        setNotice(`Enter the reset code sent to ${email.trim()}.`);
      } else {
        const result = await signIn.attemptFirstFactor({
          strategy: "reset_password_email_code",
          code: code.trim(),
          password,
        });
        if (result.status === "complete") {
          await setActive({ session: result.createdSessionId });
          navigate("/dashboard", { replace: true });
        } else {
          setPassword("");
          setCode("");
          setMode("sign-in");
          setNotice(
            "Continue with the secure sign-in form to complete the remaining verification.",
          );
        }
      }
    } catch (error) {
      setError(clerkMessage(error));
    } finally {
      lock.current = false;
      setPending(false);
    }
  }
  return (
    <AuthLayout>
      {!isLoaded ? (
        <PendingLabel>Preparing secure sign-in…</PendingLabel>
      ) : mode === "sign-in" ? (
        <>
          {notice && (
            <p
              role="status"
              className="mb-5 rounded-lg bg-primary/10 p-4 text-sm leading-relaxed text-primary"
            >
              {notice}
            </p>
          )}
          <SignIn
            routing="hash"
            signUpUrl="/signup"
            forceRedirectUrl="/dashboard"
            appearance={authAppearance(resolvedTheme === "dark")}
          />
          <Button
            variant="link"
            className="mt-3 px-0"
            onClick={() => {
              setMode("request");
              setNotice(null);
              setError(null);
            }}
          >
            Forgot your password?
          </Button>
        </>
      ) : (
        <section>
          <Button
            variant="ghost"
            className="mb-7 -ml-3"
            disabled={pending}
            onClick={() => {
              setMode("sign-in");
              setError(null);
              setNotice(null);
              setPassword("");
              setCode("");
            }}
          >
            <ArrowLeft />
            Back to sign in
          </Button>
          <h1 className="text-3xl font-semibold">
            {mode === "request" ? "A fresh start." : "Choose a new password."}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {mode === "request"
              ? "Enter your account email to request a password reset code."
              : "Use the code from your email and a strong new password."}
          </p>
          {notice && (
            <p role="status" className="mt-5 text-sm text-primary">
              {notice}
            </p>
          )}
          {error && (
            <p
              role="alert"
              className="mt-5 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm"
            >
              {error}
            </p>
          )}
          <form
            onSubmit={(event) => void recover(event)}
            className="mt-7 space-y-5"
          >
            {mode === "request" ? (
              <div className="space-y-2">
                <Label htmlFor="recovery-email">Account email</Label>
                <Input
                  id="recovery-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={pending}
                />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="reset-code">Reset code</Label>
                  <Input
                    id="reset-code"
                    autoComplete="one-time-code"
                    inputMode="numeric"
                    required
                    value={code}
                    onChange={(event) => setCode(event.target.value)}
                    disabled={pending}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    disabled={pending}
                  />
                </div>
              </>
            )}
            <Button
              type="submit"
              className="w-full"
              pending={pending}
              pendingLabel={
                mode === "request" ? "Requesting code…" : "Resetting password…"
              }
              disabled={!signInReady}
            >
              {mode === "request" ? "Send reset code" : "Reset password"}
            </Button>
            {mode === "reset" && (
              <Button
                type="button"
                variant="link"
                disabled={pending}
                className="px-0"
                onClick={() => {
                  setMode("request");
                  setError(null);
                  setNotice(null);
                  setPassword("");
                  setCode("");
                }}
              >
                Use a different email or request another code
              </Button>
            )}
          </form>
        </section>
      )}
    </AuthLayout>
  );
}
