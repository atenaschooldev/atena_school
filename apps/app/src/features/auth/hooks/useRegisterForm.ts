import { useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/routing";
import { toast } from "sonner";
import { signUpWithEmailAction } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/client";

export function useRegisterForm() {
  const t = useTranslations("auth.register");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  const rawRedirect = searchParams.get("redirect");
  const redirectUrl = (rawRedirect && rawRedirect.startsWith("/") && !rawRedirect.startsWith("/autenticazione"))
    ? rawRedirect
    : "/dashboard";

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await signUpWithEmailAction({
        email,
        password,
        metadata: {
          full_name: fullName,
        },
      });

      if (!res.success) {
        toast.error(res.error || "Errore durante la registrazione");
      } else {
        toast.success(t("success"));
        router.push("/autenticazione");
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google') => {
    const supabase = createClient();
    const redirectTo = `${window.location.origin}/autenticazione/callback?next=${encodeURIComponent(redirectUrl)}`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
      },
    });

    if (error) {
      toast.error(error.message || "Impossibile avviare l'accesso social");
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    fullName,
    setFullName,
    loading,
    handleRegister,
    handleOAuthLogin,
    redirectUrl,
  };
}
