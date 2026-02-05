import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 🔐 Security
  app.use(
    helmet({
      contentSecurityPolicy: false,
    }),
  );

  // 🌍 CORS (Live Server)
  app.enableCors({
    origin: [
      'http://127.0.0.1:5500',
      'http://localhost:5500',
      'http://localhost:8081',
      'http://127.0.0.1:5502',
    ],
    credentials: true,
  });

  // 🌍 API prefix
  app.setGlobalPrefix('api');

  // ✅ Global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // 📚 Swagger
  const config = new DocumentBuilder()
    .setTitle('SanaPay API')
    .setDescription('API Documentation for SanaPay')
    .setVersion('2.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = Number(process.env.PORT) || 3000;
  await app.listen(port);

  console.log(`
🚀 SanaPay Backend is running!

🔗 API Base : http://localhost:${port}/api
📚 Swagger  : http://localhost:${port}/api/docs
🌐 Frontend: Live Server (5500 / 8081)
🔐 Env     : ${process.env.NODE_ENV || 'development'}
`);
}
bootstrap();

