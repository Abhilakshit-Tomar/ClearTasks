import { useState } from 'react';
import { aiService, projectService } from '@/services/api';
import { AIProjectPlan } from '@/types';

// Steps
import ProjectInfoForm from './steps/ProjectInfoForm';
import AIAnalysisLoading from './steps/AIAnalysisLoading';
import InitialPlanReview from './steps/InitialPlanReview';
import ImprovePlanForm from './steps/ImprovePlanForm';
import ReviewConfirm from './steps/ReviewConfirm';
import ProjectSuccess from './steps/ProjectSuccess';
import { toast } from 'sonner';

type FlowStep = 'INFO' | 'ANALYZING' | 'INITIAL_PLAN' | 'IMPROVING' | 'IMPROVED_PLAN' | 'REVIEW' | 'SUCCESS';

const CreateProjectFlow = () => {
  const [currentStep, setCurrentStep] = useState<FlowStep>('INFO');
  
  const [projectData, setProjectData] = useState<any>({});
  const [aiPlan, setAiPlan] = useState<AIProjectPlan | null>(null);
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);

  // Handlers
  const handleInfoSubmit = async (data: any) => {
    setProjectData({ ...projectData, ...data });
    setCurrentStep('ANALYZING');
    
    try {
      const plan = await aiService.analyzeProject(data);
      setAiPlan(plan);
      setCurrentStep('INITIAL_PLAN');
    } catch (error) {
      toast.error('Failed to analyze project. Please try again.');
      setCurrentStep('INFO');
    }
  };

  const handleImproveRequest = () => {
    setCurrentStep('IMPROVING');
  };

  const handleImproveSubmit = async (data: any) => {
    setCurrentStep('ANALYZING'); // We can reuse the loading screen or make a new one, but let's use a specific state for text
    try {
      const improved = await aiService.improvePlan({ ...projectData, ...data });
      setAiPlan(improved);
      setCurrentStep('IMPROVED_PLAN');
    } catch (error) {
      toast.error('Failed to improve plan.');
      setCurrentStep('INITIAL_PLAN');
    }
  };

  const handleProceedToReview = () => {
    setCurrentStep('REVIEW');
  };

  const handleConfirm = async () => {
    try {
      // Create project in DB
      const project = await projectService.createProject({
        name: projectData.title,
        description: projectData.description,
        deadline: projectData.deadline,
        team_size: parseInt(projectData.teamSize),
        project_type: aiPlan?.projectType,
        difficulty: aiPlan?.difficulty,
      });
      setCreatedProjectId(project.id);
      setCurrentStep('SUCCESS');
    } catch (error) {
      toast.error('Failed to create project.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {currentStep === 'INFO' && <ProjectInfoForm onSubmit={handleInfoSubmit} />}
      {currentStep === 'ANALYZING' && <AIAnalysisLoading text="Analyzing project requirements..." />}
      {currentStep === 'INITIAL_PLAN' && aiPlan && (
        <InitialPlanReview 
          plan={aiPlan} 
          onImprove={handleImproveRequest} 
          onProceed={handleProceedToReview} 
        />
      )}
      {currentStep === 'IMPROVING' && (
        <ImprovePlanForm 
          onSubmit={handleImproveSubmit} 
          onCancel={() => setCurrentStep('INITIAL_PLAN')} 
        />
      )}
      {currentStep === 'IMPROVED_PLAN' && aiPlan && (
        <InitialPlanReview 
          plan={aiPlan} 
          onImprove={handleImproveRequest} 
          onProceed={handleProceedToReview} 
          isImproved={true}
        />
      )}
      {currentStep === 'REVIEW' && aiPlan && (
        <ReviewConfirm 
          plan={aiPlan} 
          projectData={projectData} 
          onConfirm={handleConfirm} 
          onBack={() => setCurrentStep('INITIAL_PLAN')}
        />
      )}
      {currentStep === 'SUCCESS' && createdProjectId && (
        <ProjectSuccess projectId={createdProjectId} />
      )}
    </div>
  );
};

export default CreateProjectFlow;
