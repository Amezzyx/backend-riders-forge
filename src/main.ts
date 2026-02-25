import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for frontend
  app.enableCors({
    origin: true, // Allow all origins in development
    credentials: true,
  });
  
  // Enable JSON body parsing
  app.use(require('express').json());
  
  const port = process.env.PORT ?? 3001; // Use 3001 to avoid conflict with React dev server
  await app.listen(port);
  console.log(`Backend running on http://localhost:${port}`);
  console.log(`API available at http://localhost:${port}/api`);
}
bootstrap();
