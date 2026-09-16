import { NextRequest, NextResponse } from 'next/server';
import { createStripeSession } from '@/lib/server/checkout-service';
import { createReservationSchema } from '@atena/validators';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: 'Corpo della richiesta non valido (JSON malformato)' },
      { status: 400 }
    );
  }

  const parsed = createReservationSchema.safeParse(body);
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
    const result = await createStripeSession(parsed.data);
    return NextResponse.json(result, { status: 201 });
  } catch (err: any) {
    console.error('[create-stripe-session route error]:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Impossibile avviare il pagamento con Stripe' },
      { status: 400 }
    );
  }
}
