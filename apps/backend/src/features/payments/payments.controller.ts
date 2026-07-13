import { Controller, Get, Post, Body, Param, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '../../core/guards/auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { Audit } from '../../core/decorators/audit.decorator';
import { AuditInterceptor } from '../../core/interceptors/audit.interceptor';
import { PaymentsService } from './payments.service';

@ApiTags('payments')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard, RolesGuard)
@UseInterceptors(AuditInterceptor)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  @Roles('admin', 'student', 'parent')
  @ApiOperation({ summary: 'Получить список платежей' })
  async listPayments() {
    return this.paymentsService.listPayments();
  }

  @Get(':id')
  @Roles('admin', 'student', 'parent')
  @ApiOperation({ summary: 'Получить информацию о платеже' })
  async getPayment(@Param('id') id: string) {
    return this.paymentsService.getPayment(id);
  }

  @Post()
  @Roles('admin')
  @Audit('payments', 'create')
  @ApiOperation({ summary: 'Зарегистрировать новый платеж / счет' })
  async createPayment(@Body() dto: any) {
    return this.paymentsService.createPayment(dto);
  }
}
