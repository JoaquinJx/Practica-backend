import { ExecutionTimeInterceptor } from "../execution-time.interceptor"
import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';



describe('ExecutionTimeInteceptor', ()=>{
    let interceptor: ExecutionTimeInterceptor;
    
    const mockContext ={
        switchToHttp: () => ({
            getRequest: () => ({ method: 'GET', url: '/test' }),
            getResponse: () => ({ statusCode: 200 }),
        })
    }as ExecutionContext;

    const mockCallHandler ={
        handle: ()=> of ({message:'test response'})
    }as CallHandler;
    

    beforeEach(async()=>{
        const module: TestingModule = await Test.createTestingModule({
            providers: [ExecutionTimeInterceptor],
        }).compile();

        interceptor = module.get<ExecutionTimeInterceptor>(ExecutionTimeInterceptor);
    })

    it('should be defined',()=>{
        expect(interceptor).toBeDefined();
    });

    it('should add execution time to the response',(done)=>{

        interceptor.intercept(mockContext, mockCallHandler).subscribe({
            next: (result) => {
                expect(result).toHaveProperty('message', 'test response');
                expect(result).toHaveProperty('executionTime');
                expect(result.executionTime).toMatch(/^\d+ms$/);
                
                done();
            },
            error: (error) => {
                done(error);
            }
        });
    });
    
});