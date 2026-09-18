import { DictionaryEntry } from '../common/dictionary.types';

export const MembershipStatus = {
  ACTIVE: 1,  // Active and valid membership
  PENDING: 2, // Awaiting payment or confirmation
  EXPIRED: 3, // Membership term has ended
  REVOKED: 4, // Revoked / cancelled by admin
} as const;
export type MembershipStatus = (typeof MembershipStatus)[keyof typeof MembershipStatus];

export const MEMBERSHIP_STATUS_DICTIONARY: Record<MembershipStatus, DictionaryEntry> = {
  [MembershipStatus.ACTIVE]: {
    id: 1,
    code: 'ACTIVE',
    label_it: 'Attivo',
    label_en: 'Active',
    label_ru: 'Активно',
    description: 'Членство в ассоциации активно и действительно на текущий учебный год',
  },
  [MembershipStatus.PENDING]: {
    id: 2,
    code: 'PENDING',
    label_it: 'In attesa',
    label_en: 'Pending',
    label_ru: 'В ожидании',
    description: 'Членство ожидает подтверждения или фактического поступления оплаты взноса',
  },
  [MembershipStatus.EXPIRED]: {
    id: 3,
    code: 'EXPIRED',
    label_it: 'Scaduto',
    label_en: 'Expired',
    label_ru: 'Истекло',
    description: 'Срок действия членской карты истек (завершился учебный год)',
  },
  [MembershipStatus.REVOKED]: {
    id: 4,
    code: 'REVOKED',
    label_it: 'Revocato',
    label_en: 'Revoked',
    label_ru: 'Отозвано',
    description: 'Членство аннулировано или отозвано администрацией школы',
  },
};

export function parseMembershipStatus(val: any): MembershipStatus {
  if (typeof val === 'number') {
    if (val >= 1 && val <= 4) return val as MembershipStatus;
    return MembershipStatus.ACTIVE;
  }
  const s = String(val || '').toLowerCase().trim();
  if (s === '1' || s === 'active' || s === 'attivo' || s === 'valid') return MembershipStatus.ACTIVE;
  if (s === '2' || s === 'pending' || s === 'in_attesa' || s === 'in attesa') return MembershipStatus.PENDING;
  if (s === '3' || s === 'expired' || s === 'scaduto') return MembershipStatus.EXPIRED;
  if (s === '4' || s === 'revoked' || s === 'cancelled' || s === 'revocato' || s === 'annullato') return MembershipStatus.REVOKED;
  return MembershipStatus.ACTIVE;
}
