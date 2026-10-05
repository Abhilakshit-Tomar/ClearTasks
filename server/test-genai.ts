import { GoogleGenAI, Type } from '@google/genai';
import { z } from 'zod';
import zodToJsonSchema from 'zod-to-json-schema';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

const AIPlanResponseSchema = z.object({
  projectType: z.string(),
  difficulty: z.string(),
  estimatedTasks: z.number(),
  timelineWeeks: z.number()
});

async function run() {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: 'Generate a test project plan.',
      config: {
        responseMimeType: 'application/json',
        responseSchema: zodToJsonSchema(AIPlanResponseSchema) as any,
        systemInstruction: 'You are an expert project manager. Output strictly in JSON format matching the schema.'
      }
    });
    console.log("Success with generateContent:", response.text);
  } catch (error) {
    console.error("Error with generateContent:", error);
  }
}
run();
