import { Body, Controller, Post } from '@nestjs/common';
import { DiscordService } from './discord.service';
import { SendWebhookDto } from './dto/send-webhook.dto';
import { ResponseWebhookDto } from './dto/response-webhook.dto';

@Controller('discord')
export class DiscordController {
  constructor(private readonly discordService: DiscordService) {}

  @Post('webhook')
  async sendWebhook(@Body() body: SendWebhookDto): Promise<ResponseWebhookDto> {
    const { title, description } = body;

    await this.discordService.sendWebhook(title, description);

    return {
      success: true,
    };
  }
}
