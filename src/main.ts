import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AppModule } from './app.module';
import * as Sentry from '@sentry/node';
import { ENV_NAMES } from './shared/configuration/env.enum';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  app.use(bodyParser.json());

  Sentry.init({
    dsn: configService.get(ENV_NAMES.SENTRY_DSN),
  });

  app.setGlobalPrefix(configService.get(ENV_NAMES.GLOBAL_PREFIX));
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  app.enableCors();

  const options = new DocumentBuilder()
    .setTitle('Job List API Documentation')
    .setDescription('The documentation of the job list api')
    .setVersion('1')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup(
    configService.get(ENV_NAMES.SWAGGER_PREFIX),
    app,
    document,
  );

  const port = configService.get(ENV_NAMES.API_PORT);
  await app.listen(port, '0.0.0.0', () => {
    console.log(`App running at ${port} port`);
  });
}
bootstrap();
