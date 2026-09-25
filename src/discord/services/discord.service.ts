import { Injectable } from '@nestjs/common';
import { DiscordRateLimitResponse } from '../interfaces/discord-rate-limit-response.interface';
import { DiscordRateLimitError } from '../errors/discord-rate-limit.error';
import { DiscordTransientError } from '../errors/discord-transient.error';
import { DiscordPermanentError } from '../errors/discord-permanent.error';

@Injectable()
export class DiscordService {
  private static readonly DEFAULT_RETRY_AFTER_MS = 1000;

  async sendWebhook(
    webhookUrl: string,
    title: string,
    description: string,
  ): Promise<void> {
    let response: Response;

    try {
      response = await fetch(webhookUrl, {
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
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Неизвестная ошибка';

      throw new DiscordTransientError(
        undefined,
        `Ошибка сети при отправке вебхука: ${message}`,
      );
    }

    if (response.ok) {
      return;
    }

    const { status } = response;

    if (status === 429) {
      const body = (await response.json()) as DiscordRateLimitResponse;

      const retryAfterMs = this.resolveRetryAfterMs(response, body);

      throw new DiscordRateLimitError(retryAfterMs);
    }

    const responseText = await response.text();

    if (status === 408 || status >= 500) {
      throw new DiscordTransientError(
        status,
        `Временная ошибка Discord: ${status} - ${responseText}`,
      );
    }

    if (status >= 400 && status < 500) {
      throw new DiscordPermanentError(
        status,
        `Невосстановимая ошибка Discord: ${status} - ${responseText}`,
      );
    }

    throw new DiscordPermanentError(
      response.status,
      `Неожиданная ошибка Discord: ${response.status} - ${responseText}`,
    );
  }

  private resolveRetryAfterMs(
    response: Response,
    body: DiscordRateLimitResponse,
  ): number {
    if (
      typeof body.retry_after === 'number' &&
      Number.isFinite(body.retry_after)
    ) {
      return Math.max(Math.ceil(body.retry_after * 1000), 1);
    }

    const retryAfterHeader = response.headers.get('retry-after');

    if (retryAfterHeader) {
      const retryAfterSeconds = +retryAfterHeader;

      if (Number.isFinite(retryAfterSeconds) && retryAfterSeconds >= 0) {
        return Math.max(Math.ceil(retryAfterSeconds * 1000), 1);
      }
    }
    return DiscordService.DEFAULT_RETRY_AFTER_MS;
  }
}
