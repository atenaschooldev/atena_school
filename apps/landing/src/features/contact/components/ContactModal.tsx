"use client";

import React, { useState, useEffect, useRef } from "react";
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Disable body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Auto-resize textarea message field
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [formData.messaggio]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, privacy: e.target.checked }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.privacy) {
      alert("Devi accettare l'informativa sulla privacy per procedere.");
      return;
    }
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
      onClose();
    }, 2500);
  };

  const address = contactData?.address || "Via Matteotti 11, Cittanova (RC) 89022";
  const phone = contactData?.phone || "+39 375 605 2362";
  const landline = contactData?.landline || "0966 447052";
  const email = contactData?.email || "atenaschool20@gmail.com";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Modal Container */}
      <div className="relative bg-[#0B1B2B] border border-white/10 rounded-[32px] w-full max-w-5xl max-h-[92vh] overflow-y-auto shadow-2xl text-white font-sans">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-3 top-2 p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-all duration-300 cursor-pointer z-30"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" weight="bold" />
        </button>

        {submitted ? (
          <div className="p-10 flex flex-col items-center justify-center text-center space-y-4 min-h-[400px]">
            <div className="w-16 h-16 rounded-full bg-green-500/10 text-green-400 flex items-center justify-center shadow-lg border border-green-500/20">
              <ShieldCheck className="w-8 h-8" weight="bold" />
            </div>
            <h3 className="text-2xl font-serif font-black text-white">Grazie!</h3>
            <p className="text-white/70 max-w-sm text-sm">
              La tua richiesta è stata inviata con successo. Ti ricontatteremo al più presto.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-14 pb-8 px-6 md:px-8">

            {/* Column 1 - Contact Info (Left) */}
            <div className="md:col-span-4 flex flex-col justify-between space-y-8 pr-0 md:pr-4 md:border-r border-white/10">
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <h3 className="text-2xl font-black leading-tight text-left">
                    Contatta
                  </h3>
                  <span className="text-2xl font-black text-[#F8861D] block text-left">
                    Atena School
                  </span>
                </div>

                <p className="text-xs text-white/70 leading-relaxed text-left">
                  Siamo qui per aiutarti a scegliere il percorso formativo più adatto a te. Scrivici o contattaci direttamente!
                </p>

                {/* Contact Rows */}
                <div className="space-y-4 pt-2">
                  <div className="flex gap-3 items-center">
                    <div className="w-8 h-8 rounded-full bg-[#F8861D] flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4 text-[#0B1B2B]" weight="fill" />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] text-white/50 uppercase font-bold tracking-wider leading-none">Telefono</p>
                      <p className="text-xs font-bold text-white mt-0.5">{phone}</p>
                      <p className="text-xs font-bold text-white mt-0.5">{landline}</p>
                    </div>
                  </div>

                  <div className="flex gap-3 items-center">
                    <div className="w-8 h-8 rounded-full bg-[#F8861D] flex items-center justify-center shrink-0">
                      <Envelope className="w-4 h-4 text-[#0B1B2B]" weight="fill" />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] text-white/50 uppercase font-bold tracking-wider leading-none">Email</p>
                      <p className="text-xs font-bold text-white mt-0.5">{email}</p>
                    </div>
                  </div>

                  <div className="flex gap-3 items-center">
                    <div className="w-8 h-8 rounded-full bg-[#F8861D] flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4 text-[#0B1B2B]" weight="fill" />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] text-white/50 uppercase font-bold tracking-wider leading-none">Indirizzo</p>
                      <p className="text-xs font-bold text-white mt-0.5 leading-snug">{address}</p>
                    </div>
                  </div>

                  <div className="flex gap-3 items-center">
                    <div className="w-8 h-8 rounded-full bg-[#F8861D] flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4 text-[#0B1B2B]" weight="fill" />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] text-white/50 uppercase font-bold tracking-wider leading-none">Orari di apertura</p>
                      <p className="text-xs font-bold text-white mt-0.5 leading-snug">Lunedì – Venerdì <span className="block text-white/70">09:00 - 18:00</span></p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Socials & Mini Map */}
              <div className="space-y-5 pt-4">
                <div className="text-left">
                  <span className="text-[10px] font-black text-white/50 uppercase tracking-widest block mb-2">
                    Seguici sui social
                  </span>
                  <div className="flex gap-2">
                    <a
                      href="https://www.instagram.com/atenaschool_srls/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-full bg-white/5 border border-white/10 hover:bg-[#F8861D] hover:text-[#0B1B2B] flex items-center justify-center transition-all duration-300"
                    >
                      <InstagramLogo className="w-4 h-4" weight="bold" />
                    </a>
                    <a
                      href="https://www.facebook.com/CSAtena7"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-full bg-white/5 border border-white/10 hover:bg-[#F8861D] hover:text-[#0B1B2B] flex items-center justify-center transition-all duration-300"
                    >
                      <FacebookLogo className="w-4 h-4" weight="bold" />
                    </a>
                    <a
                      href={`https://wa.me/${phone.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-full bg-white/5 border border-white/10 hover:bg-[#F8861D] hover:text-[#0B1B2B] flex items-center justify-center transition-all duration-300"
                    >
                      <WhatsappLogo className="w-4 h-4" weight="bold" />
                    </a>
                  </div>
                </div>

                {/* Mini Map Card */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex items-center gap-3 overflow-hidden">
                  <div className="relative w-16 h-16 rounded-xl bg-gray-800 border border-white/10 flex-shrink-0 flex items-center justify-center overflow-hidden">
                    {/* Stylized dark map snippet background representation */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#0b1b2b] to-[#1a2d42] opacity-80" />
                    <div className="absolute w-full h-[2px] bg-white/10 top-1/3 -rotate-12" />
                    <div className="absolute w-[2px] h-full bg-white/10 left-1/2 rotate-12" />
                    <div className="absolute w-full h-[2px] bg-white/10 bottom-1/4 rotate-6" />
                    <MapPin className="w-6 h-6 text-[#F8861D] relative z-10 animate-bounce" weight="fill" />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-xs font-black text-white truncate">Atena School</p>
                    <p className="text-[10px] text-white/60 truncate mt-0.5">{address}</p>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
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
            <form onSubmit={handleSubmit} className="md:col-span-5 flex flex-col justify-start space-y-4">
              <div className="space-y-3">
                <div className="text-left space-y-1">
                  <h4 className="text-sm font-bold text-white">
                    Richiedi informazioni o prenota una consulenza
                  </h4>
                  <p className="text-[11px] text-white/50">
                    Compila il modulo e ti ricontatteremo al più presto.
                  </p>
                </div>

                {/* Inputs Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 w-4 h-4 text-white/40" />
                    <input
                      type="text"
                      name="nome"
                      value={formData.nome}
                      onChange={handleChange}
                      placeholder="Nome *"
                      required
                      className="w-full bg-[#112235] border border-white/10 focus:border-[#F8861D]/55 focus:ring-1 focus:ring-[#F8861D]/55 rounded-xl py-3 pl-10 pr-3 text-xs placeholder-white/40 outline-none transition-all duration-300 text-white"
                    />
                  </div>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 w-4 h-4 text-white/40" />
                    <input
                      type="text"
                      name="cognome"
                      value={formData.cognome}
                      onChange={handleChange}
                      placeholder="Cognome *"
                      required
                      className="w-full bg-[#112235] border border-white/10 focus:border-[#F8861D]/55 focus:ring-1 focus:ring-[#F8861D]/55 rounded-xl py-3 pl-10 pr-3 text-xs placeholder-white/40 outline-none transition-all duration-300 text-white"
                    />
                  </div>
                </div>

                <div className="relative">
                  <Envelope className="absolute left-3.5 top-3.5 w-4 h-4 text-white/40" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email *"
                    required
                    className="w-full bg-[#112235] border border-white/10 focus:border-[#F8861D]/55 focus:ring-1 focus:ring-[#F8861D]/55 rounded-xl py-3 pl-10 pr-3 text-xs placeholder-white/40 outline-none transition-all duration-300 text-white"
                  />
                </div>

                <div className="relative">
                  <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-white/40" />
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    placeholder="Telefono"
                    className="w-full bg-[#112235] border border-white/10 focus:border-[#F8861D]/55 focus:ring-1 focus:ring-[#F8861D]/55 rounded-xl py-3 pl-10 pr-3 text-xs placeholder-white/40 outline-none transition-all duration-300 text-white"
                  />
                </div>

                <div className="relative">
                  <GraduationCap className="absolute left-3.5 top-3.5 w-4 h-4 text-white/40" />
                  <select
                    name="interesse"
                    value={formData.interesse}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#112235] border border-white/10 focus:border-[#F8861D]/55 focus:ring-1 focus:ring-[#F8861D]/55 rounded-xl py-3 pl-10 pr-10 text-xs text-white/80 placeholder-white/40 outline-none appearance-none transition-all duration-300"
                  >
                    <option value="" disabled hidden>
                      Sono interessato a...
                    </option>
                    <option value="inglese" className="bg-[#0B1B2B]">Corsi di Inglese</option>
                    <option value="digitale" className="bg-[#0B1B2B]">Certificazioni Informatiche</option>
                    <option value="doposcuola" className="bg-[#0B1B2B]">Doposcuola & Recupero materie</option>
                    <option value="altro" className="bg-[#0B1B2B]">Altro</option>
                  </select>
                  <CaretDown className="absolute right-3.5 top-4 w-3.5 h-3.5 text-white/40 pointer-events-none" />
                </div>

                <div className="relative">
                  <Chat className="absolute left-3.5 top-3.5 w-4 h-4 text-white/40" />
                  <textarea
                    ref={textareaRef}
                    name="messaggio"
                    value={formData.messaggio}
                    onChange={handleChange}
                    placeholder="Messaggio"
                    maxLength={500}
                    rows={8}
                    className="w-full bg-[#112235] border border-white/10 focus:border-[#F8861D]/55 focus:ring-1 focus:ring-[#F8861D]/55 rounded-xl py-3 pl-10 pr-3 text-xs placeholder-white/40 outline-none resize-none transition-all duration-300 text-white min-h-[200px]"
                  />
                  <span className="absolute bottom-2.5 right-3 text-[9px] text-white/35">
                    {formData.messaggio.length} / 500
                  </span>
                </div>

                {/* Checkbox */}
                <label className="flex items-start gap-2.5 cursor-pointer group pt-1 select-none">
                  <input
                    type="checkbox"
                    checked={formData.privacy}
                    onChange={handleCheckboxChange}
                    className="rounded border-white/20 bg-[#112235] text-[#F8861D] focus:ring-offset-0 focus:ring-0 mt-0.5"
                  />
                  <span className="text-[10px] text-white/60 text-left leading-normal">
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
              </div>

              {/* Submit & Secure Text */}
              <div className="space-y-4 pt-3">
                <button
                  type="submit"
                  className="w-full bg-[#F8861D] hover:bg-[#e0730d] text-white font-black text-sm py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2.5 transition-all duration-300 shadow-lg shadow-orange-500/10 cursor-pointer select-none"
                >
                  <PaperPlaneRight className="w-4 h-4" weight="fill" />
                  Invia richiesta
                </button>

                <div className="flex items-center justify-center gap-1.5 text-[10px] text-white/40">
                  <Lock className="w-3 h-3" />
                  <span>I tuoi dati sono al sicuro con noi.</span>
                </div>
              </div>
            </form>

            {/* Column 3 - Why Choose Us & Promo Card (Right) */}
            <div className="md:col-span-3 flex flex-col justify-between space-y-6 md:pl-4 md:border-l border-white/10 text-left">
              {/* Why Us Highlights */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-[#F8861D]">
                  Perché scegliere Atena School?
                </h4>
                <div className="w-8 h-0.5 bg-[#F8861D]/55" />

                <div className="space-y-4 pt-2">
                  <div className="flex gap-3 items-start">
                    <GraduationCap className="w-5 h-5 text-[#F8861D] shrink-0 mt-0.5" />
                    <p className="text-[11px] leading-relaxed font-bold text-white/80">
                      Docenti qualificati e certificati
                    </p>
                  </div>

                  <div className="flex gap-3 items-start">
                    <ShieldCheck className="w-5 h-5 text-[#F8861D] shrink-0 mt-0.5" />
                    <p className="text-[11px] leading-relaxed font-bold text-white/80">
                      Certificazioni riconosciute
                    </p>
                  </div>

                  <div className="flex gap-3 items-start">
                    <ChartBar className="w-5 h-5 text-[#F8861D] shrink-0 mt-0.5" />
                    <p className="text-[11px] leading-relaxed font-bold text-white/80">
                      Percorsi personalizzati per ogni esigenza
                    </p>
                  </div>

                  <div className="flex gap-3 items-start">
                    <Headset className="w-5 h-5 text-[#F8861D] shrink-0 mt-0.5" />
                    <p className="text-[11px] leading-relaxed font-bold text-white/80">
                      Supporto costante e orientamento
                    </p>
                  </div>
                </div>
              </div>

              {/* Promo Card */}
              <div className="border border-[#F8861D] bg-gradient-to-br from-[#0B1B2B] to-[#122A42] p-4 rounded-2xl flex flex-col gap-3">
                <div className="flex items-center gap-2 text-[#F8861D]">
                  <Calendar className="w-5 h-5" weight="bold" />
                  <span className="text-[10px] font-black uppercase tracking-widest leading-none">Voucher omaggio</span>
                </div>

                <div className="space-y-1">
                  <h5 className="text-[11px] font-black text-white leading-snug">
                    Prenota subito la tua consulenza gratuita!
                  </h5>
                  <p className="text-[9px] text-white/70 leading-relaxed">
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
                  className="w-full border border-[#F8861D] hover:bg-[#F8861D] hover:text-[#0B1B2B] text-[#F8861D] font-bold text-[10px] py-2 px-4 rounded-xl transition-all duration-300 text-center select-none cursor-pointer"
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
