import { Controller, Get, Param, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CheckoutService } from './checkout.public.service';

@ApiTags('Public & App — Courses (Catalog)')
@Controller(['landing/courses', 'app/courses', 'courses'])
export class CoursesPublicController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Get()
  @ApiOperation({
    summary: 'Получить полный каталог активных курсов',
    description: 'Возвращает список всех активных курсов школы с привязанными преподавателями, форматами оплаты и расписанием',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Список курсов успешно получен',
    schema: {
      example: {
        success: true,
        courses: [
          {
            id: '550e8400-e29b-41d4-a716-446655440000',
            name: 'Corso di Inglese B1 Preliminary',
            title_it: 'Corso di Inglese B1 Preliminary',
            slug: 'b1-preliminary',
            price: 240,
            billing_type: 3,
            subscription_price: 240,
            stripe_monthly_price_id: 'price_1Qxyz...',
            category: 'languages',
            course_format: 1,
            lessons_per_week: 2,
            lesson_duration_minutes: 60,
            schedule_days: [1, 3],
            start_time: '16:00',
            end_time: '17:00',
            teacher_name: 'Sarah Jenkins',
            teacher_photo_url: 'https://...',
          },
        ],
      },
    },
  })
  async getPublicCourses() {
    return this.checkoutService.getPublicCourses();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Получить публичную информацию о курсе',
    description: 'Возвращает карточку курса по ID (UUID) или slug с информацией о преподавателе и поддерживаемых форматах оплаты (разово / подписка)',
  })
  @ApiParam({ name: 'id', description: 'UUID или slug курса (напр. b1-preliminary)', example: 'b1-preliminary' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Информация о курсе найдена',
    schema: {
      example: {
        success: true,
        item: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          name: 'Corso di Inglese B1 Preliminary',
          title_it: 'Corso di Inglese B1 Preliminary',
          slug: 'b1-preliminary',
          price: 240,
          billing_type: 3,
          subscription_price: 240,
          stripe_monthly_price_id: 'price_1Qxyz...',
          category: 'languages',
          course_format: 1,
          lessons_per_week: 2,
          lesson_duration_minutes: 60,
          schedule_days: [1, 3],
          start_time: '16:00',
          end_time: '17:00',
          teacher_name: 'Sarah Jenkins',
          teacher_photo_url: 'https://...',
        },
      },
    },
  })
  async getItem(@Param('id') id: string) {
    return this.checkoutService.getItem(id);
  }
}
