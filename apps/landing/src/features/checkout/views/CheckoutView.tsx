"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { it as dateLocale } from "date-fns/locale";
import { toast } from "sonner";
import { useCheckout } from "@/features/checkout/hooks/useCheckout";
import { useMounted } from "@/hooks/useMounted";
import { ANNUAL_REGISTRATION_FEE_EUR, FeeCheckStatus, SubmitAction } from "@/constants";
import {
  CheckoutHeader,
  CheckoutMobileSummary,
  CheckoutPurchaserFields,
  CheckoutStudentsList,
  CheckoutRegistrationFeeSelector,
  CheckoutPaymentModeSelector,
  CheckoutBillingSchemeSelector,
  CheckoutNotesAndGdpr,
  CheckoutOrderSummary,
  CheckoutMobileBottomBar,
  CheckoutAuthModal,
} from "@/features/checkout/components";
import { BillingScheme } from "@atena/api-types";

interface CheckoutViewProps {
  id: string;
}

export function CheckoutView({ id }: CheckoutViewProps) {
  const {
    formMethods,
    item,
    loading,
    stripeEnabled,
    subscriptionsEnabled,
    billingScheme,
    setBillingScheme,
    submitting,
    registrationFeeAmount,
    academicYear,
    feeCheckStatus,
    studentsList,
    studentFeeStatuses,
    addStudent,
    removeStudent,
    updateStudent,
    appliedPromo,
    promoCodeInput,
    setPromoCodeInput,
    applyingPromo,
    applyPromoCode,
    removePromoCode,
    user,
    savedProfileSource,
    availableSavedStudents,
    loadProfileFromAccount,
    clearSavedProfile,
    selectSavedStudent,
    dateParam,
    timeParam,
    actionRef,
    onSubmit,
  } = useCheckout(id);

  const [authModalOpen, setAuthModalOpen] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = formMethods;
  const isForChild = watch("isForChild");
  const includeRegistrationFee = watch("includeRegistrationFee");
  const mounted = useMounted();
  const [selectedPaymentMode, setSelectedPaymentMode] = useState<SubmitAction>(
    stripeEnabled ? SubmitAction.PAY : SubmitAction.BOOK
  );
  const [prevStripeEnabled, setPrevStripeEnabled] = useState(stripeEnabled);

  if (prevStripeEnabled !== stripeEnabled) {
    setPrevStripeEnabled(stripeEnabled);
    setSelectedPaymentMode(stripeEnabled ? SubmitAction.PAY : SubmitAction.BOOK);
    setValue("includeRegistrationFee", stripeEnabled);
  }

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#043569]" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Caricamento informazioni...</p>
        </div>
      </div>
    );
  }

  const isSubscription = subscriptionsEnabled && billingScheme === BillingScheme.SUBSCRIPTION;
  const coursePrice = isSubscription
    ? (item?.subscription_price != null ? Number(item.subscription_price) : (Number(item?.price) || 73.20))
    : Number(item?.price || 0);

  const studentCount = isForChild ? Math.max(1, studentsList.length) : 1;
  const totalCoursePrice = coursePrice * studentCount;

  // Calculate unpaid fees count
  const unpaidFeesCount = isForChild
    ? studentsList.reduce((acc, _, idx) => acc + (studentFeeStatuses[idx] === FeeCheckStatus.NOT_PAID ? 1 : 0), 0)
    : (feeCheckStatus === FeeCheckStatus.NOT_PAID ? 1 : 0);

  const hasAnyFeeDue = unpaidFeesCount > 0;
  const isAnyFeeChecking = isForChild
    ? Object.values(studentFeeStatuses).some((status) => status === FeeCheckStatus.CHECKING)
    : feeCheckStatus === FeeCheckStatus.CHECKING;

  const totalRegistrationFees = (hasAnyFeeDue && includeRegistrationFee !== false && !appliedPromo?.waiveRegistrationFee)
    ? unpaidFeesCount * (registrationFeeAmount ?? ANNUAL_REGISTRATION_FEE_EUR)
    : 0;

  const discountAmount = appliedPromo?.discountAmount ? Number(appliedPromo.discountAmount) : 0;
  const totalPrice = Math.max(0, totalCoursePrice + totalRegistrationFees - discountAmount);
  const title = item?.title_it || item?.name || "Corso Atena School";

  const formatCategoryName = (cat?: string): string => {
    if (!cat) return "";
    const lower = String(cat).toLowerCase();
    if (lower === "languages" || lower === "language") return "Corsi di Lingua";
    if (lower === "academic" || lower === "recupero") return "Recupero Scolastico";
    if (lower === "certipass" || lower === "eipass") return "Certificazioni EIPASS";
    return String(cat);
  };

  const formattedDateString = (dStr?: string | null) => {
    if (!dStr) return null;
    try {
      return format(new Date(dStr), "d MMMM yyyy", { locale: dateLocale });
    } catch (e) {
      return dStr;
    }
  };

  const handleInvalid = (validationErrors: any) => {
    console.warn("Validation errors on submit:", validationErrors);
    toast.error("Please fill in all required fields marked with *");
  };

  return (
    <main className="bg-slate-100 min-h-screen pt-20 sm:pt-24 pb-28 lg:pb-8 font-sans flex flex-col justify-center">
      <div className="max-w-6xl mx-auto w-full px-3 sm:px-6 lg:px-8 py-3 sm:py-4">

        {/* Back Link and Header Title */}
        <CheckoutHeader courseSlugOrId={item?.slug || id} />

        {/* Mobile Top Course Summary Card (Visible ONLY on mobile lg:hidden) */}
        <CheckoutMobileSummary
          item={item}
          title={title}
          coursePrice={coursePrice}
          dateParam={dateParam}
          timeParam={timeParam}
          formattedDateString={formattedDateString}
          formatCategoryName={formatCategoryName}
          mounted={mounted}
          appliedPromo={appliedPromo}
          promoCodeInput={promoCodeInput}
          setPromoCodeInput={setPromoCodeInput}
          applyingPromo={applyingPromo}
          applyPromoCode={applyPromoCode}
          removePromoCode={removePromoCode}
          discountAmount={discountAmount}
        />

        {/* Main Form Grid */}
        <form
          id="checkout-form"
          onSubmit={handleSubmit(onSubmit, handleInvalid)}
          className="grid grid-cols-1 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px] gap-5 items-start"
        >
          {/* LEFT FORM CARD */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 space-y-4">
            <CheckoutPurchaserFields
              register={register}
              watch={watch}
              errors={errors}
              user={user}
              courseId={id}
              dateParam={dateParam}
              timeParam={timeParam}
              feeCheckStatus={feeCheckStatus}
              savedProfileSource={savedProfileSource}
              onClearSavedProfile={clearSavedProfile}
              onOpenAuthModal={() => setAuthModalOpen(true)}
            />

            {isForChild && (
              <CheckoutStudentsList
                studentsList={studentsList}
                studentFeeStatuses={studentFeeStatuses}
                errors={errors}
                coursePrice={coursePrice}
                addStudent={addStudent}
                removeStudent={removeStudent}
                updateStudent={updateStudent}
                availableSavedStudents={availableSavedStudents}
                onSelectSavedStudent={selectSavedStudent}
              />
            )}

            <CheckoutBillingSchemeSelector
              subscriptionsEnabled={subscriptionsEnabled}
              item={item}
              billingScheme={billingScheme}
              setBillingScheme={setBillingScheme}
            />

            <CheckoutRegistrationFeeSelector
              stripeEnabled={stripeEnabled}
              hasAnyFeeDue={hasAnyFeeDue}
              unpaidFeesCount={unpaidFeesCount}
              includeRegistrationFee={includeRegistrationFee}
              setValue={setValue}
              registrationFeeAmount={registrationFeeAmount}
              academicYear={academicYear}
            />

            <CheckoutPaymentModeSelector
              stripeEnabled={stripeEnabled}
              selectedPaymentMode={selectedPaymentMode}
              setSelectedPaymentMode={setSelectedPaymentMode}
            />

            <CheckoutNotesAndGdpr
              register={register}
              errors={errors}
              title={title}
            />
          </div>

          {/* RIGHT ORDER SUMMARY CARD */}
          <CheckoutOrderSummary
            item={item}
            title={title}
            coursePrice={coursePrice}
            studentCount={studentCount}
            totalCoursePrice={totalCoursePrice}
            hasAnyFeeDue={hasAnyFeeDue}
            includeRegistrationFee={includeRegistrationFee}
            unpaidFeesCount={unpaidFeesCount}
            totalRegistrationFees={totalRegistrationFees}
            totalPrice={totalPrice}
            dateParam={dateParam}
            timeParam={timeParam}
            formattedDateString={formattedDateString}
            formatCategoryName={formatCategoryName}
            mounted={mounted}
            selectedPaymentMode={selectedPaymentMode}
            actionRef={actionRef}
            submitting={submitting}
            isAnyFeeChecking={isAnyFeeChecking}
            stripeEnabled={stripeEnabled}
            isSubscription={isSubscription}
            registrationFeeAmount={registrationFeeAmount}
            appliedPromo={appliedPromo}
            promoCodeInput={promoCodeInput}
            setPromoCodeInput={setPromoCodeInput}
            applyingPromo={applyingPromo}
            applyPromoCode={applyPromoCode}
            removePromoCode={removePromoCode}
            discountAmount={discountAmount}
          />

          <CheckoutMobileBottomBar
            totalPrice={totalPrice}
            selectedPaymentMode={selectedPaymentMode}
            actionRef={actionRef}
            submitting={submitting}
            isAnyFeeChecking={isAnyFeeChecking}
          />
        </form>

      </div>

      <CheckoutAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={loadProfileFromAccount}
        courseId={id}
      />
    </main>
  );
}

export default CheckoutView;

