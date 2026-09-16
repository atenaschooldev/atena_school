import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp, rateLimitExceededResponse } from "@/lib/server/rate-limit";
import { getSupabaseAdmin } from "@/lib/server/supabase-admin";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rateCheck = checkRateLimit(`magic-link:${ip}`, {
      intervalMs: 60 * 1000,
      maxRequests: 5,
    });

    if (!rateCheck.success) {
      return rateLimitExceededResponse(rateCheck.retryAfter);
    }

    const body = await req.json().catch(() => ({}));
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "A valid email address is required" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://atena-school.vercel.app";
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${siteUrl}/autenticazione/callback`,
      },
    });

    if (error) {
      console.error("[API /auth/magic-link] Supabase error:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Magic Link successfully dispatched to ${email}`,
    });
  } catch (err: unknown) {
    console.error("[API /auth/magic-link] Unhandled error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to dispatch magic link" },
      { status: 500 }
    );
  }
}
