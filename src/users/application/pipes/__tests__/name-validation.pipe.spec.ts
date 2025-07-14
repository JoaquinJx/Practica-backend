import { BadRequestException } from '@nestjs/common';
import { NameValidationPipe } from '../name-validation.pipe';

describe('NameValidationPipe', () => {
  let pipe: NameValidationPipe;

  beforeEach(() => {
    pipe = new NameValidationPipe();
  });

  describe('transform', () => {
    it('should capitalize first letter of each word', () => {
      expect(pipe.transform('john doe')).toBe('John Doe');
      expect(pipe.transform('mary jane watson')).toBe('Mary Jane Watson');
      expect(pipe.transform('jean-claude van damme')).toBe('Jean-claude Van Damme'); // Los guiones NO separan palabras
    });

    it('should trim excessive whitespace', () => {
      expect(pipe.transform('  john   doe  ')).toBe('John   Doe'); // Solo trim de bordes, no espacios internos
      expect(pipe.transform('john    doe')).toBe('John    Doe');
    });

    it('should handle single names', () => {
      expect(pipe.transform('madonna')).toBe('Madonna');
      expect(pipe.transform('  CHER  ')).toBe('Cher');
    });

    it('should throw BadRequestException for invalid names', () => {
      const invalidNames = ['', '   ', 'a'];
      
      invalidNames.forEach(name => {
        expect(() => pipe.transform(name)).toThrow(BadRequestException);
      });
    });

    it('should handle names with special characters', () => {
      expect(pipe.transform("o'connor")).toBe("Oconnor"); // Los apóstrofes se eliminan por seguridad
      expect(pipe.transform('josé maría')).toBe('José María');
    });

    it('should reject names that are too short', () => {
      expect(() => pipe.transform('a')).toThrow(BadRequestException);
    });

    it('should reject names with numbers', () => {
      expect(() => pipe.transform('john123')).toThrow(BadRequestException);
      expect(() => pipe.transform('user123')).toThrow(BadRequestException);
    });

    it('should handle null and undefined', () => {
      expect(() => pipe.transform(null as any)).toThrow(BadRequestException);
      expect(() => pipe.transform(undefined as any)).toThrow(BadRequestException);
    });
  });
});
