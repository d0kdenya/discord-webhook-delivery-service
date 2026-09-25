import { ConfigService } from '@nestjs/config';
import { DiscordDestination } from '../interfaces/discord-destination.interface';

export function getDiscordDestinations(
  configService: ConfigService,
): Map<string, DiscordDestination> {
  const usersWebhookUrl = configService.get<string>('DISCORD_WEBHOOK_USERS');

  const adminsWebhookUrl = configService.get<string>('DISCORD_WEBHOOK_ADMINS');

  const destinations = new Map<string, DiscordDestination>();

  if (usersWebhookUrl) {
    destinations.set('users', {
      channelKey: 'users',
      webhookUrl: usersWebhookUrl,
    });
  }

  if (adminsWebhookUrl) {
    destinations.set('admins', {
      channelKey: 'admins',
      webhookUrl: adminsWebhookUrl,
    });
  }

  return destinations;
}
