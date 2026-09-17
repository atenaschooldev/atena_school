import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsOptional,
  IsBoolean,
  IsNotEmpty,
  IsInt,
  MinLength,
  MaxLength,
  Matches,
  ValidateIf,
  Length,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BookingPaymentStatus, PaymentMethod, BillingScheme } from '@atena/api-types';

/**
 * Codice Fiscale — физлицо (16 символов) или Partita IVA (11 цифр).
 * Используется в @Matches() для полей purchaserTaxCode, studentTaxCode.
 */
const CF_PATTERN =
  /^([A-Z]{6}[0-9LMNPQRSTUV]{2}[ABCDEHLMPRST]{1}[0-9LMNPQRSTUV]{2}[A-Z]{1}[0-9LMNPQRSTUV]{3}[A-Z]{1}|[0-9]{11})$/i;

/**
 * Телефон: принимает итальянские (+39, 3xx, 0xx) и международные номера (E.164: +1, +380, +44 и т.д.)
 */
const PHONE_PATTERN = /^\+?[0-9\s\-().]{7,25}$/;

/** Codice SDI — ровно 7 буквенно-цифровых символов */
const SDI_PATTERN = /^[A-Z0-9]{7}$/i;

// ---------------------------------------------------------------------------

export class CheckFeeDto {
  @ApiPropertyOptional({
    description: 'Налоговый код (Codice Fiscale) для проверки статуса ежегодного членского взноса (€30)',
    example: 'RSSLCU10A01H501Z',
  })
  @IsOptional()
  @IsString()
  @ValidateIf((o) => !!o.taxCode && o.taxCode.trim() !== '')
  @MinLength(11, { message: 'Codice Fiscale обязателен (минимум 11 символов)' })
  @MaxLength(16, { message: 'Codice Fiscale не может быть длиннее 16 символов' })
  @Matches(CF_PATTERN, {
    message: 'Некорректный формат Codice Fiscale (напр. RSSMRA80A01H501T или 11 цифр P.IVA)',
  })
  taxCode?: string;
}

// ---------------------------------------------------------------------------

export class StudentItemDto {
  @ApiProperty({ description: 'Имя студента', example: 'Luca' })
  @IsString()
  @MinLength(2, { message: 'Имя студента должно содержать минимум 2 символа' })
  @MaxLength(50, { message: 'Имя студента слишком длинное (макс. 50 символов)' })
  firstName: string;

  @ApiProperty({ description: 'Фамилия студента', example: 'Rossi' })
  @IsString()
  @MinLength(2, { message: 'Фамилия студента должна содержать минимум 2 символа' })
  @MaxLength(50, { message: 'Фамилия студента слишком длинная (макс. 50 символов)' })
  lastName: string;

  @ApiPropertyOptional({ description: 'Личный email студента (опционально)', example: 'luca.rossi@gmail.com' })
  @IsOptional()
  @IsEmail({}, { message: 'Некорректный адрес электронной почты студента' })
  email?: string;

  @ApiPropertyOptional({ description: 'Личный телефон студента (опционально)', example: '+39 340 1234567' })
  @IsOptional()
  @IsString()
  @ValidateIf((o) => !!o.phone && o.phone.trim() !== '')
  @Matches(PHONE_PATTERN, {
    message: 'Некорректный формат номера телефона студента',
  })
  phone?: string;

  @ApiProperty({ description: 'Налоговый код (Codice Fiscale) студента', example: 'RSSLCU10A01H501Z' })
  @IsString()
  @MinLength(11, { message: 'Codice Fiscale студента обязателен' })
  @Matches(CF_PATTERN, {
    message: 'Некорректный формат Codice Fiscale студента (напр. RSSLCU10A01H501Z)',
  })
  taxCode: string;

  @ApiPropertyOptional({ description: 'Дата рождения студента (ГГГГ-ММ-ДД)', example: '2012-05-15' })
  @IsOptional()
  @IsString()
  birthDate?: string;
}

// ---------------------------------------------------------------------------

