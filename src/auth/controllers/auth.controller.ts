import { Body, Controller, Post, HttpCode, HttpStatus, UseInterceptors } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { LoginDto } from 'src/users/application/dto/login.dto';
import { Public } from '../decorators/public.decorator';
import { LoggerInterceptor } from 'src/users/infrastructure/interceptors/logger.interceptor';
import { ExecutionTimeInterceptor } from 'src/users/infrastructure/interceptors/execution-time.interceptor';

@Controller('auth')
@UseInterceptors(LoggerInterceptor,ExecutionTimeInterceptor)
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public() // El login debe ser público
  @HttpCode(HttpStatus.OK)
   // Interceptor para registrar el acceso
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }
}
