import { GoogleGenerativeAI } from "@google/generative-ai";
import { IAgent, AgentInput, AgentOutput } from "./BaseAgent";
import dns from "node:dns";

// Fix for fetch failed errors in some Node.js 18+ environments
// when resolving Google API hostnames.
if (typeof dns.setDefaultResultOrder === "function") {
  dns.setDefaultResultOrder("ipv4first");
}

export class GoogleAgent implements IAgent {
  private genAI: GoogleGenerativeAI;

  constructor(
    public name: string,
    public role: string,
    private systemInstruction: string,
  ) {
    const apiKey = (process.env.GOOGLE_GENERATIVE_AI_API_KEY || "").trim();
    console.log(
      `[AI Agent: ${name}] API Key Loaded: ${apiKey ? `Yes (Length: ${apiKey.length}, Prefix: ${apiKey.substring(0, 7)})` : "NO"}`,
    );
    if (!apiKey) {
      console.warn(`[AI Agent: ${name}] API Key is missing!`);
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async process(input: AgentInput): Promise<AgentOutput> {
    const prompt = `Topic: ${input.topic}${input.pointOfView ? `\nPoint of View: ${input.pointOfView}` : ""}${
      input.history
        ? `\n\nPrevious work:\n${input.history.join("\n---\n")}`
        : ""
    }`;

    // Confirmed available models for this API key (from ListModels).
    // Ordered: highest free-tier quota → most capable last resort.
    // gemini-2.5-flash:        500 free req/day  (~$0.009/post if paid)
    // gemini-2.0-flash:      1,500 free req/day  (~$0.002/post if paid)
    // gemini-2.0-flash-lite: 1,500 free req/day  (~$0.001/post if paid)
    // gemini-2.5-pro:           25 free req/day  (~$0.034/post if paid) ← last resort
    const modelsToTry = [
      "gemini-2.5-flash", // Primary: 500 free req/day, fast + capable
      "gemini-2.0-flash", // Fallback 1: 1,500 free req/day
      "gemini-2.0-flash-001", // Fallback 2: pinned stable version
      "gemini-2.0-flash-lite", // Fallback 3: lightest, highest free RPM
      "gemini-2.0-flash-lite-001", // Fallback 4: pinned lite
      "gemini-2.5-pro", // Last resort: only 25 free req/day
    ];

    let lastError: any = null;

    for (const modelName of modelsToTry) {
      try {
        console.log(`[AI Agent: ${this.name}] Testing model: ${modelName}`);

        const model = this.genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: this.systemInstruction,
        });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        if (text) {
          console.log(`[AI Agent: ${this.name}] SUCCESS with ${modelName}`);
          return { content: text };
        }
      } catch (error: any) {
        lastError = error;
        const statusCode = error.status || error.statusCode || 0;
        const errMsg = error.message?.toLowerCase() || "unknown error";

        console.warn(
          `[AI Agent: ${this.name}] Failed ${modelName} (Status: ${statusCode}): ${errMsg}`,
        );

        // If it's a 429, quota, or 403, we definitely want to try another model
        // If it's a 404, the model might not exist or be available in the region
        if (
          statusCode === 429 ||
          statusCode === 403 ||
          statusCode === 404 ||
          errMsg.includes("429") ||
          errMsg.includes("quota") ||
          errMsg.includes("limit") ||
          errMsg.includes("exhausted") ||
          errMsg.includes("not found") ||
          errMsg.includes("404") ||
          errMsg.includes("403") ||
          errMsg.includes("not supported") ||
          errMsg.includes("fetch failed")
        ) {
          console.warn(
            `[AI Agent: ${this.name}] Transient error or quota hit for ${modelName}. Moving to next fallback...`,
          );

          // If it's a rate limit, wait just a bit longer
          if (
            statusCode === 429 ||
            errMsg.includes("429") ||
            errMsg.includes("quota")
          ) {
            await new Promise((resolve) => setTimeout(resolve, 3000));
          }
          continue;
        }

        // For other supposedly critical errors, still try next model unless it's an auth error
        if (
          errMsg.includes("api key") ||
          errMsg.includes("auth") ||
          statusCode === 401
        ) {
          throw error;
        }

        console.warn(
          `[AI Agent: ${this.name}] Unexpected error for ${modelName}, trying next anyway...`,
        );
        continue;
      }
    }

    console.error(`[AI Agent: ${this.name}] ALL MODELS FAILED.`);

    // Check if all failures were quota-related
    const lastMsg = lastError?.message?.toLowerCase() || "";
    const wasQuota =
      lastMsg.includes("429") ||
      lastMsg.includes("quota") ||
      lastMsg.includes("limit") ||
      lastMsg.includes("exhausted");

    if (wasQuota) {
      throw new Error(
        `All AI models have hit their rate limit or quota for your API key. ` +
          `Please wait a few minutes and try again, or upgrade your Google AI plan at https://ai.google.dev/gemini-api/docs/rate-limits`,
      );
    }

    throw new Error(
      `AI Agent "${this.name}" failed across all models. Last error: ${lastError?.message || "Unknown failure"}`,
    );
  }
}
