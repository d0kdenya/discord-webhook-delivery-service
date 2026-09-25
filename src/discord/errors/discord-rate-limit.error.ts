export class DiscordRateLimitError extends Error {
  constructor(public readonly retryAfterMs: number) {
    super(
      `Превышен лимит запросов Discord. Повторите попытку через ${retryAfterMs}мс`,
    );

    this.name = DiscordRateLimitError.name;
  }
}
