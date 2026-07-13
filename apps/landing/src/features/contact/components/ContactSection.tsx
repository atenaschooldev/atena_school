"use client";

import { useTranslations } from "next-intl";
import { MapPin, Phone, Envelope, InstagramLogo, FacebookLogo, FileText } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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
  const t = useTranslations("contact");

  const address = data?.address || "Via Matteotti 11, Cittanova (RC) 89022";
  const phone = data?.phone || "+39 375 605 2362";
  const landline = data?.landline || "0966 447052";
  const email = data?.email || "atenaschool20@gmail.com";
  const vat = data?.vat || "P.IVA/C.F. 03321620803";

  return (
    <section id="contact" className="relative py-16 px-4 bg-background overflow-hidden">
      {/* Top wave transition from Testimonials (bg-muted) to Contact (background/white) */}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-none z-10 transform rotate-180">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[40px] fill-muted">
          <path d="M1200 120L0 120 309.19 8C462.66-8 637.34-8 790.81 8L1200 120Z"></path>
        </svg>
      </div>

      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 relative z-20">
        {/* Info */}
        <div>
          <h2 className="text-3xl font-bold text-primary mb-3 leading-tight">{t("title")}</h2>
          <p className="text-foreground/75 mb-8 text-base leading-relaxed">{t("subtitle")}</p>
          <div className="space-y-5">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <p className="text-foreground/80">{address}</p>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <p className="text-foreground/80">{phone}</p>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <p className="text-foreground/80">{landline}</p>
            </div>
            <div className="flex items-start gap-3">
              <Envelope className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <p className="text-foreground/80">{email}</p>
            </div>
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <p className="text-foreground/80">{vat}</p>
            </div>
          </div>

          {/* Social */}
          <div className="flex gap-4 mt-8">
            <a
              href="https://www.instagram.com/atenaschool_srls/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-secondary hover:text-secondary-foreground hover:scale-110 transition-all duration-300"
            >
              <span className="sr-only">Instagram</span>
              <InstagramLogo className="w-5 h-5" />
            </a>
            <a
              href="https://www.facebook.com/CSAtena7"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-secondary hover:text-secondary-foreground hover:scale-110 transition-all duration-300 active:scale-90"
            >
              <span className="sr-only">Facebook</span>
              <FacebookLogo className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Form */}
        <div className="bg-card rounded-2xl shadow-lg p-8">
          <h3 className="text-xl font-bold text-foreground mb-4">{t("form.title")}</h3>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-2 gap-4">
              <Input placeholder={t("form.firstName")} />
              <Input placeholder={t("form.lastName")} />
            </div>
            <Input type="email" placeholder={t("form.email")} />
            <Textarea placeholder={t("form.message")} rows={5} />
            <Button className="w-full rounded-full">{t("form.submit")}</Button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
