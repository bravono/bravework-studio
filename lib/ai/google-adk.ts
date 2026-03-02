import { GoogleGenerativeAI } from "@google/generative-ai";
import { IAgent, AgentInput, AgentOutput } from "./BaseAgent";

export class GoogleAgent implements IAgent {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(
    public name: string,
    public role: string,
    private systemInstruction: string,
  ) {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || "";
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: systemInstruction,
    });
  }

  async process(input: AgentInput): Promise<AgentOutput> {
    const prompt = `Topic: ${input.topic}${input.pointOfView ? `\nPoint of View: ${input.pointOfView}` : ""}${
      input.history
        ? `\n\nPrevious work:\n${input.history.join("\n---\n")}`
        : ""
    }`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      return { content: text };
    } catch (error) {
      console.error(`Error in agent ${this.name}:`, error);
      throw error;
    }
  }
}
