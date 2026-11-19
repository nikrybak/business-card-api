import { ConsoleLogger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { appConfig, type AppConfig } from '~/app/app.config';
import { AppModule } from '~/app/app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const { port, isProduction } = app.get<AppConfig>(appConfig.KEY);
  const logger = new ConsoleLogger({ json: isProduction, colors: !isProduction });

  app.useLogger(logger);
  app.enableShutdownHooks();

  await app.listen(port, '0.0.0.0');
  logger.log(`GraphQL is ready on port ${port} at /graphql`, 'Bootstrap');
}

void bootstrap();
