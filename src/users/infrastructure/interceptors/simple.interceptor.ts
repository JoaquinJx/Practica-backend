import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class SimpleInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    
    console.log(`🟢 Starting: ${method} ${url}`);
    
    return next.handle().pipe(
      tap(data => {
        console.log(`🟢 Finished: ${method} ${url}`);
        console.log(`📊 Data count: ${Array.isArray(data) ? data.length : 1}`);
      })
    );
  }
}
