export class PaymentEntity {
  id: string;
  paymentNumber: string;
  studentId: string;
  price: number;
  paymentType: string;
  status: string;
  paymentDate: Date;

  // Joined information (optional)
  studentName?: string;
}
