import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use((req, next) => {
    req.app.set('trust proxy', 1);
    next();
  });

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

  await app.listen(3002);
}
bootstrap();
