import { useState } from "react";
import { submitContactForm } from "@/app/actions/contact";

export interface ContactFormData {
  nome: string;
  cognome: string;
  email: string;
  telefono: string;
  interesse: string;
  messaggio: string;
  privacy: boolean;
}

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, privacy: e.target.checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.privacy) {
      alert("Devi accettare l'informativa sulla privacy per procedere.");
      return;
    }
    setLoading(true);
    setError(null);
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
        }, 3000);
      } else {
        setError(res.error || "Qualcosa è andato storto. Riprova più tardi.");
      }
    } catch (err) {
      console.error(err);
      setError("Errore di rete. Riprova più tardi.");
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    submitted,
    loading,
    error,
    handleChange,
    handleCheckboxChange,
    handleSubmit,
  };
}
