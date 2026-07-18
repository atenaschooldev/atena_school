"use client";

import React, { useState } from "react";
import {
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
  Lock,
} from "@phosphor-icons/react";
import { useLocale } from "next-intl";
import { submitContactForm } from "@/app/actions/contact";

interface ContactSectionProps {
  data?: {
    address?: string;
    phone?: string;
    landline?: string;
    email?: string;
    vat?: string;
  };
}

const ContactSection = ({ data }: ContactSectionProps) => {
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

  const address = data?.address || "Via Matteotti 11, Cittanova (RC) 89022";
  const phone = data?.phone || "+39 375 605 2362";
  const landline = data?.landline || "0966 447052";
  const email = data?.email || "atenaschool20@gmail.com";

  return (
    <section id="contact" className="relative isolate py-12 lg:py-16 min-[1700px]:!pb-28 px-4 bg-gray-50 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[120px] -z-10" />

      <div className="max-w-6xl 2xl:max-w-[1400px] min-[1700px]:max-w-[1550px] mx-auto bg-white rounded-3xl border border-gray-150 shadow-xl text-gray-900 font-sans p-6 sm:p-10 lg:p-12 relative z-20">
        {submitted ? (
          <div className="py-16 flex flex-col items-center justify-center text-center space-y-4 min-h-[400px]">
            <div className="w-16 h-16 rounded-full bg-green-50 text-green-600 flex items-center justify-center shadow-lg border border-green-200">
              <ShieldCheck className="w-8 h-8" weight="bold" />
            </div>
            <h3 className="text-2xl font-serif font-black text-gray-900">Grazie!</h3>
            <p className="text-gray-600 max-w-sm text-sm">
              La tua richiesta è stata inviata con successo. Ti ricontatteremo al più presto.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 2xl:gap-12">
            {/* Column 1 - Contact Info (Left) */}
            <div className="hidden md:flex md:col-span-4 flex-col justify-between space-y-8 pr-4 md:border-r border-gray-150">
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl 2xl:text-4xl font-black leading-tight text-left text-gray-900">
                    Contatta
                  </h3>
                  <span className="text-2xl 2xl:text-4xl font-black text-[#00328F] block text-left">
                    Atena School
                  </span>
                </div>

                <p className="text-xs 2xl:text-sm text-gray-600 leading-relaxed text-left">
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
                      href="https://maps.app.goo.gl/4Vmvrk9hxz5EC5gM7"
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
            <form onSubmit={handleSubmit} className="col-span-1 md:col-span-8 lg:col-span-5 flex flex-col">
              <div className="flex flex-col flex-1 space-y-3">
                <div className="text-left space-y-1">
                  <h4 className="text-sm font-bold text-gray-900">
                    Richiedi informazioni o prenota una consulenza
                  </h4>
                  <p className="text-[11px] text-gray-500">
                    Compila il modulo e ti ricontatteremo al più presto.
                  </p>
                </div>

                {/* Inputs Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      name="nome"
                      value={formData.nome}
                      onChange={handleChange}
                      placeholder="Nome *"
                      required
                      className="w-full bg-gray-50 border border-gray-200 focus:border-[#F8861D] focus:ring-1 focus:ring-[#F8861D]/30 rounded-xl py-3 2xl:py-4 pl-10 pr-3 text-base md:text-xs 2xl:text-sm placeholder-gray-400 outline-none transition-all duration-300 text-gray-900"
                    />
                  </div>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      name="cognome"
                      value={formData.cognome}
                      onChange={handleChange}
                      placeholder="Cognome *"
                      required
                      className="w-full bg-gray-50 border border-gray-200 focus:border-[#F8861D] focus:ring-1 focus:ring-[#F8861D]/30 rounded-xl py-3 2xl:py-4 pl-10 pr-3 text-base md:text-xs 2xl:text-sm placeholder-gray-400 outline-none transition-all duration-300 text-gray-900"
                    />
                  </div>
                  <div className="relative">
                    <Envelope className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Email *"
                      required
                      className="w-full bg-gray-50 border border-gray-200 focus:border-[#F8861D] focus:ring-1 focus:ring-[#F8861D]/30 rounded-xl py-3 2xl:py-4 pl-10 pr-3 text-base md:text-xs 2xl:text-sm placeholder-gray-400 outline-none transition-all duration-300 text-gray-900"
                    />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      placeholder="Telefono"
                      className="w-full bg-gray-50 border border-gray-200 focus:border-[#F8861D] focus:ring-1 focus:ring-[#F8861D]/30 rounded-xl py-3 2xl:py-4 pl-10 pr-3 text-base md:text-xs 2xl:text-sm placeholder-gray-400 outline-none transition-all duration-300 text-gray-900"
                    />
                  </div>
                </div>

                <div className="relative">
                  <GraduationCap className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                  <select
                    name="interesse"
                    value={formData.interesse}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-50 border border-gray-200 focus:border-[#F8861D] focus:ring-1 focus:ring-[#F8861D]/30 rounded-xl py-3 2xl:py-4 pl-10 pr-10 text-base md:text-xs 2xl:text-sm text-gray-700 placeholder-gray-400 outline-none appearance-none transition-all duration-300"
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

                <div className="relative flex flex-col flex-1">
                  <Chat className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                  <textarea
                    name="messaggio"
                    value={formData.messaggio}
                    onChange={handleChange}
                    placeholder="Messaggio"
                    maxLength={500}
                    className="flex-1 w-full bg-gray-50 border border-gray-200 focus:border-[#F8861D] focus:ring-1 focus:ring-[#F8861D]/30 rounded-xl py-3 2xl:py-4 pl-10 pr-3 text-base md:text-xs 2xl:text-sm placeholder-gray-400 outline-none resize-none transition-all duration-300 text-gray-900 min-h-[140px]"
                  />
                  <span className="absolute bottom-2.5 right-3 text-[9px] text-gray-400">
                    {formData.messaggio.length} / 500
                  </span>
                </div>

                {/* Checkbox */}
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
                      className="text-[#F8861D] hover:underline underline-offset-2 ml-1 font-bold"
                    >
                      Informativa sulla Privacy *
                    </a>
                  </span>
                </label>
              </div>

              {/* Error Display */}
              {error && (
                <p className="text-red-500 text-xs text-left font-bold pt-1">{error}</p>
              )}

              {/* Submit & Secure Text */}
              <div className="space-y-3 pt-2 mt-auto">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full bg-[#F8861D] hover:bg-[#e0730d] text-white font-black text-sm py-3 px-6 rounded-2xl flex items-center justify-center gap-2.5 transition-all duration-300 shadow-lg shadow-orange-500/10 cursor-pointer select-none ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
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
            <div className="hidden lg:flex lg:col-span-3 flex-col justify-between space-y-6 pl-4 border-l border-gray-150 text-left">
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

              {/* SEO Keywords Block */}
              <div className="border border-gray-150 bg-gradient-to-br from-white to-gray-50 p-4 rounded-2xl flex flex-col gap-3">
                <div className="flex items-center gap-2 text-[#F8861D]">
                  <GraduationCap className="w-5 h-5" weight="bold" />
                  <span className="text-[10px] font-black uppercase tracking-widest leading-none">I nostri corsi</span>
                </div>
                <ul className="space-y-1.5">
                  {[
                    "Corsi di inglese – A1 · A2 · B1 · B2 · C1",
                    "Cambridge English: KET, PET, FCE, CAE",
                    "Certificazioni EIPASS – Office & Web",
                    "Doposcuola & recupero scolastico",
                    "Preparazione esami universitari",
                    "Corsi estivi per bambini e ragazzi",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-[10px] text-gray-700 font-medium leading-snug">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#F8861D] mt-1 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="text-[9px] text-gray-400 leading-relaxed pt-1">
                  Scuola di lingua e informatica a Cittanova (RC), Calabria.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ContactSection;
