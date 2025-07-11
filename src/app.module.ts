import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './shared/services/prisma.module';
import { UserModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { AuthGuard } from './auth/guards/auth.guard';
import { RoleGuard } from './auth/guards/role.guard';

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
  ],
})
export class AppModule {}
