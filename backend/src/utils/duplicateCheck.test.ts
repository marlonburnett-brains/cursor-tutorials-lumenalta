/**
 * Unit tests for duplicate detection
 */

import { isDuplicateTask, extractFirstLine } from './duplicateCheck';
import { Task } from '../types/task';

describe('DuplicateCheck Utils', () => {
  // Helper function to create test tasks
  const createTask = (
    id: string,
    content: string,
    status: 'todo' | 'in-progress' | 'completed' = 'todo'
  ): Task => ({
    id,
    content,
    status,
    createdAt: Date.now(),
  });

  describe('extractFirstLine', () => {
    it('should extract first line from single-line content', () => {
      const result = extractFirstLine('Single line content');
      expect(result).toBe('Single line content');
    });

    it('should extract first line from multi-line content', () => {
      const content = 'First line\nSecond line\nThird line';
      const result = extractFirstLine(content);
      expect(result).toBe('First line');
    });

    it('should trim whitespace from extracted line', () => {
      const result = extractFirstLine('  First line  \nSecond line');
      expect(result).toBe('First line');
    });

    it('should handle content with leading and trailing newlines', () => {
      const result = extractFirstLine('\n\nContent\n\n');
      expect(result).toBe('Content');
    });

    it('should handle empty string', () => {
      const result = extractFirstLine('');
      expect(result).toBe('');
    });
  });

  describe('isDuplicateTask', () => {
    describe('single-line content', () => {
      it('should detect exact duplicate', () => {
        const tasks = [
          createTask('1', 'Buy groceries'),
          createTask('2', 'Write tests'),
        ];

        expect(isDuplicateTask('Buy groceries', tasks)).toBe(true);
      });

      it('should detect case-insensitive duplicate', () => {
        const tasks = [
          createTask('1', 'Buy groceries'),
          createTask('2', 'Write tests'),
        ];

        expect(isDuplicateTask('buy groceries', tasks)).toBe(true);
        expect(isDuplicateTask('BUY GROCERIES', tasks)).toBe(true);
        expect(isDuplicateTask('BuY GrOcErIeS', tasks)).toBe(true);
      });

      it('should not detect non-duplicate', () => {
        const tasks = [
          createTask('1', 'Buy groceries'),
          createTask('2', 'Write tests'),
        ];

        expect(isDuplicateTask('Buy milk', tasks)).toBe(false);
        expect(isDuplicateTask('Go shopping', tasks)).toBe(false);
      });

      it('should handle whitespace differences', () => {
        const tasks = [createTask('1', 'Buy groceries')];

        expect(isDuplicateTask('  Buy groceries  ', tasks)).toBe(true);
        expect(isDuplicateTask('Buy groceries  ', tasks)).toBe(true);
        expect(isDuplicateTask('  Buy groceries', tasks)).toBe(true);
      });

      it('should return false for empty task list', () => {
        expect(isDuplicateTask('Buy groceries', [])).toBe(false);
      });
    });

    describe('multi-line content', () => {
      it('should only compare first line', () => {
        const tasks = [
          createTask('1', 'Buy groceries\nMilk\nEggs\nBread'),
        ];

        // Same first line, different details
        expect(
          isDuplicateTask('Buy groceries\nCheese\nYogurt', tasks)
        ).toBe(true);
      });

      it('should detect duplicate with different subsequent lines', () => {
        const tasks = [
          createTask('1', 'Project meeting\nDiscuss Q4 goals'),
        ];

        expect(
          isDuplicateTask('Project meeting\nReview budget', tasks)
        ).toBe(true);
      });

      it('should not detect duplicate if first line differs', () => {
        const tasks = [
          createTask('1', 'Buy groceries\nMilk\nEggs'),
        ];

        expect(
          isDuplicateTask('Buy supplies\nMilk\nEggs', tasks)
        ).toBe(false);
      });

      it('should handle multi-line content case-insensitively', () => {
        const tasks = [
          createTask('1', 'Buy groceries\nMilk\nEggs'),
        ];

        expect(
          isDuplicateTask('BUY GROCERIES\nDifferent details', tasks)
        ).toBe(true);
      });
    });

    describe('excludeId parameter', () => {
      it('should exclude task with matching ID', () => {
        const tasks = [
          createTask('1', 'Buy groceries'),
          createTask('2', 'Write tests'),
        ];

        // Should not be duplicate when excluding task 1
        expect(isDuplicateTask('Buy groceries', tasks, '1')).toBe(false);
      });

      it('should still detect duplicates from other tasks', () => {
        const tasks = [
          createTask('1', 'Buy groceries'),
          createTask('2', 'Buy groceries'),
          createTask('3', 'Write tests'),
        ];

        // Excluding task 1, but task 2 still has same content
        expect(isDuplicateTask('Buy groceries', tasks, '1')).toBe(true);
      });

      it('should work with non-existent exclude ID', () => {
        const tasks = [createTask('1', 'Buy groceries')];

        expect(isDuplicateTask('Buy groceries', tasks, 'non-existent')).toBe(
          true
        );
      });
    });

    describe('edge cases', () => {
      it('should handle empty content', () => {
        const tasks = [createTask('1', 'Buy groceries')];

        expect(isDuplicateTask('', tasks)).toBe(false);
      });

      it('should handle content with only whitespace', () => {
        const tasks = [createTask('1', 'Buy groceries')];

        expect(isDuplicateTask('   ', tasks)).toBe(false);
      });

      it('should check across all task statuses', () => {
        const tasks = [
          createTask('1', 'Buy groceries', 'todo'),
          createTask('2', 'Write tests', 'in-progress'),
          createTask('3', 'Review PR', 'completed'),
        ];

        expect(isDuplicateTask('Buy groceries', tasks)).toBe(true);
        expect(isDuplicateTask('Write tests', tasks)).toBe(true);
        expect(isDuplicateTask('Review PR', tasks)).toBe(true);
      });

      it('should handle special characters', () => {
        const tasks = [
          createTask('1', 'Buy groceries @ store #1'),
        ];

        expect(isDuplicateTask('Buy groceries @ store #1', tasks)).toBe(true);
        expect(isDuplicateTask('buy groceries @ store #1', tasks)).toBe(true);
      });

      it('should handle unicode characters', () => {
        const tasks = [
          createTask('1', 'Acheter des courses 🛒'),
        ];

        expect(isDuplicateTask('Acheter des courses 🛒', tasks)).toBe(true);
        expect(isDuplicateTask('acheter des courses 🛒', tasks)).toBe(true);
      });
    });
  });
});

