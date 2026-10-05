import { GoogleGenAI } from '@google/genai';

async function run() {
  const ai = new GoogleGenAI({ apiKey: 'invalid_key_for_testing' });
  try {
    await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: 'Test'
    });
  } catch (error: any) {
    console.log("Error properties:", Object.keys(error));
    console.log("Status:", error.status);
    console.log("Message:", error.message);
  }
}
run();
