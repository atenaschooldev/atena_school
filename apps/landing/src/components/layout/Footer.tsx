"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import logo from "@/assets/logo.webp";
import { InstagramLogo, FacebookLogo, LinkedinLogo, WhatsappLogo, Phone, EnvelopeSimple, MapPin } from "@phosphor-icons/react";
import { TikTokLogo, YoutubeLogo } from "@/components/icons/SocialLogos";
import { usePathname } from "next/navigation";
import { DEFAULT_SCHOOL_PROFILE, formatFullSchoolAddress } from "@atena/core";
import type { SchoolProfile } from "@atena/api-types";
import { getStudentPortalUrl } from "@/lib/urls";

interface FooterProps {
  school?: SchoolProfile;
}

const Footer = ({ school = DEFAULT_SCHOOL_PROFILE }: FooterProps) => {
  const t = useTranslations("footer");
  const pathname = usePathname();

  if (pathname && (pathname.includes("/test-inglese") || pathname.includes("/checkout") || pathname.includes("/book") || /\/corsi\/.+/.test(pathname))) {
    return null;
  }

  const resolvedLogo = (!school.logo_url || school.logo_url === "/assets/logo.webp") ? logo : school.logo_url;

  return (
    <footer className="w-full bg-primary text-white pt-12 sm:pt-16 pb-8 px-4 sm:px-6 lg:px-12 relative overflow-hidden rounded-t-3xl sm:rounded-t-[40px] border-t border-white/10 cv-auto">
      {/* Centered Content Container */}
      <div className="max-w-7xl mx-auto relative z-10">

        {/* Ambient Light */}
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-10 border-b border-white/10">

          {/* Brand & Address */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="bg-white p-1.5 rounded-xl inline-flex items-center justify-center shrink-0 shadow-sm">
                <Image
                  src={resolvedLogo}
                  alt={school.name}
                  width={36}
                  height={36}
                  unoptimized={typeof resolvedLogo === 'string' && (resolvedLogo.startsWith('data:') || resolvedLogo.startsWith('http'))}
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-serif font-black text-lg tracking-wider uppercase text-white">
                  {school.name.split(' ')[0]} <span className="text-secondary">{school.name.split(' ').slice(1).join(' ') || 'School'}</span>
                </span>
                {school.tagline && (
                  <span className="text-[8px] tracking-widest uppercase text-white/50">
                    {school.tagline}
                  </span>
                )}
              </div>
            </div>
            <p className="text-xs text-slate-400 font-medium leading-relaxed">
              {formatFullSchoolAddress(school)} <span className="text-white/20 mx-1">•</span> {school.vat_code}
            </p>
          </div>

          {/* Top CTA Button */}
          <a
            href={getStudentPortalUrl('/autenticazione/accedi')}
            className="w-full sm:w-auto text-center bg-white hover:bg-slate-100 text-slate-900 font-extrabold px-6 py-3 rounded-2xl text-xs sm:text-sm transition-all duration-300 shadow-md hover:shadow-lg inline-flex items-center justify-center gap-2 select-none cursor-pointer"
          >
            Accedi alla piattaforma →
          </a>
        </div>

        {/* Main Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 py-10">

          {/* Column 1: Corsi di Lingua */}
          <div className="md:col-span-4 lg:col-span-4 space-y-4">
            <h4 className="text-sm font-bold text-white tracking-wide">
              Corsi di Lingua
            </h4>
            <ul className="space-y-2.5 text-xs text-white/85 font-medium">
              <li>
                <Link prefetch={false} href="/corsi/toddlers-3-5-anni" className="inline-block transition-all duration-200 hover:text-secondary hover:translate-x-1.5">
                  Toddlers (3-5 anni)
                </Link>
              </li>
              <li>
                <Link prefetch={false} href="/corsi/kids-6-7-anni" className="inline-block transition-all duration-200 hover:text-secondary hover:translate-x-1.5">
                  Kids (6-7 anni)
                </Link>
              </li>
              <li>
                <Link prefetch={false} href="/corsi/beginners-starters-8-10-anni" className="inline-block transition-all duration-200 hover:text-secondary hover:translate-x-1.5">
                  Starters (8-10 anni)
                </Link>
              </li>
              <li>
                <Link prefetch={false} href="/corsi/movers" className="inline-block transition-all duration-200 hover:text-secondary hover:translate-x-1.5">
                  Movers
                </Link>
              </li>
              <li>
                <Link prefetch={false} href="/corsi/flyers" className="inline-block transition-all duration-200 hover:text-secondary hover:translate-x-1.5">
                  Flyers
                </Link>
              </li>
              <li>
                <Link prefetch={false} href="/corsi/a2-key-for-schools" className="inline-block transition-all duration-200 hover:text-secondary hover:translate-x-1.5">
                  A2 Key for Schools
                </Link>
              </li>
              <li className="flex items-center gap-2">
                <Link prefetch={false} href="/corsi/b1-preliminary" className="inline-block transition-all duration-200 hover:text-secondary hover:translate-x-1.5">
                  B1 Preliminary
                </Link>
              </li>
              <li>
                <Link prefetch={false} href="/corsi/b2-first" className="inline-block transition-all duration-200 hover:text-secondary hover:translate-x-1.5">
                  B2 First
                </Link>
              </li>
              <li>
                <Link prefetch={false} href="/corsi/c1-advanced" className="inline-block transition-all duration-200 hover:text-secondary hover:translate-x-1.5">
                  C1 Advanced
                </Link>
              </li>
              <li>
                <Link prefetch={false} href="/corsi/c2-advanced" className="inline-block transition-all duration-200 hover:text-secondary hover:translate-x-1.5">
                  C2 Advanced
                </Link>
              </li>
              <li>
                <Link prefetch={false} href="/corsi/lezioni-private-singole" className="inline-block transition-all duration-200 hover:text-secondary hover:translate-x-1.5">
                  Lezioni Private Singole
                </Link>
              </li>
              <li>
                <Link prefetch={false} href="/corsi/pacchetto-10-lezioni-private" className="inline-block transition-all duration-200 hover:text-secondary hover:translate-x-1.5">
                  Pacchetto 10 Lezioni Private
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Certificazioni EIPASS */}
          <div className="md:col-span-3 lg:col-span-3 space-y-4">
            <h4 className="text-sm font-bold text-white tracking-wide">
              Certificazioni EIPASS
            </h4>
            <ul className="space-y-2.5 text-xs text-white/85 font-medium">
              <li className="flex items-center gap-2">
                <Link prefetch={false} href="/corsi/eipass-7-moduli-user" className="inline-block transition-all duration-200 hover:text-secondary hover:translate-x-1.5">
                  EIPASS 7 Moduli User
                </Link>
              </li>
              <li>
                <Link prefetch={false} href="/corsi/eipass-it-security" className="inline-block transition-all duration-200 hover:text-secondary hover:translate-x-1.5">
                  EIPASS IT Security
                </Link>
              </li>
              <li>
                <Link prefetch={false} href="/corsi/eipass-coding" className="inline-block transition-all duration-200 hover:text-secondary hover:translate-x-1.5">
                  EIPASS Coding
                </Link>
              </li>
              <li>
                <Link prefetch={false} href="/corsi/eipass-lim" className="inline-block transition-all duration-200 hover:text-secondary hover:translate-x-1.5">
                  EIPASS LIM
                </Link>
              </li>
              <li>
                <Link prefetch={false} href="/corsi/eipass-personale-ata" className="inline-block transition-all duration-200 hover:text-secondary hover:translate-x-1.5">
                  EIPASS Personale ATA
                </Link>
              </li>
              <li>
                <Link prefetch={false} href="/corsi/eipass-tablet" className="inline-block transition-all duration-200 hover:text-secondary hover:translate-x-1.5">
                  EIPASS Tablet
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Navigazione */}
          <div className="md:col-span-2 lg:col-span-2 space-y-4">
            <h4 className="text-sm font-bold text-white tracking-wide">
              Navigazione
            </h4>
            <ul className="space-y-2.5 text-xs text-white/85 font-medium">
              <li>
                <Link prefetch={false} href="/" className="inline-block transition-all duration-200 hover:text-secondary hover:translate-x-1.5">
                  Home
                </Link>
              </li>
              <li>
                <Link prefetch={false} href="/#chi-siamo" className="inline-block transition-all duration-200 hover:text-secondary hover:translate-x-1.5">
                  Chi Siamo
                </Link>
              </li>
              <li>
                <Link prefetch={false} href="/corsi" className="inline-block transition-all duration-200 hover:text-secondary hover:translate-x-1.5">
                  Tutti i Corsi
                </Link>
              </li>
              <li>
                <Link prefetch={false} href="/#contatti" className="inline-block transition-all duration-200 hover:text-secondary hover:translate-x-1.5">
                  Contatti
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contatti */}
          <div className="md:col-span-3 lg:col-span-3 space-y-4">
            <h4 className="text-sm font-bold text-white tracking-wide">
              Contatti
            </h4>
            <ul className="space-y-3 text-xs text-white/85 font-medium">
              {school.phone && (
                <li className="flex items-center gap-2.5">
                  <Phone size={16} className="text-secondary shrink-0" weight="bold" />
                  <a href={`tel:${school.phone.replace(/[^0-9+]/g, '')}`} className="inline-block transition-all duration-200 hover:text-secondary hover:translate-x-1.5">
                    {school.phone}
                  </a>
                </li>
              )}
              {school.landline && (
                <li className="flex items-center gap-2.5">
                  <Phone size={16} className="text-secondary shrink-0" weight="bold" />
                  <a href={`tel:${school.landline.replace(/[^0-9+]/g, '')}`} className="inline-block transition-all duration-200 hover:text-secondary hover:translate-x-1.5">
                    {school.landline}
                  </a>
                </li>
              )}
              <li className="flex items-center gap-2.5">
                <EnvelopeSimple size={16} className="text-secondary shrink-0" weight="bold" />
                <a href={`mailto:${school.secretariat_email || school.email}`} className="inline-block transition-all duration-200 hover:text-secondary hover:translate-x-1.5">
                  {school.secretariat_email || school.email}
                </a>
              </li>
              <li className="flex items-start gap-2.5 pt-1">
                <MapPin size={16} className="text-secondary shrink-0 mt-0.5" weight="bold" />
                <a
                  href={school.maps_url || `https://maps.google.com/?q=${encodeURIComponent(formatFullSchoolAddress(school))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block transition-all duration-200 hover:text-secondary hover:translate-x-1.5"
                >
                  {formatFullSchoolAddress(school)}
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col lg:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
            <span>{t("copyright")}</span>
            <span className="text-white/20">•</span>
            <Link href="/privacy" className="hover:text-white transition-colors duration-200">
              Privacy Policy
            </Link>
            <span className="text-white/20">•</span>
            <Link href="/cookies" className="hover:text-white transition-colors duration-200">
              Cookie Policy
            </Link>
            <span className="text-white/20">•</span>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              <span>Visa</span>
              <span>•</span>
              <span>Mastercard</span>
              <span>•</span>
              <span>Stripe</span>
            </div>
          </div>

          {/* Social Icons Row */}
          <div className="flex items-center gap-5 text-slate-400">
            {school.socials?.facebook && (
              <a
                href={school.socials.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors duration-200"
                aria-label="Facebook"
              >
                <FacebookLogo size={18} weight="bold" />
              </a>
            )}
            {school.socials?.instagram && (
              <a
                href={school.socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors duration-200"
                aria-label="Instagram"
              >
                <InstagramLogo size={18} weight="bold" />
              </a>
            )}
            {school.socials?.tiktok && (
              <a
                href={school.socials.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors duration-200"
                aria-label="TikTok"
              >
                <TikTokLogo size={18} />
              </a>
            )}
            {school.socials?.youtube && (
              <a
                href={school.socials.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors duration-200"
                aria-label="YouTube"
              >
                <YoutubeLogo size={18} />
              </a>
            )}
            {school.whatsapp && (
              <a
                href={`https://wa.me/${school.whatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors duration-200"
                aria-label="WhatsApp"
              >
                <WhatsappLogo size={18} weight="bold" />
              </a>
            )}
            {school.socials?.linkedin && (
              <a
                href={school.socials.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors duration-200"
                aria-label="LinkedIn"
              >
                <LinkedinLogo size={18} weight="bold" />
              </a>
            )}
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
