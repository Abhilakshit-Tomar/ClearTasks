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
      const aiPayload = {
        projectTitle: data.title,
        description: data.description,
        teamSize: parseInt(data.teamSize, 10) || 1,
        deadline: data.deadline
      };
      console.log('[AI FLOW] submit started');
      console.log('[AI FLOW] analyze request started');
      const plan = await aiService.analyzeProject(aiPayload);
      console.log('[AI FLOW] analyze response received');
      console.log('[AI FLOW] plan received', plan);
      console.log('[AI FLOW] navigating to Initial AI Plan');
      setAiPlan(plan);
      setCurrentStep('INITIAL_PLAN');
    } catch (error: any) {
      console.error("ANALYSIS ERROR:", error);
      toast.error(`Error: ${error.message || 'Failed to analyze project. Please try again.'}`);
      setCurrentStep('INFO');
    }
  };

  const handleImproveRequest = () => {
    setCurrentStep('IMPROVING');
  };

  const handleImproveSubmit = async (data: any) => {
    setCurrentStep('ANALYZING'); // We can reuse the loading screen or make a new one, but let's use a specific state for text
    try {
      const improvements = {
        similarSkillLevels: false,
        assignByStrengths: !!data.teamSkills,
        preferredTechnology: data.techPreferences || '',
        instructorRequirements: data.instructorRequirements || '',
        // The frontend form provides strings, we split them to match the backend array schema
        advancedFeatures: data.advancedFeatures ? data.advancedFeatures.split(',').map((s: string) => s.trim()) : [],
        // The backend expects an array of objects for teamSkills, we pass the raw string into a single 'Team' placeholder to satisfy the schema but convey the prompt
        teamSkills: data.teamSkills ? [{ name: 'Team', skills: [data.teamSkills] }] : []
      };

      const improvePayload = {
        projectTitle: projectData.title,
        description: projectData.description,
        teamSize: parseInt(projectData.teamSize, 10) || 1,
        deadline: projectData.deadline,
        originalPlan: aiPlan,
        improvements: improvements
      };
      const improved = await aiService.improvePlan(improvePayload);
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
        team_size: parseInt(projectData.teamSize || '1') || 1,
        project_type: aiPlan?.projectType,
        difficulty: aiPlan?.difficulty,
        tasks: aiPlan?.phases.flatMap(p => p.tasks.map(t => ({
          title: t.title,
          description: t.description,
          phase: p.name,
          priority: t.priority,
          estimated_hours: t.estimatedHours
        }))) || [],
        milestones: aiPlan?.milestones.map(m => ({ title: m.title, description: m.description })) || [],
      } as any);
      setCreatedProjectId(project.id);
      setCurrentStep('SUCCESS');
    } catch (error: any) {
      toast.error(`Failed to create project: ${error.message || 'Unknown error'}`);
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
