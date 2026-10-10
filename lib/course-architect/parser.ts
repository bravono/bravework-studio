import { ParsedCommand } from './types';

/**
 * Parses user input for Course Architect command triggers:
 * - [NEW: <Topic>]
 * - [UPDATE: <Course Name / Component>]
 * - [PRICE/DURATION: <Topic>]
 */
export function parseCourseCommand(input: string): ParsedCommand {
  const trimmed = input.trim();

  // Pattern matching for [NEW: ...]
  const newMatch = trimmed.match(/^\[NEW:\s*([^\]]+)\]/i);
  if (newMatch) {
    const topic = newMatch[1].trim();
    if (!topic) {
      return {
        type: 'UNKNOWN',
        raw: input,
        error: 'Missing topic parameter in [NEW: <Topic>] command.',
      };
    }
    return {
      type: 'NEW',
      topic,
    };
  }

  // Pattern matching for [UPDATE: ...]
  const updateMatch = trimmed.match(/^\[UPDATE:\s*([^\]]+)\]/i);
  if (updateMatch) {
    const rawContent = updateMatch[1].trim();
    if (!rawContent) {
      return {
        type: 'UNKNOWN',
        raw: input,
        error: 'Missing component parameter in [UPDATE: <Course Name / Component>] command.',
      };
    }

    // Support optional split if provided as Target | Modification
    const parts = rawContent.split(/\s*\|\s*|\s*->\s*/);
    const target = parts[0].trim();
    const modification = parts.length > 1 ? parts.slice(1).join(' ').trim() : undefined;

    return {
      type: 'UPDATE',
      target,
      modification,
    };
  }

  // Pattern matching for [PRICE/DURATION: ...]
  const priceMatch = trimmed.match(/^\[PRICE\/DURATION:\s*([^\]]+)\]/i);
  if (priceMatch) {
    const topic = priceMatch[1].trim();
    if (!topic) {
      return {
        type: 'UNKNOWN',
        raw: input,
        error: 'Missing topic parameter in [PRICE/DURATION: <Topic>] command.',
      };
    }
    return {
      type: 'PRICE_DURATION',
      topic,
    };
  }

  return {
    type: 'UNKNOWN',
    raw: input,
    error: 'Command must begin with [NEW: <Topic>], [UPDATE: <Course Name / Component>], or [PRICE/DURATION: <Topic>].',
  };
}
