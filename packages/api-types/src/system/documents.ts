/**
 * ============================================================================
 * ATENA SCHOOL — SYSTEM / DOCUMENTS DOMAIN
 * ============================================================================
 * @module @atena/api-types/system/documents
 * @description
 * Complete type definitions, numeric enums, and dictionaries for the Atena School Documents Module:
 * - DocumentCategoryType: 1=STUDENT_CONTRACTS, 2=TEACHER_CONTRACTS, 3=FINANCIAL, 4=LEGAL_AND_PRIVACY, 5=CERTIFICATES, 6=ADMINISTRATIVE
 * - DocumentType: 1=REGISTRATION_CONTRACT, 2=TEACHER_CONTRACT, 3=PAYMENT_RECEIPT, 4=MINOR_PICKUP_DELEGATION, 5=PRIVACY_GDPR, 6=COURSE_CERTIFICATE, 7=ATTENDANCE_ATTESTATION, 8=CUSTOM_DOCUMENT
 * - DocumentTemplateType: 1=MODULO_ISCRIZIONE_STANDARD, 2=CONTRATTO_DOCENTE_ORARIO, 3=RICEVUTA_PAGAMENTO_STANDARD, 4=ALLEGATO_DELEGA_RITIRO, 5=INFORMATIVA_PRIVACY_GDPR, 6=ATTESTATO_FREQUENZA_CORSO, 7=CERTIFICATO_LIVELLO_LINGUA
 * - DocumentStatus: 1=DRAFT, 2=GENERATED, 3=SENT, 4=SIGNED, 5=ARCHIVED, 6=CANCELLED
 * - DocumentRecipientType: 1=STUDENT, 2=PARENT, 3=TEACHER, 4=SCHOOL_ADMIN, 5=THIRD_PARTY
 * - DocumentGenerationSource: 1=SYSTEM_AUTOMATIC, 2=CRM_MANUAL
 * - DocumentPaperFormat: 1=A4_PORTRAIT, 2=A4_LANDSCAPE, 3=RECEIPT_COMPACT
 * - DocumentLogAction: 1=GENERATED, 2=VIEWED, 3=PRINTED, 4=DOWNLOADED_PDF, 5=SENT_EMAIL, 6=SIGNED, 7=REGENERATED
 * ============================================================================
 */

import { DictionaryEntry } from '../common/dictionary';

// ----------------------------------------------------------------------------
// 1. Document Categories (DocumentCategoryType)
// ----------------------------------------------------------------------------

export const DocumentCategoryType = {
  STUDENT_CONTRACTS: 1,    // Contratti Studenti / Договоры со студентами
  TEACHER_CONTRACTS: 2,    // Contratti Docenti / Договоры с преподавателями
  FINANCIAL: 3,            // Ricevute e Pagamenti / Финансовые квитанции
  LEGAL_AND_PRIVACY: 4,    // Privacy, GDPR e Deleghe / Юр. согласия и доверенности
  CERTIFICATES: 5,         // Certificati e Attestati / Сертификаты и дипломы
  ADMINISTRATIVE: 6,       // Moduli Amministrativi / Административные справки
} as const;
export type DocumentCategoryType = (typeof DocumentCategoryType)[keyof typeof DocumentCategoryType];

export const DOCUMENT_CATEGORY_DICTIONARY: Record<DocumentCategoryType, DictionaryEntry & { icon: string }> = {
  [DocumentCategoryType.STUDENT_CONTRACTS]: {
    id: 1,
    code: 'STUDENT_CONTRACTS',
    label_it: 'Contratti Studenti',
    label_en: 'Student Contracts',
    label_ru: 'Договоры со студентами',
    description: 'Moduli di iscrizione, regolamenti didattici e contratti formativi per allievi',
    icon: 'file-text',
  },
  [DocumentCategoryType.TEACHER_CONTRACTS]: {
    id: 2,
    code: 'TEACHER_CONTRACTS',
    label_it: 'Contratti Docenti',
    label_en: 'Teacher Contracts',
    label_ru: 'Договоры с преподавателями',
    description: 'Lettere di incarico, contratti di collaborazione e accordi con insegnanti',
    icon: 'briefcase',
  },
  [DocumentCategoryType.FINANCIAL]: {
    id: 3,
    code: 'FINANCIAL',
    label_it: 'Ricevute e Pagamenti',
    label_en: 'Receipts & Payments',
    label_ru: 'Финансовые квитанции',
    description: 'Ricevute di pagamento corsi, quote associative annuali e saldi cassa',
    icon: 'receipt',
  },
  [DocumentCategoryType.LEGAL_AND_PRIVACY]: {
    id: 4,
    code: 'LEGAL_AND_PRIVACY',
    label_it: 'Privacy, GDPR e Deleghe',
    label_en: 'Privacy, GDPR & Delegations',
    label_ru: 'GDPR и доверенности',
    description: 'Consensi privacy, liberatorie foto/video e deleghe ritiro minori (Allegato 2)',
    icon: 'shield-check',
  },
  [DocumentCategoryType.CERTIFICATES]: {
    id: 5,
    code: 'CERTIFICATES',
    label_it: 'Certificati e Attestati',
    label_en: 'Certificates & Diplomas',
    label_ru: 'Сертификаты и дипломы',
    description: 'Attestati di fine corso, certificazioni di livello linguistico ed esami',
    icon: 'award',
  },
  [DocumentCategoryType.ADMINISTRATIVE]: {
    id: 6,
    code: 'ADMINISTRATIVE',
    label_it: 'Moduli Amministrativi',
    label_en: 'Administrative Forms',
    label_ru: 'Административные справки',
    description: 'Certificati di frequenza per scuole pubbliche, università e pratiche amministrative',
    icon: 'landmark',
  },
};

