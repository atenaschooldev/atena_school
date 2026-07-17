"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import logo from "@/assets/logo.webp";
import { InstagramLogo, FacebookLogo, LinkedinLogo, WhatsappLogo, MapPin, Phone, EnvelopeSimple } from "@phosphor-icons/react";

const ContactModal = dynamic(() => import("../features/contact/components/ContactModal"), { ssr: false });

const Footer = () => {
  const t = useTranslations("footer");
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <footer id="contact" className="bg-[#043569] text-white pt-16 pb-8 px-4 sm:px-6 lg:px-8 border-t border-white/5 relative overflow-hidden">
      {/* Subtle ambient light in the footer */}
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">

          {/* Column 1: Brand & Contact Info */}
          <div className="md:col-span-4 space-y-6">
            <div className="flex items-center gap-3">
              <div className="bg-white p-1.5 rounded-xl inline-flex items-center justify-center shrink-0">
                <Image
                  src={logo}
                  alt="Atena School"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-serif font-black text-lg tracking-wider uppercase text-white">
                  Atena <span className="text-[#F8861D]">School</span>
                </span>
                <span className="text-[8px] tracking-widest uppercase text-white/50">
                  civitatis ornamento
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-white/70 max-w-sm leading-relaxed">
                Centro autorizzato per la preparazione agli esami Cambridge English e alle certificazioni informatiche EIPASS. Offriamo percorsi formativi su misura per ogni esigenza.
              </p>
              <p className="text-[10px] text-white/40 font-semibold tracking-wide">
                P.IVA / C.F. 03321620803
              </p>
            </div>

            {/* Social Icons */}
            <div className="flex gap-3 pt-2">
              <a
                href="https://www.instagram.com/atenaschool_srls/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 hover:border-[#F8861D] text-white hover:text-[#F8861D] flex items-center justify-center hover:bg-[#F8861D]/10 transition duration-300 active:scale-95"
              >
                <InstagramLogo className="w-5 h-5" weight="bold" />
              </a>
              <a
                href="https://www.facebook.com/CSAtena7"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 hover:border-[#F8861D] text-white hover:text-[#F8861D] flex items-center justify-center hover:bg-[#F8861D]/10 transition duration-300 active:scale-95"
              >
                <FacebookLogo className="w-5 h-5" weight="bold" />
              </a>
              <a
                href="https://www.linkedin.com/company/atena-school-srls/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 hover:border-[#F8861D] text-white hover:text-[#F8861D] flex items-center justify-center hover:bg-[#F8861D]/10 transition duration-300 active:scale-95"
              >
                <LinkedinLogo className="w-5 h-5" weight="bold" />
              </a>
              <a
                href="https://wa.me/393756052362"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 hover:border-[#F8861D] text-white hover:text-[#F8861D] flex items-center justify-center hover:bg-[#F8861D]/10 transition duration-300 active:scale-95"
              >
                <WhatsappLogo className="w-5 h-5" weight="bold" />
              </a>
            </div>
          </div>

          {/* Column 2: Navigation Links */}
          <div className="md:col-span-2 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#F8861D]">
              Navigazione
            </h4>
            <ul className="space-y-2.5 text-xs text-white/75">
              <li>
                <Link href="/" className="hover:text-[#F8861D] transition-colors duration-200">
                  Home
                </Link>
              </li>
              <li>
                <Link href="#about" className="hover:text-[#F8861D] transition-colors duration-200">
                  Chi Siamo
                </Link>
              </li>
              <li>
                <Link href="#courses" className="hover:text-[#F8861D] transition-colors duration-200">
                  Corsi e Certificazioni
                </Link>
              </li>
              <li>
                <Link href="#contact" className="hover:text-[#F8861D] transition-colors duration-200">
                  Contatti
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact & Address details */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#F8861D]">
              Contatti
            </h4>
            <ul className="space-y-3.5 text-xs text-white/75">
              <li className="flex gap-2.5 items-start">
                <MapPin size={18} className="text-[#F8861D] shrink-0 mt-0.5" weight="bold" />
                <span>Via Matteotti 11, Cittanova (RC) 89022</span>
              </li>
              <li className="flex gap-2.5 items-start">
                <Phone size={18} className="text-[#F8861D] shrink-0 mt-0.5" weight="bold" />
                <div className="flex flex-col gap-1">
                  <a href="tel:+393756052362" className="hover:text-[#F8861D] transition-colors duration-200">
                    +39 375 605 2362
                  </a>
                  <a href="tel:0966447052" className="hover:text-[#F8861D] transition-colors duration-200">
                    0966 447052
                  </a>
                </div>
              </li>
              <li className="flex gap-2.5 items-start">
                <EnvelopeSimple size={18} className="text-[#F8861D] shrink-0 mt-0.5" weight="bold" />
                <a href="mailto:atenaschool20@gmail.com" className="hover:text-[#F8861D] transition-colors duration-200">
                  atenaschool20@gmail.com
                </a>
              </li>
            </ul>

            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 inline-flex items-center justify-center gap-2 bg-[#F8861D] hover:bg-[#e0730d] text-white px-5 py-2.5 rounded-full font-black text-xs transition-all duration-300 shadow-lg shadow-orange-500/10 transform hover:-translate-y-0.5 active:translate-y-0 select-none cursor-pointer"
            >
              Richiedi informazioni →
            </button>
          </div>

          {/* Column 4: Mini Map Card */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#F8861D]">
              Mappa
            </h4>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex items-center gap-3 overflow-hidden shadow-lg">
              <div className="relative w-16 h-16 rounded-xl bg-white/10 border border-white/10 flex-shrink-0 flex items-center justify-center overflow-hidden">
                {/* Stylized map representation */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-white/10" />
                <div className="absolute w-full h-[2px] bg-white/10 top-1/3 -rotate-12" />
                <div className="absolute w-[2px] h-full bg-white/10 left-1/2 rotate-12" />
                <div className="absolute w-full h-[2px] bg-white/10 bottom-1/4 rotate-6" />
                <MapPin className="w-6 h-6 text-[#F8861D] relative z-10 animate-bounce" weight="fill" />
              </div>
              <div className="text-left flex-1 min-w-0">
                <p className="text-xs font-black text-white truncate">Atena School</p>
                <p className="text-[10px] text-white/50 truncate mt-0.5">Via Matteotti 11, Cittanova (RC) 89022</p>
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

        {/* Divider */}
        <div className="w-full h-px bg-white/10 my-8 md:my-10" />

        {/* Bottom Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-white/60">
          <div>
            <p>{t("copyright")}</p>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            <Link href="/privacy" className="hover:text-[#F8861D] transition-colors duration-300">
              Privacy Policy
            </Link>
            <Link href="/cookies" className="hover:text-[#F8861D] transition-colors duration-300">
              Cookie Policy
            </Link>
            <Link href="#" className="hover:text-[#F8861D] transition-colors duration-300">
              Termini e Condizioni
            </Link>
          </div>
        </div>
      </div>

      {/* Modal Dialog */}
      <ContactModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </footer>
  );
};

export default Footer;