export class CreateReservationDto {
  @ApiProperty({ description: 'ID или slug выбранного курса', example: 'b1-preliminary' })
  @IsString()
  @IsNotEmpty({ message: 'itemId обязателен для создания бронирования' })
  itemId: string;

  @ApiPropertyOptional({ description: 'Тип элемента (course / exam)', default: 'course' })
  @IsOptional()
  @IsString()
  itemType?: string;

  @ApiPropertyOptional({ description: 'Выбранная дата начала занятий (ГГГГ-ММ-ДД)', example: '2026-10-01' })
  @IsOptional()
  @IsString()
  date?: string;

  @ApiPropertyOptional({ description: 'Выбранное время проведения занятий', example: '16:00' })
  @IsOptional()
  @IsString()
  time?: string;

  // --- Покупатель / Genitore ---

  @ApiProperty({ description: 'Имя покупателя / родителя', example: 'Mario' })
  @IsString()
  @MinLength(2, { message: 'Имя должно содержать как минимум 2 символа' })
  @MaxLength(50, { message: 'Имя слишком длинное (макс. 50 символов)' })
  firstName: string;

  @ApiProperty({ description: 'Фамилия покупателя / родителя', example: 'Rossi' })
  @IsString()
  @MinLength(2, { message: 'Фамилия должна содержать как минимум 2 символа' })
  @MaxLength(50, { message: 'Фамилия слишком длинная (макс. 50 символов)' })
  lastName: string;

  @ApiProperty({ description: 'Email покупателя / родителя', example: 'mario.rossi@gmail.com' })
  @IsEmail({}, { message: 'Введите корректный адрес электронной почты' })
  email: string;

  @ApiProperty({ description: 'Телефон покупателя / родителя (WhatsApp)', example: '+39 375 605 2362' })
  @IsString()
  @Matches(PHONE_PATTERN, {
    message: 'Некорректный номер телефона (напр. +39 333 1234567)',
  })
  phone: string;

  @ApiPropertyOptional({ description: 'Codice Fiscale покупателя / родителя (для фискального чека)', example: 'RSSMRA80A01H501T' })
  @IsOptional()
  @IsString()
  @ValidateIf((o) => !!o.purchaserTaxCode && o.purchaserTaxCode.trim() !== '')
  @Matches(CF_PATTERN, {
    message: 'Некорректный Codice Fiscale покупателя / родителя (напр. RSSMRA80A01H501T)',
  })
  purchaserTaxCode?: string;

  // --- Мульти-студенты (N детей/учеников) ---

