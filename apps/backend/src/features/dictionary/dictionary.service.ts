import { Injectable } from '@nestjs/common';
import {
  BOOKING_PAYMENT_STATUS_DICTIONARY,
  BOOKING_STATUS_DICTIONARY,
  BOOKING_SCHEDULING_STATUS_DICTIONARY,
  PAYMENT_METHOD_DICTIONARY,
  BILLING_SCHEME_DICTIONARY,
  PAYMENT_CURRENCY_DICTIONARY,
  PAYMENT_TYPE_DICTIONARY,
  PAYMENT_RECORD_STATUS_DICTIONARY,
  PAYMENT_PROVIDER_DICTIONARY,
  LESSON_STATUS_DICTIONARY,
  LESSON_ATTENDANCE_DICTIONARY,
  LESSON_LOCATION_TYPE_DICTIONARY,
  APP_SETTINGS_DICTIONARY,
  MEMBERSHIP_STATUS_DICTIONARY,
  STUDENT_STATUS_DICTIONARY,
  LANGUAGE_LEVEL_DICTIONARY,
  COURSE_STATUS_DICTIONARY,
  COURSE_SCHEDULE_TYPE_DICTIONARY,
  COURSE_FORMAT_DICTIONARY,
  COURSE_CATEGORY_DICTIONARY,
  USER_ROLE_DICTIONARY,
  ITEM_TYPE_DICTIONARY,
  NOTIFICATION_TYPE_DICTIONARY,
  ERROR_CODE_DICTIONARY,
  DAY_OF_WEEK_DICTIONARY,
  DISCOUNT_TYPE_DICTIONARY,
  EXAM_CERTIFICATION_TYPE_DICTIONARY,
  CONTACT_TOPIC_DICTIONARY,
  CONTACT_MESSAGE_STATUS_DICTIONARY,
  BookingPaymentStatus,
  BookingStatus,
  BookingSchedulingStatus,
  PaymentMethod,
  BillingScheme,
  PaymentCurrency,
  PaymentType,
  PaymentRecordStatus,
  PaymentProvider,
  LessonStatus,
  LessonAttendance,
  LessonLocationType,
  AppSettingKey,
  MembershipStatus,
  StudentStatus,
  LanguageLevel,
  CourseStatus,
  CourseScheduleType,
  CourseFormat,
  CourseCategory,
  UserRole,
  ItemType,
  NotificationType,
  ErrorCode,
  DayOfWeek,
  DiscountType,
  ExamCertificationType,
  ContactTopic,
  ContactMessageStatus,
} from '@atena/api-types';

import { renderDictionaryHtml } from './dictionary.template';

@Injectable()
export class DictionaryService {
  getBookingsDictionary() {
    const columns = {
      payment_status: {
        column: 'payment_status',
        dbType: 'SMALLINT / INTEGER',
        name: 'BookingPaymentStatus',
        description: 'Статус онлайн/офлайн оплаты бронирования (1=PENDING..7=CANCELLED)',
        values: BOOKING_PAYMENT_STATUS_DICTIONARY,
        codes: BookingPaymentStatus,
      },
      booking_status: {
        column: 'booking_status',
        dbType: 'SMALLINT / INTEGER',
        name: 'BookingStatus',
        description: 'Общий жизненный статус брони (1=ACTIVE, 2=COMPLETED, 3=CANCELLED)',
        values: BOOKING_STATUS_DICTIONARY,
        codes: BookingStatus,
      },
      scheduling_status: {
        column: 'scheduling_status',
        dbType: 'SMALLINT / INTEGER',
        name: 'BookingSchedulingStatus',
        description: 'Статус согласования расписания занятий (1=SCHEDULED, 2=PENDING_COORDINATION)',
        values: BOOKING_SCHEDULING_STATUS_DICTIONARY,
        codes: BookingSchedulingStatus,
      },
      payment_method: {
        column: 'payment_method',
        dbType: 'SMALLINT / INTEGER',
        name: 'PaymentMethod',
        description: 'Выбранный клиентом способ оплаты курса (1=STRIPE..4=BANK_TRANSFER)',
        values: PAYMENT_METHOD_DICTIONARY,
        codes: PaymentMethod,
      },
      billing_scheme: {
        column: 'billing_scheme',
        dbType: 'SMALLINT / INTEGER',
        name: 'BillingScheme',
        description: 'Схема оплаты курса (1=FULL, 2=INSTALLMENTS, 3=PER_LESSON)',
        values: BILLING_SCHEME_DICTIONARY,
        codes: BillingScheme,
      },
    };

    return {
      table: 'bookings',
      title: 'Бронирования и заявки на курсы',
      description:
        'Основная таблица заказов и бронирований. Содержит данные плательщика, студента, выбранный курс, сумму, скидки и статусы.',
      columns,
      enums: columns,
    };
  }

