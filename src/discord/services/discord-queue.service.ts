import { BadRequestException, Injectable } from '@nestjs/common';
import { DiscordWebhookJob } from '../interfaces/discord-webhook-job.interface';
import { ChannelQueueManagerService } from './channel-queue-manager.service';
import { DiscordDestination } from '../interfaces/discord-destination.interface';
import { ConfigService } from '@nestjs/config';
import { getDiscordDestinations } from '../config/discord-destinations.config';

@Injectable()
export class DiscordQueueService {
  private readonly destinations: Map<string, DiscordDestination>;

  constructor(
    private readonly configService: ConfigService,
    private readonly channelQueueManager: ChannelQueueManagerService,
  ) {
    this.destinations = getDiscordDestinations(this.configService);
  }

  async enqueue(
    channelKey: string,
    title: string,
    description: string,
  ): Promise<string> {
    const destination = this.destinations.get(channelKey);

    if (!destination) {
      throw new BadRequestException(`Неизвестный канал: ${channelKey}`);
    }

    const { webhookUrl } = destination;

    const payload: DiscordWebhookJob = {
      channelKey: destination.channelKey,
      webhookUrl,
      title,
      description,
    };

    const queue = await this.channelQueueManager.getQueue(
      destination.channelKey,
    );

    const job = await queue.add('send-webhook', payload, {
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
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
