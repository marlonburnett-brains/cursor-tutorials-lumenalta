/**
 * Unit tests for validation utilities
 */

import {
  validateContent,
  validateStatus,
  validateUUID,
  trimContent,
  validateRequired,
  CONTENT_MAX_LENGTH,
} from './validation';
import { ERROR_CODES } from '../types/error';

describe('Validation Utils', () => {
  describe('trimContent', () => {
    it('should trim leading whitespace', () => {
      expect(trimContent('  hello')).toBe('hello');
    });

    it('should trim trailing whitespace', () => {
      expect(trimContent('hello  ')).toBe('hello');
    });

    it('should trim both leading and trailing whitespace', () => {
      expect(trimContent('  hello  ')).toBe('hello');
    });

    it('should not modify content without whitespace', () => {
      expect(trimContent('hello')).toBe('hello');
    });

    it('should handle newlines and tabs', () => {
      expect(trimContent('\n\thello\t\n')).toBe('hello');
    });
  });

  describe('validateContent', () => {
    it('should accept valid content', () => {
      const result = validateContent('Valid content');
      expect(result).toBe('Valid content');
    });

    it('should trim and return content', () => {
      const result = validateContent('  Valid content  ');
      expect(result).toBe('Valid content');
    });

    it('should accept content at minimum length', () => {
      const result = validateContent('ab');
      expect(result).toBe('ab');
    });

    it('should accept content at maximum length', () => {
      const longContent = 'a'.repeat(CONTENT_MAX_LENGTH);
      const result = validateContent(longContent);
      expect(result).toBe(longContent);
    });

    it('should throw error for missing content', () => {
      expect(() => validateContent(undefined)).toThrow('Content field is required');
      try {
        validateContent(undefined);
      } catch (error: any) {
        expect(error.code).toBe(ERROR_CODES.MISSING_FIELD);
      }
    });

    it('should throw error for null content', () => {
      expect(() => validateContent(null)).toThrow('Content field is required');
      try {
        validateContent(null);
      } catch (error: any) {
        expect(error.code).toBe(ERROR_CODES.MISSING_FIELD);
      }
    });

    it('should throw error for non-string content', () => {
      expect(() => validateContent(123)).toThrow('Content must be a string');
      try {
        validateContent(123);
      } catch (error: any) {
        expect(error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
      }
    });

    it('should throw error for content too short after trimming', () => {
      expect(() => validateContent('a')).toThrow('at least 2 characters');
      try {
        validateContent('a');
      } catch (error: any) {
        expect(error.code).toBe(ERROR_CODES.CONTENT_TOO_SHORT);
      }
    });

    it('should throw error for content too long', () => {
      const tooLong = 'a'.repeat(CONTENT_MAX_LENGTH + 1);
      expect(() => validateContent(tooLong)).toThrow('must not exceed');
      try {
        validateContent(tooLong);
      } catch (error: any) {
        expect(error.code).toBe(ERROR_CODES.CONTENT_TOO_LONG);
      }
    });

    it('should include field name in error', () => {
      try {
        validateContent('');
      } catch (error: any) {
        expect(error.field).toBe('content');
      }
    });
  });

  describe('validateStatus', () => {
    it('should accept valid status: todo', () => {
      const result = validateStatus('todo');
      expect(result).toBe('todo');
    });

    it('should accept valid status: in-progress', () => {
      const result = validateStatus('in-progress');
      expect(result).toBe('in-progress');
    });

    it('should accept valid status: completed', () => {
      const result = validateStatus('completed');
      expect(result).toBe('completed');
    });

    it('should throw error for missing status', () => {
      expect(() => validateStatus(undefined)).toThrow('Status field is required');
      try {
        validateStatus(undefined);
      } catch (error: any) {
        expect(error.code).toBe(ERROR_CODES.MISSING_FIELD);
      }
    });

    it('should throw error for null status', () => {
      expect(() => validateStatus(null)).toThrow('Status field is required');
      try {
        validateStatus(null);
      } catch (error: any) {
        expect(error.code).toBe(ERROR_CODES.MISSING_FIELD);
      }
    });

    it('should throw error for non-string status', () => {
      expect(() => validateStatus(123)).toThrow('Status must be a string');
      try {
        validateStatus(123);
      } catch (error: any) {
        expect(error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
      }
    });

    it('should throw error for invalid status value', () => {
      expect(() => validateStatus('invalid')).toThrow('Status must be one of');
      try {
        validateStatus('invalid');
      } catch (error: any) {
        expect(error.code).toBe(ERROR_CODES.INVALID_STATUS);
      }
    });

    it('should be case-sensitive (reject uppercase)', () => {
      expect(() => validateStatus('TODO')).toThrow('Status must be one of');
      expect(() => validateStatus('Todo')).toThrow('Status must be one of');
      expect(() => validateStatus('IN-PROGRESS')).toThrow('Status must be one of');
      expect(() => validateStatus('COMPLETED')).toThrow('Status must be one of');
    });

    it('should include field name in error', () => {
      try {
        validateStatus('invalid');
      } catch (error: any) {
        expect(error.field).toBe('status');
      }
    });
  });

  describe('validateUUID', () => {
    it('should accept valid UUID v4', () => {
      const validUUID = '550e8400-e29b-41d4-a716-446655440000';
      const result = validateUUID(validUUID);
      expect(result).toBe(validUUID);
    });

    it('should accept UUID with uppercase letters', () => {
      const validUUID = '550E8400-E29B-41D4-A716-446655440000';
      const result = validateUUID(validUUID);
      expect(result).toBe(validUUID);
    });

    it('should throw error for missing UUID', () => {
      expect(() => validateUUID(undefined)).toThrow('ID field is required');
      try {
        validateUUID(undefined);
      } catch (error: any) {
        expect(error.code).toBe(ERROR_CODES.MISSING_FIELD);
      }
    });

    it('should throw error for null UUID', () => {
      expect(() => validateUUID(null)).toThrow('ID field is required');
      try {
        validateUUID(null);
      } catch (error: any) {
        expect(error.code).toBe(ERROR_CODES.MISSING_FIELD);
      }
    });

    it('should throw error for non-string UUID', () => {
      expect(() => validateUUID(123)).toThrow('ID must be a string');
      try {
        validateUUID(123);
      } catch (error: any) {
        expect(error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
      }
    });

    it('should throw error for invalid UUID format', () => {
      expect(() => validateUUID('not-a-uuid')).toThrow('valid UUID');
      try {
        validateUUID('not-a-uuid');
      } catch (error: any) {
        expect(error.code).toBe(ERROR_CODES.INVALID_UUID);
      }
    });

    it('should throw error for UUID with wrong version', () => {
      // UUID v1 (not v4)
      expect(() => validateUUID('550e8400-e29b-11d4-a716-446655440000')).toThrow('valid UUID');
    });

    it('should throw error for UUID with wrong format', () => {
      expect(() => validateUUID('550e8400e29b41d4a716446655440000')).toThrow('valid UUID');
      expect(() => validateUUID('550e8400-e29b-41d4-a716')).toThrow('valid UUID');
    });

    it('should include field name in error', () => {
      try {
        validateUUID('invalid');
      } catch (error: any) {
        expect(error.field).toBe('id');
      }
    });
  });

  describe('validateRequired', () => {
    it('should not throw for valid value', () => {
      expect(() => validateRequired('value', 'field')).not.toThrow();
      expect(() => validateRequired(0, 'field')).not.toThrow();
      expect(() => validateRequired(false, 'field')).not.toThrow();
    });

    it('should throw for undefined', () => {
      expect(() => validateRequired(undefined, 'field')).toThrow('field is required');
      try {
        validateRequired(undefined, 'field');
      } catch (error: any) {
        expect(error.code).toBe(ERROR_CODES.MISSING_FIELD);
      }
    });

    it('should throw for null', () => {
      expect(() => validateRequired(null, 'field')).toThrow('field is required');
      try {
        validateRequired(null, 'field');
      } catch (error: any) {
        expect(error.code).toBe(ERROR_CODES.MISSING_FIELD);
      }
    });

    it('should throw for empty string', () => {
      expect(() => validateRequired('', 'field')).toThrow('field is required');
      try {
        validateRequired('', 'field');
      } catch (error: any) {
        expect(error.code).toBe(ERROR_CODES.MISSING_FIELD);
      }
    });

    it('should include custom field name in error', () => {
      try {
        validateRequired(undefined, 'customField');
      } catch (error: any) {
        expect(error.field).toBe('customField');
        expect(error.message).toContain('customField');
      }
    });
  });
});

