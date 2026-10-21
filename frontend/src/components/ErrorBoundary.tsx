import React from "react";
import { Button } from "@/components/ui/button";

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          className="mx-auto max-w-xl space-y-4 rounded-2xl border bg-card p-8 text-center"
        >
          <h2 className="text-xl font-semibold">
            This page needs a fresh start.
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Something interrupted the page. Reload to try again; saved project
            data is kept.
          </p>
          <Button onClick={() => window.location.reload()}>Reload page</Button>
        </div>
      );
    }
    return this.props.children;
  }
}
