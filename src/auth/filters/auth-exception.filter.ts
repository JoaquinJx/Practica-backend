import { ArgumentsHost, Catch, HttpException,ExceptionFilter } from "@nestjs/common";


@Catch(HttpException)
export class AuthExceptionFilter implements ExceptionFilter {
catch(exception:HttpException, host: ArgumentsHost){

  const ctx= host.switchToHttp();
  const response= ctx.getResponse();
  const request = ctx.getRequest()
  const status = exception.getStatus();
  const message = exception.message;
  

  const errorResponse ={
    statusCode: status,
    timestamp: new Date().toISOString(),
    path:request.url,
    method:request.method,
    message:message,
    error:exception.getResponse()

  }

  response.status(status).json(errorResponse);


}
}