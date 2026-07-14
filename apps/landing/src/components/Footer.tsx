"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import logo from "@/assets/athena-logo.webp";

const Footer = () => {
  const t = useTranslations("footer");

  return (
    <footer className="relative bg-[#043569] text-white pt-8 pb-4 px-4 mt-[-2px]">
      {/* Top wave — transitions from page background into the dark footer */}
      <div className="absolute top-[-48px] left-0 w-full overflow-hidden leading-none z-20">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[50px] fill-[#043569]">
          <path d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z"></path>
        </svg>
      </div>
      
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
        {/* Left Side: Logo & Copyright */}
        <div className="flex flex-col items-center md:items-start gap-2">
          <div className="flex items-center gap-2">
            <Image 
              src={logo} 
              alt="Atena School" 
              width={32} 
              height={32} 
              className="object-contain"
            />
            <span className="font-serif font-black text-lg tracking-wider uppercase">
              Atena <span className="text-[#F8861D]">School</span>
            </span>
          </div>
          <p className="text-xs text-white/60">{t("copyright")}</p>
        </div>

        {/* Right Side: Legal Links */}
        <div className="flex flex-wrap justify-center gap-6 text-xs text-white/70">
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
    </footer>
  );
};

export default Footer;
