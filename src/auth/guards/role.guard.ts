import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Role } from '../enums/role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { jwtConstants } from '../constants';
import { UserService } from 'src/users/application/services/user.service';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    private userService: UserService
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

    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true; // Si no se especifican roles, permite el acceso
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No token provided for role verification');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.secret,
      });

      // Obtener el usuario actualizado desde la base de datos
      // para asegurar que el rol sea el más reciente
      const user = await this.userService.findByEmail(payload.username);
      
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const userRole = user.role as Role;
      
      // Verificar si el usuario tiene alguno de los roles requeridos
      const hasRequiredRole = requiredRoles.some((role) => userRole === role);
      
      if (!hasRequiredRole) {
        throw new ForbiddenException(
          `Access denied. Required role(s): ${requiredRoles.join(', ')}. Your role: ${userRole}`
        );
      }

      // Añadir información del usuario al request para uso posterior
      request['user'] = { ...payload, role: userRole };
      
      return true;
    } catch (error) {
      // Si ya es una excepción de NestJS, la relanzamos
      if (error instanceof UnauthorizedException || error instanceof ForbiddenException) {
        throw error;
      }
      
      // Para otros errores, lanzamos una excepción genérica
      throw new UnauthorizedException('Role verification failed');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
