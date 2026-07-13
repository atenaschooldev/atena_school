import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { PaymentEntity } from '../domain/payment.entity';
import { PaymentsRepository } from '../domain/payments.repository.interface';
import { Prisma } from '@prisma/client';

@Injectable()
export class PrismaPaymentsRepository implements PaymentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(): Promise<PaymentEntity[]> {
    const list = await this.prisma.payment.findMany({
      include: {
        student: {
          include: {
            user: true,
          },
        },
      },
      orderBy: { paymentDate: 'desc' },
    });
    return list.map((p) => this.mapToEntity(p));
  }

  async findOne(id: string): Promise<PaymentEntity | null> {
    const p = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        student: {
          include: {
            user: true,
          },
        },
      },
    });
    if (!p) return null;
    return this.mapToEntity(p);
  }

  async create(data: {
    paymentNumber: string;
    studentId: string;
    price: number;
    paymentType: string;
    status?: string;
    paymentDate?: Date;
  }): Promise<PaymentEntity> {
    const p = await this.prisma.payment.create({
      data: {
        paymentNumber: data.paymentNumber,
        studentId: data.studentId,
        price: new Prisma.Decimal(data.price),
        paymentType: data.paymentType,
        status: data.status || 'pending',
        paymentDate: data.paymentDate || new Date(),
      },
      include: {
        student: {
          include: {
            user: true,
          },
        },
      },
    });
    return this.mapToEntity(p);
  }

  async update(id: string, data: Partial<PaymentEntity>): Promise<PaymentEntity> {
    const updateData: any = {};
    if (data.paymentNumber !== undefined) updateData.paymentNumber = data.paymentNumber;
    if (data.studentId !== undefined) updateData.studentId = data.studentId;
    if (data.price !== undefined) updateData.price = new Prisma.Decimal(data.price);
    if (data.paymentType !== undefined) updateData.paymentType = data.paymentType;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.paymentDate !== undefined) updateData.paymentDate = data.paymentDate;

    const p = await this.prisma.payment.update({
      where: { id },
      data: updateData,
      include: {
        student: {
          include: {
            user: true,
          },
        },
      },
    });
    return this.mapToEntity(p);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.payment.delete({
      where: { id },
    });
  }

  private mapToEntity(p: any): PaymentEntity {
    let studentName = 'Unknown Student';
    if (p.student && p.student.user) {
      studentName = `${p.student.user.firstName} ${p.student.user.lastName}`;
    }

    return {
      id: p.id,
      paymentNumber: p.paymentNumber,
      studentId: p.studentId,
      price: p.price ? Number(p.price) : 0,
      paymentType: p.paymentType,
      status: p.status,
      paymentDate: p.paymentDate,
      studentName,
    };
  }
}
