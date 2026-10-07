import express from 'express';
import { GoogleGenAI, Type, Schema } from '@google/genai';
import { aiAnalyzeSchema, aiImproveSchema } from '../utils/validators';

const router = express.Router();

const geminiSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    projectType: { type: Type.STRING },
    difficulty: { type: Type.STRING },
    estimatedTasks: { type: Type.INTEGER },
    timelineDays: { type: Type.INTEGER },
    modules: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING }
        }
      }
    },
    phases: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          order: { type: Type.INTEGER },
          tasks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                priority: { type: Type.STRING, enum: ['LOW', 'MEDIUM', 'HIGH'] },
                estimatedHours: { type: Type.INTEGER },
                dependsOn: { type: Type.ARRAY, items: { type: Type.STRING } },
                assignedToProfile: { type: Type.STRING },
                milestoneId: { type: Type.STRING },
                relativeStartDay: { type: Type.INTEGER },
                relativeDueDay: { type: Type.INTEGER }
              }
            }
          }
        }
      }
    },
    milestones: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          relativeDay: { type: Type.INTEGER }
        }
      }
    },
    assignments: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          taskTitle: { type: Type.STRING },
          memberPlaceholder: { type: Type.STRING }
        }
      }
    }
  },
  required: ['projectType', 'difficulty', 'estimatedTasks', 'timelineDays', 'modules', 'phases', 'milestones', 'assignments']
};

const generateFallbackPlan = (projectTitle: string) => {
  return {
    projectType: 'Software Project',
    difficulty: 'Medium',
    estimatedTasks: 5,
    timelineDays: 28,
    modules: [{ name: 'Core', description: 'Core application features' }],
    phases: [
      {
        name: 'Planning & Setup',
        order: 1,
        tasks: [
          {
            title: 'Project Setup',
            description: 'Initialize repository and environment',
            priority: 'HIGH',
            estimatedHours: 4,
            dependsOn: [],
            milestoneId: 'm1',
            relativeStartDay: 1,
            relativeDueDay: 3
          },
          {
            title: 'Define Requirements',
            description: 'Finalize functional requirements',
            priority: 'HIGH',
            estimatedHours: 6,
            dependsOn: [],
            milestoneId: 'm1',
            relativeStartDay: 3,
            relativeDueDay: 7
          }
        ]
      },
      {
        name: 'Development',
        order: 2,
        tasks: [
          {
            title: 'Implement Core Features',
            description: 'Build main functionality',
            priority: 'HIGH',
            estimatedHours: 20,
            dependsOn: ['Project Setup', 'Define Requirements'],
            milestoneId: 'm2',
            relativeStartDay: 8,
            relativeDueDay: 21
          }
        ]
      },
      {
        name: 'Testing & Delivery',
        order: 3,
        tasks: [
          {
            title: 'Testing',
            description: 'Run all tests',
            priority: 'MEDIUM',
            estimatedHours: 8,
            dependsOn: ['Implement Core Features'],
            milestoneId: 'm3',
            relativeStartDay: 22,
            relativeDueDay: 26
          },
          {
            title: 'Deployment',
            description: 'Deploy application',
            priority: 'HIGH',
            estimatedHours: 4,
            dependsOn: ['Testing'],
            milestoneId: 'm3',
            relativeStartDay: 26,
            relativeDueDay: 28
          }
        ]
      }
    ],
    milestones: [
      { id: 'm1', title: 'Planning Complete', description: 'Requirements gathered', relativeDay: 7 },
      { id: 'm2', title: 'Core Development Complete', description: 'Main features built', relativeDay: 21 },
      { id: 'm3', title: 'Project Delivered', description: 'Deployed', relativeDay: 28 },
    ],
    assignments: []
  };
};

const getGeminiClient = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });
};

const getModels = () => {
  const primary = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite';
  return [primary, 'gemini-3.5-flash-lite', 'gemini-3-flash'];
};

