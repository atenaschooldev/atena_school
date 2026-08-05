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
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { PaymentsService } from './payments.service';
import { AuthGuard } from '../../core/guards/auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { Audit } from '../../core/decorators/audit.decorator';
import { AuditInterceptor } from '../../core/interceptors/audit.interceptor';

export class CreatePaymentDto {
  @IsOptional()
  @IsString()
  bookingId?: string;

  @IsOptional()
  @IsString()
  studentId?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsString()
  paymentMethod: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  provider?: string;

  @IsOptional()
  @IsString()
  providerTransactionId?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  paidAt?: string;
}

export class UpdatePaymentDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  studentId?: string;

  @IsOptional()
  @IsString()
  bookingId?: string;

  @IsOptional()
  @IsString()
  paidAt?: string;
}

@ApiTags('Admin — Payments')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard, RolesGuard)
@UseInterceptors(AuditInterceptor)
@Controller('admin/payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'Получить список транзакций / платежей' })
  async findAll(
    @Query('bookingId') bookingId?: string,
    @Query('studentId') studentId?: string,
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('method') method?: string,
  ) {
    return this.paymentsService.findAll(bookingId, studentId, { status, type, method });
  }

  @Get('summary')
  @Roles('admin')
  @ApiOperation({ summary: 'Получить сводку кассового аудита и финансовых показателей' })
  async getSummary() {
    return this.paymentsService.getSummary();
  }

  @Get(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Получить информацию о конкретном платеже' })
  async findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }

  @Post('pos-checkout')
  @Roles('admin')
  @Audit('payments', 'pos_checkout')
  @ApiOperation({ summary: 'Универсальная кассовая регистрация оплаты (курс, взнос €30, урок)' })
  async posCheckout(@Body() dto: any) {
    return this.paymentsService.posCheckout(dto);
  }

  @Post()
  @Roles('admin')
  @Audit('payments', 'create')
  @ApiOperation({ summary: 'Зарегистрировать платеж' })
  async create(@Body() dto: CreatePaymentDto) {
    return this.paymentsService.create(dto);
  }

  @Patch(':id')
  @Roles('admin')
  @Audit('payments', 'update')
  @ApiOperation({ summary: 'Обновить платеж' })
  async update(@Param('id') id: string, @Body() dto: UpdatePaymentDto) {
    return this.paymentsService.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  @Audit('payments', 'delete')
  @ApiOperation({ summary: 'Удалить платеж' })
  async remove(@Param('id') id: string) {
    return this.paymentsService.remove(id);
  }
}
