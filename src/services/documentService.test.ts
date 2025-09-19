import { describe, it, expect } from 'vitest';
import { documentService } from './documentService';

describe('documentService', () => {
  describe('formatFileSize', () => {
    it('should return "0 B" for 0 bytes', () => {
      expect(documentService.formatFileSize(0)).toBe('0 B');
    });

    it('should format bytes correctly', () => {
      expect(documentService.formatFileSize(100)).toBe('100 B');
    });

    it('should format kilobytes correctly', () => {
      expect(documentService.formatFileSize(1024)).toBe('1.0 KB');
      expect(documentService.formatFileSize(1536)).toBe('1.5 KB');
    });

    it('should format megabytes correctly', () => {
      expect(documentService.formatFileSize(1048576)).toBe('1.0 MB');
      expect(documentService.formatFileSize(1572864)).toBe('1.5 MB');
    });

    it('should format gigabytes correctly', () => {
      expect(documentService.formatFileSize(1073741824)).toBe('1.0 GB');
    });
  });
});
