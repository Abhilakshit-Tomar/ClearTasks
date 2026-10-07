import { useEffect, useState } from 'react';
import { CheckCircle2, Sparkles, Circle } from 'lucide-react';

interface Props {
  text: string;
}

const AIAnalysisLoading = ({ text }: Props) => {
  const [progress, setProgress] = useState(0);
  
  const steps = [
    'Understanding your project',
    'Identifying modules',
    'Planning milestones',
    'Generating tasks',
    'Balancing workload',
    'Checking timeline',
    'Finalizing your plan'
  ];

  const currentStepIndex = Math.min(Math.floor((progress / 100) * steps.length), steps.length - 1);

  useEffect(() => {
    // We simulate the progress to give the user a sense of "work" being done.
    // The backend request usually takes 10-20 seconds.
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return 95; // Cap at 95% until actual API completes
        return prev + 1; // Increment by 1 every 150ms -> ~15 seconds to 100%
      });
    }, 150);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 min-h-[60vh]">
      <div className="w-full max-w-md">
        
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-4 bg-primary/5 text-primary rounded-full mb-6">
            <Sparkles className="h-8 w-8 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">{text}</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2">This usually takes about 10-15 seconds.</p>
        </div>
        
        <div className="space-y-4">
          {steps.map((step, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            
            return (
              <div 
                key={idx} 
                className={`flex items-center gap-4 p-3 rounded-lg transition-all duration-500 ${
                  isCurrent ? 'bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 translate-x-2' : ''
                } ${idx > currentStepIndex ? 'opacity-40' : 'opacity-100'}`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                ) : isCurrent ? (
                  <Sparkles className="h-5 w-5 text-primary animate-pulse shrink-0" />
                ) : (
                  <Circle className="h-5 w-5 text-slate-300 dark:text-slate-700 shrink-0" />
                )}
                
                <span className={`font-medium ${isCurrent ? 'text-slate-900 dark:text-slate-50' : 'text-slate-600 dark:text-slate-400'}`}>
                  {step}
                </span>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default AIAnalysisLoading;
