import { DictionaryEntry } from '../common/dictionary.types';

export const ItemType = {
  COURSE: 1,
  SINGLE_LESSON: 2,
  PACKAGE: 3,
  CERTIFICATION: 4,
} as const;
export type ItemType = (typeof ItemType)[keyof typeof ItemType];

export const ITEM_TYPE_DICTIONARY: Record<ItemType, DictionaryEntry> = {
  [ItemType.COURSE]: {
    id: 1,
    code: 'COURSE',
    label_it: 'Corso Standard',
    label_en: 'Standard Course',
    label_ru: 'Стандартный курс',
    description: 'Регулярный групповой или индивидуальный курс школы',
  },
  [ItemType.SINGLE_LESSON]: {
    id: 2,
    code: 'SINGLE_LESSON',
    label_it: 'Lezione Singola',
    label_en: 'Single Lesson',
    label_ru: 'Разовое занятие',
    description: 'Однократный индивидуальный урок или консультация',
  },
  [ItemType.PACKAGE]: {
    id: 3,
    code: 'PACKAGE',
    label_it: 'Pacchetto Ore / Lezioni',
    label_en: 'Hour / Lesson Package',
    label_ru: 'Пакет занятий',
    description: 'Блок уроков (например, 10 или 20 часов)',
  },
  [ItemType.CERTIFICATION]: {
    id: 4,
    code: 'CERTIFICATION',
    label_it: 'Esame di Certificazione',
    label_en: 'Certification Exam',
    label_ru: 'Сертификационный экзамен',
    description: 'Экзаменационный ваучер / сессия (EIPASS, Cambridge)',
  },
};

export function parseItemType(val: any): ItemType {
  if (typeof val === 'number') {
    if (val >= 1 && val <= 4) return val as ItemType;
    return ItemType.COURSE;
  }
  const s = String(val || '').toLowerCase().trim();
  if (s === '1' || s === 'course' || s === 'corso') return ItemType.COURSE;
  if (s === '2' || s === 'lesson' || s === 'lezione' || s === 'single') return ItemType.SINGLE_LESSON;
  if (s === '3' || s === 'package' || s === 'pacchetto') return ItemType.PACKAGE;
  if (s === '4' || s === 'certification' || s === 'certificazione' || s === 'shop') return ItemType.CERTIFICATION;
  return ItemType.COURSE;
}

export const NotificationType = {
  BOOKING_CONFIRMATION: 1,
  PAYMENT_RECEIPT: 2,
  PAYMENT_REMINDER: 3,
  MEMBERSHIP_CARD: 4,
  CONTACT_FORM: 5,
} as const;
export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];

export const NOTIFICATION_TYPE_DICTIONARY: Record<NotificationType, DictionaryEntry> = {
  [NotificationType.BOOKING_CONFIRMATION]: {
    id: 1,
    code: 'BOOKING_CONFIRMATION',
    label_it: 'Conferma Prenotazione',
    label_en: 'Booking Confirmation',
    label_ru: 'Подтверждение бронирования',
    description: 'Уведомление клиенту и школе об успешной записи на курс',
  },
  [NotificationType.PAYMENT_RECEIPT]: {
    id: 2,
    code: 'PAYMENT_RECEIPT',
    label_it: 'Ricevuta di Pagamento',
    label_en: 'Payment Receipt',
    label_ru: 'Квитанция об оплате',
    description: 'Финансовая квитанция с детализацией курса и взноса €30',
  },
  [NotificationType.PAYMENT_REMINDER]: {
    id: 3,
    code: 'PAYMENT_REMINDER',
    label_it: 'Promemoria Saldo',
    label_en: 'Payment Reminder',
    label_ru: 'Напоминание об оплате',
    description: 'Напоминание о необходимости доплаты в секретариате',
  },
  [NotificationType.MEMBERSHIP_CARD]: {
    id: 4,
    code: 'MEMBERSHIP_CARD',
    label_it: 'Tessera Associativa',
    label_en: 'Membership Card',
    label_ru: 'Членская карта',
    description: 'Подтверждение членства ассоциации на учебный год',
  },
  [NotificationType.CONTACT_FORM]: {
    id: 5,
    code: 'CONTACT_FORM',
    label_it: 'Richiesta di Contatto',
    label_en: 'Contact Request',
    label_ru: 'Заявка с сайта',
    description: 'Сообщение из формы обратной связи лендинга',
  },
};