  getPaymentsDictionary() {
    const columns = {
      currency: {
        column: 'currency',
        dbType: 'SMALLINT / INTEGER',
        name: 'PaymentCurrency',
        description: 'Валюта платежной транзакции (1=EUR, 2=USD, 3=GBP)',
        values: PAYMENT_CURRENCY_DICTIONARY,
        codes: PaymentCurrency,
      },
      payment_method: {
        column: 'payment_method',
        dbType: 'SMALLINT / INTEGER',
        name: 'PaymentMethod',
        description: 'Фактический платежный инструмент (1=STRIPE..4=BANK_TRANSFER)',
        values: PAYMENT_METHOD_DICTIONARY,
        codes: PaymentMethod,
      },
      type: {
        column: 'type',
        dbType: 'SMALLINT / INTEGER',
        name: 'PaymentType',
        description: 'Бухгалтерский тип платежа (1=COURSE_PAYMENT, 2=REGISTRATION_FEE (€30)..8=OTHER)',
        values: PAYMENT_TYPE_DICTIONARY,
        codes: PaymentType,
      },
      status: {
        column: 'status',
        dbType: 'SMALLINT / INTEGER',
        name: 'PaymentRecordStatus',
        description: 'Статус финансовой транзакции (1=PENDING, 2=SUCCEEDED..6=CANCELLED)',
        values: PAYMENT_RECORD_STATUS_DICTIONARY,
        codes: PaymentRecordStatus,
      },
      provider: {
        column: 'provider',
        dbType: 'SMALLINT / INTEGER',
        name: 'PaymentProvider',
        description: 'Платежный провайдер / шлюз (1=STRIPE, 2=MANUAL, 3=POS, 4=BANK)',
        values: PAYMENT_PROVIDER_DICTIONARY,
        codes: PaymentProvider,
      },
    };

    return {
      table: 'payments',
      title: 'Платежи и транзакции',
      description:
        'Финансовая таблица бухгалтерских записей и проводок по бронированиям и студентам. Каждый курс генерирует 2 записи: оплату курса (type=1) и членский взнос €30 (type=2).',
      columns,
      enums: columns,
    };
  }

  getLessonsDictionary() {
    const columns = {
      status: {
        column: 'status',
        dbType: 'SMALLINT / INTEGER',
        name: 'LessonStatus',
        description: 'Статус жизненного цикла урока (1=SCHEDULED, 2=COMPLETED, 3=CANCELLED, 4=RESCHEDULED)',
        values: LESSON_STATUS_DICTIONARY,
        codes: LessonStatus,
      },
      attendance: {
        column: 'attendance',
        dbType: 'SMALLINT / INTEGER',
        name: 'LessonAttendance',
        description: 'Факт посещения студентом урока (1=PENDING, 2=PRESENT, 3=ABSENT, 4=LATE, 5=EXCUSED)',
        values: LESSON_ATTENDANCE_DICTIONARY,
        codes: LessonAttendance,
      },
      location_type: {
        column: 'location_type',
        dbType: 'SMALLINT / INTEGER',
        name: 'LessonLocationType',
        description: 'Формат проведения урока (1=IN_PERSON, 2=ONLINE, 3=HYBRID)',
        values: LESSON_LOCATION_TYPE_DICTIONARY,
        codes: LessonLocationType,
      },
    };

    return {
      table: 'lessons',
      title: 'Уроки и расписание',
      description:
        'Таблица запланированных уроков, привязанных к бронированиям. Хранит дату/время, статус урока, факт посещения, тип проведения и ссылки на преподавателей.',
      columns,
      enums: columns,
    };
  }

