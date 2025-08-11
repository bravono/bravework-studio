type ClassValue = string | number | null | undefined | false | Record<string, boolean> | ClassValue[];

export function cn(...inputs: ClassValue[]): string {
  const result: string[] = [];

  const flatten = (input: ClassValue): void => {
    if (!input) return;

    if (typeof input === 'string' || typeof input === 'number') {
      result.push(String(input).trim());
    } else if (Array.isArray(input)) {
      input.forEach(flatten);
    } else if (typeof input === 'object') {
      for (const [key, value] of Object.entries(input)) {
        if (value) result.push(key.trim());
      }
    }
  };

  inputs.forEach(flatten);
  return result.join(' ');
}