export function parseDocumentCategoryType(val: any): DocumentCategoryType {
  if (typeof val === 'number') {
    if (val >= 1 && val <= 6) return val as DocumentCategoryType;
    return DocumentCategoryType.STUDENT_CONTRACTS;
  }
  const s = String(val || '').toLowerCase().trim();
  if (s === '1' || s.includes('student') || s.includes('iscrizion')) return DocumentCategoryType.STUDENT_CONTRACTS;
  if (s === '2' || s.includes('teacher') || s.includes('docent')) return DocumentCategoryType.TEACHER_CONTRACTS;
  if (s === '3' || s.includes('financ') || s.includes('ricevut') || s.includes('payment')) return DocumentCategoryType.FINANCIAL;
  if (s === '4' || s.includes('privacy') || s.includes('gdpr') || s.includes('delega')) return DocumentCategoryType.LEGAL_AND_PRIVACY;
  if (s === '5' || s.includes('certificat') || s.includes('attestat')) return DocumentCategoryType.CERTIFICATES;
  if (s === '6' || s.includes('admin') || s.includes('frequenza')) return DocumentCategoryType.ADMINISTRATIVE;
  return DocumentCategoryType.STUDENT_CONTRACTS;
}

// ----------------------------------------------------------------------------
// 2. Document Types (DocumentType)
// ----------------------------------------------------------------------------

export const DocumentType = {
  REGISTRATION_CONTRACT: 1,   // Modulo di Iscrizione e Regolamento
  TEACHER_CONTRACT: 2,        // Contratto Collaborazione Docente
  PAYMENT_RECEIPT: 3,         // Ricevuta Pagamento / Quota Iscrizione
  MINOR_PICKUP_DELEGATION: 4, // Allegato 2: Delega Ritiro & Uscita Autonoma
  PRIVACY_GDPR: 5,            // Informativa Privacy GDPR
  COURSE_CERTIFICATE: 6,      // Attestato Fine Corso
  ATTENDANCE_ATTESTATION: 7,  // Certificato di Frequenza
  CUSTOM_DOCUMENT: 8,         // Свободный документ
} as const;
export type DocumentType = (typeof DocumentType)[keyof typeof DocumentType];

export const DOCUMENT_TYPE_DICTIONARY: Record<DocumentType, DictionaryEntry & { category_type: DocumentCategoryType }> = {
  [DocumentType.REGISTRATION_CONTRACT]: {
    id: 1,
    code: 'REGISTRATION_CONTRACT',
    label_it: 'Modulo di Iscrizione e Regolamento',
    label_en: 'Registration & Regulation Form',
    label_ru: 'Анкета записи и регламент школы',
    description: 'Modulo ufficiale di adesione ai corsi con accettazione del regolamento interno',
    category_type: DocumentCategoryType.STUDENT_CONTRACTS,
  },
  [DocumentType.TEACHER_CONTRACT]: {
    id: 2,
    code: 'TEACHER_CONTRACT',
    label_it: 'Contratto di Collaborazione Docente',
    label_en: 'Teacher Collaboration Contract',
    label_ru: 'Трудовой договор с преподавателем',
    description: 'Accordo di prestazione d\'opera per insegnamento linguistico e tariffa oraria',
    category_type: DocumentCategoryType.TEACHER_CONTRACTS,
  },
  [DocumentType.PAYMENT_RECEIPT]: {
    id: 3,
    code: 'PAYMENT_RECEIPT',
    label_it: 'Ricevuta di Pagamento',
    label_en: 'Payment Receipt',
    label_ru: 'Квитанция об оплате',
    description: 'Documento contabile per corso con IVA inclusa ed eventuale quota associativa di €30',
    category_type: DocumentCategoryType.FINANCIAL,
  },
  [DocumentType.MINOR_PICKUP_DELEGATION]: {
    id: 4,
    code: 'MINOR_PICKUP_DELEGATION',
    label_it: 'Allegato 2: Delega Ritiro e Uscita Minori',
    label_en: 'Minor Pickup Delegation & Self-Exit',
    label_ru: 'Делегирование забора ребенка и авто-выход',
    description: 'Modulo di autorizzazione ritiro allievi minori da parte di delegati e uscita autonoma (L. 172/2017)',
    category_type: DocumentCategoryType.LEGAL_AND_PRIVACY,
  },
  [DocumentType.PRIVACY_GDPR]: {
    id: 5,
    code: 'PRIVACY_GDPR',
    label_it: 'Informativa Privacy e Consenso GDPR',
    label_en: 'GDPR Privacy Policy & Consent',
    label_ru: 'Согласие на обработку персданных GDPR',
    description: 'Consenso al trattamento dati personali, comunicazioni didattiche e liberatoria multimediale',
    category_type: DocumentCategoryType.LEGAL_AND_PRIVACY,
  },
  [DocumentType.COURSE_CERTIFICATE]: {
    id: 6,
    code: 'COURSE_CERTIFICATE',
    label_it: 'Attestato di Fine Corso',
    label_en: 'Course Completion Certificate',
    label_ru: 'Сертификат об окончании курса',
    description: 'Attestato formale di completamento percorso linguistico e livello QCER raggiunto',
    category_type: DocumentCategoryType.CERTIFICATES,
  },
  [DocumentType.ATTENDANCE_ATTESTATION]: {
    id: 7,
    code: 'ATTENDANCE_ATTESTATION',
    label_it: 'Certificato di Frequenza',
    label_en: 'Attendance Certificate',
    label_ru: 'Справка о посещении занятий',
    description: 'Dichiarazione ufficiale del monte ore svolto per crediti scolastici o usi legali',
    category_type: DocumentCategoryType.ADMINISTRATIVE,
  },
  [DocumentType.CUSTOM_DOCUMENT]: {
    id: 8,
    code: 'CUSTOM_DOCUMENT',
    label_it: 'Documento Personalizzato',
    label_en: 'Custom Document',
    label_ru: 'Произвольный документ / Справка',
    description: 'Lettera formale o comunicazione personalizzata su carta intestata',
    category_type: DocumentCategoryType.ADMINISTRATIVE,
  },
};

