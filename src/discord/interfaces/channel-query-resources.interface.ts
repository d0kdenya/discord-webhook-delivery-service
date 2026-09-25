import { Queue, Worker } from 'bullmq';
import { DiscordWebhookJob } from './discord-webhook-job.interface';

export interface ChannelQueueResources {
  queue: Queue<DiscordWebhookJob>;
  worker: Worker<DiscordWebhookJob>;
}
