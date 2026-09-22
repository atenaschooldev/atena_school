import React, { Suspense } from "react";
import { CheckoutView } from "@/features/checkout/views";
import { getCourse, getSystemSettings } from "@/lib/server/checkout-service";
import { createClient } from "@/lib/supabase/server";
import { getSchoolProfile, resolveActiveFormTemplate } from "@atena/core";
import { FormType } from "@atena/api-types";

export default async function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Prefetch data in parallel on the server for instant zero-latency first render
  const supabase = createClient();
  const [courseRes, userRes, schoolProfile, paymentSettings, templatesRes] = await Promise.all([
    getCourse(id).catch(() => ({ success: false, item: null })),
    supabase.auth.getUser().catch(() => ({ data: { user: null } })),
    getSchoolProfile(supabase).catch(() => null),
    getSystemSettings().catch(() => ({ stripeEnabled: false, subscriptionsEnabled: false })),
    Promise.resolve(supabase.from("form_templates").select("*").eq("is_active", true)).catch(() => ({ data: [] })),
  ]);

  const course = courseRes?.success ? courseRes.item : null;
  const user = userRes?.data?.user || null;
  const formTemplate = resolveActiveFormTemplate(templatesRes?.data || [], {
    form_type: FormType.BOOKING,
    course_id: id,
  });

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-100 font-sans">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#043569]" />
        </div>
      }
    >
      <CheckoutView
        id={id}
        initialCourse={course}
        initialUser={user}
        initialSchoolProfile={schoolProfile}
        initialSettings={paymentSettings}
        initialFormTemplate={formTemplate}
      />
    </Suspense>
  );
}
