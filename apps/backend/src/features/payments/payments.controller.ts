import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { AuthGuard } from '../../core/guards/auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';

@ApiTags('Admin — Payments')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard, RolesGuard)
@Controller('admin/payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'Получить список транзакций / платежей' })
  async findAll(@Query('bookingId') bookingId?: string) {
    return this.paymentsService.findAll(bookingId);
  }

  @Get(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Получить информацию о конкретном платеже' })
  async findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Зарегистрировать платеж' })
  async create(@Body() dto: any) {
    return this.paymentsService.create(dto);
  }

  @Patch(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Обновить платеж' })
  async update(@Param('id') id: string, @Body() dto: any) {
    return this.paymentsService.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Удалить платеж' })
  async remove(@Param('id') id: string) {
    return this.paymentsService.remove(id);
  }
}
