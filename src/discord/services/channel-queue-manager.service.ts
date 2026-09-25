import { Injectable, Logger, OnApplicationShutdown } from '@nestjs/common';
import { ChannelQueueResources } from '../interfaces/channel-query-resources.interface';
import { ConfigService } from '@nestjs/config';
import { DiscordService } from './discord.service';
import { Queue, Worker } from 'bullmq';
import { DiscordWebhookJob } from '../interfaces/discord-webhook-job.interface';

@Injectable()
export class ChannelQueueManagerService implements OnApplicationShutdown {
  private readonly logger = new Logger(ChannelQueueManagerService.name);

  private readonly channels = new Map<string, ChannelQueueResources>();

  constructor(
    private readonly configService: ConfigService,
    private readonly discordService: DiscordService,
  ) {}

  async getQueue(channelKey: string): Promise<Queue<DiscordWebhookJob>> {
    const existing = this.channels.get(channelKey);

    if (existing) {
      return existing.queue;
    }

    const resources = this.createChannelResources(channelKey);

    this.channels.set(channelKey, resources);

    return resources.queue;
  }

  private createChannelResources(channelKey: string): ChannelQueueResources {
    const queueName = this.buildQueueName(channelKey);

    const connection = {
      host: this.configService.get<string>('REDIS_HOST', 'localhost'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
    };

    const queue = new Queue<DiscordWebhookJob>(queueName, {
      connection,
    });

    const worker = new Worker<DiscordWebhookJob>(
      queueName,
      async (job) => {
        const { title, description, channelKey } = job.data;

        this.logger.log(
          `Выполняется задача: ${job.id} из канала: ${channelKey}`,
        );

        await this.discordService.sendWebhook(title, description);
      },
      {
        connection,
        concurrency: 1,
        limiter: {
          max: 2,
          duration: 1000,
        },
      },
    );

    worker.on('completed', (job) => {
      this.logger.log(`Выполнена задача: ${job.id} из канала: ${channelKey}`);
    });

    worker.on('failed', (job, error) => {
      this.logger.error(
        `Ошибка выполнения задачи: ${job.id} из канала: ${channelKey} | ${error.message}`,
      );
    });

    this.logger.log(`Созданы очередь и воркер для канала: ${channelKey}`);

    return {
      queue,
      worker,
    };
  }

  private buildQueueName(channelKey: string): string {
    return `discord-webhook-${channelKey}`;
  }

  async onApplicationShutdown(): Promise<void> {
    const resources = Array.from(this.channels.values());

    await Promise.all(
      resources.map(async ({ queue, worker }) => {
        await worker.close();
        await queue.close();
      }),
    );
  }
}
