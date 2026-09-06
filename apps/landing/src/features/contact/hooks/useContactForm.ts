import { useState } from "react";
import { submitContactForm } from "@/app/actions/contact";
import { contactFormSchema } from "@atena/validators";

export interface ContactFormData {
  nome: string;
  cognome: string;
  email: string;
  telefono: string;
  interesse: string;
  messaggio: string;
  privacy: boolean;
}

export type FieldErrors = Partial<Record<keyof ContactFormData, string>>;

export function useContactForm() {
  const [formData, setFormData] = useState<ContactFormData>({
    nome: "",
    cognome: "",
    email: "",
    telefono: "",
    interesse: "",
    messaggio: "",
    privacy: false,
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name as keyof ContactFormData]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, privacy: e.target.checked }));
    if (fieldErrors.privacy) {
      setFieldErrors((prev) => ({ ...prev, privacy: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setError(null);

    if (!formData.privacy) {
      setFieldErrors((prev) => ({
        ...prev,
        privacy: "Devi accettare l'informativa sulla privacy per procedere.",
      }));
      return;
    }

    const validationResult = contactFormSchema.safeParse({
      nome: formData.nome,
      cognome: formData.cognome,
      email: formData.email,
      telefono: formData.telefono ? formData.telefono.trim() : undefined,
      interesse: formData.interesse ? formData.interesse.trim() : undefined,
      messaggio: formData.messaggio,
      privacy: formData.privacy,
    });

    if (!validationResult.success) {
      const flattened = validationResult.error.flatten().fieldErrors;
      const errorsMap: FieldErrors = {};
      for (const [key, msgs] of Object.entries(flattened)) {
        if (msgs && msgs.length > 0) {
          errorsMap[key as keyof ContactFormData] = msgs[0];
        }
      }
      setFieldErrors(errorsMap);
      return;
    }

    setLoading(true);
    try {
      const res = await submitContactForm(formData);
      if (res.success) {
        setSubmitted(true);
        setTimeout(() => {
          setSubmitted(false);
          setFormData({
            nome: "",
            cognome: "",
            email: "",
            telefono: "",
            interesse: "",
            messaggio: "",
            privacy: false,
          });
          setFieldErrors({});
        }, 3000);
      } else {
        if (res.details) {
          const errorsMap: FieldErrors = {};
          for (const [key, msgs] of Object.entries(res.details)) {
            if (Array.isArray(msgs) && msgs.length > 0) {
              errorsMap[key as keyof ContactFormData] = msgs[0] as string;
            }
          }
          setFieldErrors(errorsMap);
        }
        setError(res.error || "Qualcosa è andato storto. Riprova più tardi.");
      }
    } catch (err: any) {
      console.error(err);
      setError("Errore di connessione. Riprova più tardi.");
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    submitted,
    loading,
    error,
    fieldErrors,
    handleChange,
    handleCheckboxChange,
    handleSubmit,
  };
}
