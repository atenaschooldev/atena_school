"use client";

import React from "react";
import { Calendar, CreditCard, CheckCircle, Check } from "@phosphor-icons/react";

export interface CheckoutStepperProps {
  currentStep: 1 | 2 | 3;
  dark?: boolean;
}

export function CheckoutStepper({ currentStep, dark }: CheckoutStepperProps) {
  const steps = [
    { number: 1, label: "Data e Orario", icon: Calendar },
    { number: 2, label: "Dettagli & Pagamento", icon: CreditCard },
    { number: 3, label: "Conferma", icon: CheckCircle },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto px-4 mb-2">
      <div className="flex items-center justify-between relative">
        {/* Connecting Line Track with Active Progress inside */}
        <div className={`absolute top-5 left-10 right-10 h-1 -translate-y-1/2 z-0 rounded-full ${dark ? "bg-white/10" : "bg-slate-200/80"} overflow-hidden`}>
          <div
            className={`h-full transition-all duration-500 ease-out rounded-full ${
              dark ? "bg-gradient-to-r from-white via-white to-[#F8861D]" : "bg-gradient-to-r from-[#043569] to-[#F8861D]"
            }`}
            style={{
              width: currentStep === 1 ? "0%" : currentStep === 2 ? "50%" : "100%",
            }}
          />
        </div>

        {/* Step Nodes */}
        {steps.map((step) => {
          const isCompleted = step.number < currentStep;
          const isCurrent = step.number === currentStep;
          const Icon = step.icon;

          return (
            <div key={step.number} className="relative z-10 flex flex-col items-center group">
              <div
                className={`
                  w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center font-bold transition-all duration-300 shadow-md
                  ${
                    dark
                      ? isCompleted
                        ? "bg-white text-[#043569] scale-100 ring-4 ring-white/10"
                        : isCurrent
                        ? "bg-white text-[#043569] scale-110 ring-4 ring-white/20 shadow-xl shadow-white/10"
                        : "bg-white/10 text-white/40 border border-white/10"
                      : isCompleted
                      ? "bg-gradient-to-br from-[#043569] to-[#0A4B8F] text-white scale-100 ring-4 ring-[#043569]/10"
                      : isCurrent
                      ? "bg-gradient-to-br from-[#043569] via-[#064485] to-[#0A4B8F] text-white scale-110 ring-4 ring-[#043569]/20 shadow-xl shadow-[#043569]/25"
                      : "bg-white text-slate-400 border border-slate-200 shadow-sm"
                  }
                `}
              >
                {isCompleted ? (
                  <Check className={`w-5 h-5 stroke-[3] ${dark ? "text-emerald-600" : "text-emerald-400"}`} />
                ) : (
                  <Icon
                    className={`w-5 h-5 ${
                      isCurrent
                        ? "text-[#F8861D]"
                        : dark
                        ? "text-white/40"
                        : "text-slate-400"
                    }`}
                    weight={isCurrent ? "duotone" : "regular"}
                  />
                )}
              </div>

              {/* Step Label */}
              <span
                className={`
                  mt-2 text-[9px] sm:text-xs font-black uppercase tracking-wider text-center transition-colors whitespace-normal sm:whitespace-nowrap max-w-[85px] sm:max-w-none leading-tight
                  ${
                    dark
                      ? isCurrent ? "text-white" : isCompleted ? "text-white/60" : "text-white/30"
                      : isCurrent ? "text-[#043569]" : isCompleted ? "text-slate-700" : "text-slate-400"
                  }
                `}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
