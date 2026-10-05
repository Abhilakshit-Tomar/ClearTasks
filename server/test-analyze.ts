import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { generateWithFallback } from './src/routes/ai.ts';
import { GoogleGenAI } from '@google/genai';

async function testAnalyze() {
  console.log('Testing generateWithFallback...');
  try {
    const aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const systemPrompt = `You are an expert technical project manager and software architect.
Your job is to generate a structured project plan for a student project.
The project deadline is 2026-10-30. Available planning time: 25 days.
Ensure the output EXACTLY matches the requested JSON schema.`;

    const userPrompt = `Project Title: College Event Management System
Description: A web application for managing college events. Students should be able to register for events, organizers should be able to create and manage events, and admins should be able to view registrations and manage users.
Team Size: 4
Deadline: 2026-10-30

Analyze this project and generate a structured project plan.`;

    const plan = await generateWithFallback(aiClient, systemPrompt, userPrompt, '/analyze');
    console.log('SUCCESS! Plan:', JSON.stringify(plan, null, 2).substring(0, 500) + '...');
  } catch (error: any) {
    console.error('FAILED!', error);
  }
}

testAnalyze();
