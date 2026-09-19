"use client";

import React from "react";
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
import { useContactForm } from "@/features/contact/hooks/useContactForm";
import { DEFAULT_SCHOOL_PROFILE, formatFullSchoolAddress } from "@atena/core";
import type { SchoolProfile } from "@atena/api-types";

interface ContactSectionProps {
  data?: {
    address?: string;
    phone?: string;
    landline?: string;
    email?: string;
    vat?: string;
  };
  school?: SchoolProfile;
}

const ContactSection = ({ data, school = DEFAULT_SCHOOL_PROFILE }: ContactSectionProps) => {
  const locale = useLocale();
  const {
    formData,
    submitted,
    loading,
    error,
    fieldErrors,
    handleChange,
    handleCheckboxChange,
    handleSubmit,
    resetForm,
  } = useContactForm();

  const address = formatFullSchoolAddress(school) || data?.address || "";
  const phone = school.phone || data?.phone || DEFAULT_SCHOOL_PROFILE.phone || "+39 375 605 2362";
  const landline = school.landline || data?.landline || DEFAULT_SCHOOL_PROFILE.landline || "0966 447052";
  const email = school.secretariat_email || school.email || data?.email || DEFAULT_SCHOOL_PROFILE.secretariat_email || "info@atenaschool.com";

  return (
    <section id="contatti" className="relative isolate py-12 lg:py-16 px-4 bg-slate-50/70 overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:36px_36px] pointer-events-none -z-0" />

      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[120px] -z-10" />

      <div className="max-w-6xl 2xl:max-w-[1600px] mx-auto bg-white rounded-3xl border border-gray-150 shadow-xl text-gray-900 font-sans p-6 sm:p-10 lg:p-12 2xl:p-16 relative z-20">
        {submitted ? (
          <div className="py-16 flex flex-col items-center justify-center text-center space-y-4 min-h-[400px]">
            <div className="w-16 h-16 rounded-full bg-green-50 text-green-600 flex items-center justify-center shadow-lg border border-green-200">
              <ShieldCheck className="w-8 h-8" weight="bold" />
            </div>
            <h3 className="text-2xl font-serif font-black text-gray-900">Grazie!</h3>
            <p className="text-gray-600 max-w-sm text-sm">
              La tua richiesta è stata inviata con successo. Ti ricontatteremo al più presto.
            </p>
            <button
              type="button"
              onClick={resetForm}
              className="mt-4 text-xs font-bold text-[#00328F] hover:underline cursor-pointer"
            >
              ← Invia un altro messaggio
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 2xl:gap-12">
            {/* Column 1 - Contact Info (Left) */}
            <div className="hidden md:flex md:col-span-4 flex-col justify-between space-y-8 pr-6 md:border-r border-gray-200/80">
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl 2xl:text-4xl font-black leading-tight text-left text-gray-900">
                    Contatta
                  </h3>
                  <span className="text-2xl 2xl:text-4xl font-black text-[#00328F] block text-left">
                    {school.name}
                  </span>
                </div>

                <p className="text-xs 2xl:text-sm text-gray-600 leading-relaxed text-left">
                  Siamo qui per aiutarti a scegliere il percorso formativo più adatto a te. Scrivici o contattaci direttamente!
                </p>

                {/* Contact Rows */}
                <div className="space-y-4.5 pt-2">
                  <div className="flex gap-3.5 items-center">
                    <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#F8861D] flex items-center justify-center shrink-0 border border-orange-100/50">
                      <Phone className="w-4 h-4" weight="fill" />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider leading-none">Telefono</p>
                      <p className="text-xs font-bold text-gray-800 mt-1">{phone}</p>
                      <p className="text-xs font-bold text-gray-800 mt-0.5">{landline}</p>
                    </div>
                  </div>

                  <div className="flex gap-3.5 items-center">
                    <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#F8861D] flex items-center justify-center shrink-0 border border-orange-100/50">
                      <Envelope className="w-4 h-4" weight="fill" />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider leading-none">Email</p>
                      <p className="text-xs font-bold text-gray-800 mt-1">{email}</p>
                    </div>
                  </div>

                  <div className="flex gap-3.5 items-center">
                    <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#F8861D] flex items-center justify-center shrink-0 border border-orange-100/50">
                      <MapPin className="w-4 h-4" weight="fill" />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider leading-none">Indirizzo</p>
                      <p className="text-xs font-bold text-gray-800 mt-1 leading-snug">{address}</p>
                    </div>
                  </div>

                  <div className="flex gap-3.5 items-center">
                    <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#F8861D] flex items-center justify-center shrink-0 border border-orange-100/50">
                      <Clock className="w-4 h-4" weight="fill" />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider leading-none">Orari di apertura</p>
                      <p className="text-xs font-bold text-gray-800 mt-1 leading-snug">Lunedì – Venerdì <span className="block text-gray-500 mt-0.5">09:00 - 18:00</span></p>
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
                      href={school.socials?.instagram || "https://instagram.com"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-full bg-gray-50 border border-gray-200 text-gray-600 hover:bg-[#FAA904] hover:text-white flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95"
                    >
                      <InstagramLogo className="w-4 h-4" weight="bold" />
                    </a>
                    <a
                      href={school.socials?.facebook || "https://facebook.com"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-full bg-gray-50 border border-gray-200 text-gray-600 hover:bg-[#FAA904] hover:text-white flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95"
                    >
                      <FacebookLogo className="w-4 h-4" weight="bold" />
                    </a>
                    <a
                      href={`https://wa.me/${phone.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-full bg-gray-50 border border-gray-200 text-gray-600 hover:bg-[#FAA904] hover:text-white flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95"
                    >
                      <WhatsappLogo className="w-4 h-4" weight="bold" />
                    </a>
                  </div>
                </div>

                {/* Mini Map Card */}
                <a
                  href={school.maps_url || `https://maps.google.com/?q=${encodeURIComponent(address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/map bg-gray-50 hover:bg-gray-100/80 border border-gray-200/80 rounded-2xl p-3 flex items-center gap-3 transition-all duration-300 cursor-pointer text-left"
                >
                  <div className="relative w-16 h-16 rounded-xl bg-gray-200 border border-gray-200 flex-shrink-0 flex items-center justify-center overflow-hidden">
                    <svg className="absolute inset-0 w-full h-full text-gray-300/85" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M 0,10 L 80,10 M 0,30 L 80,30 M 0,50 L 80,50 M 0,70 L 80,70" />
                      <path d="M 15,0 L 15,80 M 35,0 L 35,80 M 55,0 L 55,80 M 75,0 L 75,80" />
                      <path d="M 0,0 L 80,80" strokeWidth="2.5" className="text-gray-250/20" />
                    </svg>
                    <div className="absolute w-3.5 h-3.5 bg-[#F8861D]/20 rounded-full animate-ping z-0" />
                    <MapPin className="w-6 h-6 text-[#F8861D] relative z-10 group-hover/map:scale-110 transition-transform duration-300" weight="fill" />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-xs font-black text-gray-800">{school.name}</p>
                    <p className="text-[10px] text-gray-500 truncate mt-0.5">{address}</p>
                    <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-[#F8861D] mt-1">
                      Apri in Google Maps →
                    </span>
                  </div>
                </a>
              </div>
            </div>

            {/* Column 2 - Inquiry Form (Center) */}
            <form onSubmit={handleSubmit} className="col-span-1 md:col-span-8 lg:col-span-5 flex flex-col space-y-5">
              {/* Invisible Honeypot field for bot protection */}
              <input
                type="text"
                name="website_url"
                value={formData.website_url || ""}
                onChange={handleChange}
                tabIndex={-1}
                autoComplete="off"
                className="opacity-0 absolute -z-50 pointer-events-none h-0 w-0"
                aria-hidden="true"
              />
              <div className="text-left space-y-1">
                <h4 className="text-sm font-bold text-gray-900">
                  Richiedi informazioni o prenota una consulenza
                </h4>
                <p className="text-[11px] text-gray-500">
                  Compila il modulo e ti ricontatteremo al più presto.
                </p>
              </div>

              {/* Inputs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="relative group/field flex items-center">
                    <User className="absolute left-3.5 w-4 h-4 text-gray-400 group-focus-within/field:text-[#00328F] transition-colors duration-300" />
                    <input
                      type="text"
                      name="nome"
                      value={formData.nome}
                      onChange={handleChange}
                      placeholder="Nome *"
                      required
                      className={`w-full bg-gray-50/50 hover:bg-gray-50 border ${
                        fieldErrors?.nome ? "border-red-500 bg-red-50/20" : "border-gray-200/80"
                      } focus:border-[#00328F] focus:bg-white rounded-2xl py-3 pl-10 pr-4 text-sm placeholder-gray-400/85 outline-none transition-all duration-300 text-gray-900 shadow-sm focus:shadow-[0_0_0_4px_rgba(0,50,143,0.08)]`}
                    />
                  </div>
                  {fieldErrors?.nome && (
                    <p className="text-[11px] text-red-500 font-semibold text-left mt-1 pl-1">{fieldErrors.nome}</p>
                  )}
                </div>

                <div>
                  <div className="relative group/field flex items-center">
                    <User className="absolute left-3.5 w-4 h-4 text-gray-400 group-focus-within/field:text-[#00328F] transition-colors duration-300" />
                    <input
                      type="text"
                      name="cognome"
                      value={formData.cognome}
                      onChange={handleChange}
                      placeholder="Cognome *"
                      required
                      className={`w-full bg-gray-50/50 hover:bg-gray-50 border ${
                        fieldErrors?.cognome ? "border-red-500 bg-red-50/20" : "border-gray-200/80"
                      } focus:border-[#00328F] focus:bg-white rounded-2xl py-3 pl-10 pr-4 text-sm placeholder-gray-400/85 outline-none transition-all duration-300 text-gray-900 shadow-sm focus:shadow-[0_0_0_4px_rgba(0,50,143,0.08)]`}
                    />
                  </div>
                  {fieldErrors?.cognome && (
                    <p className="text-[11px] text-red-500 font-semibold text-left mt-1 pl-1">{fieldErrors.cognome}</p>
                  )}
                </div>

                <div>
                  <div className="relative group/field flex items-center">
                    <Envelope className="absolute left-3.5 w-4 h-4 text-gray-400 group-focus-within/field:text-[#00328F] transition-colors duration-300" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Email *"
                      required
                      className={`w-full bg-gray-50/50 hover:bg-gray-50 border ${
                        fieldErrors?.email ? "border-red-500 bg-red-50/20" : "border-gray-200/80"
                      } focus:border-[#00328F] focus:bg-white rounded-2xl py-3 pl-10 pr-4 text-sm placeholder-gray-400/85 outline-none transition-all duration-300 text-gray-900 shadow-sm focus:shadow-[0_0_0_4px_rgba(0,50,143,0.08)]`}
                    />
                  </div>
                  {fieldErrors?.email && (
                    <p className="text-[11px] text-red-500 font-semibold text-left mt-1 pl-1">{fieldErrors.email}</p>
                  )}
                </div>

                <div>
                  <div className="relative group/field flex items-center">
                    <Phone className="absolute left-3.5 w-4 h-4 text-gray-400 group-focus-within/field:text-[#00328F] transition-colors duration-300" />
                    <input
                      type="tel"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      placeholder="Telefono (es. +39 340 1234567)"
                      className={`w-full bg-gray-50/50 hover:bg-gray-50 border ${
                        fieldErrors?.telefono ? "border-red-500 bg-red-50/20" : "border-gray-200/80"
                      } focus:border-[#00328F] focus:bg-white rounded-2xl py-3 pl-10 pr-4 text-sm placeholder-gray-400/85 outline-none transition-all duration-300 text-gray-900 shadow-sm focus:shadow-[0_0_0_4px_rgba(0,50,143,0.08)]`}
                    />
                  </div>
                  {fieldErrors?.telefono && (
                    <p className="text-[11px] text-red-500 font-semibold text-left mt-1 pl-1">{fieldErrors.telefono}</p>
                  )}
                </div>
              </div>

              <div>
                <div className="relative group/field flex items-center">
                  <GraduationCap className="absolute left-3.5 w-4 h-4 text-gray-400 group-focus-within/field:text-[#00328F] transition-colors duration-300" />
                  <select
                    name="interesse"
                    value={formData.interesse}
                    onChange={handleChange}
                    className="w-full bg-gray-50/50 hover:bg-gray-50 border border-gray-200/80 focus:border-[#00328F] focus:bg-white rounded-2xl py-3 pl-10 pr-10 text-sm text-gray-700 placeholder-gray-400/85 outline-none appearance-none transition-all duration-300 shadow-sm focus:shadow-[0_0_0_4px_rgba(0,50,143,0.08)] cursor-pointer"
                  >
                    <option value="" disabled hidden>
                      Sono interessato a...
                    </option>
                    <option value="inglese" className="bg-white text-gray-900">Corsi di Inglese</option>
                    <option value="digitale" className="bg-white text-gray-900">Certificazioni Informatiche</option>
                    <option value="doposcuola" className="bg-white text-gray-900">Doposcuola & Recupero materie</option>
                    <option value="altro" className="bg-white text-gray-900">Altro</option>
                  </select>
                  <CaretDown className="absolute right-3.5 w-3.5 h-3.5 text-gray-400 pointer-events-none group-focus-within/field:text-[#00328F] group-focus-within/field:rotate-180 transition-all duration-300" />
                </div>
              </div>

              <div>
                <div className="relative flex flex-col group/field">
                  <Chat className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400 group-focus-within/field:text-[#00328F] transition-colors duration-300" />
                  <textarea
                    name="messaggio"
                    value={formData.messaggio}
                    onChange={handleChange}
                    placeholder="Messaggio *"
                    maxLength={2000}
                    className={`w-full bg-gray-50/50 hover:bg-gray-50 border ${
                      fieldErrors?.messaggio ? "border-red-500 bg-red-50/20" : "border-gray-200/80"
                    } focus:border-[#00328F] focus:bg-white rounded-2xl py-3 pl-10 pr-4 text-sm placeholder-gray-400/85 outline-none resize-none transition-all duration-300 text-gray-900 min-h-[140px] focus:shadow-[0_0_0_4px_rgba(0,50,143,0.08)]`}
                  />
                  <span className="absolute bottom-2.5 right-3 text-[9px] text-gray-400 font-bold bg-white/80 px-1.5 py-0.5 rounded-md backdrop-blur-sm border border-gray-100">
                    {formData.messaggio.length} / 2000
                  </span>
                </div>
                {fieldErrors?.messaggio && (
                  <p className="text-[11px] text-red-500 font-semibold text-left mt-1 pl-1">{fieldErrors.messaggio}</p>
                )}
              </div>

              {/* Checkbox */}
              <div>
                <label className="flex items-start gap-2.5 cursor-pointer group pt-1 select-none">
                  <input
                    type="checkbox"
                    checked={formData.privacy}
                    onChange={handleCheckboxChange}
                    className="rounded border-gray-300 text-[#00328F] focus:ring-[#00328F]/20 focus:ring-offset-0 focus:ring-2 w-4 h-4 mt-0.5 transition-all cursor-pointer"
                  />
                  <span className="text-[10px] text-gray-500 text-left leading-normal">
                    Accetto l'
                    <a
                      href="/privacy"
                      target="_blank"
                      className="text-[#00328F] hover:underline underline-offset-2 ml-1 font-bold"
                    >
                      Informativa sulla Privacy *
                    </a>
                  </span>
                </label>
                {fieldErrors?.privacy && (
                  <p className="text-[11px] text-red-500 font-semibold text-left mt-1 pl-1">{fieldErrors.privacy}</p>
                )}
              </div>

              {/* Error Display */}
              {error && (
                <p className="text-red-500 text-xs text-left font-bold">{error}</p>
              )}

              {/* Submit & Secure Text */}
              <div className="space-y-3 pt-3">
                <button
                  type="submit"
                  disabled={loading}
                  className={`group/btn w-full bg-gradient-to-r from-[#00328F] to-[#004eac] hover:from-[#002770] hover:to-[#00328F] text-white font-extrabold text-sm py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2.5 transition-all duration-300 shadow-md hover:shadow-xl hover:shadow-blue-500/10 active:scale-[0.98] cursor-pointer select-none ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <PaperPlaneRight className="w-4 h-4 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-0.5 transition-transform duration-300" weight="fill" />
                  {loading ? 'Invio in corso...' : 'Invia richiesta'}
                </button>

                <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-400">
                  <Lock className="w-3 h-3" />
                  <span>I tuoi dati sono al sicuro con noi.</span>
                </div>
              </div>
            </form>

            {/* Column 3 - Why Choose Us & Promo Card (Right) */}
            <div className="hidden lg:flex lg:col-span-3 flex-col justify-between space-y-6 pl-6 border-l border-gray-200/80 text-left">
              {/* Why Us Highlights */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-[#00328F]">
                  Perché sceglierci?
                </h4>
                <div className="w-8 h-0.5 bg-[#00328F]/40" />

                <div className="space-y-4 pt-2">
                  <div className="flex gap-3.5 items-center">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#00328F] flex items-center justify-center shrink-0 border border-blue-100/50">
                      <GraduationCap className="w-4 h-4" weight="bold" />
                    </div>
                    <p className="text-[11px] font-bold text-gray-700">
                      Docenti qualificati e certificati
                    </p>
                  </div>

                  <div className="flex gap-3.5 items-center">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#00328F] flex items-center justify-center shrink-0 border border-blue-100/50">
                      <ShieldCheck className="w-4 h-4" weight="bold" />
                    </div>
                    <p className="text-[11px] font-bold text-gray-700">
                      Certificazioni riconosciute
                    </p>
                  </div>

                  <div className="flex gap-3.5 items-center">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#00328F] flex items-center justify-center shrink-0 border border-blue-100/50">
                      <ChartBar className="w-4 h-4" weight="bold" />
                    </div>
                    <p className="text-[11px] font-bold text-gray-700">
                      Percorsi personalizzati
                    </p>
                  </div>

                  <div className="flex gap-3.5 items-center">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#00328F] flex items-center justify-center shrink-0 border border-blue-100/50">
                      <Headset className="w-4 h-4" weight="bold" />
                    </div>
                    <p className="text-[11px] font-bold text-gray-700">
                      Supporto e orientamento
                    </p>
                  </div>
                </div>
              </div>

              {/* Course List Card */}
              <div className="border border-gray-200/80 bg-white p-4.5 rounded-2xl shadow-sm flex flex-col gap-3">
                <div className="flex items-center gap-2.5 text-[#00328F] border-b border-gray-100 pb-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100 shrink-0">
                    <GraduationCap className="w-4.5 h-4.5" weight="bold" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-wider">I nostri corsi</span>
                </div>
                <ul className="space-y-3">
                  {[
                    "Corsi di inglese – A1 · A2 · B1 · B2 · C1",
                    "Cambridge Esami: KET, PET, FCE, CAE",
                    "Certificazioni EIPASS – IT & Web",
                    "Doposcuola & recupero materie",
                    "Preparazione esami universitari",
                    "Corsi estivi per bambini e ragazzi",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-[11px] text-gray-700 font-bold leading-normal">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#F8861D] shrink-0 mt-1.5" />
                      <span className="flex-1">{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-[9.5px] text-gray-400 leading-relaxed pt-2">
                  Scuola di formazione a {school.city} ({school.province}).
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
