import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  const config = new DocumentBuilder()
    .setTitle('HMC API')
    .setDescription('API documentation for POS(Point of Sale)')
    .setVersion('1.0')
    .addTag('users', 'User management endpoints')
    .addServer(`http://localhost:${process.env.PORT || 8082}`, 'Development server')
    .build();
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT || 8082);
}

bootstrap();
