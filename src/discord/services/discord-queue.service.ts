import { Injectable } from '@nestjs/common';
import { DiscordWebhookJob } from '../interfaces/discord-webhook-job.interface';
import { ChannelQueueManagerService } from './channel-queue-manager.service';

@Injectable()
export class DiscordQueueService {
  constructor(
    private readonly channelQueueManager: ChannelQueueManagerService,
  ) {}

  async enqueue(payload: DiscordWebhookJob): Promise<string> {
    const queue = await this.channelQueueManager.getQueue(payload.channelKey);

    const job = await queue.add('send-webhook', payload, {
      removeOnComplete: {
        count: 1000,
      },
      removeOnFail: {
        count: 1000,
      },
    });

    return String(job.id);
  }
}
