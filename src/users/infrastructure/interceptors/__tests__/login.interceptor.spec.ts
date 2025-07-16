import { LoginInterceptor } from '../login.interceptor';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { Test, TestingModule } from '@nestjs/testing';

describe('LoginInterceptor', () => {
  let interceptor: LoginInterceptor;
  let mockExecutionContext: ExecutionContext;
  let mockCallHandler: CallHandler;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoginInterceptor],
    }).compile();

    interceptor = module.get<LoginInterceptor>(LoginInterceptor);

    // 🔧 Mock ExecutionContext para login
    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          method: 'POST',
          url: '/auth/login',
          body: {
            email: 'test@example.com',
            password: 'password123'
          },
          ip: '192.168.1.100',
          headers: {
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        }),
      }),
    } as any;

    // 🔧 Mock CallHandler
    mockCallHandler = {
      handle: jest.fn(),
    } as any;

    // 🔧 Spy en console.log para verificar los logs
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('intercept', () => {
    it('should log login attempt for POST /auth/login', () => {
      // Arrange
      const loginResponse = {
        access_token: 'jwt-token-123',
        user: { id: 1, email: 'test@example.com', role: 'USER' }
      };
      mockCallHandler.handle = jest.fn().mockReturnValue(of(loginResponse));

      // Act
      interceptor.intercept(mockExecutionContext, mockCallHandler);

      // Assert
      expect(console.log).toHaveBeenCalledWith('🔐 ===== LOGIN ATTEMPT =====');
      expect(console.log).toHaveBeenCalledWith('📍 IP: 192.168.1.100');
      expect(console.log).toHaveBeenCalledWith('📧 Email: test@example.com');
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('🌐 User-Agent: Mozilla/5.0')
      );
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('⏰ Timestamp:')
      );
    });

    it('should log successful login with user details', (done) => {
      // Arrange
      const loginResponse = {
        access_token: 'jwt-token-123',
        user: { id: 1, email: 'test@example.com', role: 'USER' }
      };
      mockCallHandler.handle = jest.fn().mockReturnValue(of(loginResponse));

      // Act
      const result = interceptor.intercept(mockExecutionContext, mockCallHandler);

      // Assert
      result.subscribe(() => {
        expect(console.log).toHaveBeenCalledWith('✅ LOGIN SUCCESS');
        expect(console.log).toHaveBeenCalledWith('👤 User ID: 1');
        expect(console.log).toHaveBeenCalledWith('📧 Email: test@example.com');
        expect(console.log).toHaveBeenCalledWith('🎭 Role: USER');
        expect(console.log).toHaveBeenCalledWith('🔑 Token generated: Yes');
        expect(console.log).toHaveBeenCalledWith('🔐 ========================');
        done();
      });
    });

    it('should log failed login with error details', (done) => {
      // Arrange
      const loginError = new Error('Invalid credentials');
      mockCallHandler.handle = jest.fn().mockReturnValue(throwError(loginError));

      // Act
      const result = interceptor.intercept(mockExecutionContext, mockCallHandler);

      // Assert
      result.subscribe({
        error: () => {
          expect(console.log).toHaveBeenCalledWith('❌ LOGIN FAILED');
          expect(console.log).toHaveBeenCalledWith('📧 Email: test@example.com');
          expect(console.log).toHaveBeenCalledWith('🚫 Error: Invalid credentials');
          expect(console.log).toHaveBeenCalledWith('📍 IP: 192.168.1.100');
          expect(console.log).toHaveBeenCalledWith(
            expect.stringContaining('⏰ Failed at:')
          );
          expect(console.log).toHaveBeenCalledWith('🔐 ========================');
          done();
        }
      });
    });

    it('should handle login response without user data', (done) => {
      // Arrange
      const loginResponse = {
        access_token: 'jwt-token-123'
        // Sin user data
      };
      mockCallHandler.handle = jest.fn().mockReturnValue(of(loginResponse));

      // Act
      const result = interceptor.intercept(mockExecutionContext, mockCallHandler);

      // Assert
      result.subscribe(() => {
        expect(console.log).toHaveBeenCalledWith('✅ LOGIN SUCCESS');
        expect(console.log).toHaveBeenCalledWith('👤 User ID: Unknown');
        expect(console.log).toHaveBeenCalledWith('📧 Email: Unknown');
        expect(console.log).toHaveBeenCalledWith('🎭 Role: Unknown');
        expect(console.log).toHaveBeenCalledWith('🔑 Token generated: Yes');
        done();
      });
    });

    it('should handle login response without access_token', (done) => {
      // Arrange
      const loginResponse = {
        user: { id: 1, email: 'test@example.com', role: 'USER' }
        // Sin access_token
      };
      mockCallHandler.handle = jest.fn().mockReturnValue(of(loginResponse));

      // Act
      const result = interceptor.intercept(mockExecutionContext, mockCallHandler);

      // Assert
      result.subscribe(() => {
        expect(console.log).toHaveBeenCalledWith('✅ LOGIN SUCCESS');
        expect(console.log).toHaveBeenCalledWith('🔑 Token generated: No');
        done();
      });
    });

    it('should handle request without email in body', () => {
      // Arrange
      mockExecutionContext.switchToHttp = jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          method: 'POST',
          url: '/auth/login',
          body: {}, // Sin email
          ip: '192.168.1.100',
          headers: { 'user-agent': 'Mozilla/5.0' }
        }),
      });

      const loginResponse = {
        access_token: 'jwt-token-123',
        user: { id: 1, email: 'test@example.com', role: 'USER' }
      };
      mockCallHandler.handle = jest.fn().mockReturnValue(of(loginResponse));

      // Act
      interceptor.intercept(mockExecutionContext, mockCallHandler);

      // Assert
      expect(console.log).toHaveBeenCalledWith('📧 Email: No email provided');
    });

    it('should handle request without user-agent header', () => {
      // Arrange
      mockExecutionContext.switchToHttp = jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          method: 'POST',
          url: '/auth/login',
          body: { email: 'test@example.com' },
          ip: '192.168.1.100',
          headers: {} // Sin user-agent
        }),
      });

      const loginResponse = {
        access_token: 'jwt-token-123',
        user: { id: 1, email: 'test@example.com', role: 'USER' }
      };
      mockCallHandler.handle = jest.fn().mockReturnValue(of(loginResponse));

      // Act
      interceptor.intercept(mockExecutionContext, mockCallHandler);

      // Assert
      expect(console.log).toHaveBeenCalledWith('🌐 User-Agent: Unknown');
    });

    it('should not log anything for non-login requests', (done) => {
      // Arrange
      mockExecutionContext.switchToHttp = jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          method: 'GET',
          url: '/users',
          body: {},
          ip: '192.168.1.100',
          headers: {}
        }),
      });

      const response = [{ id: 1, name: 'John' }];
      mockCallHandler.handle = jest.fn().mockReturnValue(of(response));

      // Act
      const result = interceptor.intercept(mockExecutionContext, mockCallHandler);

      // Assert
      result.subscribe(() => {
        expect(console.log).not.toHaveBeenCalledWith('🔐 ===== LOGIN ATTEMPT =====');
        expect(console.log).not.toHaveBeenCalledWith('✅ LOGIN SUCCESS');
        done();
      });
    });

    it('should not log anything for non-login errors', (done) => {
      // Arrange
      mockExecutionContext.switchToHttp = jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          method: 'GET',
          url: '/users',
          body: {},
          ip: '192.168.1.100',
          headers: {}
        }),
      });

      const error = new Error('Some other error');
      mockCallHandler.handle = jest.fn().mockReturnValue(throwError(error));

      // Act
      const result = interceptor.intercept(mockExecutionContext, mockCallHandler);

      // Assert
      result.subscribe({
        error: () => {
          expect(console.log).not.toHaveBeenCalledWith('❌ LOGIN FAILED');
          done();
        }
      });
    });

    it('should handle login error without email in body', (done) => {
      // Arrange
      mockExecutionContext.switchToHttp = jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          method: 'POST',
          url: '/auth/login',
          body: {}, // Sin email
          ip: '192.168.1.100',
          headers: { 'user-agent': 'Mozilla/5.0' }
        }),
      });

      const loginError = new Error('Invalid credentials');
      mockCallHandler.handle = jest.fn().mockReturnValue(throwError(loginError));

      // Act
      const result = interceptor.intercept(mockExecutionContext, mockCallHandler);

      // Assert
      result.subscribe({
        error: () => {
          expect(console.log).toHaveBeenCalledWith('❌ LOGIN FAILED');
          expect(console.log).toHaveBeenCalledWith('📧 Email: No email provided');
          done();
        }
      });
    });
  });
});
