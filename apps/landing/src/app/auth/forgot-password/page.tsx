"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Envelope, CaretLeft } from "@phosphor-icons/react";

export default function ForgotPasswordPage() {
  const t = useTranslations("auth.forgotPassword");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const supabase = createClient();

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
    });

    if (error) {
      toast.error(error.message);
    } else {
      setSubmitted(true);
      toast.success(t("success"));
    }
    setLoading(false);
  };

  return (
    <div className="relative overflow-hidden min-h-[calc(100vh-120px)] flex items-center justify-center px-4 pt-20 pb-16">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary z-10 relative">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-serif text-primary">{t("title")}</CardTitle>
          <CardDescription>
            {submitted ? t("success") : t("subtitle")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!submitted ? (
            <form onSubmit={handleResetRequest} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t("email")}</Label>
                <div className="relative">
                  <Envelope className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <Button className="w-full font-bold uppercase tracking-widest" type="submit" disabled={loading}>
                {loading ? "..." : t("submit")}
              </Button>
            </form>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <Envelope className="w-12 h-12 text-primary mx-auto mb-4 opacity-20" />
              <p>{t("success")}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/auth/login" className="text-sm text-primary hover:underline font-medium inline-flex items-center gap-1">
            <CaretLeft className="w-4 h-4" />
            {t("backToLogin")}
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
