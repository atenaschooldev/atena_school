"use client";

import React from "react";
import { Calendar, CreditCard, CheckCircle, Check } from "@phosphor-icons/react";

export interface CheckoutStepperProps {
  currentStep: 1 | 2 | 3;
  dark?: boolean;
}

export function CheckoutStepper({ currentStep, dark }: CheckoutStepperProps) {
  const steps = [
    { number: 1, label: "Data e orario", icon: Calendar },
    { number: 2, label: "Dettagli e pagamento", icon: CreditCard },
    { number: 3, label: "Conferma", icon: CheckCircle },
  ];

  return (
    <div className="w-full sm:w-auto min-w-[300px]">
      <div className="flex items-center justify-between relative">
        {/* Connecting Line Track with Active Progress inside */}
        <div className={`absolute top-4 left-8 right-8 h-[2px] -translate-y-1/2 z-0 ${dark ? "bg-white/20" : "bg-slate-200"}`}>
          <div
            className="h-full bg-[#043569] transition-all duration-500 ease-out"
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
                  w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 shadow-sm
                  ${
                    isCompleted
                      ? "bg-[#043569] text-white ring-4 ring-[#043569]/10"
                      : isCurrent
                      ? "bg-[#043569] text-white ring-4 ring-[#043569]/15 shadow-md scale-105"
                      : "bg-white text-slate-300 border border-slate-200"
                  }
                `}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 text-white stroke-[3]" />
                ) : (
                  <Icon
                    className={`w-4 h-4 ${
                      isCurrent
                        ? "text-white"
                        : "text-slate-400"
                    }`}
                  />
                )}
              </div>

              {/* Step Label */}
              <span
                className={`
                  mt-1.5 text-[11px] sm:text-xs font-semibold text-center transition-colors whitespace-nowrap leading-tight
                  ${
                    isCurrent ? "text-[#043569] font-bold" : isCompleted ? "text-slate-600" : "text-slate-400"
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
