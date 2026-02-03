import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 🌍 Autoriser les requêtes du frontend
  app.enableCors();

  // ✅ Validation globale des DTO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,            // supprime les champs non définis dans les DTO
      forbidNonWhitelisted: true, // rejette les champs inconnus
      transform: true,            // transforme string -> number automatiquement
    }),
  );

  await app.listen(3000);
  console.log('Backend SanaPay démarré sur http://localhost:3000');
}

bootstrap();
