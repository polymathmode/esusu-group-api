import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

enum JoinRequestAction {
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
}

export class JoinRequestActionDto {
  @ApiProperty({ enum: JoinRequestAction, example: 'APPROVE' })
  @IsEnum(JoinRequestAction)
  action: JoinRequestAction;
}