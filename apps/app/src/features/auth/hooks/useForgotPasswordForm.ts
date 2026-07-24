import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { forgotPasswordAction } from "@/app/actions/auth";

export function useForgotPasswordForm() {
  const t = useTranslations("auth.forgotPassword");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await forgotPasswordAction(email);

    if (!res.success) {
      toast.error(res.error || "Errore");
    } else {
      setSubmitted(true);
      toast.success(t("success"));
    }
    setLoading(false);
  };

  return {
    email,
    setEmail,
    loading,
    submitted,
    handleResetRequest,
  };
}
