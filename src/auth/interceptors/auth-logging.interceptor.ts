import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable()
export class AuthLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuthLoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, headers } = request;
    
    // Log de intento de acceso
    const hasAuthHeader = !!headers.authorization;
    const userAgent = headers['user-agent'] || 'Unknown';
    const clientIP = request.ip || request.connection.remoteAddress || 'Unknown';

    this.logger.log(`${method} ${url} - Auth: ${hasAuthHeader ? 'Yes' : 'No'} - IP: ${clientIP}`);

    return next.handle().pipe(
      tap((data) => {
        // Log de acceso exitoso
        const user = request.user;
        if (user) {
          this.logger.log(`✅ Access granted - User: ${user.username} - Role: ${user.role || 'Unknown'} - ${method} ${url}`);
        }
      }),
      catchError((error) => {
        // Log de acceso denegado
        if (error.status === 401 || error.status === 403) {
          this.logger.warn(`❌ Access denied - ${error.message} - ${method} ${url} - IP: ${clientIP} - UserAgent: ${userAgent}`);
        }
        return throwError(() => error);
      }),
    );
  }
}