  getCoursesDictionary() {
    const columns = {
      status: {
        column: 'status',
        dbType: 'SMALLINT / INTEGER',
        name: 'CourseStatus',
        description: 'Статус курса в каталоге (1=ACTIVE, 2=DRAFT, 3=ARCHIVED)',
        values: COURSE_STATUS_DICTIONARY,
        codes: CourseStatus,
      },
      schedule_type: {
        column: 'schedule_type',
        dbType: 'SMALLINT / INTEGER',
        name: 'CourseScheduleType',
        description: 'Тип расписания занятий (1=FIXED, 2=FLEXIBLE)',
        values: COURSE_SCHEDULE_TYPE_DICTIONARY,
        codes: CourseScheduleType,
      },
      course_format: {
        column: 'course_format',
        dbType: 'SMALLINT / INTEGER',
        name: 'CourseFormat',
        description: 'Формат проведения курса (1=GROUP, 2=INDIVIDUAL, 3=ONLINE, 4=CERTIFICATION)',
        values: COURSE_FORMAT_DICTIONARY,
        codes: CourseFormat,
      },
      category: {
        column: 'category',
        dbType: 'TEXT / SMALLINT',
        name: 'CourseCategory',
        description: 'Предметная категория курса (1=LANGUAGES, 2=ACADEMIC, 3=CERTIPASS, 4=OTHER)',
        values: COURSE_CATEGORY_DICTIONARY,
        codes: CourseCategory,
      },
    };

    return {
      table: 'courses',
      title: 'Курсы и программы обучения',
      description:
        'Каталог курсов языковой школы Atena: индивидуальные и групповые курсы, онлайн-программы и курсы сертификации Certipass/Cambridge.',
      columns,
      enums: columns,
    };
  }

  getAnnualMembershipsDictionary() {
    const columns = {
      status: {
        column: 'status',
        dbType: 'SMALLINT / INTEGER',
        name: 'MembershipStatus',
        description: 'Статус членства ассоциации (1=ACTIVE, 2=PENDING, 3=EXPIRED, 4=REVOKED)',
        values: MEMBERSHIP_STATUS_DICTIONARY,
        codes: MembershipStatus,
      },
    };

    return {
      table: 'annual_memberships',
      title: 'Годовые членские взносы (Tessere)',
      description:
        'Таблица членских карт ассоциации школы (€30 за учебный год). Автоматически активируется при оплате взноса и действует до 31 августа текущего учебного года.',
      columns,
      enums: columns,
    };
  }

  getStudentsDictionary() {
    const columns = {
      status: {
        column: 'status',
        dbType: 'SMALLINT / INTEGER',
        name: 'StudentStatus',
        description: 'Статус студента в реестре школы (1=ACTIVE, 2=INACTIVE, 3=PAUSED, 4=GRADUATED, 5=ARCHIVED)',
        values: STUDENT_STATUS_DICTIONARY,
        codes: StudentStatus,
      },
      language_level: {
        column: 'language_level',
        dbType: 'SMALLINT / INTEGER',
        name: 'LanguageLevel',
        description: 'Уровень владения языком по шкале CEFR (1=A1..6=C2)',
        values: LANGUAGE_LEVEL_DICTIONARY,
        codes: LanguageLevel,
      },
    };

    return {
      table: 'students',
      title: 'Студенты (Реестр учеников)',
      description:
        'Основная таблица студентов языковой школы Atena. Хранит персональные данные, уровень языка по CEFR, статус обучения и статус оплаты годового взноса.',
      columns,
      enums: columns,
    };
  }

