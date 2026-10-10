import {
  CourseBlueprint,
  FunnelTier,
  LessonBlock,
  PricingTierDetail,
  ApprovedDomain,
} from './types';

/**
 * Generates standard pricing and duration tiers for a technical topic.
 */
export function generatePricingMatrix(
  topic: string,
  baseHours: { teaser: number; tier1: number; tier2: number; tier3: number } = {
    teaser: 2,
    tier1: 12,
    tier2: 24,
    tier3: 36,
  }
): Record<FunnelTier, PricingTierDetail> {
  return {
    TEASER: {
      tier: 'TEASER',
      recommendedDurationHours: baseHours.teaser,
      selfPacedPriceUsd: 0,
      cohortPriceUsd: 19,
      marketJustification: `Introductory 2-hour onboarding session for ${topic}. Free or low-barrier entry point demonstrating teaching velocity and zero-to-one workflow competence.`,
    },
    TIER_1: {
      tier: 'TIER_1',
      recommendedDurationHours: baseHours.tier1,
      selfPacedPriceUsd: 149,
      cohortPriceUsd: 399,
      marketJustification: `Beginner foundational mechanics in ${topic}. Replaces unstructured tutorials with zero-to-one workspace and tool setup, producing independent project viability.`,
    },
    TIER_2: {
      tier: 'TIER_2',
      recommendedDurationHours: baseHours.tier2,
      selfPacedPriceUsd: 349,
      cohortPriceUsd: 899,
      marketJustification: `Intermediate production pipelines in ${topic}. Focuses on professional velocity, procedural optimization, and industry-grade portfolio assets.`,
    },
    TIER_3: {
      tier: 'TIER_3',
      recommendedDurationHours: baseHours.tier3,
      selfPacedPriceUsd: 699,
      cohortPriceUsd: 1899,
      marketJustification: `Advanced specialized systems and edge-case engineering in ${topic}. Equips students with lead-level troubleshooting, automation scripts, and studio-grade pipelines.`,
    },
  };
}

/**
 * Converts a live-teaching interactive checkpoint into an asynchronous recorded video block.
 */
export function convertLiveBlockToRecorded(block: LessonBlock): LessonBlock {
  const recordedScript = block.teacherScript
    .replace(
      /raise your hand in chat|type 'done' in the chat|let's wait for everyone/gi,
      'pause the video now, complete the exercise in your workspace, and resume once your viewport matches the checkpoint'
    );

  const recordedCheckpoint = {
    ...block.studentCheckpoint,
    selfTestStep: block.studentCheckpoint.selfTestStep ||
      'Compare your geometry and node network against reference file in the lesson downloads before clicking Next.',
  };

  const recordedOnScreen = [
    ...block.onScreenActions,
    'Display on-screen pause prompt: [PAUSE RECORDING TO COMPLETE HANDS-ON STEP].',
  ];

  return {
    ...block,
    teacherScript: recordedScript,
    onScreenActions: recordedOnScreen,
    studentCheckpoint: recordedCheckpoint,
  };
}

/**
 * Generates the Stage 1 response text including the mandatory execution protocol confirmation prompt.
 */
export function formatStage1Response(blueprint: CourseBlueprint): string {
  const toolsFormatted = blueprint.tools
    .map(
      (t) =>
        `- ${t.name} (${t.category}, License: ${t.license}${t.downloadUrl ? `, Source: ${t.downloadUrl}` : ''})`
    )
    .join('\n');

  const pricingFormatted = Object.values(blueprint.pricingTiers)
    .map(
      (p) =>
        `| ${p.tier} | ${p.recommendedDurationHours} hrs | $${p.selfPacedPriceUsd} | $${p.cohortPriceUsd} | ${p.marketJustification} |`
    )
    .join('\n');

  const teaserFormatted = blueprint.teaserScript
    .map(
      (b, idx) => `
### Block ${idx + 1}: ${b.title}
- Time Allocation: ${b.timeAllocation} (${b.durationMinutes} min)
- Slide / Reference: ${b.slideNotes}

Teacher Script:
${b.teacherScript}

On-Screen Actions:
${b.onScreenActions.map((a) => `- ${a}`).join('\n')}

Student Checkpoint:
- State: ${b.studentCheckpoint.objectiveState}
- Verification: ${b.studentCheckpoint.verificationRule}
${b.studentCheckpoint.selfTestStep ? `- Self-Test: ${b.studentCheckpoint.selfTestStep}` : ''}
`
    )
    .join('\n');

  return `# Course Blueprint: ${blueprint.title}

## Summary
${blueprint.summary}

## Primary Domain
${blueprint.primaryDomain}

## Recommended Free & Open-Source Tools Stack
${toolsFormatted}

## Recommended Duration & Market Pricing Tiers
| Tier | Duration | Self-Paced (USD) | Live Cohort (USD) | Market Justification |
| :--- | :--- | :--- | :--- | :--- |
${pricingFormatted}

---

## 2-Hour Live Teaser: Complete Turnkey Script
${teaserFormatted}

---

## High-Level Tier Roadmap
- Tier 1 (Beginner): Foundations, interface navigation, core primitives, fundamental mechanics.
- Tier 2 (Intermediate): Complex workflows, optimization, real-world case scenarios, production assets.
- Tier 3 (Advanced): Industry-grade execution, edge cases, troubleshooting, advanced pipelines.

---

## Execution Protocol Confirmation
Stage 1 (Overview, Free Tools Stack, Pricing Matrix, 2-Hour Live Teaser Script, and Tier Roadmap) is complete. Please confirm to proceed with Stage 2: full step-by-step turnkey lesson scripts for Tiers 1, 2, and 3.
`;
}
