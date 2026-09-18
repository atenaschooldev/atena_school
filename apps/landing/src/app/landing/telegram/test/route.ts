import { NextRequest, NextResponse } from 'next/server';
import { sendTelegramMessage } from '@/lib/server/telegram-service';
import { validateInternalAuth } from '@/lib/server/api-auth';

export async function POST(request: NextRequest) {
  const auth = validateInternalAuth(request);
  if (!auth.authorized) {
    return auth.errorResponse!;
  }

  try {
    const text = '🔔 <b>TEST ATENA NOTIFICATION BOT (Vercel Serverless)</b>\n\nIl bot Telegram di Atena School è configurato correttamente e attivo per ricevere le notifiche su Vercel!';
    const buttons = [
      [{ text: '🌐 Apri Portale Admin', url: 'https://atena-school-admin.vercel.app' }],
    ];

    const result = await sendTelegramMessage({ text, inlineKeyboard: buttons });
    return NextResponse.json({ success: result.success, timestamp: new Date().toISOString() });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
