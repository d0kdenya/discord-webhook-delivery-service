import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class SendWebhookDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}
