import { UpdateUserDto } from '../update.user.dto';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { Role } from 'src/auth/enums/role.enum';

describe('UpdateUserDto', () => {
  // SIN beforeEach - cada test crea sus propios datos

  describe('email validation', () => {
    it('should pass with valid email', async () => {
      const input = {
        email: 'test@example.com'
      };

      const dtoInstance = plainToClass(UpdateUserDto, input);
      const errors = await validate(dtoInstance);

      expect(errors).toHaveLength(0);
      expect(dtoInstance.email).toBe('test@example.com');
    });

    it('should fail with invalid email', async () => {
      const input = {
        email: 'invalid-email'
      };

      const dtoInstance = plainToClass(UpdateUserDto, input);
      const errors = await validate(dtoInstance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('email');
      expect(errors[0].constraints?.isEmail).toBe('Email must be a valid email address.');
    });

    it('should pass when email is not provided', async () => {
      const input = {
        name: 'John Doe'
      };

      const dtoInstance = plainToClass(UpdateUserDto, input);
      const errors = await validate(dtoInstance);

      expect(errors).toHaveLength(0);
      expect(dtoInstance.email).toBeUndefined();
    });

    it('should transform email to lowercase and trim spaces', async () => {
      const input = {
        email: ' TEST@EXAMPLE.COM '
      };

      const dtoInstance = plainToClass(UpdateUserDto, input);
      const errors = await validate(dtoInstance);

      expect(errors).toHaveLength(0);
      expect(dtoInstance.email).toBe('test@example.com');
    });
  });

  describe('password validation', () => {
    it('should pass with valid password', async () => {
      const input = {
        password: 'password123'
      };

      const dtoInstance = plainToClass(UpdateUserDto, input);
      const errors = await validate(dtoInstance);

      expect(errors).toHaveLength(0);
      expect(dtoInstance.password).toBe('password123');
    });

    it('should fail with password too short', async () => {
      const input = {
        password: '123'
      };

      const dtoInstance = plainToClass(UpdateUserDto, input);
      const errors = await validate(dtoInstance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('password');
      expect(errors[0].constraints?.minLength).toBe('Password must contain at least 6 characters.');
    });

    it('should pass when password is not provided', async () => {
      const input = {
        name: 'John Doe'
      };

      const dtoInstance = plainToClass(UpdateUserDto, input);
      const errors = await validate(dtoInstance);

      expect(errors).toHaveLength(0);
      expect(dtoInstance.password).toBeUndefined();
    });

    it('should transform password by trimming spaces', async () => {
      const input = {
        password: '  password123  '
      };

      const dtoInstance = plainToClass(UpdateUserDto, input);
      const errors = await validate(dtoInstance);

      expect(errors).toHaveLength(0);
      expect(dtoInstance.password).toBe('password123');
    });
  });

  describe('name validation', () => {
    it('should pass with valid name', async () => {
      const input = {
        name: 'John Doe'
      };

      const dtoInstance = plainToClass(UpdateUserDto, input);
      const errors = await validate(dtoInstance);

      expect(errors).toHaveLength(0);
      expect(dtoInstance.name).toBe('John Doe');
    });

    it('should pass when name is not provided', async () => {
      const input = {
        email: 'test@example.com'
      };

      const dtoInstance = plainToClass(UpdateUserDto, input);
      const errors = await validate(dtoInstance);

      expect(errors).toHaveLength(0);
      expect(dtoInstance.name).toBeUndefined();
    });

    it('should transform name by trimming spaces', async () => {
      const input = {
        name: '  John Doe  '
      };

      const dtoInstance = plainToClass(UpdateUserDto, input);
      const errors = await validate(dtoInstance);

      expect(errors).toHaveLength(0);
      expect(dtoInstance.name).toBe('John Doe');
    });
  });

  describe('avatarUrl validation', () => {
    it('should pass with valid URL', async () => {
      const input = {
        avatarUrl: 'https://example.com/avatar.jpg'
      };

      const dtoInstance = plainToClass(UpdateUserDto, input);
      const errors = await validate(dtoInstance);

      expect(errors).toHaveLength(0);
      expect(dtoInstance.avatarUrl).toBe('https://example.com/avatar.jpg');
    });

    it('should fail with invalid URL', async () => {
      const input = {
        avatarUrl: 'invalid-url'
      };

      const dtoInstance = plainToClass(UpdateUserDto, input);
      const errors = await validate(dtoInstance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('avatarUrl');
      expect(errors[0].constraints?.isUrl).toBe('Avatar URL must be a valid URL.');
    });

    it('should pass when avatarUrl is not provided', async () => {
      const input = {
        name: 'John Doe'
      };

      const dtoInstance = plainToClass(UpdateUserDto, input);
      const errors = await validate(dtoInstance);

      expect(errors).toHaveLength(0);
      expect(dtoInstance.avatarUrl).toBeUndefined();
    });
  });

  describe('role validation', () => {
    it('should pass with valid role USER', async () => {
      const input = {
        role: Role.USER
      };

      const dtoInstance = plainToClass(UpdateUserDto, input);
      const errors = await validate(dtoInstance);

      expect(errors).toHaveLength(0);
      expect(dtoInstance.role).toBe(Role.USER);
    });

    it('should pass with valid role ADMIN', async () => {
      const input = {
        role: Role.ADMIN
      };

      const dtoInstance = plainToClass(UpdateUserDto, input);
      const errors = await validate(dtoInstance);

      expect(errors).toHaveLength(0);
      expect(dtoInstance.role).toBe(Role.ADMIN);
    });

    it('should pass with valid role MODERATOR', async () => {
      const input = {
        role: Role.MODERATOR
      };

      const dtoInstance = plainToClass(UpdateUserDto, input);
      const errors = await validate(dtoInstance);

      expect(errors).toHaveLength(0);
      expect(dtoInstance.role).toBe(Role.MODERATOR);
    });

    it('should fail with invalid role', async () => {
      const input = {
        role: 'invalid-role' as any
      };

      const dtoInstance = plainToClass(UpdateUserDto, input);
      const errors = await validate(dtoInstance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('role');
      expect(errors[0].constraints?.isEnum).toBeDefined();
    });

    it('should pass when role is not provided', async () => {
      const input = {
        name: 'John Doe'
      };

      const dtoInstance = plainToClass(UpdateUserDto, input);
      const errors = await validate(dtoInstance);

      expect(errors).toHaveLength(0);
      expect(dtoInstance.role).toBeUndefined();
    });
  });

  describe('integration tests', () => {
    it('should pass with all valid fields', async () => {
      const input = {
        email: 'test@example.com',
        password: 'password123',
        name: 'John Doe',
        avatarUrl: 'https://example.com/avatar.jpg',
        role: Role.USER
      };

      const dtoInstance = plainToClass(UpdateUserDto, input);
      const errors = await validate(dtoInstance);

      expect(errors).toHaveLength(0);
      expect(dtoInstance.email).toBe('test@example.com');
      expect(dtoInstance.password).toBe('password123');
      expect(dtoInstance.name).toBe('John Doe');
      expect(dtoInstance.avatarUrl).toBe('https://example.com/avatar.jpg');
      expect(dtoInstance.role).toBe(Role.USER);
    });

    it('should pass with empty object (all fields optional)', async () => {
      const input = {};

      const dtoInstance = plainToClass(UpdateUserDto, input);
      const errors = await validate(dtoInstance);

      expect(errors).toHaveLength(0);
      expect(dtoInstance.email).toBeUndefined();
      expect(dtoInstance.password).toBeUndefined();
      expect(dtoInstance.name).toBeUndefined();
      expect(dtoInstance.avatarUrl).toBeUndefined();
      expect(dtoInstance.role).toBeUndefined();
    });

    it('should fail with multiple invalid fields', async () => {
      const input = {
        email: 'invalid-email',
        password: '123', // too short
        avatarUrl: 'invalid-url',
        role: 'invalid-role' as any
      };

      const dtoInstance = plainToClass(UpdateUserDto, input);
      const errors = await validate(dtoInstance);

      expect(errors).toHaveLength(4);
      
      const errorProperties = errors.map(error => error.property);
      expect(errorProperties).toContain('email');
      expect(errorProperties).toContain('password');
      expect(errorProperties).toContain('avatarUrl');
      expect(errorProperties).toContain('role');
    });
  });
});
