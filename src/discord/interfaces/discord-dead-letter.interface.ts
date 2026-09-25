export interface DiscordDeadLetter {
  originalJobId: string;
  channelKey: string;
  title: string;
  description: string;
  statusCode?: number;
  errorMessage: string;
  attempts: number;
  failedAt: string;
}
