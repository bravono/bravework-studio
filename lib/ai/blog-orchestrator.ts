import { GoogleAgent } from "./google-adk";
import { AgentInput, AgentOutput } from "./BaseAgent";

export class BlogOrchestrator {
  private writer: GoogleAgent;
  private critic: GoogleAgent;
  private editor: GoogleAgent;

  constructor() {
    this.writer = new GoogleAgent(
      "Writer",
      "WRITER",
      "You are a professional blog writer. Your task is to draft a compelling blog post based on a topic and a provided Point of View (POV). If a POV is provided, you MUST use it as the core argument, even if it's controversial. Be creative and engaging.",
    );

    this.critic = new GoogleAgent(
      "Critic",
      "CRITIC",
      "You are a sharp, analytical editor and critic. Your task is to review a blog draft. You must ensure the content is high quality, logically sound, and either perfectly aligns with the user's POV or provides a sophisticated, constructive counter-argument if the POV is weak or logically flawed. Suggest specific improvements or rewrite sections if necessary.",
    );

    this.editor = new GoogleAgent(
      "Editor",
      "EDITOR",
      "You are a markdown and SEO specialist. Your task is to take a finalized blog post and format it perfectly in Markdown with frontmatter. Ensure the title, excerpt, category, and tags are correctly extracted and formatted as YAML frontmatter.",
    );
  }

  async generate(
    topic: string,
    pointOfView?: string,
    onStatus?: (status: string) => void,
  ) {
    const input: AgentInput = { topic, pointOfView };

    // Step 1: Writer drafts the post
    onStatus?.("Writer is drafting the initial post...");
    const draft = await this.writer.process(input);

    // Step 2: Critic reviews the draft
    onStatus?.("Critic is reviewing and refining the draft...");
    const review = await this.critic.process({
      ...input,
      history: [draft.content],
    });

    // Step 3: Editor finalizes the markdown
    onStatus?.("Editor is applying final formatting and SEO...");
    const final = await this.editor.process({
      ...input,
      history: [draft.content, review.content],
    });

    onStatus?.("Generation complete!");
    return final.content;
  }
}
