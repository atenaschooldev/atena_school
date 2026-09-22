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

export class CreateCourseCategoryDto {
  @ApiPropertyOptional({ description: 'Название категории (напр. Corsi di Lingua)' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Уникальный slug категории (напр. languages)' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ description: 'Описание категории' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Порядок сортировки (1, 2, 3...)', example: 1 })
  @IsOptional()
  @IsNumber()
  sort_order?: number;

  @ApiPropertyOptional({ description: 'Порядок сортировки (алиас sortOrder)', example: 1 })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @ApiPropertyOptional({ description: 'Флаг активности категории', example: true })
  @IsOptional()
  is_active?: boolean;

  @ApiPropertyOptional({ description: 'Флаг активности (алиас isActive)', example: true })
  @IsOptional()
  isActive?: boolean;
}

export class UpdateCourseCategoryDto extends CreateCourseCategoryDto {}

export class CreateCourseSettingsDto {
  @ApiPropertyOptional({ description: 'Название пресета настроек (напр. Gruppo Fisso Bisettimanale)' })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Режим проведения: 1=FIXED_SCHEDULE, 2=FLEXIBLE_SCHEDULE, 4=CERTIFICATION',
    example: 1,
  })
  @IsOptional()
  delivery_mode?: number;

  @ApiPropertyOptional({ description: 'Режим проведения (алиас deliveryMode)', example: 1 })
  @IsOptional()
  deliveryMode?: number;

  @ApiPropertyOptional({ description: 'Дни недели занятий (1=Пн..7=Вс)', example: [1, 3] })
  @IsOptional()
  @IsArray()
  schedule_days?: any[];

  @ApiPropertyOptional({ description: 'Дни недели (алиас scheduleDays)', example: [1, 3] })
  @IsOptional()
  @IsArray()
  scheduleDays?: any[];

  @ApiPropertyOptional({ description: 'Время начала урока (HH:MM)', example: '18:00' })
  @IsOptional()
  @IsString()
  start_time?: string;

  @ApiPropertyOptional({ description: 'Время начала (алиас startTime)', example: '18:00' })
  @IsOptional()
  @IsString()
  startTime?: string;

  @ApiPropertyOptional({ description: 'Время окончания урока (HH:MM)', example: '19:30' })
  @IsOptional()
  @IsString()
  end_time?: string;

  @ApiPropertyOptional({ description: 'Время окончания (алиас endTime)', example: '19:30' })
  @IsOptional()
  @IsString()
  endTime?: string;

  @ApiPropertyOptional({ description: 'Длительность одного урока в минутах', example: 60 })
  @IsOptional()
  @IsNumber()
  lesson_duration_minutes?: number;

  @ApiPropertyOptional({ description: 'Длительность урока (алиас lessonDurationMinutes)', example: 60 })
  @IsOptional()
  @IsNumber()
  lessonDurationMinutes?: number;

  @ApiPropertyOptional({ description: 'Количество занятий в неделю', example: 2 })
  @IsOptional()
  @IsNumber()
  lessons_per_week?: number;

  @ApiPropertyOptional({ description: 'Уроков в неделю (алиас lessonsPerWeek)', example: 2 })
  @IsOptional()
  @IsNumber()
  lessonsPerWeek?: number;

  @ApiPropertyOptional({ description: 'Всего уроков в курсе', example: 32 })
  @IsOptional()
  @IsNumber()
  total_lessons?: number;

  @ApiPropertyOptional({ description: 'Всего уроков (алиас totalLessons)', example: 32 })
  @IsOptional()
  @IsNumber()
  totalLessons?: number;

  @ApiPropertyOptional({ description: 'Всего академических часов', example: 48 })
  @IsOptional()
  @IsNumber()
  total_hours?: number;

  @ApiPropertyOptional({ description: 'Всего часов (алиас totalHours)', example: 48 })
  @IsOptional()
  @IsNumber()
  totalHours?: number;

  @ApiPropertyOptional({ description: 'Минимум студентов в группе', example: 3 })
  @IsOptional()
  @IsNumber()
  min_students?: number;

  @ApiPropertyOptional({ description: 'Минимум студентов (алиас minStudents)', example: 3 })
  @IsOptional()
  @IsNumber()
  minStudents?: number;

  @ApiPropertyOptional({ description: 'Максимум студентов в группе', example: 8 })
  @IsOptional()
  @IsNumber()
  max_students?: number;

  @ApiPropertyOptional({ description: 'Максимум студентов (алиас maxStudents)', example: 8 })
  @IsOptional()
  @IsNumber()
  maxStudents?: number;
}

export class UpdateCourseSettingsDto extends CreateCourseSettingsDto {}
