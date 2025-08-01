import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class JoinWithCodeDto {
  @ApiProperty({ example: 'abc123-def456-ghi789' })
  @IsString()
  @IsNotEmpty()
  inviteCode: string;
}