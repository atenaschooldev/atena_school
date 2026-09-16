"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Phone,
  Envelope,
  MapPin,
  Clock,
  InstagramLogo,
  FacebookLogo,
  WhatsappLogo,
  GraduationCap,
  CaretDown,
  Chat,
  User,
  PaperPlaneRight,
  ShieldCheck,
  ChartBar,
  Headset,
  Calendar,
  Lock,
} from "@phosphor-icons/react";
import { useLocale } from "next-intl";
import { contactFormSchema } from "@atena/validators";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  contactData?: {
    address?: string;
    phone?: string;
    landline?: string;
    email?: string;
    vat?: string;
  };
}

const FALLBACK_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256&h=256",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=256&h=256",
];

const ContactModal = ({ isOpen, onClose, contactData }: ContactModalProps) => {
  const locale = useLocale();
  const [formData, setFormData] = useState({
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
  // Disable body scroll when modal is open, compensating for scrollbar width to prevent layout shift
  useEffect(() => {
    if (isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      
      document.body.setAttribute("data-scroll-y", scrollTop.toString());
      
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
      
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollTop}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";
    } else {
      const scrollY = document.body.getAttribute("data-scroll-y");
      
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
      
      if (scrollY) {
        const originalScrollBehavior = document.documentElement.style.scrollBehavior;
        document.documentElement.style.scrollBehavior = "auto";
        window.scrollTo(0, parseInt(scrollY, 10));
        document.documentElement.style.scrollBehavior = originalScrollBehavior;
        document.body.removeAttribute("data-scroll-y");
      }
    }
    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [isOpen]);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, privacy: e.target.checked }));
    if (fieldErrors.privacy) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.privacy;
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setError(null);

    if (!formData.privacy) {
      setFieldErrors({ privacy: "Devi accettare l'informativa sulla privacy per procedere." });
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
      const errorsMap: Record<string, string> = {};
      for (const [key, msgs] of Object.entries(flattened)) {
        if (msgs && msgs.length > 0) {
          errorsMap[key] = msgs[0];
        }
      }
      setFieldErrors(errorsMap);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/landing/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const res = await response.json();
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
          onClose();
        }, 2000);
      } else {
        if (res.details) {
          const errorsMap: Record<string, string> = {};
          for (const [key, msgs] of Object.entries(res.details)) {
            if (Array.isArray(msgs) && msgs.length > 0) {
              errorsMap[key] = msgs[0] as string;
            }
          }
          setFieldErrors(errorsMap);
        }
        setError(res.error || "Qualcosa è andato storto. Riprova più tardi.");
      }
    } catch (err: any) {
      console.error(err);
      setError("Errore di rete. Riprova più tardi.");
    } finally {
      setLoading(false);
    }
  };

  const address = contactData?.address || "Via Matteotti 11, Cittanova (RC) 89022";
  const phone = contactData?.phone || "+39 375 605 2362";
  const landline = contactData?.landline || "0966 447052";
  const email = contactData?.email || "atenaschool20@gmail.com";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-0 md:p-4 overflow-visible md:overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Solid background cover to prevent landing page from showing during keyboard panning on mobile */}
      <div className="absolute -inset-y-[100vh] inset-x-0 bg-white md:hidden -z-10 pointer-events-none" />

      {/* Modal Container */}
      <div className="relative bg-white w-full h-screen md:h-auto md:max-h-[92vh] rounded-none md:rounded-[32px] md:max-w-5xl border-none md:border md:border-gray-150 shadow-2xl text-gray-900 font-sans overflow-y-auto">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="fixed md:absolute right-4 top-4 p-2 rounded-full border border-gray-200 bg-white text-gray-400 hover:text-gray-700 hover:bg-gray-50 hover:border-gray-300 shadow-sm transition-all duration-300 cursor-pointer z-30 flex items-center justify-center"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" weight="bold" />
        </button>

        {submitted ? (
          <div className="p-10 flex flex-col items-center justify-center text-center space-y-4 min-h-[400px]">
            <div className="w-16 h-16 rounded-full bg-green-50 text-green-600 flex items-center justify-center shadow-lg border border-green-200">
              <ShieldCheck className="w-8 h-8" weight="bold" />
            </div>
            <h3 className="text-2xl font-serif font-black text-gray-900">Grazie!</h3>
            <p className="text-gray-600 max-w-sm text-sm">
              La tua richiesta è stata inviata con successo. Ti ricontatteremo al più presto.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-16 pb-8 px-6 md:pt-12 md:px-8">

            {/* Column 1 - Contact Info (Left) */}
            <div className="hidden md:flex md:col-span-4 flex-col justify-between space-y-8 pr-0 md:pr-4 md:border-r border-gray-150">
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <h3 className="text-2xl font-black leading-tight text-left text-gray-900">
                    Contatta
                  </h3>
                  <span className="text-2xl font-black text-[#00328F] block text-left">
                    Atena School
                  </span>
                </div>

                <p className="text-xs text-gray-600 leading-relaxed text-left">
                  Siamo qui per aiutarti a scegliere il percorso formativo più adatto a te. Scrivici o contattaci direttamente!
                </p>

                {/* Contact Rows */}
                <div className="space-y-4 pt-2">
                  <div className="flex gap-3 items-center">
                    <div className="w-8 h-8 rounded-full bg-[#F8861D] flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4 text-white" weight="fill" />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider leading-none">Telefono</p>
                      <p className="text-xs font-bold text-gray-800 mt-0.5">{phone}</p>
                      <p className="text-xs font-bold text-gray-800 mt-0.5">{landline}</p>
                    </div>
                  </div>

                  <div className="flex gap-3 items-center">
                    <div className="w-8 h-8 rounded-full bg-[#F8861D] flex items-center justify-center shrink-0">
                      <Envelope className="w-4 h-4 text-white" weight="fill" />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider leading-none">Email</p>
                      <p className="text-xs font-bold text-gray-800 mt-0.5">{email}</p>
                    </div>
                  </div>

                  <div className="flex gap-3 items-center">
                    <div className="w-8 h-8 rounded-full bg-[#F8861D] flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4 text-white" weight="fill" />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider leading-none">Indirizzo</p>
                      <p className="text-xs font-bold text-gray-800 mt-0.5 leading-snug">{address}</p>
                    </div>
                  </div>

                  <div className="flex gap-3 items-center">
                    <div className="w-8 h-8 rounded-full bg-[#F8861D] flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4 text-white" weight="fill" />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider leading-none">Orari di apertura</p>
                      <p className="text-xs font-bold text-gray-800 mt-0.5 leading-snug">Lunedì – Venerdì <span className="block text-gray-500">09:00 - 18:00</span></p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Socials & Mini Map */}
              <div className="space-y-5 pt-4">
                <div className="text-left">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">
                    Seguici sui social
                  </span>
                  <div className="flex gap-2">
                    <a
                      href="https://www.instagram.com/atenaschool_srls/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-full bg-gray-50 border border-gray-200 text-gray-600 hover:bg-[#FAA904] hover:text-white flex items-center justify-center transition-all duration-300"
                    >
                      <InstagramLogo className="w-4 h-4" weight="bold" />
                    </a>
                    <a
                      href="https://www.facebook.com/CSAtena7"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-full bg-gray-50 border border-gray-200 text-gray-600 hover:bg-[#FAA904] hover:text-white flex items-center justify-center transition-all duration-300"
                    >
                      <FacebookLogo className="w-4 h-4" weight="bold" />
                    </a>
                    <a
                      href={`https://wa.me/${phone.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-full bg-gray-50 border border-gray-200 text-gray-600 hover:bg-[#FAA904] hover:text-white flex items-center justify-center transition-all duration-300"
                    >
                      <WhatsappLogo className="w-4 h-4" weight="bold" />
                    </a>
                  </div>
                </div>

                {/* Mini Map Card */}
                <div className="bg-gray-50 border border-gray-150 rounded-2xl p-3 flex items-center gap-3 overflow-hidden">
                  <div className="relative w-16 h-16 rounded-xl bg-gray-200 border border-gray-200 flex-shrink-0 flex items-center justify-center overflow-hidden">
                    {/* Stylized map representation */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-gray-100 to-gray-200" />
                    <div className="absolute w-full h-[2px] bg-gray-300 top-1/3 -rotate-12" />
                    <div className="absolute w-[2px] h-full bg-gray-300 left-1/2 rotate-12" />
                    <div className="absolute w-full h-[2px] bg-gray-300 bottom-1/4 rotate-6" />
                    <MapPin className="w-6 h-6 text-[#F8861D] relative z-10 animate-bounce" weight="fill" />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-xs font-black text-gray-800 truncate">Atena School</p>
                    <p className="text-[10px] text-gray-500 truncate mt-0.5">{address}</p>
                    <a
                      href={`https://maps.app.goo.gl/4Vmvrk9hxz5EC5gM7`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block text-[10px] font-bold text-[#F8861D] hover:underline mt-1.5"
                    >
                      Apri in Google Maps →
                    </a>
                  </div>
                </div>
              </div>

            </div>

            {/* Column 2 - Inquiry Form (Center) */}
            <form onSubmit={handleSubmit} className="col-span-1 md:col-span-5 flex flex-col justify-start space-y-4">
              <div className="space-y-3">
                <div className="text-left space-y-1">
                  <h4 className="text-sm font-bold text-gray-900">
                    Richiedi informazioni o prenota una consulenza
                  </h4>
                  <p className="text-[11px] text-gray-500">
                    Compila il modulo e ti ricontatteremo al più presto.
                  </p>
                </div>

                {/* Inputs Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        name="nome"
                        value={formData.nome}
                        onChange={handleChange}
                        placeholder="Nome *"
                        required
                        className={`w-full bg-gray-50 border ${
                          fieldErrors.nome ? "border-red-500 bg-red-50/20" : "border-gray-200"
                        } focus:border-[#F8861D] focus:ring-1 focus:ring-[#F8861D]/30 rounded-xl py-3 pl-10 pr-3 text-base md:text-xs placeholder-gray-400 outline-none transition-all duration-300 text-gray-900`}
                      />
                    </div>
                    {fieldErrors.nome && (
                      <p className="text-[10px] text-red-500 font-semibold text-left mt-1 pl-1">{fieldErrors.nome}</p>
                    )}
                  </div>
                  <div>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        name="cognome"
                        value={formData.cognome}
                        onChange={handleChange}
                        placeholder="Cognome *"
                        required
                        className={`w-full bg-gray-50 border ${
                          fieldErrors.cognome ? "border-red-500 bg-red-50/20" : "border-gray-200"
                        } focus:border-[#F8861D] focus:ring-1 focus:ring-[#F8861D]/30 rounded-xl py-3 pl-10 pr-3 text-base md:text-xs placeholder-gray-400 outline-none transition-all duration-300 text-gray-900`}
                      />
                    </div>
                    {fieldErrors.cognome && (
                      <p className="text-[10px] text-red-500 font-semibold text-left mt-1 pl-1">{fieldErrors.cognome}</p>
                    )}
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <Envelope className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Email *"
                      required
                      className={`w-full bg-gray-50 border ${
                        fieldErrors.email ? "border-red-500 bg-red-50/20" : "border-gray-200"
                      } focus:border-[#F8861D] focus:ring-1 focus:ring-[#F8861D]/30 rounded-xl py-3 pl-10 pr-3 text-base md:text-xs placeholder-gray-400 outline-none transition-all duration-300 text-gray-900`}
                    />
                  </div>
                  {fieldErrors.email && (
                    <p className="text-[10px] text-red-500 font-semibold text-left mt-1 pl-1">{fieldErrors.email}</p>
                  )}
                </div>

                <div>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      placeholder="Telefono (es. +39 340 1234567)"
                      className={`w-full bg-gray-50 border ${
                        fieldErrors.telefono ? "border-red-500 bg-red-50/20" : "border-gray-200"
                      } focus:border-[#F8861D] focus:ring-1 focus:ring-[#F8861D]/30 rounded-xl py-3 pl-10 pr-3 text-base md:text-xs placeholder-gray-400 outline-none transition-all duration-300 text-gray-900`}
                    />
                  </div>
                  {fieldErrors.telefono && (
                    <p className="text-[10px] text-red-500 font-semibold text-left mt-1 pl-1">{fieldErrors.telefono}</p>
                  )}
                </div>

                <div className="relative">
                  <GraduationCap className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                  <select
                    name="interesse"
                    value={formData.interesse}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-200 focus:border-[#F8861D] focus:ring-1 focus:ring-[#F8861D]/30 rounded-xl py-3 pl-10 pr-10 text-base md:text-xs text-gray-700 placeholder-gray-400 outline-none appearance-none transition-all duration-300"
                  >
                    <option value="" disabled hidden>
                      Sono interessato a...
                    </option>
                    <option value="inglese" className="bg-white text-gray-900">Corsi di Inglese</option>
                    <option value="digitale" className="bg-white text-gray-900">Certificazioni Informatiche</option>
                    <option value="doposcuola" className="bg-white text-gray-900">Doposcuola & Recupero materie</option>
                    <option value="altro" className="bg-white text-gray-900">Altro</option>
                  </select>
                  <CaretDown className="absolute right-3.5 top-4 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                </div>

                <div>
                  <div className="relative">
                    <Chat className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                    <textarea
                      name="messaggio"
                      value={formData.messaggio}
                      onChange={handleChange}
                      placeholder="Messaggio *"
                      maxLength={2000}
                      rows={8}
                      className={`w-full bg-gray-50 border ${
                        fieldErrors.messaggio ? "border-red-500 bg-red-50/20" : "border-gray-200"
                      } focus:border-[#F8861D] focus:ring-1 focus:ring-[#F8861D]/30 rounded-xl py-3 pl-10 pr-3 text-base md:text-xs placeholder-gray-400 outline-none resize-none transition-all duration-300 text-gray-900 min-h-[140px]`}
                    />
                    <span className="absolute bottom-2.5 right-3 text-[9px] text-gray-400">
                      {formData.messaggio.length} / 2000
                    </span>
                  </div>
                  {fieldErrors.messaggio && (
                    <p className="text-[10px] text-red-500 font-semibold text-left mt-1 pl-1">{fieldErrors.messaggio}</p>
                  )}
                </div>

                {/* Checkbox */}
                <div>
                  <label className="flex items-start gap-2.5 cursor-pointer group pt-1 select-none">
                    <input
                      type="checkbox"
                      checked={formData.privacy}
                      onChange={handleCheckboxChange}
                      className="rounded border-gray-300 bg-gray-50 text-[#F8861D] focus:ring-offset-0 focus:ring-0 mt-0.5"
                    />
                    <span className="text-[10px] text-gray-500 text-left leading-normal">
                      Accetto l'
                      <a
                        href="/privacy"
                        target="_blank"
                        className="text-[#F8861D] hover:underline underline-offset-2 ml-1"
                      >
                        Informativa sulla Privacy *
                      </a>
                    </span>
                  </label>
                  {fieldErrors.privacy && (
                    <p className="text-[10px] text-red-500 font-semibold text-left mt-1 pl-1">{fieldErrors.privacy}</p>
                  )}
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <p className="text-red-500 text-xs text-left font-bold pt-1">{error}</p>
              )}

              {/* Submit & Secure Text */}
              <div className="space-y-4 pt-3">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full bg-[#F8861D] hover:bg-[#e0730d] text-white font-black text-sm py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2.5 transition-all duration-300 shadow-lg shadow-orange-500/10 cursor-pointer select-none ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <PaperPlaneRight className="w-4 h-4" weight="fill" />
                  {loading ? 'Invio in corso...' : 'Invia richiesta'}
                </button>

                <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-400">
                  <Lock className="w-3 h-3" />
                  <span>I tuoi dati sono al sicuro con noi.</span>
                </div>
              </div>
            </form>

            {/* Column 3 - Why Choose Us & Promo Card (Right) */}
            <div className="hidden md:flex md:col-span-3 flex-col justify-between space-y-6 md:pl-4 md:border-l border-gray-150 text-left">
              {/* Why Us Highlights */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-[#F8861D]">
                  Perché scegliere Atena School?
                </h4>
                <div className="w-8 h-0.5 bg-[#F8861D]/55" />

                <div className="space-y-4 pt-2">
                  <div className="flex gap-3 items-start">
                    <GraduationCap className="w-5 h-5 text-[#F8861D] shrink-0 mt-0.5" />
                    <p className="text-[11px] leading-relaxed font-bold text-gray-700">
                      Docenti qualificati e certificati
                    </p>
                  </div>

                  <div className="flex gap-3 items-start">
                    <ShieldCheck className="w-5 h-5 text-[#F8861D] shrink-0 mt-0.5" />
                    <p className="text-[11px] leading-relaxed font-bold text-gray-700">
                      Certificazioni riconosciute
                    </p>
                  </div>

                  <div className="flex gap-3 items-start">
                    <ChartBar className="w-5 h-5 text-[#F8861D] shrink-0 mt-0.5" />
                    <p className="text-[11px] leading-relaxed font-bold text-gray-700">
                      Percorsi personalizzati per ogni esigenza
                    </p>
                  </div>

                  <div className="flex gap-3 items-start">
                    <Headset className="w-5 h-5 text-[#F8861D] shrink-0 mt-0.5" />
                    <p className="text-[11px] leading-relaxed font-bold text-gray-700">
                      Supporto costante e orientamento
                    </p>
                  </div>
                </div>
              </div>

              {/* Promo Card */}
              <div className="border border-gray-150 bg-gradient-to-br from-white to-gray-50 p-4 rounded-2xl flex flex-col gap-3">
                <div className="flex items-center gap-2 text-[#F8861D]">
                  <Calendar className="w-5 h-5" weight="bold" />
                  <span className="text-[10px] font-black uppercase tracking-widest leading-none">Voucher omaggio</span>
                </div>

                <div className="space-y-1">
                  <h5 className="text-[11px] font-black text-gray-900 leading-snug">
                    Prenota subito la tua consulenza gratuita!
                  </h5>
                  <p className="text-[9px] text-gray-600 leading-relaxed">
                    Parla con un nostro tutor e trova il percorso giusto per te.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      interesse: "altro",
                      messaggio: "Vorrei richiedere una consulenza gratuita.",
                    }));
                  }}
                  className="w-full border border-[#F8861D] hover:bg-[#F8861D] hover:text-white text-[#F8861D] font-bold text-[10px] py-2 px-4 rounded-xl transition-all duration-300 text-center select-none cursor-pointer"
                >
                  Prenota ora →
                </button>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default ContactModal;
