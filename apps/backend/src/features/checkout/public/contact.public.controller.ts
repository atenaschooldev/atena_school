import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CheckoutService } from './checkout.public.service';
import { ContactFormDto } from '../dto/checkout.public.dto';

@ApiTags('Public — Contact Leads')
@Controller('contact')
export class ContactPublicController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Отправка формы обратной связи / лида',
    description: 'Сохраняет входящую заявку/сообщение в таблицу contact_messages для обработки секретариатом',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Сообщение успешно сохранено',
    schema: { example: { success: true, message: 'Сообщение успешно отправлено' } },
  })
  async submitContact(@Body() dto: ContactFormDto) {
    return this.checkoutService.submitContact(dto);
  }
}
