import { IsString, IsNotEmpty, IsNumber, IsEnum, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Visibility } from '@prisma/client';

export class CreateGroupDto {
  @ApiProperty({ example: 'Lagos Book Club' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'A club for book lovers in Lagos' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 50, minimum: 2, maximum: 1000 })
  @IsNumber()
  @Min(2)
  @Max(1000)
  maxCapacity: number;

  @ApiProperty({ enum: Visibility, example: 'PUBLIC' })
  @IsEnum(Visibility)
  visibility: Visibility;
}