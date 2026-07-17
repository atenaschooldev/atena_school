"use client";

import { MapPin, Phone, Envelope, FileText, Clock } from "@phosphor-icons/react";

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

        </div>

        {/* Google Map on the Right */}
        <div className="rounded-3xl overflow-hidden shadow-xl border border-gray-100 bg-white h-[280px] relative z-10">
          <iframe
            src="https://maps.app.goo.gl/4Vmvrk9hxz5EC5gM7"
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


    </section>
  );
};

export default ContactSection;
