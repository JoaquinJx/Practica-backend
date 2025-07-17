import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';

import { RoleGuard } from './guards/role.guard';
import { AuthExceptionFilter } from './filters/auth-exception.filter';

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
     
    RoleGuard,
    AuthExceptionFilter,
    
  ],
  controllers: [AuthController],
  exports: [
    AuthService, 
     
    RoleGuard,
    AuthExceptionFilter,
    
  ],
})
export class AuthModule {}
