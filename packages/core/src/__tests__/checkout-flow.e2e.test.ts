import { describe, it, expect, vi } from "vitest";
import {
  calculateLessonDates,
  getCurrentAcademicYear,
  generateMembershipNumber,
  ANNUAL_REGISTRATION_FEE_EUR,
} from "@atena/utils";
import {
  matchesTriggerConditions,
  resolveRecipient,
} from "../notifications/trigger-matcher";
import {
  compileTemplateVariables,
  getDefaultBlocksForTemplate,
  renderEmailFromBlocks,
} from "../notifications/block-compiler";
import {
  CourseCategory,
  CourseScheduleType,
  NotificationChannel,
  RecipientType,
  DEFAULT_SCHOOL_PROFILE,
} from "@atena/api-types";

describe("E2E System Test: Full Stripe Checkout -> Booking -> Lessons -> Notification Flow", () => {
  it("executes the entire online student enrollment and notification cycle", async () => {
    // ------------------------------------------------------------------------
    // STEP 1: Client selects Course & Slot on Landing
    // ------------------------------------------------------------------------
    const course = {
      id: "kids-eng-oct-2026",
      name: "Kids (6-7 anni)",
      category: CourseCategory.KIDS,
      price: 73.20,
      schedule_days: [2, 4], // Tuesday (2) & Thursday (4)
      start_time: "17:00",
      end_time: "18:00",
      duration_minutes: 60,
      schedule_type: CourseScheduleType.FIXED,
    };

    const checkoutForm = {
      purchaser_first_name: "Andrii",
      purchaser_last_name: "Petukhov",
      purchaser_email: "andrii.petukhov@gmail.com",
      purchaser_phone: "+393401234567",
      is_for_child: true,
      student_first_name: "Viktoria",
      student_last_name: "Petukhova",
      student_birth_date: "2019-05-14",
      student_birth_place: "Reggio Calabria",
      start_date: "2026-10-06",
      slot_time: "Martedì e Giovedì 17:00-18:00",
    };

    // ------------------------------------------------------------------------
    // STEP 2: Registration Fee Check & Price Calculation
    // ------------------------------------------------------------------------
    const isFirstTimeStudent = true; // No active membership card
    const registrationFee = isFirstTimeStudent ? ANNUAL_REGISTRATION_FEE_EUR : 0;
    const totalAmount = course.price + registrationFee;

    expect(registrationFee).toBe(30);
    expect(totalAmount).toBe(103.20);

    // ------------------------------------------------------------------------
    // STEP 3: Stripe Checkout Session Completion (Simulation)
    // ------------------------------------------------------------------------
    const stripeSessionMock = {
      id: "cs_test_atena_2026_1001",
      payment_status: "paid",
      amount_total: 10320, // in cents
      currency: "eur",
      customer_details: {
        email: checkoutForm.purchaser_email,
        name: `${checkoutForm.purchaser_first_name} ${checkoutForm.purchaser_last_name}`,
      },
    };

    expect(stripeSessionMock.payment_status).toBe("paid");
    expect(stripeSessionMock.amount_total / 100).toBe(totalAmount);

    // ------------------------------------------------------------------------
    // STEP 4: Database Booking & 2 Payments Creation
    // ------------------------------------------------------------------------
    const academicYearInfo = getCurrentAcademicYear(checkoutForm.start_date);
    expect(academicYearInfo.academicYear).toBe("2026/2027");

    const membershipNumber = generateMembershipNumber(academicYearInfo.academicYear, 42);
    expect(membershipNumber).toBe("ATN-2026-0042");

    const bookingRecord = {
      id: "bk-generated-uuid-987",
      course_id: course.id,
      purchaser_email: checkoutForm.purchaser_email,
      purchaser_phone: checkoutForm.purchaser_phone,
      purchaser_name: `${checkoutForm.purchaser_first_name} ${checkoutForm.purchaser_last_name}`,
      student_name: `${checkoutForm.student_first_name} ${checkoutForm.student_last_name}`,
      is_for_child: checkoutForm.is_for_child,
      status: "confirmed",
      total_amount: totalAmount,
    };

    const payments = [
      {
        booking_id: bookingRecord.id,
        amount: course.price,
        type: "payment",
        status: "succeeded",
      },
      {
        booking_id: bookingRecord.id,
        amount: registrationFee,
        type: "registration_fee",
        status: "succeeded",
      },
    ];

    expect(payments.length).toBe(2);
    expect(payments.reduce((acc, p) => acc + p.amount, 0)).toBe(totalAmount);

    // ------------------------------------------------------------------------
    // STEP 5: Generate Scheduled Lessons via calculateLessonDates()
    // ------------------------------------------------------------------------
    const generatedLessons = calculateLessonDates(
      checkoutForm.start_date,
      checkoutForm.slot_time,
      course.category,
      course.schedule_days,
      course.duration_minutes,
      course.start_time,
      course.end_time,
      course.schedule_type
    );

    expect(generatedLessons.length).toBeGreaterThan(0);
    expect(generatedLessons[0].startsAt).toContain("2026-10-06");

    // ------------------------------------------------------------------------
    // STEP 6: Notification Trigger Matching & Email/Telegram Generation
    // ------------------------------------------------------------------------
    const systemTriggers = [
      {
        id: "trg-customer-email",
        event_key: "booking.created_stripe",
        channel: NotificationChannel.EMAIL,
        recipient_type: RecipientType.CUSTOMER,
        conditions: {},
        template_code: "booking_confirmation_customer",
      },
      {
        id: "trg-admin-telegram",
        event_key: "booking.created_stripe",
        channel: NotificationChannel.TELEGRAM,
        recipient_type: RecipientType.ADMIN,
        conditions: { min_amount: 50 },
        template_code: "telegram_booking_alert",
      },
    ];

    const notificationPayload = {
      booking_id: bookingRecord.id,
      student_name: bookingRecord.student_name,
      purchaser_name: bookingRecord.purchaser_name,
      purchaser_email: bookingRecord.purchaser_email,
      course_name: course.name,
      amount_paid: "103.20",
      total_amount: "103.20",
      date: checkoutForm.start_date,
      time: checkoutForm.slot_time,
      admin_email: "segreteria@atenaschool.com",
      admin_telegram_chat_id: "-1001234567",
    };

    for (const trigger of systemTriggers) {
      // 1. Match conditions
      const matches = matchesTriggerConditions(notificationPayload, trigger.conditions);
      expect(matches).toBe(true);

      // 2. Resolve recipient
      const recipient = resolveRecipient(
        trigger.recipient_type,
        trigger.channel,
        undefined,
        notificationPayload
      );

      if (trigger.channel === NotificationChannel.EMAIL) {
        expect(recipient).toBe(checkoutForm.purchaser_email);

        // 3. Compile and render full HTML template
        const emailBlocks = getDefaultBlocksForTemplate(trigger.template_code, NotificationChannel.EMAIL);
        const compiledEmail = renderEmailFromBlocks(emailBlocks, notificationPayload, DEFAULT_SCHOOL_PROFILE);

        expect(compiledEmail.html).toContain(bookingRecord.student_name);
        expect(compiledEmail.html).toContain(course.name);
        expect(compiledEmail.html).toContain("103.20");
      } else {
        expect(recipient).toBe("-1001234567");
      }
    }
  });
});
