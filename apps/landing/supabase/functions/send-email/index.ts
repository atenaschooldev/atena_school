import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "https://esm.sh/resend@2.1.0";
import { handleCors, jsonResponse } from "../_shared/utils.ts";

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  try {
    const authHeader = req.headers.get("Authorization");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    // Allow calls only with service_role key or from an admin user
    let isAuthorized = false;
    if (authHeader === `Bearer ${serviceRoleKey}`) {
      isAuthorized = true;
    } else if (authHeader) {
      // Fallback: allow admin users
      const supabaseClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_ANON_KEY") ?? "",
        { global: { headers: { Authorization: authHeader } } },
      );
      const { data: { user }, error } = await supabaseClient.auth.getUser();
      if (user && !error) {
        const { data: userData } = await supabaseClient
          .from("users")
          .select("role")
          .eq("id", user.id)
          .single();
        if (userData?.role === "admin") {
          isAuthorized = true;
        }
      }
    }

    if (!isAuthorized) {
      return jsonResponse({ error: "Unauthorized" }, 401, req);
    }

    const { to, subject, html, text, cc, bcc, reply_to } = await req.json();

    if (!to || !subject || (!html && !text)) {
      return jsonResponse(
        { error: "Missing required fields: to, subject, and either html or text are required." },
        400,
        req,
      );
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      // This is a server misconfiguration — 500, not 400
      return jsonResponse({ error: "Email service is not configured" }, 500, req);
    }

    const resend = new Resend(resendApiKey);
    // Always use the configured sender — ignore any "from" in the request body
    // to prevent admins from spoofing an arbitrary sender address.
    const emailFrom = Deno.env.get("RESEND_FROM_EMAIL") || "Atena School <info@atena.school>";

    const { data, error } = await resend.emails.send({
      from: emailFrom,
      to: Array.isArray(to) ? to : [to],
      subject,
      html: html || undefined,
      text: text || undefined,
      cc: cc ? (Array.isArray(cc) ? cc : [cc]) : undefined,
      bcc: bcc ? (Array.isArray(bcc) ? bcc : [bcc]) : undefined,
      reply_to: reply_to || undefined,
    });

    if (error) throw error;

    return jsonResponse({ success: true, data }, 200, req);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("[send-email]", err);
    return jsonResponse({ error: message }, 500, req);
  }
});
