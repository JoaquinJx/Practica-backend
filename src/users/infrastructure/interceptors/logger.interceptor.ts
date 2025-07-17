import { Injectable } from "@nestjs/common";
import { CallHandler, ExecutionContext, NestInterceptor } from "@nestjs/common";

import { Observable, tap } from "rxjs";
@Injectable()
export class LoggerInterceptor implements NestInterceptor {
    intercept(context:ExecutionContext, next:CallHandler):Observable<any>{

        const request= context.switchToHttp().getRequest();
        const method = request.method;
        const url = request.url; 

        const timestamp = new Date().toISOString();
        const startTime= Date.now()
        const requestId = Math.random().toString(36).substring(2, 15);
        console.log(`🟢 Starting: ${method} ${url} at time ${timestamp} with id ${requestId}`);

        return next.handle().pipe(
            tap({
                next: () => {
                    // Log de finalización exitosa
                const duration = Date.now() -startTime;
                console.log(`🔵 Finishing: ${method} ${url} - ${duration}ms [${requestId}]`);

                }
            ,error:(error) =>{
                const duration = Date.now() -startTime;
                console.log(`Error 🔴: ${method} ${url} - ${duration}ms [${requestId}] - ${error.message   }`);
                
            }

            })
        )

    }
}