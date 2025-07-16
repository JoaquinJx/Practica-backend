import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class ExecutionTimeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    
    // 🔵 ANTES - Iniciar medición
    const startTime = Date.now();
    const startHrTime = process.hrtime();
    
    console.log(`⏱️  [${method}] ${url} - Execution started`);

    return next.handle().pipe(
      tap({
        next: (data) => {
          // ✅ DESPUÉS - Calcular tiempo de ejecución exitoso
          const endTime = Date.now();
          const endHrTime = process.hrtime(startHrTime);
          
          const durationMs = endTime - startTime;
          const durationNs = endHrTime[0] * 1000000000 + endHrTime[1];
          const durationMsPrecise = durationNs / 1000000;

          console.log(`✅ [${method}] ${url} - SUCCESS`);
          console.log(`⏱️  Execution time: ${durationMs}ms (${durationMsPrecise.toFixed(3)}ms precise)`);
          
          // 🎯 Alertas por rendimiento
          if (durationMs > 1000) {
            console.log(`🚨 SLOW QUERY ALERT: ${url} took ${durationMs}ms`);
          } else if (durationMs > 500) {
            console.log(`⚠️  PERFORMANCE WARNING: ${url} took ${durationMs}ms`);
          } else if (durationMs < 50) {
            console.log(`🚀 FAST RESPONSE: ${url} completed in ${durationMs}ms`);
          }

          // 📊 Categorizar por tipo de operación
          this.categorizeOperation(method, url, durationMs);
        },
        error: (error) => {
          // ❌ DESPUÉS - Calcular tiempo de ejecución con error
          const endTime = Date.now();
          const endHrTime = process.hrtime(startHrTime);
          
          const durationMs = endTime - startTime;
          const durationNs = endHrTime[0] * 1000000000 + endHrTime[1];
          const durationMsPrecise = durationNs / 1000000;

          console.log(`❌ [${method}] ${url} - ERROR`);
          console.log(`⏱️  Execution time before error: ${durationMs}ms (${durationMsPrecise.toFixed(3)}ms precise)`);
          console.log(`🚫 Error: ${error.message}`);
        }
      })
    );
  }

  private categorizeOperation(method: string, url: string, duration: number): void {
    let category = '';
    
    // 📝 Categorizar por tipo de operación
    if (method === 'GET') {
      category = url.includes('/users/') ? 'READ_ONE' : 'READ_MANY';
    } else if (method === 'POST') {
      category = url.includes('/auth/login') ? 'AUTHENTICATION' : 'CREATE';
    } else if (method === 'PUT' || method === 'PATCH') {
      category = 'UPDATE';
    } else if (method === 'DELETE') {
      category = 'DELETE';
    }

    // 📊 Logging categorizado
    console.log(`📊 OPERATION: ${category} | DURATION: ${duration}ms`);
    
    // 🎯 Benchmarks por tipo de operación
    const benchmarks = {
      'READ_ONE': 100,
      'READ_MANY': 200,
      'CREATE': 300,
      'UPDATE': 250,
      'DELETE': 150,
      'AUTHENTICATION': 400
    };

    const expectedTime = benchmarks[category] || 200;
    const performance = duration <= expectedTime ? 'GOOD' : 'NEEDS_OPTIMIZATION';
    
    console.log(`🎯 PERFORMANCE: ${performance} (Expected: ≤${expectedTime}ms, Actual: ${duration}ms)`);
    console.log('─'.repeat(60));
  }
}
