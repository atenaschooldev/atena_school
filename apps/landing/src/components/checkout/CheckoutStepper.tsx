"use client";

import React from "react";
import { Calendar, CreditCard, CheckCircle, Check } from "@phosphor-icons/react";
import { Link } from "@/i18n/routing";
import { useParams } from "next/navigation";

export interface CheckoutStepperProps {
  currentStep: 1 | 2 | 3;
  dark?: boolean;
  type?: string;
  id?: string;
}

export function CheckoutStepper({ currentStep, dark, id: propId }: CheckoutStepperProps) {
  const params = useParams();
  const id = propId || (params?.id as string) || "";

  const getHref = (stepNumber: number) => {
    if (!id) return null;
    if (stepNumber === 1) return `/corsi/${id}`;
    if (stepNumber === 2) return `/checkout/${id}`;
    return null;
  };

  const steps = [
    { number: 1, label: "Data e orario", icon: Calendar, href: getHref(1) },
    { number: 2, label: "Dettagli e pagamento", icon: CreditCard, href: getHref(2) },
    { number: 3, label: "Conferma", icon: CheckCircle, href: getHref(3) },
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
          const isClickable = !!step.href && step.number !== currentStep && step.number !== 3;

          const content = (
            <div className={`relative z-10 flex flex-col items-center group ${isClickable ? "cursor-pointer" : ""}`}>
              <div
                className={`
                  w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 shadow-sm
                  ${
                    isCompleted
                      ? "bg-[#043569] text-white ring-4 ring-[#043569]/10 group-hover:scale-110 group-hover:bg-[#F8861D]"
                      : isCurrent
                      ? "bg-[#043569] text-white ring-4 ring-[#043569]/15 shadow-md scale-105"
                      : "bg-white text-slate-300 border border-slate-200 group-hover:border-[#043569] group-hover:scale-110"
                  }
                `}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 text-white stroke-[3]" />
                ) : (
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isCurrent
                        ? "text-white"
                        : "text-slate-400 group-hover:text-[#043569]"
                    }`}
                  />
                )}
              </div>

              {/* Step Label */}
              <span
                className={`
                  mt-1.5 text-[11px] sm:text-xs font-semibold text-center transition-colors whitespace-nowrap leading-tight
                  ${
                    isCurrent
                      ? "text-[#043569] font-bold"
                      : isCompleted
                      ? "text-slate-600 group-hover:text-[#043569]"
                      : "text-slate-400 group-hover:text-[#043569]"
                  }
                `}
              >
                {step.label}
              </span>
            </div>
          );

          if (isClickable && step.href) {
            return (
              <Link key={step.number} href={step.href as any} className="no-underline">
                {content}
              </Link>
            );
          }

          return <div key={step.number}>{content}</div>;
        })}
      </div>
    </div>
  );
}

