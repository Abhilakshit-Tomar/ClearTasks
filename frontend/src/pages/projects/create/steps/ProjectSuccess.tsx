import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight } from "lucide-react";

interface Props {
  projectId: string;
}

const ProjectSuccess = ({ projectId }: Props) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center min-h-[60vh]">
      <div className="h-20 w-20 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mb-8">
        <CheckCircle2 className="h-10 w-10 text-emerald-500" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight text-foreground mb-3">
        The plan is ready.
      </h1>
      <p className="text-lg text-muted-foreground max-w-md mb-10">
        Your project workspace has been successfully created. Tasks are
        distributed and milestones are set.
      </p>

      <Button
        asChild
        size="lg"
        className="h-12 text-base font-medium px-8 bg-primary text-primary-foreground hover:bg-primary/90"
      >
        <Link to={`/projects/${projectId}`}>
          Open Project
          <ArrowRight className="h-4 w-4 ml-2" />
        </Link>
      </Button>
    </div>
  );
};

export default ProjectSuccess;
