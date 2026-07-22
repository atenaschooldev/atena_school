import { useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/routing";
import { toast } from "sonner";
import { signUpWithEmailAction, getOAuthUrlAction } from "@/app/actions/auth";

export function useRegisterForm() {
  const t = useTranslations("auth.register");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  const redirectUrl = searchParams.get("redirect") || "/";

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
        router.push(`/auth/login${redirectUrl !== "/" ? `?redirect=${encodeURIComponent(redirectUrl)}` : ""}`);
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google') => {
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectUrl)}`;
    const res = await getOAuthUrlAction({ provider, redirectTo });

    if (res.success && res.url) {
      window.location.href = res.url;
    } else {
      toast.error(res.error || "Impossibile avviare l'accesso social");
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
