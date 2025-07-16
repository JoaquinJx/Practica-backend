import { ExecutionTimeInterceptor } from '../execution-time.interceptor';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { Test, TestingModule } from '@nestjs/testing';

describe('ExecutionTimeInterceptor', () => {
  let interceptor: ExecutionTimeInterceptor;
  let mockExecutionContext: ExecutionContext;
  let mockCallHandler: CallHandler;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExecutionTimeInterceptor],
    }).compile();

    interceptor = module.get<ExecutionTimeInterceptor>(ExecutionTimeInterceptor);

    // 🔧 Mock ExecutionContext
    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          method: 'GET',
          url: '/users',
        }),
        getResponse: jest.fn().mockReturnValue({
          statusCode: 200,
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
    it('should log execution start', () => {
      // Arrange
      mockCallHandler.handle = jest.fn().mockReturnValue(of({ id: 1, name: 'John' }));

      // Act
      interceptor.intercept(mockExecutionContext, mockCallHandler);

      // Assert
      expect(console.log).toHaveBeenCalledWith('⏱️  [GET] /users - Execution started');
    });

    it('should log execution success and time', (done) => {
      // Arrange
      const testData = { id: 1, name: 'John' };
      mockCallHandler.handle = jest.fn().mockReturnValue(of(testData));

      // Act
      const result = interceptor.intercept(mockExecutionContext, mockCallHandler);

      // Assert
      result.subscribe(() => {
        expect(console.log).toHaveBeenCalledWith('✅ [GET] /users - SUCCESS');
        expect(console.log).toHaveBeenCalledWith(
          expect.stringContaining('⏱️  Execution time:')
        );
        expect(console.log).toHaveBeenCalledWith(
          expect.stringContaining('📊 OPERATION:')
        );
        done();
      });
    });

    it('should categorize READ_ONE operation correctly', (done) => {
      // Arrange
      const testData = { id: 1, name: 'John' };
      mockCallHandler.handle = jest.fn().mockReturnValue(of(testData));
      
      // Mock para GET /users/1 (READ_ONE)
      mockExecutionContext.switchToHttp = jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          method: 'GET',
          url: '/users/1',
        }),
      });

      // Act
      const result = interceptor.intercept(mockExecutionContext, mockCallHandler);

      // Assert
      result.subscribe(() => {
        expect(console.log).toHaveBeenCalledWith(
          expect.stringContaining('📊 OPERATION: READ_ONE')
        );
        done();
      });
    });

    it('should categorize READ_MANY operation correctly', (done) => {
      // Arrange
      const testData = [{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }];
      mockCallHandler.handle = jest.fn().mockReturnValue(of(testData));

      // Act
      const result = interceptor.intercept(mockExecutionContext, mockCallHandler);

      // Assert
      result.subscribe(() => {
        expect(console.log).toHaveBeenCalledWith(
          expect.stringContaining('📊 OPERATION: READ_MANY')
        );
        done();
      });
    });

    it('should categorize CREATE operation correctly', (done) => {
      // Arrange
      const testData = { id: 1, name: 'John', email: 'john@example.com' };
      mockCallHandler.handle = jest.fn().mockReturnValue(of(testData));
      
      // Mock para POST /users (CREATE)
      mockExecutionContext.switchToHttp = jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          method: 'POST',
          url: '/users',
        }),
      });

      // Act
      const result = interceptor.intercept(mockExecutionContext, mockCallHandler);

      // Assert
      result.subscribe(() => {
        expect(console.log).toHaveBeenCalledWith(
          expect.stringContaining('📊 OPERATION: CREATE')
        );
        done();
      });
    });

    it('should categorize AUTHENTICATION operation correctly', (done) => {
      // Arrange
      const testData = { access_token: 'jwt-token', user: { id: 1 } };
      mockCallHandler.handle = jest.fn().mockReturnValue(of(testData));
      
      // Mock para POST /auth/login (AUTHENTICATION)
      mockExecutionContext.switchToHttp = jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          method: 'POST',
          url: '/auth/login',
        }),
      });

      // Act
      const result = interceptor.intercept(mockExecutionContext, mockCallHandler);

      // Assert
      result.subscribe(() => {
        expect(console.log).toHaveBeenCalledWith(
          expect.stringContaining('📊 OPERATION: AUTHENTICATION')
        );
        done();
      });
    });

    it('should show FAST RESPONSE alert for quick operations', (done) => {
      // Arrange
      const testData = { id: 1, name: 'John' };
      mockCallHandler.handle = jest.fn().mockReturnValue(of(testData));
      
      // Mock Date.now para simular operación rápida
      const originalDateNow = Date.now;
      let callCount = 0;
      Date.now = jest.fn(() => {
        callCount++;
        return callCount === 1 ? 1000 : 1030; // 30ms de diferencia
      });

      // Act
      const result = interceptor.intercept(mockExecutionContext, mockCallHandler);

      // Assert
      result.subscribe(() => {
        expect(console.log).toHaveBeenCalledWith(
          expect.stringContaining('🚀 FAST RESPONSE')
        );
        Date.now = originalDateNow;
        done();
      });
    });

    it('should show PERFORMANCE WARNING for slow operations', (done) => {
      // Arrange
      const testData = { id: 1, name: 'John' };
      mockCallHandler.handle = jest.fn().mockReturnValue(of(testData));
      
      // Mock Date.now para simular operación lenta
      const originalDateNow = Date.now;
      let callCount = 0;
      Date.now = jest.fn(() => {
        callCount++;
        return callCount === 1 ? 1000 : 1600; // 600ms de diferencia
      });

      // Act
      const result = interceptor.intercept(mockExecutionContext, mockCallHandler);

      // Assert
      result.subscribe(() => {
        expect(console.log).toHaveBeenCalledWith(
          expect.stringContaining('⚠️  PERFORMANCE WARNING')
        );
        Date.now = originalDateNow;
        done();
      });
    });

    it('should log error information when operation fails', (done) => {
      // Arrange
      const testError = new Error('Database connection failed');
      mockCallHandler.handle = jest.fn().mockReturnValue(throwError(testError));

      // Act
      const result = interceptor.intercept(mockExecutionContext, mockCallHandler);

      // Assert
      result.subscribe({
        error: () => {
          expect(console.log).toHaveBeenCalledWith('❌ [GET] /users - ERROR');
          expect(console.log).toHaveBeenCalledWith(
            expect.stringContaining('⏱️  Execution time before error:')
          );
          expect(console.log).toHaveBeenCalledWith(
            '🚫 Error: Database connection failed'
          );
          done();
        }
      });
    });

    it('should evaluate performance as GOOD for operations within benchmark', (done) => {
      // Arrange
      const testData = { id: 1, name: 'John' };
      mockCallHandler.handle = jest.fn().mockReturnValue(of(testData));
      
      // Mock Date.now para simular operación dentro del benchmark (50ms para READ_ONE)
      const originalDateNow = Date.now;
      let callCount = 0;
      Date.now = jest.fn(() => {
        callCount++;
        return callCount === 1 ? 1000 : 1050; // 50ms de diferencia
      });

      // Act
      const result = interceptor.intercept(mockExecutionContext, mockCallHandler);

      // Assert
      result.subscribe(() => {
        expect(console.log).toHaveBeenCalledWith(
          expect.stringContaining('🎯 PERFORMANCE: GOOD')
        );
        Date.now = originalDateNow;
        done();
      });
    });

    it('should evaluate performance as NEEDS_OPTIMIZATION for operations exceeding benchmark', (done) => {
      // Arrange
      const testData = { id: 1, name: 'John' };
      mockCallHandler.handle = jest.fn().mockReturnValue(of(testData));
      
      // Mock Date.now para simular operación que excede el benchmark (150ms para READ_ONE)
      const originalDateNow = Date.now;
      let callCount = 0;
      Date.now = jest.fn(() => {
        callCount++;
        return callCount === 1 ? 1000 : 1150; // 150ms de diferencia (>100ms benchmark)
      });

      // Act
      const result = interceptor.intercept(mockExecutionContext, mockCallHandler);

      // Assert
      result.subscribe(() => {
        expect(console.log).toHaveBeenCalledWith(
          expect.stringContaining('🎯 PERFORMANCE: NEEDS_OPTIMIZATION')
        );
        Date.now = originalDateNow;
        done();
      });
    });
  });
});
