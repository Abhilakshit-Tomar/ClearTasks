import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

const AIPlanResponseSchema = z.object({
  projectType: z.string(),
  difficulty: z.string(),
  estimatedTasks: z.number(),
  timelineWeeks: z.number(),
  modules: z.array(z.object({
    name: z.string(),
    description: z.string(),
  })),
  phases: z.array(z.object({
    name: z.string(),
    order: z.number(),
    tasks: z.array(z.object({
      title: z.string(),
      description: z.string(),
      priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
      estimatedHours: z.number(),
      dependsOn: z.array(z.string()),
    }))
  })),
  milestones: z.array(z.object({
    title: z.string(),
    description: z.string(),
    relativeDay: z.number(),
  })),
  assignments: z.array(z.object({
    taskTitle: z.string(),
    memberPlaceholder: z.string(),
  })),
});

async function run() {
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.parse({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an expert.' },
        { role: 'user', content: 'Test.' }
      ],
      response_format: zodResponseFormat(AIPlanResponseSchema, 'project_plan'),
    });
    console.log("Success:", completion.choices[0].message.parsed);
  } catch(e) {
    console.error("OpenAI Error:", e);
  }
}
run();
