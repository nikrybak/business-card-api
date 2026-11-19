import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '~/generated/prisma/client';

import { databaseConfig, type DatabaseConfig } from './database.config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  constructor(@Inject(databaseConfig.KEY) { url }: DatabaseConfig) {
    super({ adapter: new PrismaPg({ connectionString: url }) });
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