  getAppSettingsDictionary() {
    const columns = {
      key: {
        column: 'key',
        dbType: 'TEXT PRIMARY KEY',
        name: 'AppSettingKey',
        description: 'Уникальный ключ системной настройки приложения (JSONB Key-Value)',
        values: APP_SETTINGS_DICTIONARY,
        codes: AppSettingKey,
      },
    };

    return {
      table: 'app_settings',
      title: 'Системные настройки (App Settings)',
      description:
        'Таблица глобальных динамических параметров платформы (JSONB Key-Value). Управляет переключателями платежных шлюзов, интеграциями и системными режимами.',
      columns,
      enums: columns,
    };
  }

  getUsersDictionary() {
    const columns = {
      role: {
        column: 'role',
        dbType: 'SMALLINT / INTEGER',
        name: 'UserRole',
        description: 'Системная роль пользователя (1=STUDENT, 2=TEACHER, 3=ADMIN, 4=PARENT, 5=SECRETARY, 6=SUPERADMIN)',
        values: USER_ROLE_DICTIONARY,
        codes: UserRole,
      },
    };

    return {
      table: 'users',
      title: 'Пользователи и права доступа (Users)',
      description:
        'Таблица учетных записей платформы. Определяет доступ к личному кабинету студента, панели преподавателя или CRM администратора.',
      columns,
      enums: columns,
    };
  }

  getContactMessagesDictionary() {
    const columns = {
      status: {
        column: 'status',
        dbType: 'SMALLINT / INTEGER',
        name: 'ContactMessageStatus',
        description: 'Статус обработки входящего обращения/лида (1=NEW, 2=IN_PROGRESS, 3=RESOLVED, 4=ARCHIVED)',
        values: CONTACT_MESSAGE_STATUS_DICTIONARY,
        codes: ContactMessageStatus,
      },
    };

    return {
      table: 'contact_messages',
      title: 'Входящие обращения и лиды (Contact Messages)',
      description: 'Таблица входящих сообщений с веб-формы обратной связи для обработки секретариатом.',
      columns,
      enums: columns,
    };
  }

  getNotificationsDictionary() {
    const columns = {
      type: {
        column: 'type',
        dbType: 'SMALLINT / TEXT',
        name: 'NotificationType',
        description: 'Тип системного уведомления (1=BOOKING_CONFIRMATION..5=CONTACT_FORM)',
        values: NOTIFICATION_TYPE_DICTIONARY,
        codes: NotificationType,
      },
      item_type: {
        column: 'item_type',
        dbType: 'SMALLINT / TEXT',
        name: 'ItemType',
        description: 'Тип бронируемой услуги/товара (1=COURSE, 2=SINGLE_LESSON, 3=PACKAGE, 4=CERTIFICATION)',
        values: ITEM_TYPE_DICTIONARY,
        codes: ItemType,
      },
    };

    return {
      table: 'notifications',
      title: 'Системные уведомления и типы услуг',
      description:
        'Реестр типов системных почтовых транзакций (Resend) и категорий реализуемых образовательных услуг.',
      columns,
      enums: columns,
    };
  }

  getErrorCodesDictionary() {
    const columns = {
      code: {
        column: 'error_code',
        dbType: 'INTEGER (5 DIGITS)',
        name: 'ErrorCode',
        description: 'Системный код ошибки API (400xx=Validation, 401xx=Auth, 404xx=NotFound, 409xx=Conflict, 402xx=Payment, 500xx=Server)',
        values: ERROR_CODE_DICTIONARY,
        codes: ErrorCode,
      },
    };

    return {
      table: 'error_codes',
      title: 'Коды системных ошибок API (Error Codes)',
      description:
        'Стандартизированные 5-значные числовые коды ошибок для всех REST эндпоинтов и клиентских приложений.',
      columns,
      enums: columns,
    };
  }