  @ApiPropertyOptional({ description: 'Список студентов/детей для групповой записи на курс', type: [StudentItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StudentItemDto)
  students?: StudentItemDto[];

  // --- Одиночный студент (обратная совместимость) ---

  @ApiPropertyOptional({ description: 'Флаг: покупка оформляется родителем для несовершеннолетнего ребенка' })
  @IsOptional()
  @IsBoolean()
  isForChild?: boolean;

  @ApiPropertyOptional({ description: 'Имя студента (для одиночной записи)', example: 'Luca' })
  @IsOptional()
  @ValidateIf((o) => o.isForChild === true && (!o.students || o.students.length === 0))
  @IsString()
  @MinLength(2, { message: 'Имя студента обязательно (минимум 2 символа)' })
  @MaxLength(50, { message: 'Имя студента слишком длинное' })
  studentFirstName?: string;

  @ApiPropertyOptional({ description: 'Фамилия студента (для одиночной записи)', example: 'Rossi' })
  @IsOptional()
  @ValidateIf((o) => o.isForChild === true && (!o.students || o.students.length === 0))
  @IsString()
  @MinLength(2, { message: 'Фамилия студента обязательна (минимум 2 символа)' })
  @MaxLength(50, { message: 'Фамилия студента слишком длинная' })
  studentLastName?: string;

  @ApiPropertyOptional({ description: 'Email студента (для одиночной записи)' })
  @IsOptional()
  @IsEmail({}, { message: 'Некорректный адрес электронной почты студента' })
  studentEmail?: string;

  @ApiPropertyOptional({ description: 'Телефон студента (для одиночной записи)' })
  @IsOptional()
  @IsString()
  @ValidateIf((o) => !!o.studentPhone && o.studentPhone.trim() !== '')
  @Matches(PHONE_PATTERN, {
    message: 'Некорректный номер телефона студента',
  })
  studentPhone?: string;

  @ApiPropertyOptional({ description: 'Codice Fiscale студента (для одиночной записи)', example: 'RSSLCU10A01H501Z' })
  @IsOptional()
  @IsString()
  @ValidateIf((o) => !!o.studentTaxCode && o.studentTaxCode.trim() !== '')
  @Matches(CF_PATTERN, {
    message: 'Некорректный Codice Fiscale студента (напр. RSSMRA80A01H501T)',
  })
  studentTaxCode?: string;

  @ApiPropertyOptional({ description: 'Дата рождения студента (для одиночной записи)', example: '2012-05-15' })
  @IsOptional()
  @IsString()
  studentBirthDate?: string;

  // --- Fattura aziendale ---

  @ApiPropertyOptional({ description: 'Запрос на электронную фактуру для юридического лица / P.IVA (B2B)' })
  @IsOptional()
  @IsBoolean()
  needsCompanyInvoice?: boolean;

  @ApiPropertyOptional({ description: 'Код получателя SDI для электронной фактуры (7 символов)', example: 'SUBM70N' })
  @IsOptional()
  @IsString()
  @ValidateIf((o) => !!o.sdiCode && o.sdiCode.trim() !== '')
  @Length(7, 7, {
    message: 'Код SDI должен содержать ровно 7 символов',
  })
  @Matches(SDI_PATTERN, {
    message: 'Некорректный формат кода SDI (допустимы только буквы и цифры)',
  })
  sdiCode?: string;

  @ApiPropertyOptional({ description: 'Email PEC компании для отправки электронной фактуры', example: 'azienda@pec.it' })
  @IsOptional()
  @ValidateIf((o) => !!o.pecEmail && o.pecEmail.trim() !== '')
  @IsEmail({}, { message: 'Введите корректный адрес электронной почты PEC' })
  pecEmail?: string;

  // --- Прочее ---

  @ApiPropertyOptional({ description: 'Включить ежегодный членский взнос (€30) в сумму заказа', default: true })
  @IsOptional()
  @IsBoolean()
  includeRegistrationFee?: boolean;

  @ApiPropertyOptional({ description: 'Примечания или пожелания для секретариата школы' })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Длина примечания не может превышать 500 символов' })
  notes?: string;

  @ApiPropertyOptional({
    description: 'Статус платежа (строго числовой код): 1=PENDING, 2=RESERVED, 3=PAID, 4=REFUNDED, 5=PARTIALLY_REFUNDED, 6=FAILED, 7=CANCELLED',
    enum: BookingPaymentStatus,
    example: BookingPaymentStatus.RESERVED,
    default: BookingPaymentStatus.RESERVED,
  })
  @IsOptional()
  @IsInt({ message: 'paymentStatus должен быть числовым энамом (1..7)' })
  paymentStatus?: BookingPaymentStatus;

  @ApiPropertyOptional({ description: 'Ключ идемпотентности для предотвращения дублирования бронирований', example: 'client_req_123456789' })
  @IsOptional()
  @IsString()
  idempotencyKey?: string;

  @ApiPropertyOptional({
    description: 'Способ оплаты (строго числовой код): 1=STRIPE, 2=CASH, 3=POS, 4=BANK_TRANSFER',
    enum: PaymentMethod,
    example: PaymentMethod.CASH,
    default: PaymentMethod.CASH,
  })
  @IsOptional()
  @IsInt({ message: 'paymentMethod должен быть числовым энамом (1..4)' })
  paymentMethod?: PaymentMethod;

  @ApiPropertyOptional({
    description: 'Схема оплаты: 1=FULL, 2=INSTALLMENTS, 3=PER_LESSON, 4=SUBSCRIPTION',
    enum: BillingScheme,
    example: BillingScheme.FULL,
    default: BillingScheme.FULL,
  })
  @IsOptional()
  @IsInt({ message: 'billingScheme должен быть числовым энамом (1..4)' })
  billingScheme?: BillingScheme;
}

// ---------------------------------------------------------------------------

export class VerifyPaymentDto {
  @ApiProperty({ description: 'Идентификатор Stripe Checkout сессии (sessionId)', example: 'cs_test_a1b2c3' })
  @IsString()
  @IsNotEmpty({ message: 'sessionId обязателен' })
  sessionId: string;

  @ApiProperty({ description: 'Идентификатор бронирования в базе данных (bookingId)', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsString()
  @IsNotEmpty({ message: 'bookingId обязателен' })
  bookingId: string;
}

// ---------------------------------------------------------------------------

export class ContactFormDto {
  @ApiProperty({ description: 'Имя отправителя', example: 'Mario' })
  @IsString({ message: 'Имя должно быть строкой' })
  @IsNotEmpty({ message: 'Имя обязательно для заполнения' })
  @MinLength(2, { message: 'Имя должно содержать как минимум 2 символа' })
  @MaxLength(50, { message: 'Имя не должно превышать 50 символов' })
  nome: string;

  @ApiProperty({ description: 'Фамилия отправителя', example: 'Rossi' })
  @IsString({ message: 'Фамилия должна быть строкой' })
  @IsNotEmpty({ message: 'Фамилия обязательна для заполнения' })
  @MinLength(2, { message: 'Фамилия должна содержать как минимум 2 символа' })
  @MaxLength(50, { message: 'Фамилия не должна превышать 50 символов' })
  cognome: string;

  @ApiProperty({ description: 'Email отправителя', example: 'mario.rossi@gmail.com' })
  @IsEmail({}, { message: 'Введите корректный адрес электронной почты' })
  @MaxLength(100, { message: 'Email не должен превышать 100 символов' })
  email: string;

  @ApiPropertyOptional({ description: 'Телефон отправителя', example: '+39 340 1234567' })
  @IsOptional()
  @ValidateIf((o) => !!o.telefono && o.telefono.trim() !== '')
  @Matches(PHONE_PATTERN, {
    message: 'Некорректный номер телефона (напр. +39 340 1234567)',
  })
  telefono?: string;

  @ApiPropertyOptional({ description: 'Интересующее направление или курс', example: 'Corsi di Inglese' })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Поле интерес не должно превышать 100 символов' })
  interesse?: string;

  @ApiProperty({ description: 'Текст сообщения', example: 'Vorrei informazioni sui corsi...' })
  @IsString({ message: 'Сообщение должно быть строкой' })
  @IsNotEmpty({ message: 'Сообщение обязательно для заполнения' })
  @MinLength(10, { message: 'Сообщение должно содержать как минимум 10 символов' })
  @MaxLength(2000, { message: 'Сообщение не должно превышать 2000 символов' })
  messaggio: string;

  @ApiPropertyOptional({ description: 'Согласие с политикой конфиденциальности GDPR', default: true })
  @IsOptional()
  @IsBoolean()
  privacy?: boolean;
}

// ---------------------------------------------------------------------------

export class CustomerPortalDto {
  @ApiPropertyOptional({
    description: 'Идентификатор клиента Stripe (cus_...)',
    example: 'cus_R1234567890abc',
  })
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiPropertyOptional({
    description: 'UUID бронирования с привязанным stripe_customer_id',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsString()
  bookingId?: string;

  @ApiPropertyOptional({
    description: 'Email покупателя или студента для поиска активной подписки',
    example: 'mario.rossi@gmail.com',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Введите корректный адрес электронной почты' })
  email?: string;

  @ApiPropertyOptional({
    description: 'URL возврата после завершения действий в кабинете Stripe',
    example: 'https://atena.school/checkout',
  })
  @IsOptional()
  @IsString()
  returnUrl?: string;
}


