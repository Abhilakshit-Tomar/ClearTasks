import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="studio-wordmark" aria-label="ClearTasks home">
      <span className="studio-mark">
        <Check size={23} strokeWidth={3} aria-hidden="true" />
      </span>
      {!compact && <span>ClearTasks</span>}
    </Link>
  );
}
export function LoadingState({
  label = "Loading your workspace…",
}: {
  label?: string;
}) {
  return (
    <div className="page-shell" role="status" aria-busy="true">
      <span className="sr-only">{label}</span>
      <Skeleton className="h-9 w-48" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-60 w-full" />
    </div>
  );
}
export function ErrorState({
  message,
  retry,
  compact = false,
}: {
  message: string;
  retry: () => void;
  compact?: boolean;
}) {
  return (
    <div
      role="alert"
      className={`rounded-xl border border-destructive/25 bg-destructive/5 p-5 ${compact ? "flex flex-wrap items-center gap-3" : "mx-auto max-w-xl space-y-4 py-10 text-center"}`}
    >
      <AlertCircle
        className={`size-5 shrink-0 text-destructive ${compact ? "" : "mx-auto size-8"}`}
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        <p className="font-semibold">
          {compact
            ? "The latest update couldn’t be loaded."
            : "We couldn’t load this page."}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">{message}</p>
      </div>
      <Button variant="outline" size="sm" onClick={retry}>
        <RefreshCw className="size-4" />
        Try again
      </Button>
    </div>
  );
}
export function EmptyState({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="surface px-6 py-14 text-center">
      <CheckCircle2
        className="mx-auto mb-4 size-9 text-primary/60"
        aria-hidden="true"
      />
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}
export function PendingLabel({ children }: { children: React.ReactNode }) {
  return (
    <span
      role="status"
      className="inline-flex items-center gap-2 text-sm text-muted-foreground"
    >
      <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
      {children}
    </span>
  );
}
export function ProjectLink({
  to,
  children,
}: {
  to: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      className="inline-flex min-h-11 items-center gap-2 rounded-md text-sm font-semibold text-primary underline-offset-4 hover:underline"
    >
      {children}
      <ArrowRight className="size-4" aria-hidden="true" />
    </Link>
  );
}
