import express from "express";
import { GoogleGenAI } from "@google/genai";
import { aiAnalyzeSchema, aiImproveSchema } from "../utils/validators";
import {
  buildPlanningRequest,
  PlanQualityError,
  validateProjectPlan,
  type PlanningRequest,
} from "../ai/planning";
import { planResponseSchema } from "../ai/schema";

const router = express.Router();

const getGeminiClient = () => {
  if (!process.env.GEMINI_API_KEY)
    throw new Error("GEMINI_API_KEY is not configured");
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
};

const getModels = () => [
  ...new Set([
    process.env.GEMINI_MODEL || "gemini-3.1-flash-lite",
    "gemini-3.5-flash-lite",
    "gemini-3-flash",
  ]),
];

export async function generateWithFallback(
  client: GoogleGenAI,
  systemInstruction: string,
  prompt: string,
  endpointName: string,
  constraints?: Pick<PlanningRequest, "availableDays" | "assignees">,
) {
  let lastError: unknown;
  const deadline = Date.now() + 50000; // Leave room within the client's 60-second request limit.
  for (const model of getModels()) {
    let contents = prompt;
    // One focused correction per model for malformed or incoherent output.
    // Provider failures move directly to the existing model fallback list.
    for (let attempt = 0; attempt < 2; attempt++) {
      const remainingMs = deadline - Date.now();
      if (remainingMs <= 0) throw new Error("The planning time budget expired");
      let candidate = "";
      try {
        console.log(`[AI] ${endpointName} | ${model} | attempt ${attempt + 1}`);
        const response = await client.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: planResponseSchema,
            abortSignal: AbortSignal.timeout(Math.min(20000, remainingMs)),
          },
        });
        candidate = response.text || "";
        if (!candidate) throw new PlanQualityError(["The response was empty"]);
        const value = JSON.parse(candidate);
        return constraints ? validateProjectPlan(value, constraints) : value;
      } catch (error) {
        lastError = error;
        const repairable =
          error instanceof PlanQualityError || error instanceof SyntaxError;
        console.warn(
          `[AI] ${endpointName} | ${model} | ${repairable ? "Plan validation failed" : "Provider request failed"}`,
        );
        if (!repairable || attempt === 1) break;
        const corrections =
          error instanceof PlanQualityError
            ? error.issues.slice(0, 12)
            : ["Return a valid JSON object matching the response schema"];
        contents =
          prompt +
          "\n\nCorrect the previous candidate. Return the complete corrected plan, not a patch. Fix feasibility by reducing optional scope or rebalancing effort, never by compressing dates.\n" +
          JSON.stringify({
            validationIssues: corrections,
            previousCandidate: candidate.slice(0, 24000),
          });
      }
    }
  }
  throw lastError || new Error("The planning service did not return a plan");
}

function planningHandler(improve: boolean): express.RequestHandler {
  return async (req, res) => {
    try {
      const brief = improve
        ? aiImproveSchema.parse(req.body)
        : aiAnalyzeSchema.parse(req.body);
      if (!process.env.GEMINI_API_KEY) {
        res
          .status(500)
          .json({
            success: false,
            error: {
              message: "The planning service is not configured on the server.",
            },
          });
        return;
      }
      const request = buildPlanningRequest(brief);
      const plan = await generateWithFallback(
        getGeminiClient(),
        request.systemInstruction,
        request.prompt,
        improve ? "/improve-plan" : "/analyze",
        request,
      );
      res.json({ success: true, data: plan });
    } catch (error: any) {
      if (error.name === "ZodError") {
        res
          .status(400)
          .json({
            success: false,
            error: {
              message: "Check the project details and try again.",
              details: error.issues,
            },
          });
        return;
      }
      console.error(
        `[AI] ${improve ? "Improvement" : "Analysis"} failed:`,
        error instanceof PlanQualityError ? error.issues : error.name,
      );
      res
        .status(502)
        .json({
          success: false,
          error: {
            message:
              error instanceof PlanQualityError
                ? "We couldn’t produce a consistent plan for this brief. Your details are kept; try again or refine the scope."
                : "The planning service couldn’t finish this request. Your details are kept; please try again.",
          },
        });
    }
  };
}

router.post("/analyze", planningHandler(false));
router.post("/improve-plan", planningHandler(true));
export default router;
