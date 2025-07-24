import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { PrismaModule } from './shared/services/prisma.module';
import { UserModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { AuthGuard } from './auth/guards/auth.guard';
import { RoleGuard } from './auth/guards/role.guard';
import { AuthExceptionFilter } from './auth/filters/auth-exception.filter';

import { LogginMiddleware } from './shared/middlewares/loggin.middleware';

@Module({
  imports: [PrismaModule, UserModule, AuthModule],
  controllers: [],
  providers: [
    // Guard global para autenticación
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    // Guard global para roles
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
    // Filtro global para manejo de errores de autenticación
    {
      provide: APP_FILTER,
      useClass: AuthExceptionFilter,
    },
    // Interceptor global para logging de autenticación
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: AuthLoggingInterceptor,
    // },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LogginMiddleware)
      .forRoutes('*'); // Aplica a todas las rutas
  }
}
