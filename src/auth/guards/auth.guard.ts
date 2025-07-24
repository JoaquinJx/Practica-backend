import { JwtService } from "@nestjs/jwt";
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { jwtConstants } from '../constants';
import { Reflector } from "@nestjs/core";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";



@Injectable()
export class AuthGuard implements CanActivate{

  constructor(private jwtService: JwtService, private reflector: Reflector){}

  async canActivate(context:ExecutionContext):Promise<boolean>{
    // Verificar si el endpoint está marcado como público PRIMERO
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      // Si es público, permitir acceso sin verificar token
      return true;
    }

    // Solo si NO es público, procesar el request y validar token
    const request = context.switchToHttp().getRequest();
    const token= this.extractTokenFromHeader(request);

    if(!token){
      throw new UnauthorizedException('No token provided');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.secret,
      });
      request['user'] = payload; // Agregar el usuario al request
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}