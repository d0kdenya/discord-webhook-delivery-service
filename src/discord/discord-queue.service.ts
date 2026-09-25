import { Injectable } from '@nestjs/common';
import { DiscordService } from './discord.service';
import { InjectQueue } from '@nestjs/bullmq';
import { DISCORD_WEBHOOK_QUEUE } from './constants/discord-queue.constants';
import { Queue } from 'bullmq';
import { DiscordWebhookJob } from './interfaces/discord-webhook-job.interface';

@Injectable()
export class DiscordQueueService {
  constructor(
    @InjectQueue(DISCORD_WEBHOOK_QUEUE)
    private readonly queue: Queue<DiscordWebhookJob>,
  ) {}

  async enqueue(payload: DiscordWebhookJob): Promise<void> {
    await this.queue.add('send-webhook', payload);
  }
}
