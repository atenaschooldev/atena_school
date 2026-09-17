/**
 * This script tests the create-checkout-session function
 * by simulating a frontend request.
 *
 * Usage:
 * node scripts/test-payment.mjs
 */

const SUPABASE_URL = "http://localhost:54321"; // Default local Supabase port
const ANON_KEY = "YOUR_ANON_KEY_HERE"; // Paste your local anon key (from: npx supabase status)

async function testCheckoutSession() {
  console.log("🚀 Starting payment test (creating checkout session)...");

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/create-checkout-session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${ANON_KEY}`
      },
      body: JSON.stringify({
        // Replace with a real UUID from the `courses` table in your local DB
        itemId: "YOUR_COURSE_ID_FROM_DB", // Replace with a real UUID from the courses table
        itemType: "course",
        customerEmail: "test@example.com",
        firstName: "Test",
        lastName: "User",
        phone: "+390000000",
        date: "2026-05-01",
        time: "15:00",
        slotId: null, // Or a real slot_id from schedule_slots
        locale: "it"
      })
    });

    const body = await response.json();

    if (!response.ok) {
      console.error("❌ Error creating session:", body);
      return;
    }

    console.log("✅ SUCCESS! Generated Stripe payment link:");
    console.log(body.url);
    console.log("-----------------------------------------");
    console.log("📌 Next steps to test the webhook:");
    console.log("1. Open a second terminal and run: stripe listen --forward-to http://localhost:54321/functions/v1/stripe-webhook");
    console.log("2. Open the link above and complete the payment with a test card (use 4242 4242... as the card number).");
    console.log("3. After payment, check the terminal running stripe listen — the checkout.session.completed event should arrive and the booking status in the DB (bookings table) will change to 'paid'.");

  } catch (err) {
    console.error("❌ Network error calling the function:", err);
  }
}

testCheckoutSession();