export function parseDocumentType(val: any): DocumentType {
  if (typeof val === 'number') {
    if (val >= 1 && val <= 8) return val as DocumentType;
    return DocumentType.REGISTRATION_CONTRACT;
  }
  const s = String(val || '').toLowerCase().trim();
  if (s === '1' || s.includes('registration') || s.includes('iscrizion')) return DocumentType.REGISTRATION_CONTRACT;
  if (s === '2' || s.includes('teacher') || s.includes('docent')) return DocumentType.TEACHER_CONTRACT;
  if (s === '3' || s.includes('receipt') || s.includes('ricevut')) return DocumentType.PAYMENT_RECEIPT;
  if (s === '4' || s.includes('delega') || s.includes('pickup') || s.includes('allegato')) return DocumentType.MINOR_PICKUP_DELEGATION;
  if (s === '5' || s.includes('privacy') || s.includes('gdpr')) return DocumentType.PRIVACY_GDPR;
  if (s === '6' || s.includes('certificate') || s.includes('attestat')) return DocumentType.COURSE_CERTIFICATE;
  if (s === '7' || s.includes('frequenz') || s.includes('attend')) return DocumentType.ATTENDANCE_ATTESTATION;
  if (s === '8' || s.includes('custom')) return DocumentType.CUSTOM_DOCUMENT;
  return DocumentType.REGISTRATION_CONTRACT;
}

// ----------------------------------------------------------------------------
// 3. Document Template Types (DocumentTemplateType)
// ----------------------------------------------------------------------------

export const DocumentTemplateType = {
  MODULO_ISCRIZIONE_STANDARD: 1,
  CONTRATTO_DOCENTE_ORARIO: 2,
  RICEVUTA_PAGAMENTO_STANDARD: 3,
  ALLEGATO_DELEGA_RITIRO: 4,
  INFORMATIVA_PRIVACY_GDPR: 5,
  ATTESTATO_FREQUENZA_CORSO: 6,
  CERTIFICATO_LIVELLO_LINGUA: 7,
} as const;
export type DocumentTemplateType = (typeof DocumentTemplateType)[keyof typeof DocumentTemplateType];

