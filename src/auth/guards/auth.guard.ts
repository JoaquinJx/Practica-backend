import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { jwtConstants } from '../constants';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Verificar si el endpoint está marcado como público
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (isPublic) {
      return true; // Permitir acceso si es público
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    
    if (!token) {
      throw new UnauthorizedException('No token provided. Please include Authorization header with Bearer token.');
    }
    
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.secret,
      });
      
      // Verificar que el payload tenga la estructura esperada
      if (!payload || !payload.sub || !payload.username) {
        throw new UnauthorizedException('Invalid token structure');
      }
      
      request['user'] = payload;
    } catch (error) {
      // Manejo específico de diferentes tipos de errores JWT
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token has expired. Please login again.');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid token format or signature.');
      }
      if (error.name === 'NotBeforeError') {
        throw new UnauthorizedException('Token not active yet.');
      }
      
      // Si es un error que ya lanzamos nosotros, no lo envolvemos
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      
      // Error genérico para otros casos
      throw new UnauthorizedException('Token validation failed.');
    }
    
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
