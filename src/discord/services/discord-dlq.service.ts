import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { DiscordDeadLetter } from '../interfaces/discord-dead-letter.interface';
import { Queue } from 'bullmq';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DiscordDlqService implements OnApplicationShutdown {
  private readonly queue: Queue<DiscordDeadLetter>;

  constructor(private readonly configService: ConfigService) {
    this.queue = new Queue<DiscordDeadLetter>('discord-webhook-dlq', {
      connection: {
        host: this.configService.get<string>('REDIS_HOST', 'localhost'),
        port: this.configService.get<number>('REDIS_PORT', 6379),
      },
    });
  }

  async add(deadLetter: DiscordDeadLetter): Promise<void> {
    await this.queue.add('dead-letter', deadLetter, {
      removeOnComplete: false,
      removeOnFail: false,
    });
  }

  async onApplicationShutdown(): Promise<void> {
    await this.queue.close();
  }
}
