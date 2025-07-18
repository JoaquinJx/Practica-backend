import { JwtService } from "@nestjs/jwt";
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { jwtConstants } from '../constants';



@Injectable()
export class AuthGuard implements CanActivate{

  constructor(private jwtService: JwtService){}

  async canActivate(context:ExecutionContext):Promise<boolean>{
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