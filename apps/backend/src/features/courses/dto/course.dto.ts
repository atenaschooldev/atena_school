import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';
import { CourseStatus, CourseScheduleType, CourseFormat } from '@atena/api-types';

export class CreateCourseDto {
  @ApiPropertyOptional({ description: 'Название курса (EN/IT)' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Название курса (алиас nome)' })
  @IsOptional()
  @IsString()
  nome?: string;

  @ApiPropertyOptional({ description: 'Название курса (алиас title)' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Категория курса (languages, Certipass)' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Категория (алиас categoria)' })
  @IsOptional()
  @IsString()
  categoria?: string;

  @ApiPropertyOptional({ description: 'Стоимость курса в EUR' })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiPropertyOptional({ description: 'Стоимость (алиас prezzo)' })
  @IsOptional()
  @IsNumber()
  prezzo?: number;

  @ApiPropertyOptional({
    description: 'Статус курса: 1=ACTIVE, 2=DRAFT, 3=ARCHIVED',
    enum: CourseStatus,
    example: CourseStatus.ACTIVE,
  })
  @IsOptional()
  status?: CourseStatus | number | string;

  @ApiPropertyOptional({ description: 'Статус (алиас stato)' })
  @IsOptional()
  stato?: string;

  @ApiPropertyOptional({ description: 'URL обложки курса' })
  @IsOptional()
  @IsString()
  photoUrl?: string;

  @ApiPropertyOptional({ description: 'URL обложки (алиас photo_url)' })
  @IsOptional()
  @IsString()
  photo_url?: string;

  @ApiPropertyOptional({ description: 'Описание курса' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'ID преподавателя' })
  @IsOptional()
  @IsString()
  teacherId?: string;

  @ApiPropertyOptional({ description: 'ID преподавателя (алиас teacher_id)' })
  @IsOptional()
  @IsString()
  teacher_id?: string;

  @ApiPropertyOptional({ description: 'Количество уроков в неделю' })
  @IsOptional()
  @IsNumber()
  lessonsPerWeek?: number;

  @ApiPropertyOptional({ description: 'Порядок сортировки' })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @ApiPropertyOptional({
    description: 'Тип расписания: 1=FIXED, 2=FLEXIBLE',
    enum: CourseScheduleType,
    example: CourseScheduleType.FIXED,
  })
  @IsOptional()
  scheduleType?: CourseScheduleType | number | string;

  @ApiPropertyOptional({ description: 'Тип расписания (алиас schedule_type)' })
  @IsOptional()
  schedule_type?: string;

  @ApiPropertyOptional({ description: 'Всего уроков в курсе' })
  @IsOptional()
  @IsNumber()
  totalLessons?: number;

  @ApiPropertyOptional({ description: 'Дни недели занятий (1=Пн..7=Вс или строки)' })
  @IsOptional()
  @IsArray()
  scheduleDays?: any[];

  @ApiPropertyOptional({ description: 'Время начала урока (HH:MM)' })
  @IsOptional()
  @IsString()
  startTime?: string;

  @ApiPropertyOptional({ description: 'Время окончания урока (HH:MM)' })
  @IsOptional()
  @IsString()
  endTime?: string;

  @ApiPropertyOptional({ description: 'Длительность урока в минутах' })
  @IsOptional()
  @IsNumber()
  lessonDurationMinutes?: number;

  @ApiPropertyOptional({ description: 'Всего академических часов' })
  @IsOptional()
  @IsNumber()
  totalHours?: number;

  @ApiPropertyOptional({
    description: 'Формат проведения: 1=GROUP, 2=INDIVIDUAL, 3=ONLINE, 4=CERTIFICATION',
    enum: CourseFormat,
    example: CourseFormat.GROUP,
  })
  @IsOptional()
  courseFormat?: CourseFormat | number | string;

  @ApiPropertyOptional({ description: 'Формат (алиас course_format)' })
  @IsOptional()
  course_format?: string;

  @ApiPropertyOptional({ description: 'URL slug курса' })
  @IsOptional()
  @IsString()
  slug?: string;
}

export class UpdateCourseDto extends CreateCourseDto {}
