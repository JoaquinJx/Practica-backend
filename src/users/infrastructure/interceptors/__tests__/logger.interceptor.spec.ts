
import { LoggerInterceptor } from "../logger.interceptor";
import { Test, TestingModule , } from "@nestjs/testing";
import { ExecutionContext, CallHandler } from "@nestjs/common"; 
import { of } from "rxjs";


describe('LoggerInterceptor',()=>{
let interceptor: LoggerInterceptor;



beforeEach(async()=>{
const module:TestingModule = await Test.createTestingModule({
    providers: [LoggerInterceptor],
}).compile()

interceptor = module.get<LoggerInterceptor>(LoggerInterceptor);
})

it('should be defined',()=>{
    expect(interceptor).toBeDefined()
})

// Test parameterizado para diferentes métodos HTTP
const testCases = [
    { method: 'GET', url: '/users', description: 'GET request' },
    { method: 'POST', url: '/auth/login', description: 'POST request' },
    { method: 'PUT', url: '/users/123', description: 'PUT request' },
    { method: 'DELETE', url: '/users/123', description: 'DELETE request' },
    { method: 'PATCH', url: '/users/123/role', description: 'PATCH request' }
];

testCases.forEach(({ method, url, description }) => {
    it(`should log start and finish of ${description}`, (done) => {
        const mockRequest = {
            method: method,
            url: url
        };
        
        const mockContext = {
            switchToHttp: () => ({
                getRequest: () => mockRequest,
                getResponse: () => ({ statusCode: 200 }),
            }),
        } as ExecutionContext;
        
        const mockCallHandler = {
            handle: () => of('test response')
        } as CallHandler;

        const consoleSpy = jest.spyOn(console, 'log').mockImplementation(); 

        interceptor.intercept(mockContext, mockCallHandler).subscribe({
            complete: () => {
                // Verificar que el log contenga el método y URL correctos
                expect(consoleSpy).toHaveBeenCalledWith(
                    expect.stringContaining(`🟢 Starting: ${method} ${url}`)
                );
                expect(consoleSpy).toHaveBeenCalledWith(
                    expect.stringContaining(`🔵 Finishing: ${method} ${url}`)
                );
                
                consoleSpy.mockRestore();
                done();
            },
            error: (err) => {
                consoleSpy.mockRestore();
                done(err);
            },
        });
    });
});


})