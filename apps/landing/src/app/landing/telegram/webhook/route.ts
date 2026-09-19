import { NextRequest, NextResponse } from 'next/server';
import { handleTelegramCallbackAction } from '@atena/core';
import { getSupabaseAdmin } from '@/lib/server/supabase-admin';
import { withLandingApiLog } from '@/lib/server/api-logger';

async function handler(request: NextRequest) {
  // 1. Verify Telegram Webhook Secret Token (if configured)
  const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (webhookSecret) {
    const receivedSecret = request.headers.get('x-telegram-bot-api-secret-token');
    if (receivedSecret !== webhookSecret) {
      return NextResponse.json({ ok: false, error: 'Unauthorized secret token' }, { status: 401 });
    }
  }

  try {
    const update = await request.json();
    const supabase = getSupabaseAdmin();

    // Prepare list of allowed chat/user IDs
    const allowedChatIds: string[] = [];
    if (process.env.TELEGRAM_CHAT_ID) {
      allowedChatIds.push(String(process.env.TELEGRAM_CHAT_ID).trim());
    }
    if (process.env.TELEGRAM_ALLOWED_USER_IDS) {
      const ids = process.env.TELEGRAM_ALLOWED_USER_IDS.split(',').map((id) => id.trim()).filter(Boolean);
      allowedChatIds.push(...ids);
    }

    // 2. Handle Inline Button Callback Queries
    if (update.callback_query) {
      const result = await handleTelegramCallbackAction({
        callbackQuery: update.callback_query,
        supabase,
        botToken: process.env.TELEGRAM_BOT_TOKEN,
        allowedChatIds: allowedChatIds.length > 0 ? allowedChatIds : undefined,
      });

      return NextResponse.json({ ok: true, result });
    }

    // 3. Handle Direct Text Messages or Commands (e.g., /start, /ping)
    if (update.message) {
      const chatId = update.message.chat?.id;
      const text = (update.message.text || '').trim();
      const botToken = process.env.TELEGRAM_BOT_TOKEN;

      if (botToken && chatId && (text.startsWith('/start') || text.startsWith('/help') || text.startsWith('/ping') || text.startsWith('/lang'))) {
        const welcomeText =
          `👋 <b>Atena School Management Bot</b>\n\n` +
          `🇮🇹 <b>Italiano:</b>\n` +
          `Questo bot invia notifiche in tempo reale e permette di gestire pagamenti e iscrizioni.\n` +
          `• 💶 <b>Salda Quota:</b> Registra il versamento della quota associativa di €30\n` +
          `• 🎓 <b>Salda Corso:</b> Conferma il saldo del corso\n` +
          `• ✅ <b>Salda Tutto:</b> Conferma sia quota che corso in un solo click\n` +
          `• ❌ <b>Annulla:</b> Annulla la prenotazione\n` +
          `• 🌐 <b>Tasto Lingua:</b> Cambia al volo tra Italiano e Inglese\n\n` +
          `🇬🇧 <b>English:</b>\n` +
          `This bot delivers real-time notifications and allows managing student payments and enrollments.\n` +
          `• 💶 <b>Settle Fee:</b> Record receipt of the €30 annual registration fee\n` +
          `• 🎓 <b>Settle Course:</b> Confirm course fee balance\n` +
          `• ✅ <b>Settle All:</b> Confirm both course & annual fee in one click\n` +
          `• ❌ <b>Cancel:</b> Cancel the registration\n` +
          `• 🌐 <b>Language Button:</b> Switch between Italian and English on the fly\n\n` +
          `Chat ID: <code>${chatId}</code>`;

        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: welcomeText,
            parse_mode: 'HTML',
          }),
        }).catch(() => null);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    console.error('Telegram Webhook Error:', err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export const POST = withLandingApiLog(handler, {
  controller: 'TelegramController',
  action: 'handleTelegramWebhook',
});
