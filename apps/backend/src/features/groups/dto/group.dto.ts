import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsUUID, IsInt, IsArray, IsBoolean } from 'class-validator';

export class CreateGroupDto {
  @ApiProperty({ description: 'Название группы' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'UUID курса' })
  @IsUUID()
  @IsNotEmpty()
  courseId: string;

  @ApiPropertyOptional({ description: 'UUID преподавателя' })
  @IsUUID()
  @IsOptional()
  teacherId?: string;

  @ApiPropertyOptional({ description: 'Аудитория / класс' })
  @IsString()
  @IsOptional()
  room?: string;

  @ApiPropertyOptional({ description: 'Макс. количество студентов', default: 8 })
  @IsInt()
  @IsOptional()
  maxStudents?: number;

  @ApiPropertyOptional({ description: 'Статус группы: 1=RECRUITING, 2=IN_PROGRESS, 3=COMPLETED, 4=ARCHIVED' })
  @IsInt()
  @IsOptional()
  status?: number;

  @ApiPropertyOptional({ description: 'Дата старта группы' })
  @IsString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Дата окончания группы' })
  @IsString()
  @IsOptional()
  endDate?: string;

  @ApiProperty({ description: 'Дни недели [1, 3] (1=Пн, 2=Вт, 3=Ср...)' })
  @IsArray()
  @IsNotEmpty()
  scheduleDays: number[];

  @ApiProperty({ description: 'Время начала (18:00)' })
  @IsString()
  @IsNotEmpty()
  startTime: string;

  @ApiPropertyOptional({ description: 'Время окончания (19:30)' })
  @IsString()
  @IsOptional()
  endTime?: string;

  @ApiPropertyOptional({ description: 'Заметки / примечания' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ description: 'Автоматически сгенерировать уроки в расписании', default: true })
  @IsBoolean()
  @IsOptional()
  generateLessons?: boolean;
}

export class UpdateGroupDto {
  @ApiPropertyOptional({ description: 'Название группы' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'UUID курса' })
  @IsUUID()
  @IsOptional()
  courseId?: string;

  @ApiPropertyOptional({ description: 'UUID преподавателя' })
  @IsUUID()
  @IsOptional()
  teacherId?: string;

  @ApiPropertyOptional({ description: 'Аудитория / класс' })
  @IsString()
  @IsOptional()
  room?: string;

  @ApiPropertyOptional({ description: 'Макс. количество студентов' })
  @IsInt()
  @IsOptional()
  maxStudents?: number;

  @ApiPropertyOptional({ description: 'Статус группы: 1=RECRUITING, 2=IN_PROGRESS, 3=COMPLETED, 4=ARCHIVED' })
  @IsInt()
  @IsOptional()
  status?: number;

  @ApiPropertyOptional({ description: 'Дата старта группы' })
  @IsString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Дата окончания группы' })
  @IsString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Дни недели [1, 3]' })
  @IsArray()
  @IsOptional()
  scheduleDays?: number[];

  @ApiPropertyOptional({ description: 'Время начала (18:00)' })
  @IsString()
  @IsOptional()
  startTime?: string;

  @ApiPropertyOptional({ description: 'Время окончания (19:30)' })
  @IsString()
  @IsOptional()
  endTime?: string;

  @ApiPropertyOptional({ description: 'Заметки / примечания' })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class AddGroupMemberDto {
  @ApiProperty({ description: 'UUID студента' })
  @IsUUID()
  @IsNotEmpty()
  studentId: string;

  @ApiPropertyOptional({ description: 'UUID бронирования / заказа' })
  @IsUUID()
  @IsOptional()
  bookingId?: string;

  @ApiPropertyOptional({ description: 'Статус в группе: 1=ACTIVE, 2=PAUSED, 3=COMPLETED, 4=DROPPED' })
  @IsInt()
  @IsOptional()
  status?: number;
}
