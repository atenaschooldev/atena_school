import { Controller, Get, Param, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CheckoutService } from './checkout.public.service';

@ApiTags('Public — Courses Catalog')
@Controller('courses')
export class CoursesPublicController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Get()
  @ApiOperation({
    summary: 'Получить полный каталог активных курсов',
    description: 'Возвращает список всех активных курсов школы с привязанными преподавателями',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Список курсов успешно получен',
  })
  async getPublicCourses() {
    return this.checkoutService.getPublicCourses();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Получить публичную информацию о курсе',
    description: 'Возвращает карточку курса по ID (UUID) или slug с информацией о преподавателе',
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
          slug: 'b1-preliminary',
          price: 240,
          category: 'languages',
          teacher_name: 'Sarah Jenkins',
        },
      },
    },
  })
  async getItem(@Param('id') id: string) {
    return this.checkoutService.getItem(id);
  }
}
