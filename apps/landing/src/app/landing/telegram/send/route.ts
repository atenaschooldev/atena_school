import { NextRequest, NextResponse } from 'next/server';
import { sendTelegramMessage } from '@/lib/server/telegram-service';
import { validateInternalAuth } from '@/lib/server/api-auth';

export async function POST(request: NextRequest) {
  const auth = validateInternalAuth(request);
  if (!auth.authorized) {
    return auth.errorResponse!;
  }

  try {
    const body = await request.json();
    const { text, buttons } = body;

    if (!text) {
      return NextResponse.json({ error: 'Missing required field: text is required' }, { status: 400 });
    }

    const result = await sendTelegramMessage({ text, inlineKeyboard: buttons });
    return NextResponse.json({ success: result.success });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
