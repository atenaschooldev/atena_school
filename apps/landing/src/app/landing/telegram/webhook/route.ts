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

      if (botToken && chatId && (text === '/start' || text === '/help' || text === '/ping')) {
        const welcomeText =
          `👋 <b>Atena School Management Bot</b>\n\n` +
          `Questo bot è attivo per inviare notifiche in tempo reale e gestire i pagamenti e le iscrizioni della scuola.\n\n` +
          `• 💶 <b>Salda Quota:</b> Registra il versamento della quota associativa di €30\n` +
          `• 🎓 <b>Salda Corso:</b> Conferma il saldo del corso (in contanti o POS)\n` +
          `• ✅ <b>Salda Tutto:</b> Conferma sia quota che corso in un solo click\n` +
          `• ❌ <b>Annulla:</b> Annulla la prenotazione e le relative lezioni\n\n` +
          `Chat ID attuale: <code>${chatId}</code>`;

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
