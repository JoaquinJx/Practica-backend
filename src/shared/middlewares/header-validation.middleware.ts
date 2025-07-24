import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class HeaderValidationMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        // Validar Content-Type para métodos POST/PUT/PATCH
        if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
            const contentType = req.get('Content-Type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new BadRequestException('Content-Type must be application/json');
            }
        }
        
        // Validar headers requeridos
        const requiredHeaders = ['user-agent'];
        for (const header of requiredHeaders) {
            if (!req.get(header)) {
                throw new BadRequestException(`Missing required header: ${header}`);
            }
        }
        
        // Validar longitud máxima de User-Agent (opcional)
        const userAgent = req.get('User-Agent');
        if (userAgent && userAgent.length > 500) {
            throw new BadRequestException('User-Agent header too long');
        }
        
        next();
    }
}
