import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(cookieParser());
  const configService = app.get(ConfigService);

  app.useStaticAssets(
    configService.get<string>("UPLOAD_PATH") ||
      path.join(process.cwd(), "uploads"),
    {
      prefix: "/uploads",
    },
  );

  app.enableCors({
    origin: ["*"],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    allowedHeaders: "Content-Type, Accept, Authorization",
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  const config = new DocumentBuilder()
    .setTitle("CCNTA API")
    .setDescription("Made with ❤️ by @torikkyun")
    .setVersion("0.1")
    .addBearerAuth({
      name: "Authorization",
      bearerFormat: "Bearer",
      scheme: "bearer",
      type: "http",
      in: "Header",
    })
    .build();

  SwaggerModule.setup(
    "api/swagger",
    app,
    SwaggerModule.createDocument(app, config),
    {
      swaggerOptions: {
        persistAuthorization: true,
      },
    },
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