export const DOCUMENT_TEMPLATE_DICTIONARY: Record<DocumentTemplateType, DictionaryEntry & {
  document_type: DocumentType;
  category_type: DocumentCategoryType;
}> = {
  [DocumentTemplateType.MODULO_ISCRIZIONE_STANDARD]: {
    id: 1,
    code: 'MODULO_ISCRIZIONE_STANDARD',
    label_it: 'Modulo di Iscrizione e Regolamento 2026/2027',
    label_en: 'Standard Registration & Rules 2026/2027',
    label_ru: 'Стандартная анкета записи 2026/2027',
    description: 'Modulo completo per allievo con dati anagrafici, corso, calendario festività e regolamento',
    document_type: DocumentType.REGISTRATION_CONTRACT,
    category_type: DocumentCategoryType.STUDENT_CONTRACTS,
  },
  [DocumentTemplateType.CONTRATTO_DOCENTE_ORARIO]: {
    id: 2,
    code: 'CONTRATTO_DOCENTE_ORARIO',
    label_it: 'Contratto Collaborazione Docente (Tariffa Oraria)',
    label_en: 'Teacher Hourly Contract',
    label_ru: 'Контракт преподавателя с почасовой оплатой',
    description: 'Contratto di prestazione con clausole di riservatezza, compenso e programma didattico',
    document_type: DocumentType.TEACHER_CONTRACT,
    category_type: DocumentCategoryType.TEACHER_CONTRACTS,
  },
  [DocumentTemplateType.RICEVUTA_PAGAMENTO_STANDARD]: {
    id: 3,
    code: 'RICEVUTA_PAGAMENTO_STANDARD',
    label_it: 'Ricevuta Pagamento Ufficiale (IVA Inclusa)',
    label_en: 'Official Payment Receipt',
    label_ru: 'Официальная квитанция об оплате',
    description: 'Ricevuta contabile con codice fiscale, scorporo IVA 22% e quota associativa',
    document_type: DocumentType.PAYMENT_RECEIPT,
    category_type: DocumentCategoryType.FINANCIAL,
  },
  [DocumentTemplateType.ALLEGATO_DELEGA_RITIRO]: {
    id: 4,
    code: 'ALLEGATO_DELEGA_RITIRO',
    label_it: 'Allegato 2: Modulo Delega Ritiro e Uscita Minori',
    label_en: 'Attachment 2: Minor Delegation & Self-Exit',
    label_ru: 'Приложение 2: Делегирование забора ребенка',
    description: 'Autorizzazione formale per il ritiro di minori o uscita autonoma per alunni di 11+ anni',
    document_type: DocumentType.MINOR_PICKUP_DELEGATION,
    category_type: DocumentCategoryType.LEGAL_AND_PRIVACY,
  },
  [DocumentTemplateType.INFORMATIVA_PRIVACY_GDPR]: {
    id: 5,
    code: 'INFORMATIVA_PRIVACY_GDPR',
    label_it: 'Informativa Privacy e Trattamento Dati Personali',
    label_en: 'GDPR Data Processing Policy',
    label_ru: 'Политика обработки персональных данных GDPR',
    description: 'Trattamento dati ai sensi del Regolamento UE 2016/679 e consenso multimediale',
    document_type: DocumentType.PRIVACY_GDPR,
    category_type: DocumentCategoryType.LEGAL_AND_PRIVACY,
  },
  [DocumentTemplateType.ATTESTATO_FREQUENZA_CORSO]: {
    id: 6,
    code: 'ATTESTATO_FREQUENZA_CORSO',
    label_it: 'Attestato di Frequenza e Ore Didattiche',
    label_en: 'Course Attendance Certificate',
    label_ru: 'Справка о посещаемости и академических часах',
    description: 'Dichiarazione ufficiale di frequenza con percentuale presenze e ore totali',
    document_type: DocumentType.ATTENDANCE_ATTESTATION,
    category_type: DocumentCategoryType.ADMINISTRATIVE,
  },
  [DocumentTemplateType.CERTIFICATO_LIVELLO_LINGUA]: {
    id: 7,
    code: 'CERTIFICATO_LIVELLO_LINGUA',
    label_it: 'Certificato di Competenza Linguistica QCER',
    label_en: 'CEFR Language Proficiency Certificate',
    label_ru: 'Сертификат уровня владения языком CEFR',
    description: 'Diploma di certificazione del livello linguistico raggiunto con giudizio del docente',
    document_type: DocumentType.COURSE_CERTIFICATE,
    category_type: DocumentCategoryType.CERTIFICATES,
  },
};

export function parseDocumentTemplateType(val: any): DocumentTemplateType {
  if (val === null || val === undefined) return undefined as any;
  if (typeof val === 'number') {
    if (val >= 1 && val <= 7) return val as DocumentTemplateType;
    return DocumentTemplateType.MODULO_ISCRIZIONE_STANDARD;
  }
  const s = String(val || '').toLowerCase().trim();
  if (!s) return undefined as any;
  if (s === '1' || s.includes('iscrizione') || s.includes('modulo')) return DocumentTemplateType.MODULO_ISCRIZIONE_STANDARD;
  if (s === '2' || s.includes('docente')) return DocumentTemplateType.CONTRATTO_DOCENTE_ORARIO;
  if (s === '3' || s.includes('ricevuta')) return DocumentTemplateType.RICEVUTA_PAGAMENTO_STANDARD;
  if (s === '4' || s.includes('delega') || s.includes('allegato')) return DocumentTemplateType.ALLEGATO_DELEGA_RITIRO;
  if (s === '5' || s.includes('privacy')) return DocumentTemplateType.INFORMATIVA_PRIVACY_GDPR;
  if (s === '6' || s.includes('frequenza')) return DocumentTemplateType.ATTESTATO_FREQUENZA_CORSO;
  if (s === '7' || s.includes('livello') || s.includes('certificato')) return DocumentTemplateType.CERTIFICATO_LIVELLO_LINGUA;
  return DocumentTemplateType.MODULO_ISCRIZIONE_STANDARD;
}

// ----------------------------------------------------------------------------
// 4. Document Statuses (DocumentStatus)
// ----------------------------------------------------------------------------

export const DocumentStatus = {
  DRAFT: 1,      // Черновик (в процессе создания/редактирования)
  GENERATED: 2,  // Сгенерирован (готов к печати/просмотру)
  SENT: 3,       // Отправлен на Email получателю
  SIGNED: 4,     // Подписан (вручную или цифровой подписью)
  ARCHIVED: 5,   // Архивирован
  CANCELLED: 6,  // Аннулирован
} as const;
export type DocumentStatus = (typeof DocumentStatus)[keyof typeof DocumentStatus];

