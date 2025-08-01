import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SearchGroupsDto {
  @ApiPropertyOptional({ example: 'book' })
  @IsOptional()
  @IsString()
  name?: string;
}