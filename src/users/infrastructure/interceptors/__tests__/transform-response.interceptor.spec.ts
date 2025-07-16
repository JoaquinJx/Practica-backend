import { TransformResponseInterceptor } from '../transform-response.interceptor';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';
import { Test, TestingModule } from '@nestjs/testing';

describe('TransformResponseInterceptor', () => {
  let interceptor: TransformResponseInterceptor;
  let mockExecutionContext: ExecutionContext;
  let mockCallHandler: CallHandler;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TransformResponseInterceptor],
    }).compile();

    interceptor = module.get<TransformResponseInterceptor>(TransformResponseInterceptor);

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

    // 🔧 Mock Date para resultados consistentes
    jest.spyOn(Date.prototype, 'toISOString').mockReturnValue('2025-01-16T14:30:15.234Z');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('intercept', () => {
    it('should transform response with standard format', (done) => {
      // Arrange
      const originalData = { id: 1, name: 'John', email: 'john@example.com' };
      mockCallHandler.handle = jest.fn().mockReturnValue(of(originalData));

      // Act
      const result = interceptor.intercept(mockExecutionContext, mockCallHandler);

      // Assert
      result.subscribe((transformedResponse) => {
        expect(transformedResponse).toEqual({
          success: true,
          statusCode: 200,
          timestamp: '2025-01-16T14:30:15.234Z',
          path: '/users',
          method: 'GET',
          data: originalData,
          meta: {
            version: '1.0.0',
            requestId: expect.any(String),
          }
        });
        done();
      });
    });

    it('should add pagination meta for GET /users with array data', (done) => {
      // Arrange
      const usersArray = [
        { id: 1, name: 'John', email: 'john@example.com' },
        { id: 2, name: 'Jane', email: 'jane@example.com' }
      ];
      mockCallHandler.handle = jest.fn().mockReturnValue(of(usersArray));

      // Act
      const result = interceptor.intercept(mockExecutionContext, mockCallHandler);

      // Assert
      result.subscribe((transformedResponse) => {
        expect(transformedResponse.meta).toEqual({
          version: '1.0.0',
          requestId: expect.any(String),
          totalItems: 2,
          itemsPerPage: 2,
          currentPage: 1,
          totalPages: 1
        });
        done();
      });
    });

    it('should not add pagination meta for GET /users with non-array data', (done) => {
      // Arrange
      const singleUser = { id: 1, name: 'John', email: 'john@example.com' };
      mockCallHandler.handle = jest.fn().mockReturnValue(of(singleUser));

      // Act
      const result = interceptor.intercept(mockExecutionContext, mockCallHandler);

      // Assert
      result.subscribe((transformedResponse) => {
        expect(transformedResponse.meta).toEqual({
          version: '1.0.0',
          requestId: expect.any(String),
        });
        expect(transformedResponse.meta.totalItems).toBeUndefined();
        done();
      });
    });

    it('should add login meta for POST /auth/login', (done) => {
      // Arrange
      const loginData = {
        access_token: 'jwt-token-123',
        user: { id: 1, email: 'test@example.com', role: 'USER' }
      };
      mockCallHandler.handle = jest.fn().mockReturnValue(of(loginData));

      // Mock para login endpoint
      mockExecutionContext.switchToHttp = jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          method: 'POST',
          url: '/auth/login',
        }),
        getResponse: jest.fn().mockReturnValue({
          statusCode: 200,
        }),
      });

      // Act
      const result = interceptor.intercept(mockExecutionContext, mockCallHandler);

      // Assert
      result.subscribe((transformedResponse) => {
        expect(transformedResponse.meta).toEqual({
          version: '1.0.0',
          requestId: expect.any(String),
          tokenExpiresIn: '1h',
          loginTime: '2025-01-16T14:30:15.234Z'
        });
        done();
      });
    });

    it('should add welcome message for POST /users', (done) => {
      // Arrange
      const newUser = { id: 1, name: 'John Doe', email: 'john@example.com' };
      mockCallHandler.handle = jest.fn().mockReturnValue(of(newUser));

      // Mock para create user endpoint
      mockExecutionContext.switchToHttp = jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          method: 'POST',
          url: '/users',
        }),
        getResponse: jest.fn().mockReturnValue({
          statusCode: 201,
        }),
      });

      // Act
      const result = interceptor.intercept(mockExecutionContext, mockCallHandler);

      // Assert
      result.subscribe((transformedResponse) => {
        expect(transformedResponse.statusCode).toBe(201);
        expect(transformedResponse.meta).toEqual({
          version: '1.0.0',
          requestId: expect.any(String),
          message: 'User created successfully',
          welcomeMessage: 'Welcome John Doe!'
        });
        done();
      });
    });

    it('should use default welcome message when user has no name', (done) => {
      // Arrange
      const newUser = { id: 1, email: 'john@example.com' }; // Sin name
      mockCallHandler.handle = jest.fn().mockReturnValue(of(newUser));

      // Mock para create user endpoint
      mockExecutionContext.switchToHttp = jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          method: 'POST',
          url: '/users',
        }),
        getResponse: jest.fn().mockReturnValue({
          statusCode: 201,
        }),
      });

      // Act
      const result = interceptor.intercept(mockExecutionContext, mockCallHandler);

      // Assert
      result.subscribe((transformedResponse) => {
        expect(transformedResponse.meta.welcomeMessage).toBe('Welcome User!');
        done();
      });
    });

    it('should generate unique request IDs', (done) => {
      // Arrange
      const testData = { id: 1, name: 'John' };
      mockCallHandler.handle = jest.fn().mockReturnValue(of(testData));

      // Act
      const result1 = interceptor.intercept(mockExecutionContext, mockCallHandler);
      const result2 = interceptor.intercept(mockExecutionContext, mockCallHandler);

      // Assert
      let requestId1: string;
      let requestId2: string;

      result1.subscribe((response1) => {
        requestId1 = response1.meta.requestId;
        
        result2.subscribe((response2) => {
          requestId2 = response2.meta.requestId;
          expect(requestId1).not.toBe(requestId2);
          expect(requestId1).toMatch(/^[a-z0-9]+$/);
          expect(requestId2).toMatch(/^[a-z0-9]+$/);
          done();
        });
      });
    });

    it('should handle GET /users/1 (specific user) correctly', (done) => {
      // Arrange
      const singleUser = { id: 1, name: 'John', email: 'john@example.com' };
      mockCallHandler.handle = jest.fn().mockReturnValue(of(singleUser));

      // Mock para GET /users/1
      mockExecutionContext.switchToHttp = jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          method: 'GET',
          url: '/users/1',
        }),
        getResponse: jest.fn().mockReturnValue({
          statusCode: 200,
        }),
      });

      // Act
      const result = interceptor.intercept(mockExecutionContext, mockCallHandler);

      // Assert
      result.subscribe((transformedResponse) => {
        expect(transformedResponse.path).toBe('/users/1');
        expect(transformedResponse.method).toBe('GET');
        expect(transformedResponse.data).toBe(singleUser);
        // No debería tener meta de paginación porque no es array
        expect(transformedResponse.meta.totalItems).toBeUndefined();
        done();
      });
    });

    it('should handle PUT /users/1 (update user) correctly', (done) => {
      // Arrange
      const updatedUser = { id: 1, name: 'John Updated', email: 'john@example.com' };
      mockCallHandler.handle = jest.fn().mockReturnValue(of(updatedUser));

      // Mock para PUT /users/1
      mockExecutionContext.switchToHttp = jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          method: 'PUT',
          url: '/users/1',
        }),
        getResponse: jest.fn().mockReturnValue({
          statusCode: 200,
        }),
      });

      // Act
      const result = interceptor.intercept(mockExecutionContext, mockCallHandler);

      // Assert
      result.subscribe((transformedResponse) => {
        expect(transformedResponse.path).toBe('/users/1');
        expect(transformedResponse.method).toBe('PUT');
        expect(transformedResponse.data).toBe(updatedUser);
        expect(transformedResponse.meta).toEqual({
          version: '1.0.0',
          requestId: expect.any(String),
        });
        done();
      });
    });

    it('should handle different status codes correctly', (done) => {
      // Arrange
      const newUser = { id: 1, name: 'John', email: 'john@example.com' };
      mockCallHandler.handle = jest.fn().mockReturnValue(of(newUser));

      // Mock para respuesta 201 (Created)
      mockExecutionContext.switchToHttp = jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          method: 'POST',
          url: '/users',
        }),
        getResponse: jest.fn().mockReturnValue({
          statusCode: 201,
        }),
      });

      // Act
      const result = interceptor.intercept(mockExecutionContext, mockCallHandler);

      // Assert
      result.subscribe((transformedResponse) => {
        expect(transformedResponse.statusCode).toBe(201);
        expect(transformedResponse.success).toBe(true);
        done();
      });
    });

    it('should handle empty array correctly', (done) => {
      // Arrange
      const emptyArray = [];
      mockCallHandler.handle = jest.fn().mockReturnValue(of(emptyArray));

      // Act
      const result = interceptor.intercept(mockExecutionContext, mockCallHandler);

      // Assert
      result.subscribe((transformedResponse) => {
        expect(transformedResponse.data).toEqual([]);
        expect(transformedResponse.meta).toEqual({
          version: '1.0.0',
          requestId: expect.any(String),
          totalItems: 0,
          itemsPerPage: 0,
          currentPage: 1,
          totalPages: 1
        });
        done();
      });
    });
  });

  describe('generateRequestId', () => {
    it('should generate valid request ID format', () => {
      // Act
      const requestId = interceptor['generateRequestId']();

      // Assert
      expect(requestId).toMatch(/^[a-z0-9]+$/);
      expect(requestId.length).toBeGreaterThan(10);
      expect(requestId.length).toBeLessThan(30);
    });

    it('should generate different IDs on each call', () => {
      // Act
      const id1 = interceptor['generateRequestId']();
      const id2 = interceptor['generateRequestId']();
      const id3 = interceptor['generateRequestId']();

      // Assert
      expect(id1).not.toBe(id2);
      expect(id2).not.toBe(id3);
      expect(id1).not.toBe(id3);
    });
  });
});
