import { NextRequest, NextResponse } from 'next/server';
import { submitContact } from '@/lib/server/checkout-service';
import { contactFormSchema } from '@atena/validators';
import { checkRateLimit, getClientIp } from '@/lib/server/rate-limit';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rate = checkRateLimit(`contact:${ip}`, { intervalMs: 60 * 1000, maxRequests: 5 });
  if (!rate.success) {
    return NextResponse.json(
      { success: false, error: 'Troppi tentativi. Riprova tra un minuto.' },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: 'JSON non valido' },
      { status: 400 }
    );
  }

  const parsed = contactFormSchema.safeParse(body);
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
    const result = await submitContact(parsed.data);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Impossibile inviare il messaggio' },
      { status: 400 }
    );
  }
}

