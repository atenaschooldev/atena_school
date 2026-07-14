"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { MapPin, Phone, Envelope, InstagramLogo, FacebookLogo, FileText, WhatsappLogo, Clock } from "@phosphor-icons/react";
import ContactModal from "./ContactModal";

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
  const [isModalOpen, setIsModalOpen] = useState(false);

  const address = data?.address || "Via Matteotti 11, Cittanova (RC) 89022";
  const phone = data?.phone || "+39 375 605 2362";
  const landline = data?.landline || "0966 447052";
  const email = data?.email || "atenaschool20@gmail.com";
  const vat = data?.vat || "P.IVA/C.F. 03321620803";

  return (
    <section id="contact" className="relative py-16 px-4 bg-background overflow-hidden">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 lg:gap-14 relative z-20 items-center">
        {/* Info */}
        <div className="space-y-6 flex flex-col items-start text-left">
          <div className="space-y-3">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-[#F8861D]">
              CONTATTACI
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-[#043569]">
              Siamo qui per te
            </h2>
          </div>

          <div className="space-y-4 w-full">
            {/* Address */}
            <div className="flex items-center gap-3">
              <div className="text-[#F8861D] shrink-0">
                <MapPin className="w-5 h-5" weight="bold" />
              </div>
              <p className="text-sm sm:text-base font-bold text-gray-700">{address}</p>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-3">
              <div className="text-[#F8861D] shrink-0">
                <Phone className="w-5 h-5" weight="bold" />
              </div>
              <p className="text-sm sm:text-base font-bold text-gray-700">{phone}</p>
            </div>

            {/* Landline */}
            <div className="flex items-center gap-3">
              <div className="text-[#F8861D] shrink-0">
                <Phone className="w-5 h-5" weight="bold" />
              </div>
              <p className="text-sm sm:text-base font-bold text-gray-700">{landline}</p>
            </div>

            {/* Email */}
            <div className="flex items-center gap-3">
              <div className="text-[#F8861D] shrink-0">
                <Envelope className="w-5 h-5" weight="bold" />
              </div>
              <p className="text-sm sm:text-base font-bold text-gray-700">{email}</p>
            </div>

            {/* VAT */}
            <div className="flex items-center gap-3">
              <div className="text-[#F8861D] shrink-0">
                <FileText className="w-5 h-5" weight="bold" />
              </div>
              <p className="text-sm sm:text-base font-bold text-gray-700">{vat}</p>
            </div>

            {/* Opening Hours */}
            <div className="flex items-center gap-3">
              <div className="text-[#F8861D] shrink-0">
                <Clock className="w-5 h-5" weight="bold" />
              </div>
              <p className="text-sm sm:text-base font-bold text-gray-700">Lunedì – Venerdì: 09:00 - 18:00</p>
            </div>
          </div>

          {/* Social & Contact Button */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-3 w-full">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 bg-[#F8861D] hover:bg-[#e0730d] text-white px-6 py-3 rounded-full font-black text-sm transition-all duration-300 shadow-lg shadow-orange-500/10 transform hover:-translate-y-0.5 active:translate-y-0 select-none cursor-pointer"
            >
              Richiedi informazioni →
            </button>
            <div className="flex gap-3">
              <a
                href="https://www.instagram.com/atenaschool_srls/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-[#0B1B2B] text-white flex items-center justify-center hover:bg-[#F8861D] hover:scale-105 transition-all duration-300"
              >
                <span className="sr-only">Instagram</span>
                <InstagramLogo className="w-4 h-4" weight="bold" />
              </a>
              <a
                href="https://www.facebook.com/CSAtena7"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-[#0B1B2B] text-white flex items-center justify-center hover:bg-[#F8861D] hover:scale-105 transition-all duration-300"
              >
                <span className="sr-only">Facebook</span>
                <FacebookLogo className="w-4 h-4" weight="bold" />
              </a>
              <a
                href={`https://wa.me/${phone.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-[#0B1B2B] text-white flex items-center justify-center hover:bg-[#F8861D] hover:scale-105 transition-all duration-300"
              >
                <span className="sr-only">WhatsApp</span>
                <WhatsappLogo className="w-4 h-4" weight="bold" />
              </a>
            </div>
          </div>
        </div>

        {/* Google Map on the Right */}
        <div className="rounded-3xl overflow-hidden shadow-xl border border-gray-100 bg-white h-[280px] relative z-10">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3121.5!2d16.0781!3d38.3561!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x131153d3a3e6b8b7%3A0x0!2sViale+Giacomo+Matteotti+11%2C+89022+Cittanova+RC!5e0!3m2!1sit!2sit!4v1700000000000!5m2!1sit!2sit&q=Viale+Giacomo+Matteotti+11,+89022+Cittanova+RC"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Atena School - Viale Giacomo Matteotti 11, Cittanova"
            className="grayscale hover:grayscale-0 transition-all duration-700"
          />
        </div>
      </div>

      {/* Modal Popup Dialog */}
      <ContactModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        contactData={data}
      />
    </section>
  );
};

export default ContactSection;
