import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Logger, Module, OnApplicationShutdown } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';

import { CARD_EXAMPLE_QUERY, CardLoadersFactory, CardModule } from '~/card';
import { PrismaModule } from '~/database';

import { AppExceptionFilter } from './app-exception.filter';
import { appConfig, type AppConfig } from './app.config';
import { HealthController } from './health.controller';
import { REQUEST_ID_HEADER, requestIdOf, type HttpExchange, type RequestContext } from './request-context';
import { RequestLoggingPlugin } from './request-logging.plugin';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [appConfig] }),
    PrismaModule,
    CardModule,
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [CardModule],
      inject: [appConfig.KEY, CardLoadersFactory],
      useFactory: ({ isProduction }: AppConfig, loaders: CardLoadersFactory): ApolloDriverConfig => ({
        autoSchemaFile: isProduction ? true : 'schema.gql',
        sortSchema: true,
        introspection: true,
        playground: false,
        fieldResolverEnhancers: ['filters'],
        parseOptions: { maxLexicalTokens: 500, maxSourceLength: 10_000 },
        plugins: [
          ApolloServerPluginLandingPageLocalDefault({
            document: CARD_EXAMPLE_QUERY,
            embed: { initialState: { pollForSchemaUpdates: false } },
          }),
        ],
        context: ({ req, res }: HttpExchange): RequestContext => {
          const requestId = requestIdOf(req.header(REQUEST_ID_HEADER));
          res.setHeader(REQUEST_ID_HEADER, requestId);
          return { requestId, loaders: loaders.create() };
        },
      }),
    }),
  ],
  controllers: [HealthController],
  providers: [{ provide: APP_FILTER, useClass: AppExceptionFilter }, RequestLoggingPlugin],
})
export class AppModule implements OnApplicationShutdown {
  private readonly logger = new Logger(AppModule.name);

  onApplicationShutdown(signal?: string): void {
    this.logger.log(signal ? `Stopped by ${signal}` : 'Stopped');
  }
}