export async function generateWithFallback(client: GoogleGenAI, systemInstruction: string, prompt: string, endpointName: string) {
  const models = getModels();
  let lastError: any = null;

  for (const model of models) {
    try {
      console.log(`[AI] Endpoint: ${endpointName} | Attempting generation with model: ${model}`);
          const response = await client.models.generateContent({
            model: model,
            contents: prompt,
            config: {
              systemInstruction,
              responseMimeType: 'application/json',
              responseSchema: geminiSchema
            }
          });

      if (!response.text) {
        throw new Error(`Empty response from ${model}`);
      }

      const plan = JSON.parse(response.text);
      console.log(`[AI] Endpoint: ${endpointName} | Success with model: ${model} | Generated Plan Phases: ${plan.phases?.length || 0}`);
      return plan;
    } catch (error: any) {
      console.warn(`[AI] Endpoint: ${endpointName} | Model ${model} failed | Reason: ${error.message} | Status: ${error.status}`);
      lastError = error;
      continue;
    }
  }

  throw lastError || new Error('All Gemini models failed');
}

router.post('/analyze', async (req, res) => {
  try {
    const validatedData = aiAnalyzeSchema.parse(req.body);
    
    let aiClient: GoogleGenAI;
    try {
      aiClient = getGeminiClient();
    } catch (e: any) {
      console.warn('Gemini not configured:', e.message);
      return res.status(500).json({ success: false, error: { message: 'Gemini API is not configured on the server.' } });
    }

    const today = new Date();
    const targetDate = new Date(validatedData.deadline);
    const availableDays = Math.max(1, Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

    const systemPrompt = `You are an expert technical project manager and software architect.
Your job is to generate a structured project plan for a student project.
Tasks must be specific, actionable, and reasonably sized. Avoid extremely tiny tasks or enterprise-level overhead.
Distribute tasks logically across phases. Create milestones to track progress before the deadline.

MILESTONE & TASK RULES:
1. Generate an appropriate number of milestones based on project complexity (e.g., 2-3 for simple, 4-6 for medium, more for complex). Do not hardcode exactly 3.
2. Milestones MUST represent meaningful checkpoints (e.g., "Database & Backend Complete").
3. Each task MUST reference its corresponding milestone using "milestoneId".
4. Calculate task "relativeStartDay", "relativeDueDay" and milestone "relativeDay" realistically based on dependencies and estimated hours. Parallelize work when assigned to different people.
5. The final milestone must finish on or before the deadline (${availableDays} days).

If Planned Team Profiles are provided, intelligently assign each task's "assignedToProfile" to the displayName of the planned team member based on their skills and preferred work. Otherwise, use placeholders (e.g. Member 1) for up to ${validatedData.teamSize} members.
The project deadline is ${validatedData.deadline}. Available planning time: ${availableDays} days.
The deadline is a HARD CONSTRAINT. All phases, tasks, and milestones must fit within this ${availableDays}-day period.
Ensure timelineDays does not exceed ${availableDays}. Ensure milestone relativeDay does not exceed ${availableDays}. Ensure task relativeStartDay and relativeDueDay do not exceed ${availableDays}.
Ensure the output EXACTLY matches the requested JSON schema.`;

    const userPrompt = `Project Title: ${validatedData.projectTitle}
Description: ${validatedData.description}
Team Size: ${validatedData.teamSize}
Deadline: ${validatedData.deadline}
Planned Team Profiles: ${validatedData.teamProfiles ? JSON.stringify(validatedData.teamProfiles, null, 2) : 'None'}

Analyze this project and generate a structured project plan.`;

    console.log(`[AI] Payload Summary for /analyze: Title="${validatedData.projectTitle}", TeamSize=${validatedData.teamSize}`);

    console.log(`[AI API] /analyze received`);
    console.log(`[AI API] request validated`);
    console.log(`[AI API] Gemini request started`);
    const plan = await generateWithFallback(aiClient, systemPrompt, userPrompt, '/analyze');
    console.log(`[AI API] Gemini response received`);
    console.log(`[AI API] Gemini response parsed`);
    
    console.log(`[AI API] deadline validation started`);
    // Post-generation validation & Proportional Scaling
    if (plan.timelineDays > availableDays) {
      const scaleFactor = availableDays / plan.timelineDays;
      plan.timelineDays = availableDays;
      
      if (plan.milestones && Array.isArray(plan.milestones)) {
        plan.milestones.forEach((m: any) => {
          m.relativeDay = Math.max(1, Math.floor(m.relativeDay * scaleFactor));
          if (m.relativeDay > availableDays) m.relativeDay = availableDays;
        });
      }
      
      if (plan.phases && Array.isArray(plan.phases)) {
        plan.phases.forEach((p: any) => {
          if (p.tasks && Array.isArray(p.tasks)) {
            p.tasks.forEach((t: any) => {
              t.relativeStartDay = Math.max(1, Math.floor(t.relativeStartDay * scaleFactor));
              t.relativeDueDay = Math.max(1, Math.floor(t.relativeDueDay * scaleFactor));
              
              if (t.relativeStartDay > availableDays) t.relativeStartDay = availableDays;
              if (t.relativeDueDay > availableDays) t.relativeDueDay = availableDays;
              // Ensure due is not before start
              if (t.relativeDueDay < t.relativeStartDay) t.relativeDueDay = t.relativeStartDay;
            });
          }
        });
      }
    } else {
      // Basic clamping if it somehow exceeds availableDays but timelineDays was reported as valid
      if (plan.milestones && Array.isArray(plan.milestones)) {
        plan.milestones.forEach((m: any) => {
          if (m.relativeDay > availableDays) m.relativeDay = availableDays;
        });
      }
      if (plan.phases && Array.isArray(plan.phases)) {
        plan.phases.forEach((p: any) => {
          if (p.tasks && Array.isArray(p.tasks)) {
            p.tasks.forEach((t: any) => {
              if (t.relativeStartDay > availableDays) t.relativeStartDay = availableDays;
              if (t.relativeDueDay > availableDays) t.relativeDueDay = availableDays;
            });
          }
        });
      }
    }
    console.log(`[AI API] deadline validation passed`);
    console.log(`[AI API] sending response`);


    console.log(`[AI] Final Result for /analyze: Returned plan successfully without fallback. TimelineDays=${plan.timelineDays}/${availableDays}`);
    return res.json({ success: true, data: plan });
  } catch (error: any) {
    console.error(`[AI] Error in /ai/analyze: ${error.message}`);
    if (error.name === 'ZodError') {
      return res.status(400).json({ success: false, error: { message: 'Invalid request data', details: error.errors } });
    }
    // Return actual error if AI fails
    return res.status(500).json({ success: false, error: { message: error.message || 'Gemini API failed to generate a plan' } });
  }
});


router.post('/improve-plan', async (req, res) => {
  try {
    const validatedData = aiImproveSchema.parse(req.body);
    
    let aiClient: GoogleGenAI;
    try {
      aiClient = getGeminiClient();
    } catch (e: any) {
      console.warn('Gemini not configured:', e.message);
      return res.status(500).json({ success: false, error: { message: 'Gemini API is not configured on the server.' } });
    }

    const today = new Date();
    const targetDate = new Date(validatedData.deadline);
    const availableDays = Math.max(1, Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

    const systemPrompt = `You are an expert technical project manager and software architect.
You are improving an existing project plan for a student project based on new user feedback and team skill information.
Your goal is to adjust tasks, technologies, workloads, and assignments. 

MILESTONE & TASK RULES:
1. Generate an appropriate number of milestones based on project complexity (e.g., 2-3 for simple, 4-6 for medium, more for complex). Do not hardcode exactly 3.
2. Milestones MUST represent meaningful checkpoints (e.g., "Database & Backend Complete").
3. Each task MUST reference its corresponding milestone using "milestoneId".
4. Calculate task "relativeStartDay", "relativeDueDay" and milestone "relativeDay" realistically based on dependencies and estimated hours. Parallelize work when assigned to different people.
5. The final milestone must finish on or before the deadline (${availableDays} days).

If Planned Team Profiles or member strengths are provided, intelligently assign each task's "assignedToProfile" to the displayName of the planned team member based on their skills and preferred work.
The project deadline is ${validatedData.deadline}. Available planning time: ${availableDays} days.
The deadline is a HARD CONSTRAINT. All phases, tasks, and milestones must fit within this ${availableDays}-day period.
Ensure timelineDays does not exceed ${availableDays}. Ensure milestone relativeDay does not exceed ${availableDays}. Ensure task relativeStartDay and relativeDueDay do not exceed ${availableDays}.
Return the complete, improved project plan using the exact same JSON schema.
Ensure to preserve useful existing tasks and logical dependencies.`;

    const userPrompt = `Original Plan:
${JSON.stringify(validatedData.originalPlan, null, 2)}

Requested Improvements / New Info:
${JSON.stringify(validatedData.improvements, null, 2)}

Project Context:
Title: ${validatedData.projectTitle}
Description: ${validatedData.description}
Team Size: ${validatedData.teamSize}
Deadline: ${validatedData.deadline}
Planned Team Profiles: ${validatedData.teamProfiles ? JSON.stringify(validatedData.teamProfiles, null, 2) : 'None'}

Provide the improved project plan.`;

    console.log(`[AI] Payload Summary for /improve-plan: Title="${validatedData.projectTitle}", ImprovementsRequested=true`);

    const plan = await generateWithFallback(aiClient, systemPrompt, userPrompt, '/improve-plan');

    // Post-generation validation & Proportional Scaling
    if (plan.timelineDays > availableDays) {
      const scaleFactor = availableDays / plan.timelineDays;
      plan.timelineDays = availableDays;
      
      if (plan.milestones && Array.isArray(plan.milestones)) {
        plan.milestones.forEach((m: any) => {
          m.relativeDay = Math.max(1, Math.floor(m.relativeDay * scaleFactor));
          if (m.relativeDay > availableDays) m.relativeDay = availableDays;
        });
      }
      
      if (plan.phases && Array.isArray(plan.phases)) {
        plan.phases.forEach((p: any) => {
          if (p.tasks && Array.isArray(p.tasks)) {
            p.tasks.forEach((t: any) => {
              t.relativeStartDay = Math.max(1, Math.floor(t.relativeStartDay * scaleFactor));
              t.relativeDueDay = Math.max(1, Math.floor(t.relativeDueDay * scaleFactor));
              
              if (t.relativeStartDay > availableDays) t.relativeStartDay = availableDays;
              if (t.relativeDueDay > availableDays) t.relativeDueDay = availableDays;
              if (t.relativeDueDay < t.relativeStartDay) t.relativeDueDay = t.relativeStartDay;
            });
          }
        });
      }
    } else {
      if (plan.milestones && Array.isArray(plan.milestones)) {
        plan.milestones.forEach((m: any) => {
          if (m.relativeDay > availableDays) m.relativeDay = availableDays;
        });
      }
      if (plan.phases && Array.isArray(plan.phases)) {
        plan.phases.forEach((p: any) => {
          if (p.tasks && Array.isArray(p.tasks)) {
            p.tasks.forEach((t: any) => {
              if (t.relativeStartDay > availableDays) t.relativeStartDay = availableDays;
              if (t.relativeDueDay > availableDays) t.relativeDueDay = availableDays;
            });
          }
        });
      }
    }

    console.log(`[AI] Final Result for /improve-plan: Returned improved plan successfully without fallback. TimelineDays=${plan.timelineDays}/${availableDays}`);
    return res.json({ success: true, data: plan });
  } catch (error: any) {
    console.error(`[AI] Error in /ai/improve-plan: ${error.message}`);
    if (error.name === 'ZodError') {
      return res.status(400).json({ success: false, error: { message: 'Invalid request data', details: error.errors } });
    }
    
    // Return actual error if AI fails
    return res.status(500).json({ success: false, error: { message: error.message || 'Gemini API failed to improve the plan' } });
  }
});

export default router;
