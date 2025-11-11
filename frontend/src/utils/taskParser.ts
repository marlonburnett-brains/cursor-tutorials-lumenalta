import { ParsedTaskContent } from '../types/task';

/**
 * Parse task content into title and description
 * 
 * Frontend-only business rule:
 * - Single-line content: No title, entire content is description
 * - Multi-line with first line ≤ 200 chars: First line becomes title, rest is description
 * - Multi-line with first line > 200 chars: No title, entire content is description
 * 
 * This function is called on every render to dynamically derive title/description.
 * Title and description are NEVER persisted to storage.
 * 
 * @param content - The raw task content string
 * @returns ParsedTaskContent with optional title and description
 */
export function parseTaskContent(content: string): ParsedTaskContent {
  if (!content || content.trim().length === 0) {
    return {
      title: null,
      description: '',
    };
  }

  const lines = content.split('\n');
  
  // Single-line content: no title, entire content is description
  if (lines.length === 1) {
    return {
      title: null,
      description: content.trim(),
    };
  }

  // Multi-line content
  const firstLine = lines[0].trim();
  const remainingLines = lines.slice(1).join('\n').trim();

  // If first line is 200 characters or less, it becomes the title
  if (firstLine.length <= 200) {
    return {
      title: firstLine,
      description: remainingLines,
    };
  }

  // If first line is more than 200 characters, no title
  return {
    title: null,
    description: content.trim(),
  };
}

