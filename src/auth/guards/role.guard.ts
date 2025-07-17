import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from "@nestjs/jwt";
import { UserService } from 'src/users/application/services/user.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { jwtConstants } from "../constants";
import { Role } from '../enums/role.enum';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    private userService: UserService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // VERIFICAR SI ES PUBLICO
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass()
    ]);

    if (isPublic) {
      return true; // Permitir acceso si es público
    }

    // VERIFICAR ROLES
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass()
    ]);

    if (!requiredRoles) {
      return true; // Si no hay roles específicos, permite el acceso
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

      // Agregar el usuario al request
      request['user'] = { ...payload, role: userRole };
      
      return true;
    } catch (error) {
      // Si ya es una excepción de NestJS, la relanzamos
      if (error instanceof UnauthorizedException || error instanceof ForbiddenException) {
        throw error;
      }
      
      throw new UnauthorizedException('Invalid token for role verification');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
