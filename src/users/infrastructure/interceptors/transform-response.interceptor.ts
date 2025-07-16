import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;

    return next.handle().pipe(
      map(data => {
        // 🔄 Transformar la respuesta en un formato estándar
        const transformedResponse = {
          success: true,
          statusCode: context.switchToHttp().getResponse().statusCode,
          timestamp: new Date().toISOString(),
          path: url,
          method: method,
          data: data,
          meta: {
            version: '1.0.0',
            requestId: this.generateRequestId(),
          } as any
        };

        // 🎯 Transformaciones específicas según el endpoint
        if (url.includes('/users') && method === 'GET') {
          // Para listado de usuarios, agregar información de paginación
          if (Array.isArray(data)) {
            transformedResponse.meta = {
              ...transformedResponse.meta,
              totalItems: data.length,
              itemsPerPage: data.length,
              currentPage: 1,
              totalPages: 1
            };
          }
        }

        if (url.includes('/auth/login') && method === 'POST') {
          // Para login, agregar información de expiración del token
          transformedResponse.meta = {
            ...transformedResponse.meta,
            tokenExpiresIn: '1h',
            loginTime: new Date().toISOString()
          };
        }

        if (url.includes('/users') && method === 'POST') {
          // Para creación de usuario, agregar mensaje de bienvenida
          transformedResponse.meta = {
            ...transformedResponse.meta,
            message: 'User created successfully',
            welcomeMessage: `Welcome ${data?.name || 'User'}!`
          };
        }

        return transformedResponse;
      })
    );
  }

  private generateRequestId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
}