export const DOCUMENT_STATUS_DICTIONARY: Record<DocumentStatus, DictionaryEntry & { badge_variant: 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline' }> = {
  [DocumentStatus.DRAFT]: {
    id: 1,
    code: 'DRAFT',
    label_it: 'Bozza',
    label_en: 'Draft',
    label_ru: 'Черновик',
    description: 'Documento in fase di compilazione',
    badge_variant: 'secondary',
  },
  [DocumentStatus.GENERATED]: {
    id: 2,
    code: 'GENERATED',
    label_it: 'Generato',
    label_en: 'Generated',
    label_ru: 'Сгенерирован',
    description: 'Documento pronto per stampa e consultazione',
    badge_variant: 'default',
  },
  [DocumentStatus.SENT]: {
    id: 3,
    code: 'SENT',
    label_it: 'Inviato',
    label_en: 'Sent',
    label_ru: 'Отправлен',
    description: 'Inviato via email al destinatario',
    badge_variant: 'warning',
  },
  [DocumentStatus.SIGNED]: {
    id: 4,
    code: 'SIGNED',
    label_it: 'Firmato',
    label_en: 'Signed',
    label_ru: 'Подписан',
    description: 'Documento firmato e convalidato',
    badge_variant: 'success',
  },
  [DocumentStatus.ARCHIVED]: {
    id: 5,
    code: 'ARCHIVED',
    label_it: 'Archiviato',
    label_en: 'Archived',
    label_ru: 'Архивирован',
    description: 'Documento archiviato nello storico',
    badge_variant: 'outline',
  },
  [DocumentStatus.CANCELLED]: {
    id: 6,
    code: 'CANCELLED',
    label_it: 'Annullato',
    label_en: 'Cancelled',
    label_ru: 'Аннулирован',
    description: 'Documento revocato o non valido',
    badge_variant: 'destructive',
  },
};

export function parseDocumentStatus(val: any): DocumentStatus {
  if (typeof val === 'number') {
    if (val >= 1 && val <= 6) return val as DocumentStatus;
    return DocumentStatus.GENERATED;
  }
  const s = String(val || '').toLowerCase().trim();
  if (s === '1' || s === 'draft' || s === 'bozza') return DocumentStatus.DRAFT;
  if (s === '2' || s === 'generated' || s === 'generato') return DocumentStatus.GENERATED;
  if (s === '3' || s === 'sent' || s === 'inviato') return DocumentStatus.SENT;
  if (s === '4' || s === 'signed' || s === 'firmato') return DocumentStatus.SIGNED;
  if (s === '5' || s === 'archived' || s === 'archiviato') return DocumentStatus.ARCHIVED;
  if (s === '6' || s === 'cancelled' || s === 'annullato') return DocumentStatus.CANCELLED;
  return DocumentStatus.GENERATED;
}

// ----------------------------------------------------------------------------
// 5. Document Recipient Types (DocumentRecipientType)
// ----------------------------------------------------------------------------

export const DocumentRecipientType = {
  STUDENT: 1,      // Студент (совершеннолетний)
  PARENT: 2,       // Родитель / Законный представитель
  TEACHER: 3,      // Преподаватель / Сотрудник
  SCHOOL_ADMIN: 4, // Внутренний архив администрации
  THIRD_PARTY: 5,  // Внешняя организация
} as const;
export type DocumentRecipientType = (typeof DocumentRecipientType)[keyof typeof DocumentRecipientType];

export const DOCUMENT_RECIPIENT_DICTIONARY: Record<DocumentRecipientType, DictionaryEntry> = {
  [DocumentRecipientType.STUDENT]: {
    id: 1,
    code: 'STUDENT',
    label_it: 'Allievo',
    label_en: 'Student',
    label_ru: 'Студент',
    description: 'Destinatario allievo maggiorenne',
  },
  [DocumentRecipientType.PARENT]: {
    id: 2,
    code: 'PARENT',
    label_it: 'Genitore / Tutore',
    label_en: 'Parent / Legal Guardian',
    label_ru: 'Родитель / Опекун',
    description: 'Destinatario genitore o tutore legale dell\'allievo minore',
  },
  [DocumentRecipientType.TEACHER]: {
    id: 3,
    code: 'TEACHER',
    label_it: 'Docente / Collaboratore',
    label_en: 'Teacher / Staff',
    label_ru: 'Преподаватель',
    description: 'Destinatario insegnante o membro dello staff didattico',
  },
  [DocumentRecipientType.SCHOOL_ADMIN]: {
    id: 4,
    code: 'SCHOOL_ADMIN',
    label_it: 'Archivio Scuola',
    label_en: 'School Internal Archive',
    label_ru: 'Архив школы',
    description: 'Copia ad uso interno della direzione scolastica',
  },
  [DocumentRecipientType.THIRD_PARTY]: {
    id: 5,
    code: 'THIRD_PARTY',
    label_it: 'Ente Terzo / Istituzione',
    label_en: 'Third Party / Institution',
    label_ru: 'Внешняя организация',
    description: 'Scuola statale, università, ente certificatore o pubblica amministrazione',
  },
};

