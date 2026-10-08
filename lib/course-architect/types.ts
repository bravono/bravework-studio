export type FunnelTier = 'TEASER' | 'TIER_1' | 'TIER_2' | 'TIER_3';

export type ApprovedDomain =
  | 'TECHNICAL_DESIGN'
  | 'HARD_SURFACE_3D'
  | 'INDUSTRIAL_MECHANICS'
  | 'ARCHITECTURAL_SPACES'
  | 'DIGITAL_MEDIA_PIPELINES';

export type DeliveryFormat = 'LIVE_COHORT' | 'RECORDED_ASYNCHRONOUS';

export interface LessonBlock {
  title: string;
  timeAllocation: string; // e.g. "00:00 - 00:15"
  durationMinutes: number;
  slideNotes: string;
  teacherScript: string;
  onScreenActions: string[];
  studentCheckpoint: {
    objectiveState: string;
    verificationRule: string;
    selfTestStep?: string;
  };
  troubleshooting?: Array<{
    errorCondition: string;
    rootCause: string;
    immediateFix: string;
  }>;
}

export interface CurriculumModule {
  id: string;
  title: string;
  tier: FunnelTier;
  durationHours: number;
  learningObjectives: string[];
  blocks: LessonBlock[];
}

export interface ToolRequirement {
  name: string;
  category: string;
  license: string;
  isFreeOrOpenSource: boolean;
  isPaidOrTrial: boolean;
  downloadUrl?: string;
}

export interface PricingTierDetail {
  tier: FunnelTier;
  recommendedDurationHours: number;
  selfPacedPriceUsd: number;
  cohortPriceUsd: number;
  marketJustification: string;
}

export interface CourseBlueprint {
  title: string;
  topic: string;
  summary: string;
  primaryDomain: ApprovedDomain;
  tools: ToolRequirement[];
  pricingTiers: Record<FunnelTier, PricingTierDetail>;
  teaserScript: LessonBlock[];
  tiers: {
    tier1: CurriculumModule[];
    tier2: CurriculumModule[];
    tier3: CurriculumModule[];
  };
  stage: 'STAGE_1_OVERVIEW' | 'STAGE_2_EXPANDED';
}

export type ParsedCommand =
  | { type: 'NEW'; topic: string }
  | { type: 'UPDATE'; target: string; modification?: string }
  | { type: 'PRICE_DURATION'; topic: string }
  | { type: 'UNKNOWN'; raw: string; error: string };

export interface ValidationIssue {
  field: string;
  message: string;
  severity: 'ERROR' | 'WARNING';
}

export interface ValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
}
