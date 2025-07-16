import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoginInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, ip, headers } = request;
    
    // 🔵 ANTES del login - Registrar intento de autenticación
    if (method === 'POST' && url.includes('/auth/login')) {
      console.log('🔐 ===== LOGIN ATTEMPT =====');
      console.log(`📍 IP: ${ip}`);
      console.log(`📧 Email: ${body?.email || 'No email provided'}`);
      console.log(`🌐 User-Agent: ${headers['user-agent'] || 'Unknown'}`);
      console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
    }

    // 🔵 DESPUÉS del login - Registrar resultado
    return next.handle().pipe(
      tap({
        next: (data) => {
          if (method === 'POST' && url.includes('/auth/login')) {
            console.log('✅ LOGIN SUCCESS');
            console.log(`👤 User ID: ${data?.user?.id || 'Unknown'}`);
            console.log(`📧 Email: ${data?.user?.email || 'Unknown'}`);
            console.log(`🎭 Role: ${data?.user?.role || 'Unknown'}`);
            console.log(`🔑 Token generated: ${data?.access_token ? 'Yes' : 'No'}`);
            console.log('🔐 ========================');
          }
        },
        error: (error) => {
          if (method === 'POST' && url.includes('/auth/login')) {
            console.log('❌ LOGIN FAILED');
            console.log(`📧 Email: ${body?.email || 'No email provided'}`);
            console.log(`🚫 Error: ${error.message}`);
            console.log(`📍 IP: ${ip}`);
            console.log(`⏰ Failed at: ${new Date().toISOString()}`);
            console.log('🔐 ========================');
          }
        }
      })
    );
  }
}
