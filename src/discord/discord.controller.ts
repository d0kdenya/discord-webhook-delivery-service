import { Body, Controller, Post } from '@nestjs/common';
import { SendWebhookDto } from './dto/send-webhook.dto';
import { ResponseWebhookDto } from './dto/response-webhook.dto';
import { DiscordQueueService } from './services/discord-queue.service';

@Controller('discord')
export class DiscordController {
  constructor(private readonly discordQueueService: DiscordQueueService) {}

  @Post('webhook')
  async sendWebhook(@Body() body: SendWebhookDto): Promise<ResponseWebhookDto> {
    const { title, description, channelKey } = body;

    const jobId = await this.discordQueueService.enqueue({
      channelKey,
      title,
      description,
    });

    return {
      success: true,
      jobId,
      channelKey,
    };
  }
}
