import { Injectable, Logger, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue, UnrecoverableError, Worker } from 'bullmq';

import { ChannelQueueResources } from '../interfaces/channel-query-resources.interface';
import { DiscordWebhookJob } from '../interfaces/discord-webhook-job.interface';

import { DiscordService } from './discord.service';
import { DiscordDlqService } from './discord-dlq.service';

import { DiscordRateLimitError } from '../errors/discord-rate-limit.error';
import { DiscordPermanentError } from '../errors/discord-permanent.error';

@Injectable()
export class ChannelQueueManagerService implements OnApplicationShutdown {
  private readonly logger = new Logger(ChannelQueueManagerService.name);

  private readonly channels = new Map<string, ChannelQueueResources>();

  constructor(
    private readonly configService: ConfigService,
    private readonly discordService: DiscordService,
    private readonly discordDlqService: DiscordDlqService,
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
        const { webhookUrl, title, description, channelKey } = job.data;

        this.logger.log(
          `Выполняется задача: ${job.id} из канала: ${channelKey}, попытка: ${job.attemptsMade + 1}`,
        );

        try {
          await this.discordService.sendWebhook(webhookUrl, title, description);
        } catch (error) {
          if (error instanceof DiscordRateLimitError) {
            this.logger.warn(
              `Ограничение по частоте запросов в канале: ${channelKey}. ` +
                `Повторный запрос через ${error.retryAfterMs} мс`,
            );

            await worker.rateLimit(error.retryAfterMs);

            throw Worker.RateLimitError();
          }
          if (error instanceof DiscordPermanentError) {
            await this.discordDlqService.add({
              originalJobId: String(job.id),
              channelKey,
              title,
              description,
              statusCode: error.statusCode,
              errorMessage: error.message,
              attempts: job.attemptsMade + 1,
              failedAt: new Date().toISOString(),
            });

            this.logger.error(
              `Задача ${job.id} из канала ${channelKey} отправлена в DLQ: ${error.message}`,
            );

            throw new UnrecoverableError(error.message);
          }
          throw error;
        }
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
        `Ошибка выполнения задачи: ${job?.id ?? 'unknown'} ` +
          `из канала: ${channelKey} | ${error.message}`,
      );
    });

    worker.on('error', (error) => {
      this.logger.error(
        `Ошибка воркера канала ${channelKey}: ${error.message}`,
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
