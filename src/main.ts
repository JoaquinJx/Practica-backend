import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { TransformResponseInterceptor } from './users/infrastructure/interceptors/transform-response.interceptor';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // VALIDACIONES
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  //INTERCEPTOR DE RESPUESTA
 app.useGlobalInterceptors(new TransformResponseInterceptor());


  // GUARD GLOBAL - Todos los endpoints requieren autenticación
  // NOTA: Solo descomenta esto si quieres que TODOS los endpoints requieran autenticación
  // app.useGlobalGuards(new AuthGuard());

  // CONFIGURACION DE SWAGGER
  const config = new DocumentBuilder()
    .setTitle('Api de peliculas')
    .setDescription('Practicar typescript y nestjs con api de peliculas')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
