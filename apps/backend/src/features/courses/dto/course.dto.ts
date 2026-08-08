import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCourseDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  nome?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  categoria?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsNumber()
  prezzo?: number;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  stato?: string;

  @IsOptional()
  @IsString()
  photoUrl?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  teacherId?: string;

  @IsOptional()
  @IsNumber()
  lessonsPerWeek?: number;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @IsOptional()
  @IsString()
  scheduleType?: string;

  @IsOptional()
  @IsNumber()
  totalLessons?: number;

  @IsOptional()
  @IsArray()
  scheduleDays?: number[];

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  endTime?: string;

  @IsOptional()
  @IsNumber()
  lessonDurationMinutes?: number;

  @IsOptional()
  @IsNumber()
  totalHours?: number;

  @IsOptional()
  @IsString()
  courseFormat?: string;

  @IsOptional()
  @IsString()
  slug?: string;
}

export class UpdateCourseDto extends CreateCourseDto {}
