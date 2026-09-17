import { NextResponse } from 'next/server';
import { sendTelegramMessage } from '@/lib/server/telegram-service';

export async function POST() {
  try {
    const text = '🔔 <b>TEST ATENA NOTIFICATION BOT (Vercel Serverless)</b>\n\nIl bot Telegram di Atena School è configurato correttamente e attivo per ricevere le notifiche su Vercel!';
    const buttons = [
      [{ text: '🌐 Apri Portale Admin', url: 'https://atena-school-admin.vercel.app' }],
    ];

    const success = await sendTelegramMessage(text, buttons);
    return NextResponse.json({ success, timestamp: new Date().toISOString() });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
