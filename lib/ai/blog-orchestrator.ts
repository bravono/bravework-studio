import { GoogleAgent } from "./google-adk";
import { ImageAgent } from "./image-agent";
import { AgentInput, AgentOutput } from "./BaseAgent";

export class BlogOrchestrator {
  private writer: GoogleAgent;
  private critic: GoogleAgent;
  private imageAgent: ImageAgent;
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

    this.imageAgent = new ImageAgent();

    this.editor = new GoogleAgent(
      "Editor",
      "EDITOR",
      "You are a markdown and SEO specialist. Your task is to take a finalized blog post draft and its image metadata, and format it perfectly in Markdown with frontmatter. \n\n" +
        "CRITICAL: DO NOT wrap your response in markdown code blocks or code fences (like ```markdown). Start your response IMMEDIATELY with the '---' frontmatter separator.\n" +
        "CRITICAL: If a 'USER_SELECTED_CATEGORY' is provided in the history/context, YOU MUST use it for the 'category' field in the frontmatter. Do not invent a different category.\n" +
        "CRITICAL: If a thumbnail URL is provided in the history/context, ensure the 'thumbnail' field in the frontmatter is populated with it. \n" +
        "CRITICAL: Insert at least one relevant image into the body of the blog post using the syntax ![Descriptive Alt Text](URL) where the URL is derived from the image metadata provided. Use the keywords to create a descriptive alt text.",
    );
  }

  async generate(
    topic: string,
    pointOfView?: string,
    onStatus?: (status: string) => void,
    category?: string,
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

    // Step 3: ImageAgent generates image metadata
    onStatus?.("Visualist is generating image concepts...");
    const imageData = await this.imageAgent.process({
      ...input,
      history: [review.content],
    });

    // Step 4: Editor finalizes the markdown
    onStatus?.("Editor is applying final formatting and embedding images...");
    const final = await this.editor.process({
      ...input,
      history: [
        review.content,
        `IMAGE_METADATA: ${JSON.stringify(imageData.metadata)}`,
        category ? `USER_SELECTED_CATEGORY: ${category}` : "",
      ],
    });

    onStatus?.("Generation complete!");
    return {
      content: final.content,
      thumbnailUrl: imageData.metadata?.thumbnailUrl,
    };
  }

  async refine(
    currentContent: string,
    instructions: string,
    onStatus?: (status: string) => void,
  ) {
    onStatus?.("Critic is analyzing your instructions...");
    const review = await this.critic.process({
      topic: "Refining existing content",
      history: [
        `CURRENT CONTENT:\n${currentContent}`,
        `REFINEMENT INSTRUCTIONS:\n${instructions}`,
      ],
    });

    onStatus?.("Editor is applying updates...");
    const final = await this.editor.process({
      topic: "Applying refinements",
      history: [currentContent, review.content],
    });

    onStatus?.("Refinement complete!");
    return final.content;
  }
}
