import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
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
  await app.listen(5000);
}
bootstrap();
