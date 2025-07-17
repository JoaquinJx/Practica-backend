
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from "@nestjs/common";
import { Observable  } from "rxjs";
import { map } from "rxjs/operators";
import { throwError } from "rxjs";
import { catchError } from "rxjs/operators";
@Injectable()
export class ExecutionTimeInterceptor implements NestInterceptor {
    intercept(context:ExecutionContext, next:CallHandler):Observable<any>{
        const request = context.switchToHttp().getRequest();
        const startTime = Date.now();
        
        return next.handle().pipe(
            map((data)=>{
                const endTime = Date.now();
                const executionTime = endTime - startTime;
                console.log(`Execution time for ${request.method} ${request.url}: ${executionTime}ms`);
                // Agregar el tiempo de ejecución a la respuesta
                return {
                    ...data,
                    executionTime: `${executionTime}ms`,
                };  

                      
            
            }),catchError((error) => {
        const endTime = Date.now();
        const executionTime = endTime - startTime;
        
        console.log(`🔴 Error execution time for ${request.method} ${request.url}: ${executionTime}ms`);
        console.error(`Error details: ${error.message}`);
        
        
        return throwError(() => ({
            ...error,
            executionTime: `${executionTime}ms`
        }));
            })  
        )
    }
}