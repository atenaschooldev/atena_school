"use client";

import { useState } from "react";
import { Plus, Minus } from "@phosphor-icons/react";

const faqs = [
  {
    q: "Dove si trova Atena School?",
    a: "Atena School si trova in Via Matteotti 11 a Cittanova (RC), in Calabria. Offriamo corsi in presenza dal lunedì al venerdì, dalle 09:00 alle 18:00.",
  },
  {
    q: "Quali certificazioni offrite?",
    a: "Siamo un centro autorizzato Cambridge English (KET, PET, FCE, CAE) e offriamo anche le certificazioni informatiche EIPASS riconosciute a livello europeo.",
  },
  {
    q: "I corsi sono adatti anche ai bambini?",
    a: "Sì. Organizziamo corsi di inglese per bambini, ragazzi e adulti, con percorsi personalizzati per ogni fascia d'età e livello di partenza.",
  },
  {
    q: "Come posso iscrivermi?",
    a: "Puoi compilare il modulo di contatto qui accanto, oppure chiamarci al +39 375 605 2362. Offriamo una consulenza gratuita per trovare il corso più adatto a te.",
  },
  {
    q: "Fate anche recupero scolastico?",
    a: "Sì, offriamo doposcuola e recupero delle materie scolastiche per studenti delle scuole medie e superiori, con tutor qualificati.",
  },
];

const FaqSidebar = () => {
  const [open, setOpen] = useState<number | null>(null);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div className="px-4 pt-4 pb-28 flex flex-col flex-1 min-h-0 bg-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replace(/</g, '\\u003c') }}
      />

      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-6 flex flex-col flex-1 min-h-0 overflow-hidden">
        {/* Header */}
        <div className="mb-5">
          <p className="text-[10px] font-black text-[#F8861D] uppercase tracking-widest mb-1">FAQ</p>
          <h2 className="text-lg font-black text-gray-900 leading-tight">
            Domande frequenti
          </h2>
        </div>

        {/* Accordion items */}
        <div className="flex flex-col divide-y divide-gray-100">
          {faqs.map((faq, i) => {
            const isOpen = open === i;
            return (
              <div key={i}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 py-4 text-left cursor-pointer select-none group"
                >
                  <span
                    className={`text-xs font-bold leading-snug transition-colors duration-200 ${
                      isOpen ? "text-[#F8861D]" : "text-gray-800 group-hover:text-[#F8861D]"
                    }`}
                  >
                    {faq.q}
                  </span>
                  <span
                    className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isOpen
                        ? "bg-[#F8861D] text-white"
                        : "bg-gray-100 text-gray-400 group-hover:bg-[#F8861D]/10 group-hover:text-[#F8861D]"
                    }`}
                  >
                    {isOpen ? (
                      <Minus className="w-3 h-3" weight="bold" />
                    ) : (
                      <Plus className="w-3 h-3" weight="bold" />
                    )}
                  </span>
                </button>

                {/* Answer */}
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <p className="pb-4 text-[11px] text-gray-500 leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FaqSidebar;
