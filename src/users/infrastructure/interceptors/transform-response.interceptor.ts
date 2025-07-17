import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';

import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';


@Injectable()
export class TransformResponseInterceptor implements NestInterceptor {
    intercept(context:ExecutionContext, next:CallHandler):Observable<any> {

        const request = context.switchToHttp().getRequest();
        const method = request.method;

        const getSuccessMessage =(method:string)=>{
            switch (method) {
                case 'GET':
                    return 'Data retrieved successfully';
                case 'POST':
                    return 'Data created successfully';
                case 'PUT':
                    return 'Data updated successfully';
                case 'PATCH':
                    return 'Data partially updated successfully';
                case 'DELETE':
                    return 'Data deleted successfully';
                default:
                    return 'Operation successful';
            }
        }
        const getErrorMessage =(error:any)=>{
                if (error.status === 400) {
                    return 'Bad request';
                } else if (error.status === 401) {
                    return 'Unauthorized access';
                } else if (error.status === 403) {
                    return 'Forbidden access';
                } else if (error.status === 404) {
                    return 'Resource not found';
                } else {
                    return 'An unexpected error occurred';
                }
            }
      return next.handle().pipe(
        map((data)=>{
            return {
                success: true,
                data: data,
                message: getSuccessMessage(method),
                timestamp: new Date().toISOString(),
            }
        }),
        catchError((error)=>{
            return of ({
                success: false,
                error: getErrorMessage(error),
                timestamp: new Date().toISOString(),
            });
        }
        )

    );

        
    

    }
}
