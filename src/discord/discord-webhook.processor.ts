import { Processor, WorkerHost } from '@nestjs/bullmq';
import { DISCORD_WEBHOOK_QUEUE } from './constants/discord-queue.constants';
import { DiscordService } from './discord.service';
import { Job } from 'bullmq';
import { DiscordWebhookJob } from './interfaces/discord-webhook-job.interface';

@Processor(DISCORD_WEBHOOK_QUEUE)
export class DiscordWebhookProcessor extends WorkerHost {
  constructor(private readonly discordService: DiscordService) {
    super();
  }

  async process(job: Job<DiscordWebhookJob>): Promise<void> {
    const { title, description } = job.data;

    console.log('Processing job:', job.id, job.data);

    await this.discordService.sendWebhook(title, description);
  }
}
