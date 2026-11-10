import { ConsoleLogger, Inject, Injectable } from '@nestjs/common';

import { appConfig, type AppConfig } from '~/config';

/** The single logger of the process: JSON lines in production, readable colors in development */
@Injectable()
export class AppLogger extends ConsoleLogger {
  constructor(@Inject(appConfig.KEY) { isProduction }: AppConfig) {
    super({ json: isProduction, colors: !isProduction });
  }
}
