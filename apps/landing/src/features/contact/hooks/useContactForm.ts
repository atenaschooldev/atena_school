"use client";

import { useState, useEffect } from "react";
import { contactFormSchema } from "@atena/validators";
import { getStoredUtmParams } from "@/lib/utm";
import { trackEvent } from "@/lib/analytics";
import { api } from "@/lib/api";
import type { FormFieldConfig } from "@atena/api-types";

export interface ContactFormData {
  nome: string;
  cognome: string;
  email: string;
  telefono: string;
  interesse: string;
  messaggio: string;
  privacy: boolean;
  website_url?: string; // Honeypot field
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
    website_url: "",
  });

  const [formTemplate, setFormTemplate] = useState<any>(null);
  const [customFieldsValues, setCustomFieldsValues] = useState<Record<string, any>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  // Dynamic template resolution for contact forms (White-Label Form Engine)
  useEffect(() => {
    let isMounted = true;
    async function loadTemplate() {
      try {
        const res = await api.forms.resolve({ form_type: "contact" });
        const tpl = res?.template || (res?.id ? res : null);
        if (isMounted && tpl) {
          setFormTemplate(tpl);
        }
      } catch (err) {
        console.warn("Failed to resolve contact form template:", err);
      }
    }
    loadTemplate();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name as keyof ContactFormData]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleCustomFieldChange = (key: string, value: any) => {
    setCustomFieldsValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, privacy: e.target.checked }));
    if (fieldErrors.privacy) {
      setFieldErrors((prev) => ({ ...prev, privacy: undefined }));
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setFormData({
      nome: "",
      cognome: "",
      email: "",
      telefono: "",
      interesse: "",
      messaggio: "",
      privacy: false,
      website_url: "",
    });
    setCustomFieldsValues({});
    setFieldErrors({});
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setError(null);

    // Bot detection via Honeypot
    if (formData.website_url && formData.website_url.trim().length > 0) {
      setSubmitted(true);
      return;
    }

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
      const utm = getStoredUtmParams();
      if (formData.website_url) {
        // Bot submission caught by honeypot
        setSubmitted(true);
        setTimeout(() => resetForm(), 5000);
        return;
      }

      const data = await api.contact.submit({
        ...formData,
        ...utm,
        custom_fields: Object.keys(customFieldsValues).length > 0 ? customFieldsValues : undefined,
        form_id: formTemplate?.id || undefined,
      } as any);

      if (data.success) {
        setSubmitted(true);
        trackEvent("generate_lead", {
          lead_type: "contact_form",
          interesse: formData.interesse || "generico",
          utm_source: utm?.utm_source,
          utm_campaign: utm?.utm_campaign,
        });

        setTimeout(() => {
          resetForm();
        }, 5000);
      } else {
        if (data.details) {
          const errorsMap: FieldErrors = {};
          for (const [key, msgs] of Object.entries(data.details)) {
            if (Array.isArray(msgs) && msgs.length > 0) {
              errorsMap[key as keyof ContactFormData] = msgs[0] as string;
            }
          }
          setFieldErrors(errorsMap);
        }
        setError(data.error || "Something went wrong. Please try again later.");
      }
    } catch (err: any) {
      console.error(err);
      setError("Network connection error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    formTemplate,
    customFields: (formTemplate?.fields_config || []) as FormFieldConfig[],
    customFieldsValues,
    handleCustomFieldChange,
    submitted,
    loading,
    error,
    fieldErrors,
    handleChange,
    handleCheckboxChange,
    handleSubmit,
    resetForm,
  };
}

export default useContactForm;
