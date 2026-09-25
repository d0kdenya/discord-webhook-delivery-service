import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DiscordService {
  constructor(private readonly configService: ConfigService) {}

  async sendWebhook(title: string, description: string): Promise<void> {
    const webhookUrl = this.configService.get<string>('DISCORD_WEBHOOK_URL');

    if (!webhookUrl) {
      throw new InternalServerErrorException(
        'Конфигурация DISCORD_WEBHOOK_URL не задана!',
      );
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: '',
        tts: false,
        components: [],
        embeds: [
          {
            title,
            description,
          },
        ],
      }),
    });

    if (!response.ok) {
      const responseText = await response.text();

      throw new InternalServerErrorException(
        `Вебхук завершился с ошибкой: ${response.status} - ${responseText}`,
      );
    }
  }
}