  getDaysOfWeekDictionary() {
    const columns = {
      day_of_week: {
        column: 'day_of_week',
        dbType: 'SMALLINT / INTEGER (1..7)',
        name: 'DayOfWeek',
        description: 'Дни недели по стандарту ISO (1=MONDAY .. 7=SUNDAY)',
        values: DAY_OF_WEEK_DICTIONARY,
        codes: DayOfWeek,
      },
    };

    return {
      table: 'days_of_week',
      title: 'Дни недели (ISO)',
      description: 'Числовые идентификаторы дней недели для расписания и планирования занятий.',
      columns,
      enums: columns,
    };
  }

  getDiscountsDictionary() {
    const columns = {
      discount_type: {
        column: 'discount_type',
        dbType: 'SMALLINT / INTEGER',
        name: 'DiscountType',
        description: 'Тип применяемой скидки к курсу (1=PERCENTAGE, 2=FIXED_AMOUNT, 3=SIBLING_DISCOUNT, 4=EARLY_BIRD)',
        values: DISCOUNT_TYPE_DICTIONARY,
        codes: DiscountType,
      },
    };

    return {
      table: 'discounts',
      title: 'Скидки и промо-акции',
      description: 'Типы скидок и специальных предложений для студентов и семей.',
      columns,
      enums: columns,
    };
  }

  getCertificationsDictionary() {
    const columns = {
      certification_type: {
        column: 'certification_type',
        dbType: 'SMALLINT / INTEGER',
        name: 'ExamCertificationType',
        description: 'Тип официального экзамена / сертификации (1=CAMBRIDGE..6=GOETHE)',
        values: EXAM_CERTIFICATION_TYPE_DICTIONARY,
        codes: ExamCertificationType,
      },
    };

    return {
      table: 'exam_certifications',
      title: 'Экзамены и сертификации',
      description: 'Международные языковые и IT-сертификации (Cambridge, IELTS, TOEFL, Certipass EIPASS, DELF/DALF, Goethe).',
      columns,
      enums: columns,
    };
  }

  getContactTopicsDictionary() {
    const columns = {
      topic: {
        column: 'topic',
        dbType: 'SMALLINT / INTEGER',
        name: 'ContactTopic',
        description: 'Тема обращения через форму обратной связи (1=GENERAL_INFO..6=OTHER)',
        values: CONTACT_TOPIC_DICTIONARY,
        codes: ContactTopic,
      },
    };

    return {
      table: 'contact_topics',
      title: 'Темы контактной формы',
      description: 'Категории входящих обращений и заявок с лендинга.',
      columns,
      enums: columns,
    };
  }

  getAll() {
    return {
      version: '1.8.0',
      description: 'Централизованный словарь перечислений и системных настроек Atena School',
      tables: {
        bookings: this.getBookingsDictionary(),
        payments: this.getPaymentsDictionary(),
        lessons: this.getLessonsDictionary(),
        courses: this.getCoursesDictionary(),
        students: this.getStudentsDictionary(),
        annual_memberships: this.getAnnualMembershipsDictionary(),
        users: this.getUsersDictionary(),
        contact_messages: this.getContactMessagesDictionary(),
        notifications: this.getNotificationsDictionary(),
        app_settings: this.getAppSettingsDictionary(),
        error_codes: this.getErrorCodesDictionary(),
        days_of_week: this.getDaysOfWeekDictionary(),
        discounts: this.getDiscountsDictionary(),
        exam_certifications: this.getCertificationsDictionary(),
        contact_topics: this.getContactTopicsDictionary(),
      },
    };
  }

  renderHtml(): string {
    return renderDictionaryHtml(this.getAll());
  }
}
