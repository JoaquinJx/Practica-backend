import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/users/application/services/user.service';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UserService,
        private jwtService: JwtService
    ) {}

    async login(
        username: string,
        password: string
    ): Promise<{ access_token: string }> {
        const user = await this.usersService.findByEmail(username);

        if (user?.password !== password) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload = { 
            userEmail: user.email, 
            sub: user.id,
            role: user.role // Incluir el rol en el payload del JWT
        };
        return {
            access_token: await this.jwtService.signAsync(payload)
        };
    }

    async validateUser(payload: any) {
        return await this.usersService.findByEmail(payload.userEmail);
    }
}
