import { Injectable } from "@nestjs/common";
import { CallHandler, ExecutionContext, NestInterceptor } from "@nestjs/common";
import { Observable, tap } from "rxjs";
@Injectable()
export class LoggerInterceptor implements NestInterceptor {
    intercept(context:ExecutionContext, next:CallHandler):Observable<any>{

        const request= context.switchToHttp().getRequest();
        const method = request.method;
        const url = request.url; 
        console.log(`🟢 Starting: ${method} ${url}`);

        return next.handle().pipe(
            tap(()=>{
                console.log(`🔵 Finishing: ${method} ${url}`);
            })
        )

    }
}