export function parseDocumentRecipientType(val: any): DocumentRecipientType {
  if (typeof val === 'number') {
    if (val >= 1 && val <= 5) return val as DocumentRecipientType;
    return DocumentRecipientType.STUDENT;
  }
  const s = String(val || '').toLowerCase().trim();
  if (s === '1' || s.includes('student') || s.includes('alliev')) return DocumentRecipientType.STUDENT;
  if (s === '2' || s.includes('parent') || s.includes('genitor') || s.includes('tutor')) return DocumentRecipientType.PARENT;
  if (s === '3' || s.includes('teacher') || s.includes('docent') || s.includes('insegnant')) return DocumentRecipientType.TEACHER;
  if (s === '4' || s.includes('admin') || s.includes('scuola') || s.includes('archiv')) return DocumentRecipientType.SCHOOL_ADMIN;
  if (s === '5' || s.includes('third') || s.includes('ente')) return DocumentRecipientType.THIRD_PARTY;
  return DocumentRecipientType.STUDENT;
}

// ----------------------------------------------------------------------------
// 6. Document Generation Source (DocumentGenerationSource)
// ----------------------------------------------------------------------------

export const DocumentGenerationSource = {
  SYSTEM_AUTOMATIC: 1, // Авто-генерация системой (при оплате / бронировании)
  CRM_MANUAL: 2,       // Ручной выпуск секретарем/администратором
} as const;
export type DocumentGenerationSource = (typeof DocumentGenerationSource)[keyof typeof DocumentGenerationSource];

export const DOCUMENT_SOURCE_DICTIONARY: Record<DocumentGenerationSource, DictionaryEntry> = {
  [DocumentGenerationSource.SYSTEM_AUTOMATIC]: {
    id: 1,
    code: 'SYSTEM_AUTOMATIC',
    label_it: 'Automatico (Sistema)',
    label_en: 'Automatic (System)',
    label_ru: 'Автоматически (Система)',
    description: 'Generato automaticamente a seguito di prenotazione o transazione Stripe',
  },
  [DocumentGenerationSource.CRM_MANUAL]: {
    id: 2,
    code: 'CRM_MANUAL',
    label_it: 'Manuale (Segreteria)',
    label_en: 'Manual (CRM Staff)',
    label_ru: 'Вручную (Секретарь)',
    description: 'Generato e personalizzato da segreteria o direzione tramite CRM',
  },
};

export function parseDocumentGenerationSource(val: any): DocumentGenerationSource {
  if (typeof val === 'number') {
    if (val === 1 || val === 2) return val as DocumentGenerationSource;
    return DocumentGenerationSource.CRM_MANUAL;
  }
  const s = String(val || '').toLowerCase().trim();
  if (s === '1' || s.includes('auto') || s.includes('system')) return DocumentGenerationSource.SYSTEM_AUTOMATIC;
  return DocumentGenerationSource.CRM_MANUAL;
}

// ----------------------------------------------------------------------------
// 7. Document Paper Format (DocumentPaperFormat)
// ----------------------------------------------------------------------------

export const DocumentPaperFormat = {
  A4_PORTRAIT: 1,     // A4 Книжная
  A4_LANDSCAPE: 2,    // A4 Альбомная
  RECEIPT_COMPACT: 3, // Компактный фискальный чек
} as const;
export type DocumentPaperFormat = (typeof DocumentPaperFormat)[keyof typeof DocumentPaperFormat];

export const DOCUMENT_FORMAT_DICTIONARY: Record<DocumentPaperFormat, DictionaryEntry> = {
  [DocumentPaperFormat.A4_PORTRAIT]: {
    id: 1,
    code: 'A4_PORTRAIT',
    label_it: 'A4 Verticale (Standard)',
    label_en: 'A4 Portrait',
    label_ru: 'A4 Книжная',
    description: 'Formato standard verticale per contratti, moduli e informative legali',
  },
  [DocumentPaperFormat.A4_LANDSCAPE]: {
    id: 2,
    code: 'A4_LANDSCAPE',
    label_it: 'A4 Orizzontale (Certificati)',
    label_en: 'A4 Landscape',
    label_ru: 'A4 Альбомная',
    description: 'Formato orizzontale ottimale per certificati di livello e diplomi',
  },
  [DocumentPaperFormat.RECEIPT_COMPACT]: {
    id: 3,
    code: 'RECEIPT_COMPACT',
    label_it: 'Ricevuta Compatta',
    label_en: 'Compact Receipt',
    label_ru: 'Компактная квитанция',
    description: 'Formato ridotto per scontrini e ricevute rapide di cassa',
  },
};

export function parseDocumentPaperFormat(val: any): DocumentPaperFormat {
  if (typeof val === 'number') {
    if (val >= 1 && val <= 3) return val as DocumentPaperFormat;
    return DocumentPaperFormat.A4_PORTRAIT;
  }
  const s = String(val || '').toLowerCase().trim();
  if (s === '2' || s.includes('landscape') || s.includes('orizzontal')) return DocumentPaperFormat.A4_LANDSCAPE;
  if (s === '3' || s.includes('compact') || s.includes('scontrin')) return DocumentPaperFormat.RECEIPT_COMPACT;
  return DocumentPaperFormat.A4_PORTRAIT;
}

