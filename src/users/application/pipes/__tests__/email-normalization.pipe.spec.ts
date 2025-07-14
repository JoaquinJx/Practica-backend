import { BadRequestException } from '@nestjs/common';
import { EmailNormalizationPipe } from '../email-normalization.pipe';

describe('EmailNormalizationPipe', () => {
  let pipe: EmailNormalizationPipe;

  beforeEach(() => {
    pipe = new EmailNormalizationPipe();
  });

  describe('transform', () => {
    it('should normalize email to lowercase', () => {
      const result = pipe.transform('ADMIN@TEST.COM');
      expect(result).toBe('admin@test.com');
    });

    it('should trim whitespace from email', () => {
      const result = pipe.transform('  admin@test.com  ');
      expect(result).toBe('admin@test.com');
    });

    it('should handle mixed case and whitespace', () => {
      const result = pipe.transform(' ADMIN@TEST.COM ');
      expect(result).toBe('admin@test.com');
    });

    it('should throw BadRequestException for invalid email format', () => {
      expect(() => pipe.transform('invalid-email')).toThrow(BadRequestException);
      expect(() => pipe.transform('invalid@')).toThrow(BadRequestException);
      expect(() => pipe.transform('@invalid.com')).toThrow(BadRequestException);
    });

    it('should handle empty string', () => {
      expect(() => pipe.transform('')).toThrow(BadRequestException);
    });

    it('should preserve valid email structure', () => {
      const validEmails = [
        'user@example.com',
        'test.email@domain.co.uk',
        'user+tag@example.org'
      ];

      validEmails.forEach(email => {
        const result = pipe.transform(email.toUpperCase());
        expect(result).toBe(email.toLowerCase());
      });
    });
  });
});
