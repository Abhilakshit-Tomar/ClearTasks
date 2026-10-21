import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AIAnalysisLoading({
  text,
  onCancel,
}: {
  text: string;
  onCancel: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-[55vh] max-w-md flex-col items-center justify-center py-12 text-center">
      <div className="mb-7 flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <LoaderCircle className="size-7 animate-spin" aria-hidden="true" />
      </div>
      <div role="status" aria-live="polite">
        <h1 className="font-editorial text-3xl">{text}</h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          We’re waiting for your suggested tasks and milestones. Your plan will
          appear here when it’s ready.
        </p>
      </div>
      <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
        You’ll review the plan before anything is created. Your project details
        are kept if you go back.
      </p>
      <Button variant="outline" onClick={onCancel} className="mt-7">
        Back to editing
      </Button>
    </div>
  );
}
