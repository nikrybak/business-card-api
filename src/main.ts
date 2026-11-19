import { ConsoleLogger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';

import { appConfig, type AppConfig } from '~/app/app.config';
import { AppModule } from '~/app/app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bufferLogs: true });
  const { port, isProduction } = app.get<AppConfig>(appConfig.KEY);
  const logger = new ConsoleLogger({ json: isProduction });

  app.disable('x-powered-by');
  app.useLogger(logger);
  app.enableShutdownHooks();

  await app.listen(port, '0.0.0.0');
  logger.log(`GraphQL is ready on port ${port} at /graphql`, 'Bootstrap');
}

void bootstrap();
