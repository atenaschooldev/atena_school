import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateReceiptHtml, getSchoolProfile } from '@atena/core';
import { parsePaymentMethod, PAYMENT_METHOD_DICTIONARY, PaymentMethod } from '@atena/api-types';

export const runtime = 'nodejs';

function getSupabaseClient() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || '';
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabaseClient();

    const { data: booking, error: bookingErr } = await supabase
      .from('bookings')
      .select('*, student:students(*)')
      .eq('id', id)
      .maybeSingle();

    if (bookingErr || !booking) {
      return new NextResponse('Prenotazione non trovata', { status: 404 });
    }

    const school = await getSchoolProfile(supabase);

    let courseTitle = school.name ? `Corso ${school.name}` : 'Corso di Lingua';
    if (booking.course_id) {
      const { data: course } = await supabase
        .from('courses')
        .select('name, title_it')
        .eq('id', booking.course_id)
        .maybeSingle();
      if (course) {
        courseTitle = course.name || course.title_it || courseTitle;
      }
    }

    const issueDate = new Date(booking.created_at || Date.now()).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    const receiptNumber = `REC-${new Date(booking.created_at || Date.now()).getFullYear()}-${String(booking.id).slice(0, 8).toUpperCase()}`;

    const regFee = Number(booking.registration_fee || 0);
    const totalPaid = Number(booking.amount_paid || 0);
    const courseFee = Math.max(0, totalPaid - regFee);

    const parsedMethod = parsePaymentMethod(booking.payment_method) ?? PaymentMethod.CASH;
    const paymentMethod = PAYMENT_METHOD_DICTIONARY[parsedMethod]?.label_it || 'Pagamento Confermato';

    const html = generateReceiptHtml({
      receiptNumber,
      issueDate,
      school,
      purchaserName: booking.purchaser_name || 'Gentile Cliente',
      purchaserTaxCode: booking.purchaser_tax_code || null,
      purchaserAddress: booking.custom_fields?.purchaser_address || null,
      studentName: booking.student_name || booking.purchaser_name || null,
      studentTaxCode: booking.student_tax_code || booking.purchaser_tax_code || null,
      courseTitle,
      courseFee,
      registrationFee: regFee,
      totalAmount: totalPaid,
      paymentMethod,
      transactionId: booking.stripe_payment_intent_id || booking.stripe_session_id || null,
    });

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (err: any) {
    return new NextResponse(`Errore generazione ricevuta: ${err?.message || 'Server error'}`, {
      status: 500,
    });
  }
}
