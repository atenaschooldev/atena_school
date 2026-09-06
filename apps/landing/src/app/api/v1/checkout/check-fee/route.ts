import { NextRequest, NextResponse } from 'next/server';
import { checkFeeStatus } from '@/lib/server/checkout-service';
import { checkFeeSchema } from '@atena/validators';
import { checkRateLimit, getClientIp } from '@/lib/server/rate-limit';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rate = checkRateLimit(`check-fee:${ip}`, { intervalMs: 60 * 1000, maxRequests: 30 });
  if (!rate.success) {
    return NextResponse.json(
      { success: false, annualFeePaid: false, userFound: false, requiresFee: true, error: 'Troppi tentativi. Riprova tra un minuto.' },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, annualFeePaid: false, userFound: false, requiresFee: true, error: 'JSON non valido' },
      { status: 400 }
    );
  }

  const parsed = checkFeeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        annualFeePaid: false,
        userFound: false,
        requiresFee: true,
        error: 'Dati non validi',
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 422 }
    );
  }

  try {
    const result = await checkFeeStatus(parsed.data);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { success: false, annualFeePaid: false, userFound: false, requiresFee: true, error: err.message },
      { status: 500 }
    );
  }
}

