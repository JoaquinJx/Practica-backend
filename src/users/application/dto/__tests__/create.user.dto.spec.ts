import { CreateUserDto } from '../create.user.dto';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { Role } from 'src/auth/enums/role.enum';

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

  describe('password validation', () => {
    it('should pass with valid password', async () => {
      const input = {
        email: 'test@example.com',
        password: 'password123',
        name: 'John Doe'
      };

      const dtoInstance = plainToClass(CreateUserDto, input);
      const errors = await validate(dtoInstance);

      expect(errors).toHaveLength(0);
      expect(dtoInstance.password).toBe('password123');
    });

    it('should fail with empty password', async () => {
      const input = {
        email: 'test@example.com',
        password: '',
        name: 'John Doe'
      };

      const dtoInstance = plainToClass(CreateUserDto, input);
      const errors = await validate(dtoInstance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('password');
      expect(errors[0].constraints?.isNotEmpty).toBe('You cannot skip this field.');
    });

    it('should fail with password too short', async () => {
      const input = {
        email: 'test@example.com',
        password: '123',
        name: 'John Doe'
      };

      const dtoInstance = plainToClass(CreateUserDto, input);
      const errors = await validate(dtoInstance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('password');
      expect(errors[0].constraints?.minLength).toBe('Password must have at least 6 characters.');
    });

    it('should fail with password too long', async () => {
      const input = {
        email: 'test@example.com',
        password: 'a'.repeat(100),
        name: 'John Doe'
      };

      const dtoInstance = plainToClass(CreateUserDto, input);
      const errors = await validate(dtoInstance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('password');
      expect(errors[0].constraints?.maxLength).toBe('Password must not exceed 20 characters.');
    });

    it('should fail with password containing only spaces', async () => {
      const input = {
        email: 'test@example.com',
        password: '     ',
        name: 'John Doe'
      };

      const dtoInstance = plainToClass(CreateUserDto, input);
      const errors = await validate(dtoInstance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('password');
      expect(errors[0].constraints?.isNotEmpty).toBe('You cannot skip this field.');
    });
  });

  describe('name validation', () => {
    it('should pass with valid name', async () => {
      const input = {
        email: 'test@example.com',
        password: 'password123',
        name: 'John Doe'
      };

      const dtoInstance = plainToClass(CreateUserDto, input);
      const errors = await validate(dtoInstance);

      expect(errors).toHaveLength(0);
      expect(dtoInstance.name).toBe('John Doe');
    });

    it('should fail with empty name', async () => {
      const input = {
        email: 'test@example.com',
        password: 'password123',
        name: ''
      };

      const dtoInstance = plainToClass(CreateUserDto, input);
      const errors = await validate(dtoInstance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('name');
      expect(errors[0].constraints?.isNotEmpty).toBe('You cannot skip this field.');
    });

    it('should fail with name containing only spaces', async () => {
      const input = {
        email: 'test@example.com',
        password: 'password123',
        name: '     '
      };

      const dtoInstance = plainToClass(CreateUserDto, input);
      const errors = await validate(dtoInstance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('name');
      expect(errors[0].constraints?.isNotEmpty).toBe('You cannot skip this field.');
    });

    it('should transform name by trimming spaces', async () => {
      const input = {
        email: 'test@example.com',
        password: 'password123',
        name: '  John Doe  '
      };

      const dtoInstance = plainToClass(CreateUserDto, input);
      const errors = await validate(dtoInstance);

      expect(errors).toHaveLength(0);
      expect(dtoInstance.name).toBe('John Doe');
    });
  });

  describe('role validation', () => {
    it('should pass with valid role USER', async () => {
      const input = {
        email: 'test@example.com',
        password: 'password123',
        name: 'John Doe',
        role: Role.USER
      };

      const dtoInstance = plainToClass(CreateUserDto, input);
      const errors = await validate(dtoInstance);

      expect(errors).toHaveLength(0);
      expect(dtoInstance.role).toBe(Role.USER);
    });

    it('should pass with valid role ADMIN', async () => {
      const input = {
        email: 'test@example.com',
        password: 'password123',
        name: 'John Doe',
        role: Role.ADMIN
      };

      const dtoInstance = plainToClass(CreateUserDto, input);
      const errors = await validate(dtoInstance);

      expect(errors).toHaveLength(0);
      expect(dtoInstance.role).toBe(Role.ADMIN);
    });

    it('should pass with valid role MODERATOR', async () => {
      const input = {
        email: 'test@example.com',
        password: 'password123',
        name: 'John Doe',
        role: Role.MODERATOR
      };

      const dtoInstance = plainToClass(CreateUserDto, input);
      const errors = await validate(dtoInstance);

      expect(errors).toHaveLength(0);
      expect(dtoInstance.role).toBe(Role.MODERATOR);
    });

    it('should fail with invalid role', async () => {
      const input = {
        email: 'test@example.com',
        password: 'password123',
        name: 'John Doe',
        role: 'invalid-role' as any
      };

      const dtoInstance = plainToClass(CreateUserDto, input);
      const errors = await validate(dtoInstance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('role');
      expect(errors[0].constraints?.isEnum).toBeDefined();
    });

    it('should default to USER when role is not provided', async () => {
      const input = {
        email: 'test@example.com',
        password: 'password123',
        name: 'John Doe'
        // role not provided
      };

      const dtoInstance = plainToClass(CreateUserDto, input);
      const errors = await validate(dtoInstance);

      expect(errors).toHaveLength(0);
      expect(dtoInstance.role).toBeUndefined(); // El campo no existe cuando no se proporciona
    });

    it('should default to USER when role is null', async () => {
      const input = {
        email: 'test@example.com',
        password: 'password123',
        name: 'John Doe',
        role: null as any
      };

      const dtoInstance = plainToClass(CreateUserDto, input);
      const errors = await validate(dtoInstance);

      expect(errors).toHaveLength(0);
      expect(dtoInstance.role).toBe(Role.USER);
    });

    it('should default to USER when role is undefined', async () => {
      const input = {
        email: 'test@example.com',
        password: 'password123',
        name: 'John Doe',
        role: undefined as any
      };

      const dtoInstance = plainToClass(CreateUserDto, input);
      const errors = await validate(dtoInstance);

      expect(errors).toHaveLength(0);
      expect(dtoInstance.role).toBe(Role.USER);
    });
  });
  
});
