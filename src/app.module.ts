import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Logger, Module, OnApplicationShutdown } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';

import { CARD_EXAMPLE_QUERY, CardLoadersFactory, CardModule, type GraphqlContext } from '~/card';
import { AppExceptionFilter } from '~/common/errors';
import { RequestLoggingPlugin } from '~/common/graphql';
import { LoggerModule } from '~/common/logger';
import { appConfig, databaseConfig, type AppConfig } from '~/config';
import { HealthModule } from '~/health';
import { PrismaModule } from '~/prisma';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, cache: true, load: [appConfig, databaseConfig] }),
    LoggerModule,
    PrismaModule,
    HealthModule,
    CardModule,
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [CardModule],
      inject: [appConfig.KEY, CardLoadersFactory],
      useFactory: ({ isProduction }: AppConfig, loaders: CardLoadersFactory): ApolloDriverConfig => ({
        // Development keeps schema.gql in the repository up to date, production builds it in memory
        autoSchemaFile: isProduction ? true : 'schema.gql',
        sortSchema: true,
        introspection: true,
        playground: false,
        includeStacktraceInErrorResponses: !isProduction,
        plugins: [ApolloServerPluginLandingPageLocalDefault({ embed: true, document: CARD_EXAMPLE_QUERY })],
        context: (): GraphqlContext => ({ loaders: loaders.create() }),
      }),
    }),
  ],
  providers: [{ provide: APP_FILTER, useClass: AppExceptionFilter }, RequestLoggingPlugin],
})
export class AppModule implements OnApplicationShutdown {
  private readonly logger = new Logger(AppModule.name);

  onApplicationShutdown(signal?: string): void {
    this.logger.log(signal ? `Stopped by ${signal}` : 'Stopped');
  }
}
