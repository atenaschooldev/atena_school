/**
 * Данный скрипт протестирует вашу функцию create-checkout-session, 
 * имитируя запрос с фронтенда.
 *
 * Запуск:
 * node scripts/test-payment.mjs
 */

const SUPABASE_URL = "http://localhost:54321"; // Дефолтный порт локального Supabase
const ANON_KEY = "YOUR_ANON_KEY_HERE"; // Вставьте ваш локальный anon key (от npx supabase status)

async function testCheckoutSession() {
  console.log("🚀 Запуск теста оплаты (создание сессии)...");

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/create-checkout-session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${ANON_KEY}`
      },
      body: JSON.stringify({
        // Здесь мы подставляем тестовые данные (нужно, чтобы itemId реально существовал в таблице `courses` локальной БД)
        itemId: "ВАШ_ИД_КУРСА_ИЗ_БАЗЫ", // Замените на реальный UUID из таблицы courses
        itemType: "course",
        customerEmail: "test@example.com",
        firstName: "Test",
        lastName: "User",
        phone: "+390000000",
        date: "2026-05-01",
        time: "15:00",
        slotId: null, // Или реальный slot_id из schedule_slots
        locale: "it"
      })
    });

    const body = await response.json();

    if (!response.ok) {
      console.error("❌ Ошибка при создании сессии:", body);
      return;
    }

    console.log("✅ УСПЕХ! Сгенерированная ссылка на оплату Stripe:");
    console.log(body.url);
    console.log("-----------------------------------------");
    console.log("📌 Следующие шаги для тестирования вебхука:");
    console.log("1. Откройте второе окно терминала и запустите: stripe listen --forward-to http://localhost:54321/functions/v1/stripe-webhook");
    console.log("2. Перейдите по ссылке выше и завершите оплату тестовой картой (введите 4242 4242... для номера карты).");
    console.log("3. После оплаты посмотрите в логи терминала со stripe listen — туда должно прийти событие checkout.session.completed, а в БД (таблица bookings) статус поменяется на 'paid'.");

  } catch (err) {
    console.error("❌ Сетевая ошибка при вызове функции:", err);
  }
}

testCheckoutSession();
