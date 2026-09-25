export class DiscordPermanentError extends Error {
  constructor(
    public readonly statusCode: number | undefined,
    message: string,
  ) {
    super(message);

    this.name = DiscordPermanentError.name;
  }
}
