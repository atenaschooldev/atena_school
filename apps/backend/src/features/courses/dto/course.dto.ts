import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';
import { CourseStatus, CourseScheduleType, CourseFormat, CourseBillingType, CourseDeliveryMode, CourseSettingsItem } from '@atena/api-types';

export class CreateCourseDto {
  @ApiPropertyOptional({
    description: 'Режим проведения/настройки курса: 1=FIXED_SCHEDULE, 2=FLEXIBLE_SCHEDULE, 4=CERTIFICATION',
    enum: CourseDeliveryMode,
    example: CourseDeliveryMode.FIXED_SCHEDULE,
  })
  @IsOptional()
  deliveryMode?: CourseDeliveryMode | number;

  @ApiPropertyOptional({ description: 'Режим проведения (алиас delivery_mode)' })
  @IsOptional()
  delivery_mode?: number;

  @ApiPropertyOptional({ description: 'ID пресета/настроек курса из таблицы course_settings (UUID)' })
  @IsOptional()
  @IsString()
  settingsId?: string;

  @ApiPropertyOptional({ description: 'ID пресета/настроек курса (алиас settings_id)' })
  @IsOptional()
  @IsString()
  settings_id?: string;

  @ApiPropertyOptional({ description: 'Конфигурация курса (настройки расписания, длительности, лимитов)' })
  @IsOptional()
  settings?: Partial<CourseSettingsItem>;
  @ApiPropertyOptional({
    description: 'Формат оплаты курса: 1=ONE_TIME_ONLY (только разово), 2=SUBSCRIPTION_ONLY (только подписка), 3=BOTH (разово или по подписке)',
    enum: CourseBillingType,
    example: CourseBillingType.BOTH,
    default: CourseBillingType.ONE_TIME_ONLY,
  })
  @IsOptional()
  billingType?: CourseBillingType | number;

  @ApiPropertyOptional({ description: 'Формат оплаты курса (алиас billing_type)' })
  @IsOptional()
  billing_type?: number;

  @ApiPropertyOptional({ description: 'Стоимость ежемесячной подписки в EUR', example: 73.2 })
  @IsOptional()
  @IsNumber()
  subscriptionPrice?: number;

  @ApiPropertyOptional({ description: 'Стоимость подписки (алиас subscription_price)', example: 73.2 })
  @IsOptional()
  @IsNumber()
  subscription_price?: number;

  @ApiPropertyOptional({ description: 'Stripe Price ID для ежемесячной подписки', example: 'price_1Qxyz...' })
  @IsOptional()
  @IsString()
  stripeMonthlyPriceId?: string;

  @ApiPropertyOptional({ description: 'Stripe Price ID (алиас stripe_monthly_price_id)' })
  @IsOptional()
  @IsString()
  stripe_monthly_price_id?: string;

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

  @ApiPropertyOptional({ description: 'ID категории из таблицы course_categories (UUID)', example: '00000000-0000-0000-0001-000000000001' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'ID категории (алиас category_id)' })
  @IsOptional()
  @IsString()
  category_id?: string;

  @ApiPropertyOptional({ description: 'Список назначенных преподавателей с ролями' })
  @IsOptional()
  @IsArray()
  teachers?: Array<{
    teacherId?: string;
    teacher_id?: string;
    role?: number;
    isPrimary?: boolean;
    is_primary?: boolean;
  }>;

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
