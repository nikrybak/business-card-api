import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';

import { PrismaService } from '~/database';

const OK = { status: 'ok' } as const;

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  live(): typeof OK {
    return OK;
  }

  @Get('ready')
  async ready(): Promise<typeof OK> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch (error) {
      throw new ServiceUnavailableException('Database is unreachable', { cause: error });
    }
    return OK;
  }
}
