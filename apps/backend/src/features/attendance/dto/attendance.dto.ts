import { IsOptional, IsString, IsNumber } from 'class-validator';

export class MarkAttendanceDto {
  @IsString()
  lessonId: string;

  @IsOptional()
  @IsString()
  bookingId?: string;

  @IsOptional()
  @IsString()
  studentId?: string;

  @IsString()
  status: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  markedBy?: string;
}

export class CreateManualLessonDto {
  @IsString()
  bookingId: string;

  @IsString()
  startsAt: string;

  @IsString()
  status: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsNumber()
  amount?: number;
}
