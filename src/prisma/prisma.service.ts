import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';

import { databaseConfig, type DatabaseConfig } from '~/config';
import { PrismaClient } from '~/generated/prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  constructor(@Inject(databaseConfig.KEY) { url }: DatabaseConfig) {
    super({ adapter: new PrismaPg({ connectionString: url }) });
  }

  /** Graceful shutdown: the pool is closed after the server stops taking requests */
  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
