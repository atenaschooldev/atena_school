"use client";

import { useTranslations } from "next-intl";
import { MapPin, Phone, Mail, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface ContactSectionProps {
  data?: {
    address?: string;
    phone?: string;
    email?: string;
  };
}

const ContactSection = ({ data }: ContactSectionProps) => {
  const t = useTranslations("contact");

  const address = data?.address || "Via Matteotti 11, Cittanova (RC)";
  const phone = data?.phone || "+39 375 605 2362";
  const email = data?.email || "atenaschool20@gmail.com";

  return (
    <section id="contact" className="py-20 px-4 bg-muted">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12">
        {/* Info */}
        <div>
          <h2 className="text-3xl font-bold text-primary mb-8">{t("title")}</h2>
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
              <Mail className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <p className="text-foreground/80">{email}</p>
            </div>
          </div>

          {/* Social */}
          <div className="flex gap-4 mt-8">
            <a 
              href="https://www.instagram.com/atenaschool_srls/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-80 transition"
            >
              <span className="sr-only">Instagram</span>
              <Instagram className="w-5 h-5" />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-80 transition">
              <span className="sr-only">Facebook</span>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
          </div>
        </div>

        {/* Form */}
        <div className="bg-card rounded-2xl shadow-lg p-8">
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
