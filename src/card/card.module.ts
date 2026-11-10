import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { ExperienceResolver, ProfileResolver } from './api';
import { cardConfig } from './card.config';
import { CardLoadersFactory, PrismaCardRepository } from './data';
import { CardReader, CardService } from './domain';

/** A vertical slice: api -> domain <- data, wired here and nowhere else */
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
