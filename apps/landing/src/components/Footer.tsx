"use client";

import { useTranslations } from "next-intl";

const Footer = () => {
  const t = useTranslations("footer");

  return (
    <footer className="relative bg-foreground text-primary-foreground pt-12 pb-8 px-4 mt-[-2px]">
      {/* Top wave — transitions from page background into the dark footer */}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-none">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[50px] fill-background">
          <path d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V0H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z"></path>
        </svg>
      </div>
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
        <p className="text-sm opacity-70">{t("copyright")}</p>
      </div>
    </footer>
  );
};

export default Footer;
