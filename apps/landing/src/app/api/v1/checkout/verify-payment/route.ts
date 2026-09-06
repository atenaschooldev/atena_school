import { NextRequest, NextResponse } from 'next/server';
import { verifyPayment } from '@/lib/server/checkout-service';
import { verifyPaymentSchema } from '@atena/validators';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: 'JSON non valido' },
      { status: 400 }
    );
  }

  const parsed = verifyPaymentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: 'Dati non validi',
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 422 }
    );
  }

  try {
    const result = await verifyPayment(parsed.data);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Impossibile verificare il pagamento' },
      { status: 400 }
    );
  }
}

