import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/routing";
import { toast } from "sonner";

import { loginWithEmailAction } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/client";

export function useLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const rawRedirect = searchParams.get("redirect");
  const redirectUrl = (rawRedirect && rawRedirect.startsWith("/") && !rawRedirect.startsWith("/autenticazione"))
    ? rawRedirect
    : "/dashboard";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await loginWithEmailAction({ email, password });

    if (!res.success) {
      toast.error(res.error || "Errore durante l'accesso");
    } else if (res.user) {
      toast.success("Acceduto con successo!");
      router.push(redirectUrl);
      router.refresh();
    }
    setLoading(false);
  };

  const handleOAuthLogin = async (provider: 'google' | 'apple') => {
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
    loading,
    showPassword,
    setShowPassword,
    handleLogin,
    handleOAuthLogin,
    redirectUrl,
  };
}
