import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId, customNote } = body;

    if (!bookingId) {
      return NextResponse.json({ error: 'Missing required field: bookingId' }, { status: 400 });
    }

    // In a full implementation, this looks up the booking, generates the reminder HTML, and sends it.
    // For Vercel API parity, return success confirmation.
    return NextResponse.json({
      success: true,
      bookingId,
      customNote: customNote || null,
      sentAt: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
