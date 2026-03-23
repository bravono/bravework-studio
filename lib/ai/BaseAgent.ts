export interface IAgent {
  name: string;
  role: string;
  process(input: AgentInput): Promise<AgentOutput>;
}

export interface AgentInput {
  topic: string;
  pointOfView?: string;
  history?: string[];
  context?: any;
}

export interface AgentOutput {
  content: string;
  metadata?: any;
}

export type AgentRole = "WRITER" | "CRITIC" | "EDITOR";
