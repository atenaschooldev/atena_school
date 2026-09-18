/**
 * ============================================================================
 * ATENA SCHOOL — SYSTEM ERROR CODES (REST API & FRONTEND)
 * ============================================================================
 * @module @atena/api-types/common/error-codes
 * @description
 * 5-значные числовые коды ошибок REST API.
 * Структура кода:
 * - 400xx: Ошибки валидации входных параметров (DTO / Zod)
 * - 401xx: Ошибки аутентификации и сессий (JWT, Magic Link)
 * - 402xx: Ошибки финансовых платежей и взносов (Stripe, Reception)
 * - 403xx: Ошибки авторизации и прав доступа (RBAC)
 * - 404xx: Сущность не найдена в базе данных
 * - 409xx: Конфликты состояния, расписания и дубликаты
 * - 500xx: Внутренние непредвиденные ошибки сервера
 * - 503xx: Временная недоступность внешних сервисов (Stripe, Resend, Supabase)
 * ============================================================================
 */

import { DictionaryEntry } from './dictionary.types';

export const ErrorCode = {
  // --------------------------------------------------------------------------
  // 1. Validation Errors (400xx / 422xx)
  // --------------------------------------------------------------------------
  VALIDATION_ERROR: 40001,
  INVALID_TAX_CODE: 42201,
  INVALID_PHONE: 42202,
  INVALID_EMAIL: 42203,
  INVALID_BIRTH_DATE: 42204,
  INVALID_SDI_OR_PEC: 42205,

  // --------------------------------------------------------------------------
  // 2. Auth & Permissions (401xx / 403xx)
  // --------------------------------------------------------------------------
  UNAUTHORIZED: 40101,
  TOKEN_EXPIRED: 40102,
  FORBIDDEN: 40301,

  // --------------------------------------------------------------------------
  // 3. Resource & Availability (404xx / 409xx)
  // --------------------------------------------------------------------------
  NOT_FOUND: 40401,
  COURSE_NOT_FOUND: 40402,
  STUDENT_NOT_FOUND: 40403,
  SLOT_UNAVAILABLE: 40901,
  COURSE_FULL: 40902,
  DUPLICATE_ENTRY: 40903,

  // --------------------------------------------------------------------------
  // 4. Payment & Memberships (402xx)
  // --------------------------------------------------------------------------
  PAYMENT_REQUIRED: 40201,
  PAYMENT_FAILED: 40202,
  STRIPE_ERROR: 40203,
  FEE_NOT_PAID: 40204,

  // --------------------------------------------------------------------------
  // 5. Server & Infrastructure (500xx / 503xx)
  // --------------------------------------------------------------------------
  INTERNAL_SERVER_ERROR: 50001,
  SERVICE_UNAVAILABLE: 50301,
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

export const ERROR_CODE_DICTIONARY: Record<ErrorCode, DictionaryEntry> = {
  [ErrorCode.VALIDATION_ERROR]: {
    id: 40001,
    code: 'VALIDATION_ERROR',
    label_it: 'Errore di validazione',
    label_en: 'Validation error',
    label_ru: 'Ошибка валидации полей запроса',
    description: 'Переданные в запросе данные не соответствуют схеме DTO / Zod',
  },
  [ErrorCode.INVALID_TAX_CODE]: {
    id: 42201,
    code: 'INVALID_TAX_CODE',
    label_it: 'Codice Fiscale non valido',
    label_en: 'Invalid Tax Code',
    label_ru: 'Некорректный налоговый код (Codice Fiscale)',
    description: 'Формат Codice Fiscale или Partita IVA не прошел проверку регулярного выражения',
  },
  [ErrorCode.INVALID_PHONE]: {
    id: 42202,
    code: 'INVALID_PHONE',
    label_it: 'Numero di telefono non valido',
    label_en: 'Invalid phone number',
    label_ru: 'Некорректный номер телефона',
    description: 'Номер телефона не соответствует формату E.164 или итальянскому стандарту',
  },
  [ErrorCode.INVALID_EMAIL]: {
    id: 42203,
    code: 'INVALID_EMAIL',
    label_it: 'Email non valida',
    label_en: 'Invalid email address',
    label_ru: 'Некорректный адрес электронной почты',
    description: 'Синтаксис почтового адреса не прошел валидацию',
  },
  [ErrorCode.INVALID_BIRTH_DATE]: {
    id: 42204,
    code: 'INVALID_BIRTH_DATE',
    label_it: 'Data di nascita non valida',
    label_en: 'Invalid birth date',
    label_ru: 'Некорректная дата рождения',
    description: 'Дата рождения должна быть в прошлом и не старше 100 лет',
  },
  [ErrorCode.INVALID_SDI_OR_PEC]: {
    id: 42205,
    code: 'INVALID_SDI_OR_PEC',
    label_it: 'Codice SDI o PEC mancante',
    label_en: 'Missing SDI code or PEC email',
    label_ru: 'Отсутствует код SDI или PEC для фактуры',
    description: 'Для выставления электронной фактуры юрлицу необходим 7-значный код SDI или PEC email',
  },
  [ErrorCode.UNAUTHORIZED]: {
    id: 40101,
    code: 'UNAUTHORIZED',
    label_it: 'Non autorizzato',
    label_en: 'Unauthorized',
    label_ru: 'Требуется аутентификация',
    description: 'JWT токен отсутствует или является недействительным',
  },
  [ErrorCode.FORBIDDEN]: {
    id: 40301,
    code: 'FORBIDDEN',
    label_it: 'Accesso negato',
    label_en: 'Forbidden',
    label_ru: 'Доступ запрещен',
    description: 'У пользователя недостаточно прав для выполнения операции (RBAC)',
  },
  [ErrorCode.TOKEN_EXPIRED]: {
    id: 40102,
    code: 'TOKEN_EXPIRED',
    label_it: 'Sessione scaduta',
    label_en: 'Token expired',
    label_ru: 'Срок действия сессии истек',
    description: 'Необходимо обновить токен доступа или войти повторно',
  },
  [ErrorCode.NOT_FOUND]: {
    id: 40401,
    code: 'NOT_FOUND',
    label_it: 'Risorsa non trovata',
    label_en: 'Resource not found',
    label_ru: 'Запрашиваемый ресурс не найден',
    description: 'Сущность с указанным идентификатором отсутствует в базе данных',
  },
  [ErrorCode.COURSE_NOT_FOUND]: {
    id: 40402,
    code: 'COURSE_NOT_FOUND',
    label_it: 'Corso non trovato',
    label_en: 'Course not found',
    label_ru: 'Курс не найден',
    description: 'Курс с указанным ID или slug не существует или неактивен',
  },
  [ErrorCode.STUDENT_NOT_FOUND]: {
    id: 40403,
    code: 'STUDENT_NOT_FOUND',
    label_it: 'Studente non trovato',
    label_en: 'Student not found',
    label_ru: 'Студент не найден',
    description: 'Профиль студента не найден по указанным критериям поиска',
  },
  [ErrorCode.SLOT_UNAVAILABLE]: {
    id: 40901,
    code: 'SLOT_UNAVAILABLE',
    label_it: 'Orario non disponibile',
    label_en: 'Slot unavailable',
    label_ru: 'Выбранный слот расписания недоступен',
    description: 'Преподаватель или аудитория уже заняты на выбранное время',
  },
  [ErrorCode.COURSE_FULL]: {
    id: 40902,
    code: 'COURSE_FULL',
    label_it: 'Corso al completo',
    label_en: 'Course full',
    label_ru: 'Группа курса полностью укомплектована',
    description: 'Достигнут максимальный лимит студентов в группе',
  },
  [ErrorCode.DUPLICATE_ENTRY]: {
    id: 40903,
    code: 'DUPLICATE_ENTRY',
    label_it: 'Elemento duplicato',
    label_en: 'Duplicate entry',
    label_ru: 'Дубликат записи',
    description: 'Запись с такими уникальными данными (email, tax_code) уже существует',
  },
  [ErrorCode.PAYMENT_REQUIRED]: {
    id: 40201,
    code: 'PAYMENT_REQUIRED',
    label_it: 'Pagamento richiesto',
    label_en: 'Payment required',
    label_ru: 'Требуется оплата',
    description: 'Для завершения действия требуется подтверждение финансовой транзакции',
  },
  [ErrorCode.PAYMENT_FAILED]: {
    id: 40202,
    code: 'PAYMENT_FAILED',
    label_it: 'Pagamento non riuscito',
    label_en: 'Payment failed',
    label_ru: 'Платеж отклонен',
    description: 'Транзакция была отклонена банком или платежным шлюзом',
  },
  [ErrorCode.STRIPE_ERROR]: {
    id: 40203,
    code: 'STRIPE_ERROR',
    label_it: 'Errore Stripe',
    label_en: 'Stripe gateway error',
    label_ru: 'Ошибка шлюза Stripe',
    description: 'Сбой при взаимодействии со Stripe Checkout или API подписок',
  },
  [ErrorCode.FEE_NOT_PAID]: {
    id: 40204,
    code: 'FEE_NOT_PAID',
    label_it: 'Quota associativa non saldata',
    label_en: 'Annual fee unpaid',
    label_ru: 'Ежегодный взнос €30 не оплачен',
    description: 'У студента отсутствует действующий ежегодный членский взнос на текущий учебный год',
  },
  [ErrorCode.INTERNAL_SERVER_ERROR]: {
    id: 50001,
    code: 'INTERNAL_SERVER_ERROR',
    label_it: 'Errore interno del server',
    label_en: 'Internal server error',
    label_ru: 'Внутренняя ошибка сервера',
    description: 'Непредвиденное исключение при обработке запроса на стороне сервера',
  },
  [ErrorCode.SERVICE_UNAVAILABLE]: {
    id: 50301,
    code: 'SERVICE_UNAVAILABLE',
    label_it: 'Servizio non disponibile',
    label_en: 'Service unavailable',
    label_ru: 'Сервис временно недоступен',
    description: 'Внешний сервис (Stripe, Resend, Supabase) временно недоступен',
  },
};
