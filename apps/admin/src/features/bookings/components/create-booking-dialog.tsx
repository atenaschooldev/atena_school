"use client";

import { useState } from "react";
import {
  Plus,
  User,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  Loader2,
  BookOpen,
  Baby,
  CreditCard,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import type { CreateBookingDialogProps } from "./create-booking/types";
import { STEPS } from "./create-booking/types";
import { useCreateBookingForm } from "./create-booking/use-create-booking-form";

import { StepClientInfo } from "./create-booking/step-client-info";
import { StepCourseSchedule } from "./create-booking/step-course-schedule";
import { StepPaymentSummary } from "./create-booking/step-payment-summary";
import { LiveReceiptCard } from "./create-booking/live-receipt-card";

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
  const paymentStatus = form.watch("paymentStatus");
  const paymentMethod = form.watch("paymentMethod");

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) handleClose();
        else setOpen(true);
      }}
    >
      <DialogTrigger asChild>
        <Button className="cursor-pointer font-semibold shadow-sm gap-2 h-9 px-4">
          <Plus className="h-4 w-4" />
          <span>Nuova Prenotazione</span>
        </Button>
      </DialogTrigger>

      <DialogContent
        className="w-full sm:max-w-5xl p-0 gap-0 border border-border/70 bg-card shadow-2xl rounded-2xl overflow-hidden flex flex-col h-[88vh] max-h-[840px]"
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
            className="flex flex-col h-full overflow-hidden"
          >
            {/* ── 1. MODAL HEADER & STEPPER ───────────────────────────── */}
            <div className="px-6 pt-5 pb-4 border-b border-border/60 bg-muted/20 shrink-0 space-y-3.5 pr-14">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
                    <GraduationCap className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <DialogTitle className="text-base font-bold leading-tight text-foreground">
                      Nuova Prenotazione in Sede
                    </DialogTitle>
                    <p className="text-xs text-muted-foreground">
                      Desk Checkout & Point of Sale · Atena Scuola
                    </p>
                  </div>
                </div>

                <Badge
                  variant="outline"
                  className="hidden sm:inline-flex text-xs font-semibold px-2.5 py-0.5 bg-background/80"
                >
                  Passo {currentStep} di 3
                </Badge>
              </div>

              {/* Stepper Navigation */}
              <div className="grid grid-cols-3 gap-2 bg-muted/50 p-1 rounded-xl border border-border/60">
                {STEPS.map((s) => {
                  const Icon = s.icon;
                  const isActive = currentStep === s.id;
                  const isCompleted = currentStep > s.id;

                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={async () => {
                        if (s.id === currentStep) return;
                        if (s.id > 1 && currentStep === 1) {
                          const pName =
                            form.getValues("purchaserFirstName") || form.getValues("purchaserName");
                          const pEmail = form.getValues("purchaserEmail");
                          if (!pName || !pEmail) {
                            form.trigger([
                              "purchaserFirstName",
                              "purchaserLastName",
                              "purchaserEmail",
                            ]);
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
                      className={cn(
                        "flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs transition-all cursor-pointer font-semibold",
                        isActive
                          ? "bg-background text-foreground shadow-xs ring-1 ring-border/80 font-bold"
                          : isCompleted
                          ? "text-foreground hover:bg-background/50"
                          : "text-muted-foreground hover:bg-background/30 font-medium"
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      ) : (
                        <Icon
                          className={cn(
                            "w-3.5 h-3.5 shrink-0",
                            isActive ? "text-primary" : "text-muted-foreground"
                          )}
                        />
                      )}
                      <span className="truncate">
                        {s.id}. {s.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── 2. TWO-COLUMN WORKSPACE BODY ────────────────────────── */}
            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 overflow-hidden">
              {/* Left Side: Active Step Form with dedicated clean scrollbar */}
              <div className="lg:col-span-7 h-full overflow-y-auto pr-2 space-y-5">
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

              {/* Right Side: Live Summary Receipt stretching full height */}
              <div className="lg:col-span-5 h-full flex flex-col min-h-0">
                <LiveReceiptCard
                  currentStep={currentStep}
                  selectedCourse={selectedCourse}
                  selectedDateState={selectedDateState}
                  previewLessons={previewLessons}
                  formattedScheduleText={formattedScheduleText}
                  isForChild={isForChild}
                  purchaserName={computedPurchaserName}
                  studentName={computedStudentName}
                  amountPaid={amountPaid}
                  registrationFee={registrationFee}
                  totalAmount={totalAmount}
                  paymentStatus={paymentStatus}
                  paymentMethod={paymentMethod}
                  membershipFeeStatus={membershipFeeStatus}
                />
              </div>
            </div>

            {/* ── 3. MODAL FOOTER ACTIONS ─────────────────────────────── */}
            <div className="px-6 py-3.5 border-t border-border/60 bg-muted/20 flex items-center justify-between shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (currentStep > 1) setCurrentStep((prev) => (prev - 1) as 1 | 2);
                  else handleClose();
                }}
                className="cursor-pointer text-xs font-semibold h-9"
              >
                {currentStep > 1 ? <ChevronLeft className="mr-1 h-3.5 w-3.5" /> : null}
                {currentStep > 1 ? "Indietro" : "Annulla"}
              </Button>

              <div className="flex items-center gap-3">
                {currentStep < 3 ? (
                  <Button
                    type="button"
                    onClick={() => {
                      if (currentStep === 1) {
                        const pName =
                          form.getValues("purchaserFirstName") || form.getValues("purchaserName");
                        const pEmail = form.getValues("purchaserEmail");
                        if (!pName || !pEmail) {
                          form.trigger([
                            "purchaserFirstName",
                            "purchaserLastName",
                            "purchaserEmail",
                          ]);
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
                    className="cursor-pointer text-xs font-bold px-5 h-9 gap-1.5"
                  >
                    <span>Prosegui al Passo Successivo</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={submitting}
                    onClick={() => {
                      setIsFinalSubmitRequested(true);
                    }}
                    className="cursor-pointer font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all text-xs px-6 h-9"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                        Registrazione in corso...
                      </>
                    ) : (
                      "Conferma & Registra Iscrizione"
                    )}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
