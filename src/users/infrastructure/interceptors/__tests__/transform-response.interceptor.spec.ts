import { TransformResponseInterceptor } from '../transform-response.interceptor';
import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of, throwError } from 'rxjs';

describe('TransformResponseInterceptor',()=>{
    let interceptor: TransformResponseInterceptor;

    
    
    const mockContext = {
        switchToHttp: () => ({
            getRequest: () => ({}),
            getResponse: () => ({ statusCode: 200 }),
        }),
    } as ExecutionContext;
    const mockCallHandler = {
        handle: () => of('test response')
    } as CallHandler;



    beforeEach(async()=>{
        const module: TestingModule = await Test.createTestingModule({
            providers: [TransformResponseInterceptor],
        }).compile();

        interceptor = module.get<TransformResponseInterceptor>(TransformResponseInterceptor);
    })

    it('should be defined',()=>{
        expect(interceptor).toBeDefined();
    });

    const dataTestCases = [
    { description: 'object data', data: { id: 1, name: 'Test User' } },
    { description: 'array data', data: [1, 2, 3] },
    { description: 'string data', data: 'hello world' },
    { description: 'null data', data: null }];
    
   dataTestCases.forEach(({ description, data }) => {
    it(`should transform ${description} successfully`, (done) => {
        const specificMockCallHandler = {
            handle: () => of(data)
        } as CallHandler;

        interceptor.intercept(mockContext, specificMockCallHandler).subscribe({
            next: (result) => {
                expect(result).toHaveProperty('success', true);
                expect(result).toHaveProperty('data', data);
                expect(result).toHaveProperty('message', 'Operation successful');
                expect(result).toHaveProperty('timestamp');
                
                done();
            },
            error: (error) => {
                done(error);
            }
        });

    })
   })
})