import { IsString, IsNotEmpty, IsOptional, IsInt, IsDateString, IsUUID, Min, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export enum QuestionType {
  MCQ = 'MCQ',
  SHORT_ANSWER = 'SHORT_ANSWER',
  ESSAY = 'ESSAY',
  TRUE_FALSE = 'TRUE_FALSE',
  FILL_BLANK = 'FILL_BLANK',
}

export class QuestionOptionDto {
  @IsString()
  @IsNotEmpty()
  text: string;

  @IsOptional()
  isCorrect?: boolean;
}

export class QuestionDto {
  @IsString()
  @IsNotEmpty()
  question: string;

  @IsEnum(QuestionType)
  type: QuestionType;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  marks: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionOptionDto)
  @IsOptional()
  options?: QuestionOptionDto[];

  @IsString()
  @IsOptional()
  correctAnswer?: string;

  @IsString()
  @IsOptional()
  explanation?: string;

  @IsOptional()
  isRequired?: boolean = true;
}

export class CreateTestDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  @IsNotEmpty()
  subjectId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionDto)
  questions: QuestionDto[];

  @IsInt()
  @Min(1)
  @Type(() => Number)
  totalMarks: number;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  duration: number; // in minutes

  @IsDateString()
  @IsNotEmpty()
  startTime: string;

  @IsDateString()
  @IsNotEmpty()
  endTime: string;

  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  isActive?: boolean = true;

  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  allowMultipleAttempts?: boolean = false;

  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  showResultsImmediately?: boolean = true;

  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  shuffleQuestions?: boolean = false;
}