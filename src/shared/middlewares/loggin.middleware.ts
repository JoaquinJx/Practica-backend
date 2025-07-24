import { NestMiddleware, Injectable, Logger } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";


@Injectable()
export class LogginMiddleware implements NestMiddleware{
    private readonly logger = new Logger(LogginMiddleware.name);
    use(req: Request, res: Response, next: NextFunction){
        const {method, originalUrl,ip}=req;
        const userAgent= req.get('User-Agent') || '';
        this.logger.log(`[${method}] ${originalUrl} - ${ip} - ${userAgent}`);

        const startTime = Date.now();
        res.on('finish', () => {
    const { statusCode } = res;
    const responseTime = Date.now() - startTime;
    this.logger.log(`${method} ${originalUrl} - ${statusCode} - ${responseTime}ms`);
});
        next();
    }
}