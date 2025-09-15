import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMessageDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  receiverId: string;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  subjectId?: string;
}