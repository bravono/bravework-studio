import {
  CourseBlueprint,
  LessonBlock,
  ToolRequirement,
  ValidationResult,
  ValidationIssue,
} from './types';

// Blacklisted commercial or trial software keywords
const PROHIBITED_TOOLS_REGEX =
  /(maya|3ds max|substance painter|substance designer|clo 3d|clo3d|marvelous designer|solidworks|cinema 4d|c4d|photoshop|illustrator|premiere pro|after effects|keyframe trial|paid license|30-day trial|14-day trial|subscription required)/i;

// Prohibited domains and keywords (Fashion visualization / apparel mockups)
const PROHIBITED_DOMAIN_REGEX =
  /(fashion visualization|apparel mockup|garment|clothing|dress|skirt|shirt|runway|fashion design|tailoring pattern|sewing|fabric draping)/i;

/**
 * Validates tool recommendations against the strict FOSS/freeware requirement.
 */
export function validateToolRequirement(tool: ToolRequirement): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (tool.isPaidOrTrial) {
    issues.push({
      field: `tools.${tool.name}`,
      message: `Tool "${tool.name}" requires a paid license or trial. Only free, open-source, or non-commercial freemium tools are permitted.`,
      severity: 'ERROR',
    });
  }

  if (PROHIBITED_TOOLS_REGEX.test(tool.name)) {
    issues.push({
      field: `tools.${tool.name}`,
      message: `Tool "${tool.name}" matches prohibited proprietary software. Use open-source alternatives like Blender, FreeCAD, Godot, Krita, or DaVinci Resolve Free.`,
      severity: 'ERROR',
    });
  }

  return issues;
}

/**
 * Validates that practical exercise topics and briefs do not violate domain constraints.
 */
export function validateDomainContent(text: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (PROHIBITED_DOMAIN_REGEX.test(text)) {
    issues.push({
      field: 'domainContent',
      message: 'Fashion visualization and apparel mockups are strictly prohibited. Use technical design, 3D hard-surface, industrial mechanics, architectural spaces, or digital media pipelines.',
      severity: 'ERROR',
    });
  }

  return issues;
}

/**
 * Validates that a lesson block contains turnkey step-by-step instructions.
 */
export function validateLessonBlock(block: LessonBlock, path: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!block.timeAllocation || block.durationMinutes <= 0) {
    issues.push({
      field: `${path}.timeAllocation`,
      message: 'Turnkey lessons must specify an explicit chronological time allocation and duration.',
      severity: 'ERROR',
    });
  }

  if (!block.slideNotes || block.slideNotes.trim().length === 0) {
    issues.push({
      field: `${path}.slideNotes`,
      message: 'Turnkey lessons must include slide notes or visual focal references.',
      severity: 'ERROR',
    });
  }

  if (!block.teacherScript || block.teacherScript.trim().length < 15) {
    issues.push({
      field: `${path}.teacherScript`,
      message: 'Turnkey lessons must include substantive teacher talking points and framing scripts.',
      severity: 'ERROR',
    });
  }

  if (!block.onScreenActions || block.onScreenActions.length === 0) {
    issues.push({
      field: `${path}.onScreenActions`,
      message: 'Turnkey lessons must list exact on-screen actions (clicks, hotkeys, tool selections, coordinates).',
      severity: 'ERROR',
    });
  }

  if (!block.studentCheckpoint || !block.studentCheckpoint.verificationRule) {
    issues.push({
      field: `${path}.studentCheckpoint`,
      message: 'Turnkey lessons must provide a student hands-on checkpoint with concrete verification criteria.',
      severity: 'ERROR',
    });
  }

  return issues;
}

/**
 * Validates an entire course blueprint against all Course Architect constraints.
 */
export function validateCourseBlueprint(blueprint: CourseBlueprint): ValidationResult {
  const issues: ValidationIssue[] = [];

  // Check 4-part funnel presence
  if (!blueprint.teaserScript || blueprint.teaserScript.length === 0) {
    issues.push({
      field: 'teaserScript',
      message: 'Curriculum must include a complete 2-Hour Live Teaser script.',
      severity: 'ERROR',
    });
  } else {
    const totalTeaserMinutes = blueprint.teaserScript.reduce(
      (sum, block) => sum + block.durationMinutes,
      0
    );
    if (totalTeaserMinutes < 110 || totalTeaserMinutes > 130) {
      issues.push({
        field: 'teaserScript.duration',
        message: `2-Hour Live Teaser must total approximately 120 minutes. Current duration: ${totalTeaserMinutes} minutes.`,
        severity: 'WARNING',
      });
    }
  }

  if (!blueprint.tiers.tier1 || blueprint.tiers.tier1.length === 0) {
    issues.push({
      field: 'tiers.tier1',
      message: 'Curriculum must include Tier 1 (Beginner) modules.',
      severity: 'ERROR',
    });
  }

  if (!blueprint.tiers.tier2 || blueprint.tiers.tier2.length === 0) {
    issues.push({
      field: 'tiers.tier2',
      message: 'Curriculum must include Tier 2 (Intermediate) modules.',
      severity: 'ERROR',
    });
  }

  if (!blueprint.tiers.tier3 || blueprint.tiers.tier3.length === 0) {
    issues.push({
      field: 'tiers.tier3',
      message: 'Curriculum must include Tier 3 (Advanced) modules.',
      severity: 'ERROR',
    });
  }

  // Check tools constraints
  for (const tool of blueprint.tools) {
    issues.push(...validateToolRequirement(tool));
  }

  // Check domain text constraints in summary and title
  issues.push(...validateDomainContent(blueprint.title));
  issues.push(...validateDomainContent(blueprint.summary));

  // Check turnkey detail in teaser blocks
  blueprint.teaserScript.forEach((block, index) => {
    issues.push(...validateLessonBlock(block, `teaserScript[${index}]`));
    issues.push(...validateDomainContent(block.teacherScript));
  });

  // Check turnkey detail in tier modules if expanded
  if (blueprint.stage === 'STAGE_2_EXPANDED') {
    const allModules = [
      ...blueprint.tiers.tier1,
      ...blueprint.tiers.tier2,
      ...blueprint.tiers.tier3,
    ];

    allModules.forEach((mod) => {
      mod.blocks.forEach((block, blockIndex) => {
        issues.push(...validateLessonBlock(block, `${mod.id}.blocks[${blockIndex}]`));
        issues.push(...validateDomainContent(block.teacherScript));
      });
    });
  }

  return {
    isValid: issues.filter((i) => i.severity === 'ERROR').length === 0,
    issues,
  };
}
