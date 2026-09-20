/**
 * ============================================================================
 * ATENA SCHOOL — SYSTEM & PLATFORM DICTIONARY REGISTRY
 * ============================================================================
 * @module @atena/backend/features/dictionary/registries/system.registry
 * @description
 * Реестр метаданных для системных и платформенных таблиц:
 * - users (Пользователи и роли RBAC)
 * - app_settings (Динамические настройки JSONB)
 * - notifications (Типы почтовых уведомлений Resend и категории услуг)
 * - contact_messages (Входящие обращения и лиды с сайта)
 * - contact_topics (Темы формы обратной связи)
 * - error_codes (Стандартизированные 5-значные коды ошибок API)
 * - days_of_week (Дни недели ISO 8601)
 * ============================================================================
 */

import {
  USER_ROLE_DICTIONARY,
  APP_SETTINGS_DICTIONARY,
  NOTIFICATION_TYPE_DICTIONARY,
  NOTIFICATION_CHANNEL_DICTIONARY,
  RECIPIENT_TYPE_DICTIONARY,
  NOTIFICATION_STATUS_DICTIONARY,
  ITEM_TYPE_DICTIONARY,
  CONTACT_MESSAGE_STATUS_DICTIONARY,
  CONTACT_TOPIC_DICTIONARY,
  ERROR_CODE_DICTIONARY,
  DAY_OF_WEEK_DICTIONARY,
  UserRole,
  AppSettingKey,
  NotificationType,
  NotificationChannel,
  RecipientType,
  NotificationStatus,
  ItemType,
  ContactMessageStatus,
  ContactTopic,
  ErrorCode,
  DayOfWeek,
} from '@atena/api-types';
import { DictionaryTableDefinition } from './types';

// ----------------------------------------------------------------------------
// 1. Users Table Metadata (RBAC)
// ----------------------------------------------------------------------------

export function getUsersDictionary(): DictionaryTableDefinition {
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

// ----------------------------------------------------------------------------
// 2. App Settings Metadata (JSONB Key-Value)
// ----------------------------------------------------------------------------

export function getAppSettingsDictionary(): DictionaryTableDefinition {
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

// ----------------------------------------------------------------------------
// 3. Notifications & Item Types Metadata
// ----------------------------------------------------------------------------

export function getNotificationsDictionary(): DictionaryTableDefinition {
  const columns = {
    channel: {
      column: 'channel',
      dbType: 'SMALLINT / INTEGER',
      name: 'NotificationChannel',
      description: 'Канал отправки уведомления (1=EMAIL, 2=TELEGRAM)',
      values: NOTIFICATION_CHANNEL_DICTIONARY,
      codes: NotificationChannel,
    },
    recipient_type: {
      column: 'recipient_type',
      dbType: 'SMALLINT / INTEGER',
      name: 'RecipientType',
      description: 'Целевая аудитория шаблона (1=CUSTOMER, 2=ADMIN)',
      values: RECIPIENT_TYPE_DICTIONARY,
      codes: RecipientType,
    },
    type: {
      column: 'type',
      dbType: 'SMALLINT / TEXT',
      name: 'NotificationType',
      description: 'Тип системного уведомления (1=BOOKING_CONFIRMATION..5=CONTACT_FORM)',
      values: NOTIFICATION_TYPE_DICTIONARY,
      codes: NotificationType,
    },
    status: {
      column: 'status',
      dbType: 'SMALLINT / INTEGER',
      name: 'NotificationStatus',
      description: 'Статус доставки уведомления (1=SENT, 2=FAILED)',
      values: NOTIFICATION_STATUS_DICTIONARY,
      codes: NotificationStatus,
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
    table: 'notification_templates',
    title: 'Шаблоны уведомлений и типы услуг',
    description:
      'Реестр шаблонов системных почтовых транзакций (Resend), Telegram-оповещений и категорий услуг.',
    columns,
    enums: columns,
  };
}

// ----------------------------------------------------------------------------
// 4. Contact Messages Metadata
// ----------------------------------------------------------------------------

export function getContactMessagesDictionary(): DictionaryTableDefinition {
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

// ----------------------------------------------------------------------------
// 5. Contact Topics Metadata
// ----------------------------------------------------------------------------

export function getContactTopicsDictionary(): DictionaryTableDefinition {
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

// ----------------------------------------------------------------------------
// 6. Error Codes Metadata
// ----------------------------------------------------------------------------

export function getErrorCodesDictionary(): DictionaryTableDefinition {
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

// ----------------------------------------------------------------------------
// 7. Days of Week Metadata (ISO)
// ----------------------------------------------------------------------------

export function getDaysOfWeekDictionary(): DictionaryTableDefinition {
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
