import {
  USER_ROLE_DICTIONARY,
  APP_SETTINGS_DICTIONARY,
  NOTIFICATION_TYPE_DICTIONARY,
  ITEM_TYPE_DICTIONARY,
  CONTACT_MESSAGE_STATUS_DICTIONARY,
  CONTACT_TOPIC_DICTIONARY,
  ERROR_CODE_DICTIONARY,
  DAY_OF_WEEK_DICTIONARY,
  UserRole,
  AppSettingKey,
  NotificationType,
  ItemType,
  ContactMessageStatus,
  ContactTopic,
  ErrorCode,
  DayOfWeek,
} from '@atena/api-types';
import { DictionaryTableDefinition } from './types';

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

export function getNotificationsDictionary(): DictionaryTableDefinition {
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
