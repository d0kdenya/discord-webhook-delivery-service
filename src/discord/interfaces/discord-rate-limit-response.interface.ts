export interface DiscordRateLimitResponse {
  message?: string;
  retry_after?: number;
  global?: boolean;
}