// ----------------------------------------------------------------------------
// 8. Document Log Action (DocumentLogAction)
// ----------------------------------------------------------------------------

export const DocumentLogAction = {
  GENERATED: 1,       // Сгенерирован
  VIEWED: 2,          // Просмотрен
  PRINTED: 3,         // Отправлен на печать
  DOWNLOADED_PDF: 4,  // Выгружен в PDF
  SENT_EMAIL: 5,      // Отправлен по почте
  SIGNED: 6,          // Подписан
  REGENERATED: 7,     // Перегенерирован
} as const;
export type DocumentLogAction = (typeof DocumentLogAction)[keyof typeof DocumentLogAction];

export const DOCUMENT_LOG_ACTION_DICTIONARY: Record<DocumentLogAction, DictionaryEntry> = {
  [DocumentLogAction.GENERATED]: {
    id: 1,
    code: 'GENERATED',
    label_it: 'Generazione Documento',
    label_en: 'Document Generated',
    label_ru: 'Генерация документа',
    description: 'Documento creato con successo dal sistema o segreteria',
  },
  [DocumentLogAction.VIEWED]: {
    id: 2,
    code: 'VIEWED',
    label_it: 'Visualizzazione',
    label_en: 'Document Viewed',
    label_ru: 'Просмотр документа',
    description: 'Documento aperto in anteprima o letto da allievo',
  },
  [DocumentLogAction.PRINTED]: {
    id: 3,
    code: 'PRINTED',
    label_it: 'Stampa',
    label_en: 'Document Printed',
    label_ru: 'Печать',
    description: 'Documento inviato alla stampante fisica',
  },
  [DocumentLogAction.DOWNLOADED_PDF]: {
    id: 4,
    code: 'DOWNLOADED_PDF',
    label_it: 'Download PDF',
    label_en: 'PDF Downloaded',
    label_ru: 'Скачивание PDF',
    description: 'File PDF scaricato localmente',
  },
  [DocumentLogAction.SENT_EMAIL]: {
    id: 5,
    code: 'SENT_EMAIL',
    label_it: 'Invio Email',
    label_en: 'Sent via Email',
    label_ru: 'Отправка по Email',
    description: 'Documento recapitato via posta elettronica',
  },
  [DocumentLogAction.SIGNED]: {
    id: 6,
    code: 'SIGNED',
    label_it: 'Firma / Accettazione',
    label_en: 'Document Signed',
    label_ru: 'Подписание документа',
    description: 'Documento sottoscritto con firma autografa o consenso digitale',
  },
  [DocumentLogAction.REGENERATED]: {
    id: 7,
    code: 'REGENERATED',
    label_it: 'Rigenerazione',
    label_en: 'Document Regenerated',
    label_ru: 'Перегенерация',
    description: 'Documento aggiornato e ricompilato con nuovi dati',
  },
};

export function parseDocumentLogAction(val: any): DocumentLogAction {
  if (typeof val === 'number') {
    if (val >= 1 && val <= 7) return val as DocumentLogAction;
    return DocumentLogAction.GENERATED;
  }
  const s = String(val || '').toLowerCase().trim();
  if (s === '2' || s.includes('view') || s.includes('visualizz')) return DocumentLogAction.VIEWED;
  if (s === '3' || s.includes('print') || s.includes('stamp')) return DocumentLogAction.PRINTED;
  if (s === '4' || s.includes('pdf') || s.includes('download')) return DocumentLogAction.DOWNLOADED_PDF;
  if (s === '5' || s.includes('email') || s.includes('invi')) return DocumentLogAction.SENT_EMAIL;
  if (s === '6' || s.includes('sign') || s.includes('firm')) return DocumentLogAction.SIGNED;
  if (s === '7' || s.includes('regen') || s.includes('rigener')) return DocumentLogAction.REGENERATED;
  return DocumentLogAction.GENERATED;
}

// ----------------------------------------------------------------------------
// 9. Visual Builder Blocks & DTOs
// ----------------------------------------------------------------------------

export type DocumentBlockType =
  | 'doc_header'         // Шапка: логотип школы, название, номер, дата
  | 'parties_block'      // Реквизиты сторон (Школа + Студент / Родитель / Преподаватель)
  | 'course_table'       // Таблица курса: название, уровень, расписание, аудитория
  | 'payment_breakdown'  // Таблица оплат: курс + взнос €30 + 22% НДС + метод оплаты
  | 'contract_clauses'   // Статьи регламента (правила отмены, праздники 2026/2027)
  | 'minor_delegation'   // Allegato 2 (Делегаты 1 и 2 + чекбокс авто-выхода с 11 лет)
  | 'gdpr_privacy'       // Чекбоксы согласия GDPR (персданные, фото/видео)
  | 'signatures'         // Подписи сторон (Дата, Подпись школы, Подпись клиента)
  | 'custom_text'        // Произвольный Rich Text с переменными
  | 'doc_footer';        // Подвал: юр. адрес, P.IVA, нумерация страниц

export interface DocumentBlock {
  id: string;
  type: DocumentBlockType;
  title: string;
  is_enabled: boolean;
  order: number;
  props: Record<string, any>;
}

