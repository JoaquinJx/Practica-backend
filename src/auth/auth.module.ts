import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
import { AuthExceptionFilter } from './filters/auth-exception.filter';
import { AuthLoggingInterceptor } from './interceptors/auth-logging.interceptor';
import { jwtConstants } from './constants';
import { UserModule } from 'src/users/users.module';

@Module({
  imports: [
    forwardRef(() => UserModule),
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [
    AuthService, 
    AuthGuard, 
    RoleGuard,
    AuthExceptionFilter,
    AuthLoggingInterceptor,
  ],
  controllers: [AuthController],
  exports: [
    AuthService, 
    AuthGuard, 
    RoleGuard,
    AuthExceptionFilter,
    AuthLoggingInterceptor,
  ],
})
export class AuthModule {}
