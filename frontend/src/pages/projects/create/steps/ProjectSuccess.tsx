import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ArrowRight } from 'lucide-react';

interface Props {
  projectId: string;
}

const ProjectSuccess = ({ projectId }: Props) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-6">
        <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-500" />
      </div>
      <h2 className="text-3xl font-bold tracking-tight mb-4">Project Created!</h2>
      <p className="text-muted-foreground max-w-md mb-8">
        Your project workspace has been created successfully. The AI plan has been applied, and tasks have been populated in your task board.
      </p>
      <Button asChild size="lg">
        <Link to={`/projects/${projectId}`}>
          Open Project Dashboard
          <ArrowRight className="h-4 w-4 ml-2" />
        </Link>
      </Button>
    </div>
  );
};

export default ProjectSuccess;
