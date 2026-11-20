import { Controller, Get } from '@nestjs/common';

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
    await this.prisma.$queryRaw`SELECT 1`;
    return OK;
  }
}
