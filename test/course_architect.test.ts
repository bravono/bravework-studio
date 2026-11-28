import {
  parseCourseCommand,
  validateToolRequirement,
  validateDomainContent,
  validateLessonBlock,
  validateCourseBlueprint,
  generatePricingMatrix,
  convertLiveBlockToRecorded,
  formatStage1Response,
  CourseBlueprint,
  LessonBlock,
} from '../lib/course-architect';

describe('Course Architect & Curriculum Builder Module', () => {
  describe('Command Parser (parseCourseCommand)', () => {
    it('should parse [NEW: <Topic>] commands correctly', () => {
      const result = parseCourseCommand('[NEW: Hard-Surface Robotics Modeling in Blender]');
      expect(result.type).toBe('NEW');
      if (result.type === 'NEW') {
        expect(result.topic).toBe('Hard-Surface Robotics Modeling in Blender');
      }
    });

    it('should handle whitespace variations in [NEW: <Topic>]', () => {
      const result = parseCourseCommand('   [NEW:   Parametric Architectural Design   ]   ');
      expect(result.type).toBe('NEW');
      if (result.type === 'NEW') {
        expect(result.topic).toBe('Parametric Architectural Design');
      }
    });

    it('should parse [UPDATE: <Component>] with target and optional modification', () => {
      const result = parseCourseCommand('[UPDATE: Module 3 Hydraulic Actuator | Swap to Gearbox Linkage]');
      expect(result.type).toBe('UPDATE');
      if (result.type === 'UPDATE') {
        expect(result.target).toBe('Module 3 Hydraulic Actuator');
        expect(result.modification).toBe('Swap to Gearbox Linkage');
      }
    });

    it('should parse [PRICE/DURATION: <Topic>] commands', () => {
      const result = parseCourseCommand('[PRICE/DURATION: Industrial Mechanics Simulation]');
      expect(result.type).toBe('PRICE_DURATION');
      if (result.type === 'PRICE_DURATION') {
        expect(result.topic).toBe('Industrial Mechanics Simulation');
      }
    });

    it('should return UNKNOWN with error for empty topic or invalid format', () => {
      const emptyNew = parseCourseCommand('[NEW: ]');
      expect(emptyNew.type).toBe('UNKNOWN');

      const invalidCommand = parseCourseCommand('Please design a syllabus for me');
      expect(invalidCommand.type).toBe('UNKNOWN');
    });
  });

  describe('Tool Validation (validateToolRequirement)', () => {
    it('should approve free and open-source tools', () => {
      const tool = {
        name: 'Blender 4.2 LTS',
        category: '3D Creation Suite',
        license: 'GPL v3',
        isFreeOrOpenSource: true,
        isPaidOrTrial: false,
      };
      const issues = validateToolRequirement(tool);
      expect(issues.length).toBe(0);
    });

    it('should reject paid commercial tools by flag', () => {
      const tool = {
        name: 'Commercial Tool',
        category: 'Modeling',
        license: 'Proprietary',
        isFreeOrOpenSource: false,
        isPaidOrTrial: true,
      };
      const issues = validateToolRequirement(tool);
      expect(issues.some((i) => i.severity === 'ERROR')).toBe(true);
      expect(issues[0].message).toContain('requires a paid license or trial');
    });

    it('should reject blacklisted commercial tool names', () => {
      const mayaTool = {
        name: 'Autodesk Maya 2025',
        category: '3D Suite',
        license: 'Commercial Subscription',
        isFreeOrOpenSource: false,
        isPaidOrTrial: false,
      };
      const issues = validateToolRequirement(mayaTool);
      expect(issues.some((i) => i.severity === 'ERROR')).toBe(true);
      expect(issues[0].message).toContain('prohibited proprietary software');
    });
  });

  describe('Domain & Example Diversity Validation (validateDomainContent)', () => {
    it('should reject fashion visualization and apparel mockup content', () => {
      const text = 'Build a fashion visualization garment mockup with fabric draping on a runway model.';
      const issues = validateDomainContent(text);
      expect(issues.length).toBeGreaterThan(0);
      expect(issues[0].severity).toBe('ERROR');
      expect(issues[0].message).toContain('Fashion visualization and apparel mockups are strictly prohibited');
    });

    it('should accept valid engineering, 3D hard-surface, and architectural content', () => {
      const text = 'Model an industrial planetary gearbox with precision teeth clearance in FreeCAD.';
      const issues = validateDomainContent(text);
      expect(issues.length).toBe(0);
    });
  });

  describe('Turnkey Lesson Validation (validateLessonBlock)', () => {
    const validBlock: LessonBlock = {
      title: 'Bevel Modifier Stacking & Normal Transfer',
      timeAllocation: '00:15 - 00:35',
      durationMinutes: 20,
      slideNotes: 'Slide 4: Non-destructive Hard Surface Edge Shading',
      teacherScript: 'Observe how standard subdivision destroys mechanical sharpness without tight support loops. We stack weighted normals to retain planar fidelity.',
      onScreenActions: [
        'Select the Turret Chassis mesh in Viewport 3D.',
        'In Modifier Stack, add Bevel Modifier: Segments 2, Width 0.02m.',
        'Add Weighted Normal Modifier and enable Keep Sharp.',
      ],
      studentCheckpoint: {
        objectiveState: 'Turret mesh with crisp chamfered highlights under MatCap preview.',
        verificationRule: 'Verify face orientation is blue and normal shading contains zero pinching artifacts.',
        selfTestStep: 'Rotate light source in viewport to confirm smooth highlight roll-off across corners.',
      },
      troubleshooting: [
        {
          errorCondition: 'Surface shading appears black or distorted after adding modifier.',
          rootCause: 'Inverted face normals from boolean operations.',
          immediateFix: 'Enter Edit Mode, select all vertices with A, and press Shift+N to recalculate normals outside.',
        },
      ],
    };

    it('should validate a complete turnkey lesson block without errors', () => {
      const issues = validateLessonBlock(validBlock, 'block_1');
      expect(issues.length).toBe(0);
    });

    it('should flag lesson blocks missing on-screen actions or checkpoints', () => {
      const incompleteBlock: LessonBlock = {
        ...validBlock,
        onScreenActions: [],
        studentCheckpoint: { objectiveState: '', verificationRule: '' },
      };
      const issues = validateLessonBlock(incompleteBlock, 'incomplete');
      expect(issues.some((i) => i.field.includes('onScreenActions'))).toBe(true);
      expect(issues.some((i) => i.field.includes('studentCheckpoint'))).toBe(true);
    });
  });

  describe('Course Blueprint Four-Part Funnel Validation (validateCourseBlueprint)', () => {
    const sampleBlueprint: CourseBlueprint = {
      title: 'Precision Hard-Surface Pipeline for Robotics',
      topic: 'Hard-Surface Robotics in Blender',
      summary: 'Turnkey curriculum mastering mechanical asset modeling, kinematic bone rigging, and real-time asset export.',
      primaryDomain: 'HARD_SURFACE_3D',
      tools: [
        {
          name: 'Blender 4.2 LTS',
          category: '3D Creation',
          license: 'GPL v3',
          isFreeOrOpenSource: true,
          isPaidOrTrial: false,
        },
      ],
      pricingTiers: generatePricingMatrix('Hard-Surface Robotics'),
      teaserScript: [
        {
          title: 'Rapid Setup & Viewport Calibration',
          timeAllocation: '00:00 - 00:15',
          durationMinutes: 15,
          slideNotes: 'Slide 1: Zero-Friction Blender Setup',
          teacherScript: 'Welcome everyone. In this initial 15 minutes, we calibrate unit scale to metric and verify our viewport overlays.',
          onScreenActions: ['Set Scene Units to Metric, Length: Millimeters.'],
          studentCheckpoint: {
            objectiveState: 'Viewport displaying millimeter grid.',
            verificationRule: 'Verify bottom right status bar confirms 1 unit = 1mm.',
          },
        },
        {
          title: 'Core Concept: Non-Destructive Booleans',
          timeAllocation: '00:15 - 00:50',
          durationMinutes: 35,
          slideNotes: 'Slide 2: Boolean Solvers & Intersection Curves',
          teacherScript: 'We demonstrate the exact difference between Fast and Exact solvers for clean mechanical cutouts.',
          onScreenActions: ['Add Cube primitive, add Cylinder cutter, apply Difference Boolean.'],
          studentCheckpoint: {
            objectiveState: 'Cylindrical cavity cut into primary box.',
            verificationRule: 'Geometry shows zero degenerate zero-area faces.',
          },
        },
        {
          title: 'Hands-On Build: Actuator Bracket Assembly',
          timeAllocation: '00:50 - 01:40',
          durationMinutes: 50,
          slideNotes: 'Slide 3: Guided Actuator Bracket Build',
          teacherScript: 'Now follow my actions step by step as we build the structural servo mount.',
          onScreenActions: ['Extrude base flange 4mm, bevel outer corners, create bolt hole array.'],
          studentCheckpoint: {
            objectiveState: 'Completed bracket with 4 mounting holes and chamfered edges.',
            verificationRule: 'Verify hole diameter is 5mm and aligned to origin.',
          },
        },
        {
          title: 'Tier Upsell Roadmap & Curriculum Transition',
          timeAllocation: '01:40 - 02:00',
          durationMinutes: 20,
          slideNotes: 'Slide 4: Professional Mastery Roadmap',
          teacherScript: 'In our 2-hour session we created a single bracket. Tiers 1 through 3 take you into full robotic assembly and simulation.',
          onScreenActions: ['Display presentation slide with Tier 1-3 comparison matrix.'],
          studentCheckpoint: {
            objectiveState: 'Students review roadmap and course link.',
            verificationRule: 'Review enrollment portal and download starter project pack.',
          },
        },
      ],
      tiers: {
        tier1: [
          {
            id: 'T1_M1',
            title: 'Foundations & Mechanical Primitives',
            tier: 'TIER_1',
            durationHours: 3,
            learningObjectives: ['Interface navigation', 'Unit precision'],
            blocks: [],
          },
        ],
        tier2: [
          {
            id: 'T2_M1',
            title: 'Complex Sub-Assemblies & UV Unwrapping',
            tier: 'TIER_2',
            durationHours: 6,
            learningObjectives: ['Subdivision topology', 'Hard surface unwrap'],
            blocks: [],
          },
        ],
        tier3: [
          {
            id: 'T3_M1',
            title: 'Kinematic Rigging & Game Engine Pipeline',
            tier: 'TIER_3',
            durationHours: 8,
            learningObjectives: ['Inverse kinematics', 'LOD export to Godot'],
            blocks: [],
          },
        ],
      },
      stage: 'STAGE_1_OVERVIEW',
    };

    it('should validate a fully compliant course blueprint', () => {
      const validation = validateCourseBlueprint(sampleBlueprint);
      expect(validation.isValid).toBe(true);
      expect(validation.issues.filter((i) => i.severity === 'ERROR').length).toBe(0);
    });

    it('should fail validation if any tier in the funnel is missing', () => {
      const brokenBlueprint: CourseBlueprint = {
        ...sampleBlueprint,
        tiers: {
          ...sampleBlueprint.tiers,
          tier3: [],
        },
      };
      const validation = validateCourseBlueprint(brokenBlueprint);
      expect(validation.isValid).toBe(false);
      expect(validation.issues.some((i) => i.field === 'tiers.tier3')).toBe(true);
    });

    it('should fail validation if apparel or fashion examples are introduced', () => {
      const forbiddenBlueprint: CourseBlueprint = {
        ...sampleBlueprint,
        summary: 'A course designing fashion visualization apparel mockups for jackets.',
      };
      const validation = validateCourseBlueprint(forbiddenBlueprint);
      expect(validation.isValid).toBe(false);
      expect(validation.issues.some((i) => i.field === 'domainContent')).toBe(true);
    });
  });

  describe('Live Checkpoint to Recorded Video Conversion', () => {
    it('should rephrase live chat interactions into recorded pause instructions', () => {
      const liveBlock: LessonBlock = {
        title: 'Gear Tooth Alignment',
        timeAllocation: '00:30 - 00:45',
        durationMinutes: 15,
        slideNotes: 'Slide 5: Gear Clearance',
        teacherScript: 'Please raise your hand in chat once your gear mesh rotates without collision.',
        onScreenActions: ['Rotate gear A by 15 degrees.'],
        studentCheckpoint: {
          objectiveState: 'Mesh gears aligned.',
          verificationRule: 'Tooth clearance is 0.2mm.',
        },
      };

      const recordedBlock = convertLiveBlockToRecorded(liveBlock);
      expect(recordedBlock.teacherScript).toContain('pause the video now');
      expect(recordedBlock.onScreenActions.some((a) => a.includes('PAUSE RECORDING'))).toBe(true);
    });
  });

  describe('Stage 1 Response and Execution Protocol Gating', () => {
    it('should include the mandatory confirmation prompt in Stage 1 formatted text', () => {
      const sampleBlueprint: CourseBlueprint = {
        title: 'Industrial Kinematics with FreeCAD',
        topic: 'Industrial Mechanics',
        summary: 'Comprehensive kinematic modeling for mechanical machinery.',
        primaryDomain: 'INDUSTRIAL_MECHANICS',
        tools: [
          {
            name: 'FreeCAD 0.21',
            category: 'Parametric CAD',
            license: 'LGPL v2+',
            isFreeOrOpenSource: true,
            isPaidOrTrial: false,
          },
        ],
        pricingTiers: generatePricingMatrix('Industrial Kinematics'),
        teaserScript: [
          {
            title: 'Intro & Sketcher Setup',
            timeAllocation: '00:00 - 00:15',
            durationMinutes: 15,
            slideNotes: 'Slide 1: Sketcher Workbench',
            teacherScript: 'In this opening block we configure geometric constraint solvers.',
            onScreenActions: ['Open Sketcher workbench and create a new sketch on the XY plane.'],
            studentCheckpoint: {
              objectiveState: 'Empty sketch on XY plane with origin locked.',
              verificationRule: 'Status confirms Fully Constrained.',
            },
          },
        ],
        tiers: {
          tier1: [],
          tier2: [],
          tier3: [],
        },
        stage: 'STAGE_1_OVERVIEW',
      };

      const output = formatStage1Response(sampleBlueprint);
      expect(output).toContain('Stage 1 (Overview, Free Tools Stack, Pricing Matrix, 2-Hour Live Teaser Script, and Tier Roadmap) is complete. Please confirm to proceed with Stage 2: full step-by-step turnkey lesson scripts for Tiers 1, 2, and 3.');
      expect(output).toContain('## Recommended Free & Open-Source Tools Stack');
      expect(output).toContain('## Recommended Duration & Market Pricing Tiers');
    });
  });
});
