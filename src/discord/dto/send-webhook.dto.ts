import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

export class SendWebhookDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Za-z0-9_-]+$/, {
    message:
      'Ключ может содержать только буквы, цифры, нижнее подчёркивание или дефис',
  })
  @MaxLength(100)
  channelKey: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}
