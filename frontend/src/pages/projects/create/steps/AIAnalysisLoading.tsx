import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Loader2 } from 'lucide-react';

interface Props {
  text: string;
}

const AIAnalysisLoading = ({ text }: Props) => {
  const [progress, setProgress] = useState(0);
  
  const steps = [
    'Understanding project requirements...',
    'Identifying modules and features...',
    'Generating task list...',
    'Estimating timeline and difficulty...',
    'Balancing team workload...',
    'Finalizing project plan...'
  ];

  const currentStepIndex = Math.min(Math.floor((progress / 100) * steps.length), steps.length - 1);

  useEffect(() => {
    // Deterministic mock progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + (100 / (2000 / 100)); // Complete in ~2s
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-semibold">{text}</h2>
          <p className="text-muted-foreground">{steps[currentStepIndex]}</p>
        </div>
        
        <Progress value={progress} className="h-2 w-full" />
        
        <div className="space-y-3 mt-8">
          {steps.map((step, idx) => (
            <div key={idx} className={`flex items-center gap-3 text-sm ${idx > currentStepIndex ? 'text-muted-foreground/50' : idx < currentStepIndex ? 'text-foreground' : 'text-primary font-medium'}`}>
              {idx < currentStepIndex ? (
                <CheckCircle2 className="h-4 w-4 text-primary" />
              ) : idx === currentStepIndex ? (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              ) : (
                <div className="h-4 w-4 rounded-full border-2 border-muted" />
              )}
              {step}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIAnalysisLoading;
