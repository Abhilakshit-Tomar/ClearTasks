import { useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { aiService, projectService } from "@/services/api";
import type { AIProjectPlan } from "@/types";
import { errorMessage } from "@/lib/studio";
import ProjectInfoForm, {
  type ProjectInfoValues,
} from "./steps/ProjectInfoForm";
import TeamProfilesForm, {
  type TeamProfileInput,
} from "./steps/TeamProfilesForm";
import AIAnalysisLoading from "./steps/AIAnalysisLoading";
import InitialPlanReview from "./steps/InitialPlanReview";
import ImprovePlanForm from "./steps/ImprovePlanForm";
import ReviewConfirm from "./steps/ReviewConfirm";
import ProjectSuccess from "./steps/ProjectSuccess";

type Step =
  | "INFO"
  | "TEAM_PROFILES"
  | "ANALYZING"
  | "INITIAL_PLAN"
  | "IMPROVING"
  | "IMPROVED_PLAN"
  | "REVIEW"
  | "SUCCESS";
type Draft = Partial<ProjectInfoValues> & { teamProfiles?: TeamProfileInput[] };
function readDraft(key: string | null): Draft {
  try {
    const value = key ? JSON.parse(sessionStorage.getItem(key) || "{}") : {};
    return value && typeof value === "object" && !Array.isArray(value)
      ? value
      : {};
  } catch {
    return {};
  }
}

export default function CreateProjectFlow() {
  const { user } = useUser();
  const draftKey = user ? `cleartasks-project-draft-${user.id}` : null;
  const [projectData, setProjectData] = useState<Draft>(() =>
    readDraft(draftKey),
  );
  const [step, setStep] = useState<Step>("INFO");
  const [plan, setPlan] = useState<AIProjectPlan | null>(null);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [flowError, setFlowError] = useState<string | null>(null);
  const [improvementDraft, setImprovementDraft] = useState<
    Record<string, string>
  >({});
  const generation = useRef<{
    controller: AbortController;
    returnTo: Step;
  } | null>(null);
  const createLock = useRef(false);
  const flowElement = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const heading = flowElement.current?.querySelector<HTMLElement>("h1");
    heading?.setAttribute("tabindex", "-1");
    heading?.focus({ preventScroll: true });
  }, [step]);
  useEffect(() => {
    if (draftKey && step !== "SUCCESS") {
      try {
        sessionStorage.setItem(draftKey, JSON.stringify(projectData));
      } catch {
        /* Draft stays available in memory when storage is full or disabled. */
      }
    }
  }, [draftKey, projectData, step]);
  useEffect(() => () => generation.current?.controller.abort(), []);
  async function generate(profiles: TeamProfileInput[]) {
    if (generation.current) return;
    const details = { ...projectData, teamProfiles: profiles };
    setProjectData(details);
    setFlowError(null);
    setStep("ANALYZING");
    const controller = new AbortController();
    generation.current = { controller, returnTo: "TEAM_PROFILES" };
    try {
      const response = await aiService.analyzeProject(
        {
          projectTitle: details.title,
          description: details.description,
          teamSize: Number(details.teamSize) || 1,
          deadline: details.deadline,
          teamProfiles: profiles,
        },
        controller.signal,
      );
      if (!controller.signal.aborted) {
        setPlan(response);
        setStep("INITIAL_PLAN");
      }
    } catch (error) {
      if (!controller.signal.aborted) {
        setFlowError(
          errorMessage(
            error,
            "Your plan couldn’t be generated. Your details are saved; try again.",
          ),
        );
        setStep("TEAM_PROFILES");
      }
    } finally {
      if (generation.current?.controller === controller)
        generation.current = null;
    }
  }
  async function improve(values: Record<string, string>) {
    if (generation.current) return;
    setImprovementDraft(values);
    setFlowError(null);
    setStep("ANALYZING");
    const controller = new AbortController();
    generation.current = { controller, returnTo: "IMPROVING" };
    try {
      const response = await aiService.improvePlan(
        {
          projectTitle: projectData.title,
          description: projectData.description,
          teamSize: Number(projectData.teamSize) || 1,
          deadline: projectData.deadline,
          teamProfiles: projectData.teamProfiles,
          originalPlan: plan,
          improvements: {
            similarSkillLevels: false,
            assignByStrengths: !!values.teamSkills,
            preferredTechnology: values.techPreferences || "",
            instructorRequirements: values.instructorRequirements || "",
            advancedFeatures: values.advancedFeatures
              ? values.advancedFeatures
                  .split(",")
                  .map((value) => value.trim())
                  .filter(Boolean)
              : [],
            teamSkills: values.teamSkills
              ? [{ name: "Team", skills: [values.teamSkills] }]
              : [],
          },
        },
        controller.signal,
      );
      if (!controller.signal.aborted) {
        setPlan(response);
        setStep("IMPROVED_PLAN");
      }
    } catch (error) {
      if (!controller.signal.aborted) {
        setFlowError(
          errorMessage(
            error,
            "The refinement couldn’t be completed. Your original plan is kept.",
          ),
        );
        setStep("IMPROVING");
      }
    } finally {
      if (generation.current?.controller === controller)
        generation.current = null;
    }
  }
  async function confirm() {
    if (!plan || createLock.current) return;
    createLock.current = true;
    setSubmitting(true);
    setFlowError(null);
    try {
      const project = await projectService.createProject({
        name: projectData.title,
        description: projectData.description,
        deadline: projectData.deadline,
        team_size: Number(projectData.teamSize) || 1,
        project_type: plan.projectType,
        difficulty: plan.difficulty,
        teamProfiles: projectData.teamProfiles,
        tasks: plan.phases.flatMap((phase) =>
          phase.tasks.map((task) => ({
            title: task.title,
            description: task.description,
            phase: phase.name,
            priority: task.priority,
            estimated_hours: task.estimatedHours,
            assignedToProfile: task.assignedToProfile,
            milestoneId: task.milestoneId,
            relativeStartDay: task.relativeStartDay,
            relativeDueDay: task.relativeDueDay,
          })),
        ),
        milestones: plan.milestones.map((milestone) => ({
          id: milestone.id,
          title: milestone.title,
          description: milestone.description,
          relativeDay: milestone.relativeDay,
        })),
      } as Parameters<typeof projectService.createProject>[0]);
      setCreatedId(project.id);
      setStep("SUCCESS");
      if (draftKey) {
        try {
          sessionStorage.removeItem(draftKey);
        } catch {
          /* The completed flow remains usable without storage. */
        }
      }
      toast.success("Your shared workspace is ready");
    } catch (error) {
      setFlowError(
        errorMessage(
          error,
          "The workspace couldn’t be created. Your plan is still here; try again.",
        ),
      );
    } finally {
      createLock.current = false;
      setSubmitting(false);
    }
  }
  const stepIndex =
    step === "INFO"
      ? 0
      : step === "TEAM_PROFILES"
        ? 1
        : step === "REVIEW" || step === "SUCCESS"
          ? 3
          : 2;
  return (
    <div ref={flowElement} className="page-shell max-w-4xl">
      {step !== "SUCCESS" && (
        <ol
          aria-label="Project setup progress"
          className="mx-auto flex max-w-2xl border-b pb-6"
        >
          {["Project", "Team", "Plan", "Confirm"].map((label, index) => (
            <li
              key={label}
              aria-current={index === stepIndex ? "step" : undefined}
              className={`flex flex-1 items-center gap-2 text-xs font-medium ${index <= stepIndex ? "text-primary" : "text-muted-foreground"}`}
            >
              <span
                className={`flex size-6 shrink-0 items-center justify-center rounded-full ${index < stepIndex ? "bg-primary text-primary-foreground" : index === stepIndex ? "border border-primary bg-primary/5" : "border"}`}
              >
                {index < stepIndex ? <Check className="size-3" /> : index + 1}
              </span>
              <span>{label}</span>
            </li>
          ))}
        </ol>
      )}
      {flowError && (
        <div
          role="alert"
          className="mx-auto max-w-2xl rounded-xl border border-destructive/25 bg-destructive/5 p-5 text-sm leading-relaxed"
        >
          {flowError}
        </div>
      )}
      {step === "INFO" && (
        <ProjectInfoForm
          initialValues={projectData}
          onDraftChange={(values) =>
            setProjectData((previous) => ({ ...previous, ...values }))
          }
          onSubmit={(values) => {
            setProjectData((previous) => ({ ...previous, ...values }));
            setFlowError(null);
            setStep("TEAM_PROFILES");
          }}
        />
      )}
      {step === "TEAM_PROFILES" && (
        <TeamProfilesForm
          initialProfiles={projectData.teamProfiles || []}
          teamSize={Number(projectData.teamSize) || 1}
          onDraftChange={(profiles) =>
            setProjectData((previous) => ({
              ...previous,
              teamProfiles: profiles,
            }))
          }
          onSubmit={(profiles) => void generate(profiles)}
          onBack={() => {
            setFlowError(null);
            setStep("INFO");
          }}
        />
      )}
      {step === "ANALYZING" && (
        <AIAnalysisLoading
          text="Making room for a good plan."
          onCancel={() => {
            const running = generation.current;
            if (running) {
              generation.current = null;
              running.controller.abort();
              setStep(running.returnTo);
            }
          }}
        />
      )}
      {(step === "INITIAL_PLAN" || step === "IMPROVED_PLAN") && plan && (
        <InitialPlanReview
          plan={plan}
          isImproved={step === "IMPROVED_PLAN"}
          onImprove={() => {
            setFlowError(null);
            setStep("IMPROVING");
          }}
          onProceed={() => {
            setFlowError(null);
            setStep("REVIEW");
          }}
        />
      )}
      {step === "IMPROVING" && (
        <ImprovePlanForm
          initialValues={improvementDraft}
          onSubmit={(values) => void improve(values)}
          onCancel={() => {
            setFlowError(null);
            setStep("INITIAL_PLAN");
          }}
        />
      )}
      {step === "REVIEW" && plan && (
        <ReviewConfirm
          plan={plan}
          projectData={projectData}
          isSubmitting={submitting}
          onConfirm={() => void confirm()}
          onBack={() => {
            setFlowError(null);
            setStep("INITIAL_PLAN");
          }}
        />
      )}
      {step === "SUCCESS" && createdId && (
        <ProjectSuccess projectId={createdId} />
      )}
    </div>
  );
}
