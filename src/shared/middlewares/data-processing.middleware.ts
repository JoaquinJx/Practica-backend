import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class DataProcessingMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        // Solo procesar si hay body en la request
        if (req.body && Object.keys(req.body).length > 0) {
            // Normalizar strings (eliminar espacios al inicio y final)
            this.normalizeStrings(req.body);
            
            // Convertir emails a lowercase
            this.normalizeEmails(req.body);
            
            // Agregar metadata de procesamiento
            this.addMetadata(req);
            
            // Remover campos con valores null o undefined
            this.removeNullValues(req.body);
        }
        
        next();
    }
    
    /**
     * Normaliza strings eliminando espacios al inicio y final
     */
    private normalizeStrings(obj: any): void {
        Object.keys(obj).forEach(key => {
            if (typeof obj[key] === 'string') {
                obj[key] = obj[key].trim();
            } else if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
                this.normalizeStrings(obj[key]);
            }
        });
    }
    
    /**
     * Convierte emails a lowercase
     */
    private normalizeEmails(obj: any): void {
        Object.keys(obj).forEach(key => {
            if (key.toLowerCase().includes('email') && typeof obj[key] === 'string') {
                obj[key] = obj[key].toLowerCase();
            } else if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
                this.normalizeEmails(obj[key]);
            }
        });
    }
    
    /**
     * Agrega metadata útil para tracking
     */
    private addMetadata(req: Request): void {
        if (!req.body._metadata) {
            req.body._metadata = {};
        }
        
        req.body._metadata = {
            processedAt: new Date().toISOString(),
            clientIp: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent'),
            method: req.method,
            endpoint: req.originalUrl
        };
    }
    
    /**
     * Remueve valores null, undefined o strings vacíos
     */
    private removeNullValues(obj: any): void {
        Object.keys(obj).forEach(key => {
            if (obj[key] === null || obj[key] === undefined || obj[key] === '') {
                delete obj[key];
            } else if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
                this.removeNullValues(obj[key]);
                // Si el objeto queda vacío después de limpiar, lo eliminamos
                if (Object.keys(obj[key]).length === 0) {
                    delete obj[key];
                }
            }
        });
    }
}
