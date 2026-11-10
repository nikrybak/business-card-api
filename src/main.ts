import { NestFactory } from '@nestjs/core';

import { AppModule } from '~/app.module';
import { AppLogger } from '~/common/logger';
import { appConfig, type AppConfig } from '~/config';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const logger = app.get(AppLogger);
  app.useLogger(logger);
  // SIGTERM and SIGINT stop taking requests first, then close the database pool
  app.enableShutdownHooks();

  const { port } = app.get<AppConfig>(appConfig.KEY);
  await app.listen(port, '0.0.0.0');
  logger.log(`GraphQL is ready on port ${port} at /graphql`, 'Bootstrap');
}

void bootstrap();
