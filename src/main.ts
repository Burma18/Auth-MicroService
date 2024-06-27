import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger } from '@nestjs/common';
import { HttpExceptionFilter } from './filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const logger = new Logger('Bootstrap');

  app.set('trust proxy', 1);

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'https://wedevx.co',
      'https://www.wedevx.co',
      'https://app.wedevx.co',
      'https://admin.wedevx.co',
      'https://test.wedevx.co',
      'https://test.app.wedevx.co',
      'https://test.admin.wedevx.co',
      'https://test-app.wedevx.co',
      'https://test-admin.wedevx.co',
      'https://flagcdn.com/',
      'https://staging.wedevx.co',
      'https://front.wedevx.co',
      'https://staging-admin.wedevx.co',
      'https://front-admin.wedevx.co',
      'https://*.dev.wedevx.co',
    ],
    credentials: true,
  });

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useLogger(logger);

  await app.listen(3002, () => {
    logger.log('NestJS application is listening on port 3002');
  });
}

bootstrap();
