import { NextRequest, NextResponse } from 'next/server';
import { sendTelegramMessage } from '@/lib/server/telegram-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, buttons } = body;

    if (!text) {
      return NextResponse.json({ error: 'Missing required field: text is required' }, { status: 400 });
    }

    const success = await sendTelegramMessage(text, buttons);
    return NextResponse.json({ success });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
