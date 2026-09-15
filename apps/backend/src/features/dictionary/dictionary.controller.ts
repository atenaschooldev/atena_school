import { Controller, Get, Header, Headers, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DictionaryService } from './dictionary.service';

@ApiTags('Dictionary / Справочники')
@Controller('dictionary')
export class DictionaryController {
  constructor(private readonly dictionaryService: DictionaryService) {}

  @Get()
  @ApiOperation({
    summary: 'Получить словарь перечислений (HTML в браузере или JSON по API)',
    description:
      'Возвращает все системные числовые коды статусов, их названия на трёх языках (IT, EN, RU) и описания. При запросе из браузера отдаёт готовую интерактивную HTML-страницу.',
  })
  @ApiResponse({
    status: 200,
    description: 'Полный структурированный словарь статусов и перечислений',
  })
  getAll(@Headers('accept') acceptHeader?: string, @Res({ passthrough: true }) res?: any) {
    if (acceptHeader && acceptHeader.includes('text/html')) {
      res.header('Content-Type', 'text/html; charset=utf-8');
      return this.dictionaryService.renderHtml();
    }
    return this.dictionaryService.getAll();
  }

  @Get('view')
  @Header('Content-Type', 'text/html; charset=utf-8')
  @ApiOperation({
    summary: 'Интерактивная HTML-страница словаря',
    description: 'Возвращает графическую таблицу со всеми статусами, кодами и фильтрами',
  })
  getView() {
    return this.dictionaryService.renderHtml();
  }

  @Get('bookings')
  @ApiOperation({
    summary: 'Словарь перечислений для таблицы бронирований (bookings)',
    description:
      'Возвращает числовые статусы оплаты (BookingPaymentStatus: 1=PENDING..7=CANCELLED), статусы брони (BookingStatus: 1=ACTIVE..3=CANCELLED), статусы расписания (BookingSchedulingStatus: 1=SCHEDULED..2=PENDING_COORDINATION), методы оплаты (PaymentMethod: 1=STRIPE..4=BANK_TRANSFER) и схемы биллинга (BillingScheme: 1=FULL..3=PER_LESSON).',
  })
  @ApiResponse({
    status: 200,
    description: 'Словарь числовых статусов таблицы bookings',
  })
  getBookings() {
    return this.dictionaryService.getBookingsDictionary();
  }

  @Get('payments')
  @ApiOperation({
    summary: 'Словарь перечислений для таблицы платежей (payments)',
    description:
      'Возвращает числовые валюты (PaymentCurrency: 1=EUR..3=GBP), методы оплаты (PaymentMethod: 1=STRIPE..4=BANK_TRANSFER), типы платежей (PaymentType: 1=COURSE_PAYMENT..8=OTHER), статусы транзакций (PaymentRecordStatus: 1=PENDING..6=CANCELLED) и провайдеры (PaymentProvider: 1=STRIPE..4=BANK).',
  })
  @ApiResponse({
    status: 200,
    description: 'Словарь числовых статусов таблицы payments',
  })
  getPayments() {
    return this.dictionaryService.getPaymentsDictionary();
  }

  @Get('lessons')
  @ApiOperation({
    summary: 'Словарь перечислений для таблицы уроков (lessons)',
    description:
      'Возвращает числовые статусы урока (LessonStatus: 1=SCHEDULED..4=RESCHEDULED), посещаемость (LessonAttendance: 1=PENDING..5=EXCUSED) и тип проведения (LessonLocationType: 1=IN_PERSON..3=HYBRID).',
  })
  @ApiResponse({
    status: 200,
    description: 'Словарь числовых статусов таблицы lessons',
  })
  getLessons() {
    return this.dictionaryService.getLessonsDictionary();
  }

  @Get('memberships')
  @ApiOperation({
    summary: 'Словарь перечислений для таблицы годовых членств (annual_memberships)',
    description:
      'Возвращает числовые статусы членской карты (MembershipStatus: 1=ACTIVE..4=REVOKED) с переводами и описанием.',
  })
  @ApiResponse({
    status: 200,
    description: 'Словарь числовых статусов таблицы annual_memberships',
  })
  getMemberships() {
    return this.dictionaryService.getAnnualMembershipsDictionary();
  }

  @Get('courses')
  @ApiOperation({
    summary: 'Словарь перечислений для таблицы курсов (courses)',
    description:
      'Возвращает числовые статусы курса (CourseStatus: 1=ACTIVE..3=ARCHIVED), типы расписания (CourseScheduleType: 1=FIXED..2=FLEXIBLE) и форматы проведения (CourseFormat: 1=GROUP..4=CERTIFICATION).',
  })
  @ApiResponse({
    status: 200,
    description: 'Словарь числовых статусов таблицы courses',
  })
  getCourses() {
    return this.dictionaryService.getCoursesDictionary();
  }

  @Get('students')
  @ApiOperation({
    summary: 'Словарь перечислений для таблицы студентов (students)',
    description:
      'Возвращает числовые статусы студента (StudentStatus: 1=ACTIVE..5=ARCHIVED) и уровни языка CEFR (LanguageLevel: 1=A1..6=C2).',
  })
  @ApiResponse({
    status: 200,
    description: 'Словарь числовых статусов таблицы students',
  })
  getStudents() {
    return this.dictionaryService.getStudentsDictionary();
  }

  @Get('app-settings')
  @ApiOperation({
    summary: 'Словарь ключей и описания таблицы системных настроек (app_settings)',
    description:
      'Возвращает ключи настроек приложения (AppSettingKey: stripe_enabled) с их назначением и переводами.',
  })
  @ApiResponse({
    status: 200,
    description: 'Словарь параметров конфигурации таблицы app_settings',
  })
  getAppSettings() {
    return this.dictionaryService.getAppSettingsDictionary();
  }
}
