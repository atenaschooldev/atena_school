import { Injectable, NotFoundException } from '@nestjs/common';
import { PaymentsRepository } from './domain/payments.repository.interface';

@Injectable()
export class PaymentsService {
  constructor(private readonly paymentsRepository: PaymentsRepository) {}

  async listPayments() {
    const list = await this.paymentsRepository.findMany();
    return list.map((p) => this.mapResponse(p));
  }

  async getPayment(id: string) {
    const p = await this.paymentsRepository.findOne(id);
    if (!p) throw new NotFoundException('Платеж не найден');
    return this.mapResponse(p);
  }

  async createPayment(dto: any) {
    const payNumber = dto.payment_number || `PAY-${Date.now()}`;
    const p = await this.paymentsRepository.create({
      paymentNumber: payNumber,
      studentId: dto.student_id || dto.studentId,
      price: Number(dto.amount || dto.price || 0),
      paymentType: dto.payment_type || dto.paymentType || 'invoice',
      status: dto.status || 'pending',
      paymentDate: dto.created_at ? new Date(dto.created_at) : new Date(),
    });
    return this.mapResponse(p);
  }

  private mapResponse(p: any) {
    return {
      id: p.id,
      payment_number: p.paymentNumber,
      student_id: p.studentId,
      amount: p.price,
      payment_type: p.paymentType,
      status: p.status,
      created_at: p.paymentDate.toISOString(),
      student_name: p.studentName,
    };
  }
}
