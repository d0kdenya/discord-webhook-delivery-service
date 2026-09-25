import { Module } from '@nestjs/common';
import { DiscordController } from './discord.controller';
import { DiscordService } from './discord.service';
import { DISCORD_WEBHOOK_QUEUE } from './constants/discord-queue.constants';
import { BullModule } from '@nestjs/bullmq';
import { DiscordQueueService } from './discord-queue.service';
import { DiscordWebhookProcessor } from './discord-webhook.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: DISCORD_WEBHOOK_QUEUE,
    }),
  ],
  controllers: [DiscordController],
  providers: [
    //
    DiscordService,
    DiscordQueueService,
    DiscordWebhookProcessor,
  ],
})
export class DiscordModule {}
