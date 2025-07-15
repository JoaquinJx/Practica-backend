import { CreateUserDto } from '../create.user.dto';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

describe('CreateUserDto', () => {
  // SIN beforeEach - cada test crea sus propios datos

  describe('email validation', () => {
    it('should pass with valid email', async () => {
      // Datos específicos para este test
      const input = {
        email: 'test@example.com',
        password: 'password123',
        name: 'John Doe',
      };

      // Crear instancia usando plainToClass
      const dtoInstance = plainToClass(CreateUserDto, input);
      const errors = await validate(dtoInstance);

      expect(errors).toHaveLength(0);
      expect(dtoInstance.email).toBe('test@example.com');
    });

    it('should fail with invalid email', async () => {
      // Datos específicos para este test
      const input = {
        email: 'invalid-email',
        password: 'password123',
        name: 'John Doe',
      };

      const dtoInstance = plainToClass(CreateUserDto, input);
      const errors = await validate(dtoInstance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('email');
      expect(errors[0].constraints?.isEmail).toBe(
        'Email must be a valid email address.',
      );
    });

    it('should fail with empty email', async () => {
      const input = {
        email: '',
        password: 'password123',
        name: 'John Doe',
      };

      const dtoInstance = plainToClass(CreateUserDto, input);
      const errors = await validate(dtoInstance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('email');
      expect(errors[0].constraints?.isNotEmpty).toBe(
        'You cannot skip this field.',
      );
    });

    it('should transform email to lowercase and trim spaces', async () => {
      const input = {
        email: ' TEST@EXAMPLE.COM ',
        password: 'password123',
        name: 'John Doe',
      };

      const dtoInstance = plainToClass(CreateUserDto, input);
      const errors = await validate(dtoInstance);

      expect(errors).toHaveLength(0);
      expect(dtoInstance.email).toBe('test@example.com');
    });
  });
});
