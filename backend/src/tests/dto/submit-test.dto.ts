import { IsString, IsOptional, IsUUID, IsNotEmpty, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class AnswerDto {
  @IsString()
  @IsNotEmpty()
  questionId: string;

  @IsString()
  @IsOptional()
  answer?: string;

  @IsArray()
  @IsOptional()
  selectedOptions?: string[];
}

export class SubmitTestDto {
  @IsUUID()
  @IsNotEmpty()
  testId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  answers: AnswerDto[];
}

export class StartTestDto {
  @IsUUID()
  @IsNotEmpty()
  testId: string;
}