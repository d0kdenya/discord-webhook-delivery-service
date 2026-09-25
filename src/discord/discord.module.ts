import { Module } from '@nestjs/common';
import { DiscordController } from './discord.controller';
import { DiscordService } from './services/discord.service';
import { DiscordQueueService } from './services/discord-queue.service';
import { ChannelQueueManagerService } from './services/channel-queue-manager.service';
import { DiscordDlqService } from './services/discord-dlq.service';

@Module({
  controllers: [DiscordController],
  providers: [
    DiscordService,
    DiscordQueueService,
    ChannelQueueManagerService,
    DiscordDlqService,
  ],
})
export class DiscordModule {}
