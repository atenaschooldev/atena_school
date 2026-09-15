"use client";

import React from "react";
import {
  GraduationCap,
  Spinner,
  CheckCircle,
  Info,
  Trash,
  User,
  IdentificationCard,
  Calendar as CalendarIcon,
  Envelope,
  Phone,
  Plus,
} from "@phosphor-icons/react";
import type { FieldErrors } from "react-hook-form";
import type { CheckoutFormValues, FeeCheckStatus } from "@/features/checkout/hooks/useCheckout";

interface StudentItem {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  taxCode: string;
  birthDate?: string;
}

interface CheckoutStudentsListProps {
  studentsList: StudentItem[];
  studentFeeStatuses: Record<number, FeeCheckStatus>;
  errors: FieldErrors<CheckoutFormValues>;
  coursePrice: number;
  addStudent: () => void;
  removeStudent: (index: number) => void;
  updateStudent: (index: number, field: keyof StudentItem, value: string) => void;
}

export function CheckoutStudentsList({
  studentsList,
  studentFeeStatuses,
  errors,
  coursePrice,
  addStudent,
  removeStudent,
  updateStudent,
}: CheckoutStudentsListProps) {
  return (
    <div className="space-y-4 pt-3 border-t border-slate-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-[#043569]" weight="bold" />
          <h3 className="text-xs sm:text-sm font-black uppercase tracking-tight text-[#043569]">
            Dati degli Studenti ({studentsList.length})
          </h3>
        </div>
        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
          {studentsList.length} {studentsList.length === 1 ? "Studente" : "Studenti"}
        </span>
      </div>

      <div className="space-y-3">
        {studentsList.map((student, idx) => {
          const studentFee = studentFeeStatuses[idx];
          const studentErrors = (errors.students as any)?.[idx];

          return (
            <div
              key={idx}
              className="bg-[#043569]/[0.02] border border-[#043569]/15 rounded-xl p-3.5 space-y-3 relative transition-all"
            >
              {/* Student Card Header */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#043569] text-white text-[10px] font-black flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-black text-[#043569] uppercase tracking-wider">
                    Studente #{idx + 1} {student.firstName ? `— ${student.firstName} ${student.lastName}` : ""}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Individual Fee Status Badge */}
                  {studentFee === "checking" && (
                    <span className="flex items-center gap-1 text-[10px] text-slate-500 font-bold bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs">
                      <Spinner className="w-3 h-3 animate-spin text-[#043569]" />
                      Verifica quota...
                    </span>
                  )}
                  {studentFee === "paid" && (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 shadow-2xs">
                      <CheckCircle className="w-3 h-3 text-emerald-600" weight="fill" />
                      Quota 2026/2027 saldata (0€)
                    </span>
                  )}
                  {studentFee === "not_paid" && (
                    <span className="flex items-center gap-1 text-[10px] text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 shadow-2xs">
                      <Info className="w-3 h-3 text-amber-600" weight="bold" />
                      Quota annuale (+30€)
                    </span>
                  )}

                  {/* Remove button if multiple students */}
                  {studentsList.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeStudent(idx)}
                      className="text-slate-400 hover:text-red-600 p-1 rounded-md hover:bg-red-50 transition-colors cursor-pointer"
                      title="Rimuovi studente"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Student Name / Surname */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nome Studente *</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={student.firstName || ""}
                      onChange={(e) => updateStudent(idx, "firstName", e.target.value)}
                      placeholder="Luca"
                      className="w-full pl-8 pr-2.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#043569]/10 focus:border-[#043569] bg-white font-medium transition-all"
                    />
                  </div>
                  {(studentErrors?.firstName || (idx === 0 && errors.studentFirstName)) && (
                    <p className="text-[10px] text-red-500 mt-1 font-semibold">
                      {studentErrors?.firstName?.message || (idx === 0 && errors.studentFirstName?.message)}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Cognome Studente *</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={student.lastName || ""}
                      onChange={(e) => updateStudent(idx, "lastName", e.target.value)}
                      placeholder="Rossi"
                      className="w-full pl-8 pr-2.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#043569]/10 focus:border-[#043569] bg-white font-medium transition-all"
                    />
                  </div>
                  {(studentErrors?.lastName || (idx === 0 && errors.studentLastName)) && (
                    <p className="text-[10px] text-red-500 mt-1 font-semibold">
                      {studentErrors?.lastName?.message || (idx === 0 && errors.studentLastName?.message)}
                    </p>
                  )}
                </div>
              </div>

              {/* Student Tax Code */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Codice Fiscale Studente *
                </label>
                <div className="relative">
                  <IdentificationCard className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={student.taxCode || ""}
                    onChange={(e) => updateStudent(idx, "taxCode", e.target.value.toUpperCase())}
                    placeholder="RSSLCU10A01H501Z"
                    className="w-full pl-8 pr-2.5 py-2 text-xs uppercase border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#043569]/10 focus:border-[#043569] bg-white font-medium tracking-wider transition-all"
                  />
                </div>
                {(studentErrors?.taxCode || (idx === 0 && errors.taxCode)) && (
                  <p className="text-[10px] text-red-500 mt-1 font-semibold">
                    {studentErrors?.taxCode?.message || (idx === 0 && errors.taxCode?.message)}
                  </p>
                )}
              </div>

              {/* Student Additional Info: Birth date, Email, Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Data di Nascita</label>
                  <div className="relative">
                    <CalendarIcon className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="date"
                      value={student.birthDate || ""}
                      onChange={(e) => updateStudent(idx, "birthDate", e.target.value)}
                      className="w-full pl-8 pr-2.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#043569]/10 focus:border-[#043569] bg-white font-medium transition-all"
                    />
                  </div>
                  {studentErrors?.birthDate && (
                    <p className="text-[10px] text-red-500 mt-1 font-semibold">{studentErrors.birthDate.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email (opzionale)</label>
                  <div className="relative">
                    <Envelope className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={student.email || ""}
                      onChange={(e) => updateStudent(idx, "email", e.target.value)}
                      placeholder="studente@email.com"
                      className="w-full pl-8 pr-2.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#043569]/10 focus:border-[#043569] bg-white font-medium transition-all"
                    />
                  </div>
                  {studentErrors?.email && (
                    <p className="text-[10px] text-red-500 mt-1 font-semibold">{studentErrors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Telefono (opzionale)</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={student.phone || ""}
                      onChange={(e) => updateStudent(idx, "phone", e.target.value)}
                      placeholder="+39 340 0000000"
                      className="w-full pl-8 pr-2.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#043569]/10 focus:border-[#043569] bg-white font-medium transition-all"
                    />
                  </div>
                  {studentErrors?.phone && (
                    <p className="text-[10px] text-red-500 mt-1 font-semibold">{studentErrors.phone.message}</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Another Student Button */}
      <button
        type="button"
        onClick={addStudent}
        disabled={studentsList.length >= 10}
        className="w-full py-2.5 px-3 rounded-xl border-2 border-dashed border-[#043569]/30 hover:border-[#043569] text-[#043569] hover:bg-[#043569]/5 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Plus className="w-4 h-4" weight="bold" />
        Aggiungi un altro studente (+{coursePrice.toFixed(2)}€)
      </button>
    </div>
  );
}
