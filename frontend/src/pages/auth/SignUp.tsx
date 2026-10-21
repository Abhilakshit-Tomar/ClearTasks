import { SignUp as ClerkSignUp, useAuth } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";
import { useTheme } from "next-themes";
import AuthLayout from "./AuthLayout";
import { authAppearance } from "./appearance";

export default function SignUp() {
  const { isLoaded, isSignedIn } = useAuth();
  const { resolvedTheme } = useTheme();
  if (isLoaded && isSignedIn) return <Navigate to="/dashboard" replace />;
  return (
    <AuthLayout>
      <ClerkSignUp
        routing="hash"
        signInUrl="/login"
        forceRedirectUrl="/dashboard"
        appearance={authAppearance(resolvedTheme === "dark")}
      />
    </AuthLayout>
  );
}
