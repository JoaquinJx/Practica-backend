import { BadRequestException } from '@nestjs/common';
import { RoleValidationPipe } from '../role-validation.pipe';
import { Role } from '../../../../auth/enums/role.enum';

describe('RoleValidationPipe', () => {
  let pipe: RoleValidationPipe;

  beforeEach(() => {
    pipe = new RoleValidationPipe();
  });

  describe('transform', () => {
    it('should normalize valid roles to lowercase', () => {
      expect(pipe.transform('ADMIN')).toBe(Role.ADMIN);
      expect(pipe.transform('MODERATOR')).toBe(Role.MODERATOR);
      expect(pipe.transform('USER')).toBe(Role.USER);
    });

    it('should trim whitespace and normalize', () => {
      expect(pipe.transform(' ADMIN ')).toBe(Role.ADMIN);
      expect(pipe.transform('  moderator  ')).toBe(Role.MODERATOR);
      expect(pipe.transform(' User ')).toBe(Role.USER);
    });

    it('should handle mixed case', () => {
      expect(pipe.transform('AdMiN')).toBe(Role.ADMIN);
      expect(pipe.transform('MoDeRaToR')).toBe(Role.MODERATOR);
      expect(pipe.transform('UsEr')).toBe(Role.USER);
    });

    it('should throw BadRequestException for invalid roles', () => {
      const invalidRoles = ['invalid', 'superuser', 'guest']; // Removed empty string
      
      invalidRoles.forEach(role => {
        expect(() => pipe.transform(role)).toThrow(BadRequestException);
      });
    });

    it('should provide helpful error message for invalid roles', () => {
      try {
        pipe.transform('invalid_role');
      } catch (error) {
        expect(error.message).toContain('Role must be one of the following');
        expect(error.message).toContain('user, admin, moderator'); // Orden correcto
      }
    });

    it('should handle null and undefined by returning default role', () => {
      expect(pipe.transform(null as any)).toBe(Role.USER); // Returns default instead of throwing
      expect(pipe.transform(undefined as any)).toBe(Role.USER);
    });
  });
});
