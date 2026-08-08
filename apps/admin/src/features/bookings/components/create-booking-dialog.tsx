"use client";

import { useState } from "react";
import {
  Plus,
  User,
  GraduationCap,
  ChevronLeft,
  Loader2,
  BookOpen,
  Baby,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Form } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";

import type { CreateBookingDialogProps } from "./create-booking/types";
import { STEPS } from "./create-booking/types";
import { useCreateBookingForm } from "./create-booking/use-create-booking-form";

import { StepClientInfo } from "./create-booking/step-client-info";
import { StepCourseSchedule } from "./create-booking/step-course-schedule";
import { StepPaymentSummary } from "./create-booking/step-payment-summary";

export function CreateBookingDialog({ onCreateBooking }: CreateBookingDialogProps) {
  const [open, setOpen] = useState(false);

  const {
    form,
    currentStep,
    setCurrentStep,
    selectedCourse,
    selectedDateState,
    membershipFeeStatus,
    searchQuery,
    setSearchQuery,
    isSearchingClient,
    clientFound,
    setClientFound,
    clientsList,
    isLoadingClients,
    isSearchOpen,
    setIsSearchOpen,
    submitting,
    isFinalSubmitRequested,
    setIsFinalSubmitRequested,
    coursesList,
    computedPurchaserName,
    computedStudentName,
    amountPaid,
    registrationFee,
    totalAmount,
    filteredClients,
    allowedDays,
    isFlexibleSchedule,
    isFixedSchedule,
    previewLessons,
    formattedScheduleText,
    handleCourseChange,
    handleDateSelect,
    applyClientData,
    handleManualLookup,
    handleClose,
    onSubmit,
  } = useCreateBookingForm({ open, setOpen, onCreateBooking });

  const isForChild = form.watch("isForChild");

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) handleClose(); else setOpen(true); }}>
      <SheetTrigger asChild>
        <Button className="cursor-pointer font-medium shadow-sm">
          <Plus className="mr-2 h-4 w-4" />
          Nuova Prenotazione
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-full sm:max-w-[740px] p-0 flex flex-col h-full border-l border-border/60 bg-background shadow-2xl overflow-hidden"
      >
        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (isFinalSubmitRequested) {
                form.handleSubmit(onSubmit)(e);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
              }
            }}
            className="flex flex-col h-full"
          >
            {/* ── TOP DRAWER HEADER ───────────────────────────────────── */}
            <div className="px-6 pt-5 pb-4 border-b border-border/60 bg-muted/20 shrink-0 space-y-4 pr-14">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
                  <GraduationCap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-base font-bold leading-tight">Nuova Prenotazione in Sede</h2>
                  <p className="text-xs text-muted-foreground">Reception Wizard · Atena School</p>
                </div>
              </div>

              {/* Stepper Navigation Tabs */}
              <div className="grid grid-cols-3 gap-2 bg-background p-1.5 rounded-xl border border-border/60 shadow-xs">
                {STEPS.map((s) => {
                  const Icon = s.icon;
                  const isActive = currentStep === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={async () => {
                        if (s.id === currentStep) return;
                        if (s.id > 1 && currentStep === 1) {
                          const pName = form.getValues("purchaserFirstName") || form.getValues("purchaserName");
                          const pEmail = form.getValues("purchaserEmail");
                          if (!pName || !pEmail) {
                            form.trigger(["purchaserFirstName", "purchaserLastName", "purchaserEmail"]);
                            return;
                          }
                        }
                        if (s.id > 2 && currentStep === 2) {
                          const courseId = form.getValues("courseId");
                          if (!courseId) {
                            form.trigger("courseName");
                            return;
                          }
                        }
                        setCurrentStep(s.id as 1 | 2 | 3);
                      }}
                      className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm font-bold"
                          : "text-foreground hover:bg-muted font-medium"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{s.id}. {s.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── LIVE SUMMARY BAR ────────────────────────────────────── */}
            <div className="px-6 py-3 bg-muted/40 border-b border-border/50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground font-medium">Cliente: </span>
                  <span className="font-bold text-foreground">
                    {computedPurchaserName || "Non specificato"}
                    {isForChild && <span className="text-primary font-normal"> (Genitore)</span>}
                  </span>
                </div>
                {isForChild && (
                  <div className="border-l pl-4 border-border/60 flex items-center gap-1.5">
                    <Baby className="w-3.5 h-3.5 text-primary" />
                    <span className="text-muted-foreground font-medium">Studente: </span>
                    <span className="font-bold text-foreground">{computedStudentName}</span>
                  </div>
                )}
                {selectedCourse && (
                  <div className="border-l pl-4 border-border/60 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-primary" />
                    <span className="text-muted-foreground font-medium">Corso: </span>
                    <span className="font-bold text-foreground">{selectedCourse.nome}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-medium">Totale:</span>
                <Badge variant="secondary" className="font-mono font-bold text-sm bg-primary/10 text-primary border-primary/20 px-3 py-0.5">
                  €{totalAmount.toFixed(2)}
                </Badge>
              </div>
            </div>

            {/* ── SCROLLABLE STEP CONTENT ─────────────────────────────── */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {currentStep === 1 && (
                <StepClientInfo
                  form={form}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  isSearchingClient={isSearchingClient}
                  clientFound={clientFound}
                  setClientFound={setClientFound}
                  clientsList={clientsList}
                  isLoadingClients={isLoadingClients}
                  isSearchOpen={isSearchOpen}
                  setIsSearchOpen={setIsSearchOpen}
                  filteredClients={filteredClients}
                  applyClientData={applyClientData}
                  handleManualLookup={handleManualLookup}
                  membershipFeeStatus={membershipFeeStatus}
                />
              )}

              {currentStep === 2 && (
                <StepCourseSchedule
                  form={form}
                  coursesList={coursesList}
                  selectedCourse={selectedCourse}
                  handleCourseChange={handleCourseChange}
                  isFixedSchedule={isFixedSchedule}
                  isFlexibleSchedule={isFlexibleSchedule}
                  selectedDateState={selectedDateState}
                  handleDateSelect={handleDateSelect}
                  allowedDays={allowedDays}
                  formattedScheduleText={formattedScheduleText}
                  previewLessons={previewLessons}
                />
              )}

              {currentStep === 3 && (
                <StepPaymentSummary
                  form={form}
                  amountPaid={amountPaid}
                  registrationFee={registrationFee}
                  totalAmount={totalAmount}
                />
              )}
            </div>

            {/* ── STICKY FOOTER ACTIONS ───────────────────────────────── */}
            <div className="px-6 py-4 border-t border-border/60 bg-muted/30 flex items-center justify-between shrink-0">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  if (currentStep > 1) setCurrentStep((prev) => (prev - 1) as 1 | 2);
                  else handleClose();
                }}
                className="cursor-pointer text-xs font-semibold"
              >
                {currentStep > 1 ? <ChevronLeft className="mr-1 h-4 w-4" /> : null}
                {currentStep > 1 ? "Indietro" : "Annulla"}
              </Button>

              {currentStep < 3 ? (
                <Button
                  type="button"
                  onClick={() => {
                    if (currentStep === 1) {
                      const pName = form.getValues("purchaserFirstName") || form.getValues("purchaserName");
                      const pEmail = form.getValues("purchaserEmail");
                      if (!pName || !pEmail) {
                        form.trigger(["purchaserFirstName", "purchaserLastName", "purchaserEmail"]);
                        return;
                      }
                    }
                    if (currentStep === 2) {
                      const courseId = form.getValues("courseId");
                      if (!courseId) {
                        form.trigger("courseName");
                        return;
                      }
                    }
                    setCurrentStep((prev) => (prev + 1) as 2 | 3);
                  }}
                  className="cursor-pointer text-xs font-bold px-5"
                >
                  Prosegui
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={submitting}
                  onClick={() => {
                    setIsFinalSubmitRequested(true);
                  }}
                  className="cursor-pointer font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all text-xs px-6"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creazione...
                    </>
                  ) : (
                    "Conferma & Crea Prenotazione"
                  )}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
