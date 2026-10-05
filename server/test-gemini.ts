import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function testGemini() {
  try {
    console.log('Testing Gemini API direct...');
    const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await client.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: 'Reply with exactly:\nGEMINI_WORKS'
    });
    console.log('Response:', response.text);
    if (response.text?.trim() === 'GEMINI_WORKS') {
      console.log('GEMINI_DIRECT_TEST_SUCCESS');
    } else {
      console.log('Unexpected response:', response.text);
    }
  } catch (error: any) {
    console.error('API Error:', error.message);
  }
}

testGemini();
