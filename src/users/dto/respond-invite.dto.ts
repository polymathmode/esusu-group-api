import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RespondInviteDto {
  @ApiProperty({ example: true, description: 'true to accept, false to decline' })
  @IsBoolean()
  accept: boolean;
}