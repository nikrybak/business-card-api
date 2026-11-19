import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { CardLoadersFactory } from './api/card.loaders';
import { ExperienceResolver, ProfileResolver } from './api/card.resolvers';
import { cardConfig } from './card.config';
import { PrismaCardRepository } from './data/prisma-card.repository';
import { CardReader } from './domain/card.reader';
import { CardService } from './domain/card.service';

@Module({
  imports: [ConfigModule.forFeature(cardConfig)],
  providers: [
    { provide: CardReader, useClass: PrismaCardRepository },
    CardService,
    CardLoadersFactory,
    ProfileResolver,
    ExperienceResolver,
  ],
  exports: [CardLoadersFactory],
})
export class CardModule {}
