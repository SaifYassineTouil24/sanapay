import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Autoriser les requêtes du frontend (HTML / JS)
  app.enableCors();

  await app.listen(3000);
  console.log('Backend SanaPay démarré sur http://localhost:3000');
}

bootstrap();
