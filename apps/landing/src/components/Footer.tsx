"use client";

import { useTranslations } from "next-intl";
import { InstagramLogo, FacebookLogo } from "@phosphor-icons/react";

const Footer = () => {
  const t = useTranslations("footer");

  return (
    <footer className="bg-foreground text-primary-foreground py-8 px-4">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        <p className="text-sm opacity-70">{t("copyright")}</p>
        <div className="flex gap-4">
          <a 
            href="https://www.instagram.com/atenaschool_srls/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary hover:text-white text-white/80 hover:text-white transition-all active:scale-90 duration-300"
            aria-label="Instagram"
          >
            <InstagramLogo className="w-4 h-4" />
          </a>
          <a 
            href="https://www.facebook.com/CSAtena7" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary hover:text-white text-white/80 hover:text-white transition-all active:scale-90 duration-300"
            aria-label="Facebook"
          >
            <FacebookLogo className="w-4 h-4" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
