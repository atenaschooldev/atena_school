import {
  IsString,
  IsEmail,
  IsOptional,
  IsBoolean,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Matches,
  ValidateIf,
  Length,
} from 'class-validator';

/**
 * Codice Fiscale — физлицо (16 символов) или Partita IVA (11 цифр).
 * Используется в @Matches() для полей purchaserTaxCode, studentTaxCode.
 */
const CF_PATTERN =
  /^([A-Z]{6}[0-9LMNPQRSTUV]{2}[ABCDEHLMPRST]{1}[0-9LMNPQRSTUV]{2}[A-Z]{1}[0-9LMNPQRSTUV]{3}[A-Z]{1}|[0-9]{11})$/i;

/**
 * Итальянский телефон: +39 333 1234567 | 0331 1234567 | 3331234567
 */
const PHONE_IT_PATTERN =
  /^(\+?39[\s\-]?)?(0\d{1,4}[\s\-]?\d{4,8}|3\d{2}[\s\-]?\d{6,7})$/;

/** Codice SDI — ровно 7 буквенно-цифровых символов */
const SDI_PATTERN = /^[A-Z0-9]{7}$/i;

// ---------------------------------------------------------------------------

export class CheckFeeDto {
  @IsOptional()
  @IsString()
  @MinLength(11, { message: 'Il Codice Fiscale è obbligatorio' })
  @Matches(CF_PATTERN, {
    message: 'Codice Fiscale non valido (es. RSSMRA80A01H501T)',
  })
  taxCode?: string;
}

// ---------------------------------------------------------------------------

export class CreateReservationDto {
  @IsString()
  @IsNotEmpty({ message: "itemId è obbligatorio" })
  itemId: string;

  @IsOptional()
  @IsString()
  itemType?: string;

  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @IsString()
  time?: string;

  // --- Покупатель / Genitore ---

  @IsString()
  @MinLength(2, { message: 'Il nome deve avere almeno 2 caratteri' })
  @MaxLength(50, { message: 'Il nome è troppo lungo' })
  firstName: string;

  @IsString()
  @MinLength(2, { message: 'Il cognome deve avere almeno 2 caratteri' })
  @MaxLength(50, { message: 'Il cognome è troppo lungo' })
  lastName: string;

  @IsEmail({}, { message: 'Inserisci un indirizzo email valido' })
  email: string;

  @IsString()
  @Matches(PHONE_IT_PATTERN, {
    message: 'Numero di telefono non valido (es. +39 333 1234567)',
  })
  phone: string;

  // CF покупателя — обязателен только если isForChild=true (проверяется в сервисе)
  @IsOptional()
  @IsString()
  @ValidateIf((o) => !!o.purchaserTaxCode && o.purchaserTaxCode.trim() !== '')
  @Matches(CF_PATTERN, {
    message: 'Codice Fiscale del genitore/acquirente non valido (es. RSSMRA80A01H501T)',
  })
  purchaserTaxCode?: string;

  // --- Студент ---

  @IsOptional()
  @IsBoolean()
  isForChild?: boolean;

  @IsOptional()
  @ValidateIf((o) => o.isForChild === true)
  @IsString()
  @MinLength(2, { message: 'Il nome dello studente è obbligatorio (min. 2 caratteri)' })
  @MaxLength(50)
  studentFirstName?: string;

  @IsOptional()
  @ValidateIf((o) => o.isForChild === true)
  @IsString()
  @MinLength(2, { message: 'Il cognome dello studente è obbligatorio (min. 2 caratteri)' })
  @MaxLength(50)
  studentLastName?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email dello studente non valida' })
  studentEmail?: string;

  @IsOptional()
  @IsString()
  @ValidateIf((o) => !!o.studentPhone && o.studentPhone.trim() !== '')
  @Matches(PHONE_IT_PATTERN, {
    message: 'Numero di telefono dello studente non valido',
  })
  studentPhone?: string;

  // CF студента
  @IsOptional()
  @IsString()
  @ValidateIf((o) => !!o.studentTaxCode && o.studentTaxCode.trim() !== '')
  @Matches(CF_PATTERN, {
    message: 'Codice Fiscale dello studente non valido (es. RSSMRA80A01H501T)',
  })
  studentTaxCode?: string;

  @IsOptional()
  @IsString()
  studentBirthDate?: string;

  // --- Fattura aziendale ---

  @IsOptional()
  @IsBoolean()
  needsCompanyInvoice?: boolean;

  @IsOptional()
  @IsString()
  @ValidateIf((o) => !!o.sdiCode && o.sdiCode.trim() !== '')
  @Length(7, 7, {
    message: 'Il Codice SDI deve avere esattamente 7 caratteri',
  })
  @Matches(SDI_PATTERN, {
    message: 'Codice SDI non valido (solo lettere e numeri)',
  })
  sdiCode?: string;

  @IsOptional()
  @ValidateIf((o) => !!o.pecEmail && o.pecEmail.trim() !== '')
  @IsEmail({}, { message: 'Inserisci un indirizzo email PEC valido' })
  pecEmail?: string;

  // --- Прочее ---

  @IsOptional()
  @IsBoolean()
  includeRegistrationFee?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Le note non possono superare i 500 caratteri' })
  notes?: string;

  @IsOptional()
  @IsString()
  paymentStatus?: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string;
}

// ---------------------------------------------------------------------------

export class VerifyPaymentDto {
  @IsString()
  @IsNotEmpty({ message: 'sessionId è obbligatorio' })
  sessionId: string;

  @IsString()
  @IsNotEmpty({ message: 'bookingId è obbligatorio' })
  bookingId: string;
}

// ---------------------------------------------------------------------------

export class ContactFormDto {
  @IsString({ message: 'Il nome deve essere una stringa' })
  @IsNotEmpty({ message: 'Il nome è obbligatorio' })
  @MinLength(2, { message: 'Il nome deve contenere almeno 2 caratteri' })
  @MaxLength(50, { message: 'Il nome non può superare i 50 caratteri' })
  nome: string;

  @IsString({ message: 'Il cognome deve essere una stringa' })
  @IsNotEmpty({ message: 'Il cognome è obbligatorio' })
  @MinLength(2, { message: 'Il cognome deve contenere almeno 2 caratteri' })
  @MaxLength(50, { message: 'Il cognome non può superare i 50 caratteri' })
  cognome: string;

  @IsEmail({}, { message: 'Inserisci un indirizzo email valido' })
  @MaxLength(100, { message: "L'email non può superare i 100 caratteri" })
  email: string;

  @IsOptional()
  @ValidateIf((o) => !!o.telefono && o.telefono.trim() !== '')
  @Matches(PHONE_IT_PATTERN, {
    message: 'Numero di telefono non valido (es. +39 340 1234567 o 340 1234567)',
  })
  telefono?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: "L'interesse non può superare i 100 caratteri" })
  interesse?: string;

  @IsString({ message: 'Il messaggio deve essere una stringa' })
  @IsNotEmpty({ message: 'Il messaggio è obbligatorio' })
  @MinLength(10, { message: 'Il messaggio deve contenere almeno 10 caratteri' })
  @MaxLength(2000, { message: 'Il messaggio non può superare i 2000 caratteri' })
  messaggio: string;

  @IsOptional()
  @IsBoolean()
  privacy?: boolean;
}

