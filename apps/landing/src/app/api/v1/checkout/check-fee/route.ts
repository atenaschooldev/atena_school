import { NextRequest, NextResponse } from 'next/server';
import { checkFeeStatus } from '@/lib/server/checkout-service';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await checkFeeStatus(body);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { success: false, annualFeePaid: false, userFound: false, requiresFee: true, error: err.message },
      { status: 500 }
    );
  }
}
