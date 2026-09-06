import { NextRequest, NextResponse } from 'next/server';
import { checkFeeStatus } from '@/lib/server/checkout-service';
import { checkFeeSchema } from '@atena/validators';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
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

