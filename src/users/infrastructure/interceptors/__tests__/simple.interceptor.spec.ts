import { SimpleInterceptor } from '../simple.interceptor';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { Test, TestingModule } from '@nestjs/testing';

describe('SimpleInterceptor', () => {
  let interceptor: SimpleInterceptor;
  let mockExecutionContext: ExecutionContext;
  let mockCallHandler: CallHandler;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SimpleInterceptor],
    }).compile();

    interceptor = module.get<SimpleInterceptor>(SimpleInterceptor);

    // 🔧 MOCK BÁSICO
    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          method: 'GET',
          url: '/users',
          body: {},
          ip: '192.168.1.100',
          headers: {}
        }),
      }),
    } as any;

    mockCallHandler = {
      handle: jest.fn(),
    } as any;

    // 🔧 MOCK CONSOLE
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('intercept', () => {
    it('should log starting message', () => {
      // 🔧 ARRANGE (Preparar)
      const testData = { id: 1, name: 'John' };
      mockCallHandler.handle = jest.fn().mockReturnValue(of(testData));

      // 🔧 ACT (Ejecutar)
      interceptor.intercept(mockExecutionContext, mockCallHandler);

      // 🔧 ASSERT (Verificar)
      expect(console.log).toHaveBeenCalledWith('🟢 Starting: GET /users');
    });

    it('should log finishing message', (done) => {
      // 🔧 ARRANGE
      const testData = { id: 1, name: 'John' };
      mockCallHandler.handle = jest.fn().mockReturnValue(of(testData));

      // 🔧 ACT
      const result = interceptor.intercept(mockExecutionContext, mockCallHandler);

      // 🔧 ASSERT - Para logs que van DESPUÉS del controlador
      result.subscribe(() => {
        expect(console.log).toHaveBeenCalledWith('🟢 Finished: GET /users');
        done(); // ¡Importante! Le dice a Jest que terminó
      });
    });

    it('should count array elements correctly', (done) => {
      // 🔧 ARRANGE - Array con 2 elementos
      const arrayData = [
        { id: 1, name: 'John' },
        { id: 2, name: 'Jane' }
      ];
      mockCallHandler.handle = jest.fn().mockReturnValue(of(arrayData));

      // 🔧 ACT
      const result = interceptor.intercept(mockExecutionContext, mockCallHandler);

      // 🔧 ASSERT
      result.subscribe(() => {
        expect(console.log).toHaveBeenCalledWith('📊 Data count: 2');
        done();
      });
    });

    it('should count single object as 1', (done) => {
      // 🔧 ARRANGE - Un solo objeto
      const singleData = { id: 1, name: 'John' };
      mockCallHandler.handle = jest.fn().mockReturnValue(of(singleData));

      // 🔧 ACT
      const result = interceptor.intercept(mockExecutionContext, mockCallHandler);

      // 🔧 ASSERT
      result.subscribe(() => {
        expect(console.log).toHaveBeenCalledWith('📊 Data count: 1');
        done();
      });
    });

    it('should handle POST requests correctly', (done) => {
      // 🔧 ARRANGE - Cambiar a POST /users
      mockExecutionContext.switchToHttp = jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          method: 'POST',
          url: '/users',
          body: { name: 'John', email: 'john@example.com' },
          ip: '192.168.1.100',
          headers: {}
        }),
      });

      const newUser = { id: 1, name: 'John', email: 'john@example.com' };
      mockCallHandler.handle = jest.fn().mockReturnValue(of(newUser));

      // 🔧 ACT
      const result = interceptor.intercept(mockExecutionContext, mockCallHandler);

      // 🔧 ASSERT
      result.subscribe(() => {
        expect(console.log).toHaveBeenCalledWith('🟢 Starting: POST /users');
        expect(console.log).toHaveBeenCalledWith('🟢 Finished: POST /users');
        expect(console.log).toHaveBeenCalledWith('📊 Data count: 1');
        done();
      });
    });
  });
});