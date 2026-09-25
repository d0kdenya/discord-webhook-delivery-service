import { Body, Controller, Post } from '@nestjs/common';
import { DiscordService } from './discord.service';
import { SendWebhookDto } from './dto/send-webhook.dto';
import { ResponseWebhookDto } from './dto/response-webhook.dto';
import { DiscordQueueService } from './discord-queue.service';

@Controller('discord')
export class DiscordController {
  constructor(private readonly discordQueueService: DiscordQueueService) {}

  @Post('webhook')
  async sendWebhook(@Body() body: SendWebhookDto): Promise<ResponseWebhookDto> {
    const { title, description } = body;

    await this.discordQueueService.enqueue({
      title,
      description,
    });

    return {
      success: true,
    };
  }
}
