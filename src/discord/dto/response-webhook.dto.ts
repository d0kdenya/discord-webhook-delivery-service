import { IsBoolean, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ResponseWebhookDto {
  @IsBoolean()
  @IsNotEmpty()
  success: boolean;

  @IsString()
  @IsNotEmpty()
  jobId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  channelKey: string;
}
