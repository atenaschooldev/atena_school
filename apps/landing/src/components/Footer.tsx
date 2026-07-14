"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import logo from "@/assets/athena-logo.webp";

const Footer = () => {
  const t = useTranslations("footer");

  return (
    <footer className="bg-[#043569] text-white py-2 px-4">
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
