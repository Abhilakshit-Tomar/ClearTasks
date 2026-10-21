/* oxlint-disable react/only-export-components -- This test module mirrors Clerk hooks and components. */
import React from "react";
const getToken = async () =>
  `fixture:${sessionStorage.getItem("studio-test-case") || "default"}:${sessionStorage.getItem("studio-test-fixture") || "normal"}`;
const user = {
  id: "fixture-student",
  fullName: "Alex Morgan",
  firstName: "Alex",
  primaryEmailAddress: { emailAddress: "alex@example.test" },
  emailAddresses: [{ emailAddress: "alex@example.test" }],
};
export const useAuth = () => ({ isLoaded: true, isSignedIn: true, getToken });
export const useUser = () => ({ isLoaded: true, user });
export const UserButton = () => (
  <span
    role="img"
    aria-label="Example student account"
    className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary"
  >
    AM
  </span>
);
export const SignOutButton = ({ children }: { children: React.ReactElement }) =>
  React.cloneElement(children as React.ReactElement<{ onClick: () => void }>, {
    onClick: () => {
      location.href = "/";
    },
  });
export const useClerk = () => ({ signOut: async () => {} });
export const useSignUp = () => ({
  isLoaded: true,
  signUp: {
    create: async () => ({
      status: "complete",
      createdSessionId: "fixture-session",
    }),
  },
  setActive: async () => {},
});
export const useSignIn = useSignUp;
export const SignIn = () => (
  <p>
    Authentication is checked on the real preview, outside this fixture
    compiler.
  </p>
);
export const SignUp = SignIn;
