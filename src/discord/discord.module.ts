import { Module } from '@nestjs/common';
import { DiscordController } from './discord.controller';
import { DiscordService } from './services/discord.service';
import { DiscordQueueService } from './services/discord-queue.service';
import { ChannelQueueManagerService } from './services/channel-queue-manager.service';

@Module({
  controllers: [DiscordController],
  providers: [
    //
    DiscordService,
    DiscordQueueService,
    ChannelQueueManagerService,
  ],
})
export class DiscordModule {}