export interface DocumentBlocksConfig {
  version: number;
  paper_format: DocumentPaperFormat;
  theme?: {
    primary_color?: string;
    font_family?: string;
    show_watermark?: boolean;
    header_style?: 'classic' | 'modern_minimal' | 'bordered';
  };
  blocks: DocumentBlock[];
}

export interface DocumentVariableInfo {
  key: string;
  label: string;
  category: 'school' | 'student' | 'parent' | 'teacher' | 'course' | 'booking' | 'payment' | 'delegates';
  sample_value: string;
}

// ----------------------------------------------------------------------------
// 10. Database Entities & DTOs
// ----------------------------------------------------------------------------

export function resolveI18n(
  val: Record<string, any> | string | number | null | undefined,
  locale: string = 'it',
  fallback: string = 'it'
): string {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'number') return String(val);
  if (typeof val === 'object') {
    const direct = val[locale] || val[fallback] || val['it'] || val['en'];
    if (direct !== undefined && direct !== null) return String(direct);
    const firstVal = Object.values(val)[0];
    if (firstVal !== undefined && firstVal !== null) return String(firstVal);
  }
  return '';
}

export interface DocumentCategoryRecord {
  id: number;
  category_type: DocumentCategoryType;
  name: Record<string, string> | string;
  name_it?: string;
  name_en?: string;
  name_ru?: string;
  description?: Record<string, string> | string | null;
  icon: string;
  order_index: number;
  is_active: boolean;
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

export interface DocumentTemplateRecord {
  id: number;
  template_type?: DocumentTemplateType | null;
  category_type: DocumentCategoryType;
  document_type: DocumentType;
  recipient_type: DocumentRecipientType;
  paper_format: DocumentPaperFormat;
  name: Record<string, string> | string;
  description?: Record<string, string> | string | null;
  locale?: string;
  blocks_config: DocumentBlocksConfig;
  available_variables: DocumentVariableInfo[];
  header_html?: string | null;
  footer_html?: string | null;
  css_styles?: string | null;
  is_system: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DocumentRecord {
  id: string;
  document_number: string;
  document_type: DocumentType;
  category_type: DocumentCategoryType;
  status: DocumentStatus;
  source: DocumentGenerationSource;
  paper_format: DocumentPaperFormat;
  locale?: string;
  template_id?: number | null;
  template_type?: DocumentTemplateType | null;
  booking_id?: string | null;
  student_id?: string | null;
  teacher_id?: number | null;
  user_id?: string | null;
  title: string;
  recipient_name?: string | null;
  recipient_email?: string | null;
  recipient_tax_code?: string | null;
  template_data: Record<string, any>;
  rendered_html: string;
  file_url?: string | null;
  signed_at?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DocumentLogRecord {
  id: number;
  document_id: string;
  action: DocumentLogAction;
  performed_by?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface GenerateDocumentDto {
  template_id?: number;
  template_type?: DocumentTemplateType;
  document_type?: DocumentType;
  category_type?: DocumentCategoryType;
  booking_id?: string;
  student_id?: string;
  teacher_id?: number;
  title?: string;
  locale?: string;
  recipient_name?: string;
  recipient_email?: string;
  recipient_tax_code?: string;
  custom_data?: Record<string, any>;
  blocks_config?: DocumentBlocksConfig;
  source?: DocumentGenerationSource;
}

export interface CreateDocumentTemplateDto {
  template_type?: DocumentTemplateType;
  category_type: DocumentCategoryType;
  document_type: DocumentType;
  recipient_type: DocumentRecipientType;
  paper_format?: DocumentPaperFormat;
  name: Record<string, string> | string;
  description?: Record<string, string> | string;
  locale?: string;
  blocks_config: DocumentBlocksConfig;
  available_variables?: DocumentVariableInfo[];
  header_html?: string;
  footer_html?: string;
  css_styles?: string;
  is_active?: boolean;
}

export interface UpdateDocumentTemplateDto {
  name?: Record<string, string> | string;
  description?: Record<string, string> | string;
  locale?: string;
  category_type?: DocumentCategoryType;
  document_type?: DocumentType;
  recipient_type?: DocumentRecipientType;
  paper_format?: DocumentPaperFormat;
  blocks_config?: DocumentBlocksConfig;
  available_variables?: DocumentVariableInfo[];
  header_html?: string;
  footer_html?: string;
  css_styles?: string;
  is_active?: boolean;
}

export interface CreateDocumentCategoryDto {
  category_type?: DocumentCategoryType;
  name: Record<string, string> | string;
  name_it?: string;
  name_en?: string;
  name_ru?: string;
  description?: Record<string, string> | string;
  icon?: string;
  order_index?: number;
  is_active?: boolean;
}

export interface UpdateDocumentCategoryDto {
  name?: Record<string, string> | string;
  name_it?: string;
  name_en?: string;
  name_ru?: string;
  description?: Record<string, string> | string;
  icon?: string;
  order_index?: number;
  is_active?: boolean;
}

export interface CreateDocumentLogDto {
  document_id: string;
  action: DocumentLogAction;
  metadata?: Record<string, any>;
}

