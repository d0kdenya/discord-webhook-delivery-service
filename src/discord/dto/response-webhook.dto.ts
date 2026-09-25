import { IsBoolean } from 'class-validator';

export class ResponseWebhookDto {
  @IsBoolean()
  success: boolean;
}
