import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Global prefix
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      /**
       * TODO: -
       * Enable to transform the data,
       * according to what the dto expects
       */
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      /************************************/
    }),
  );
  await app.listen(3000);
}
bootstrap();
