"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  GraduationCap,
  Calendar,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  Eye,
  Trash2,
  ChevronDown,
} from "lucide-react";
import { BookingPaymentStatus } from "@atena/api-types";
import { StatusBadge } from "@/components/shared/status-badge";
import { PaymentMethodBadge } from "@/components/shared/payment-method-badge";
import { useTranslation } from "@/i18n/context";
import type { Booking } from "../types/booking";

interface BookingCardProps {
  booking: Booking;
  onSelect: (booking: Booking) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, currentStatus: number | string) => void;
}

export function BookingCard({
  booking,
  onSelect,
  onDelete,
  onToggleStatus,
}: BookingCardProps) {
  const { t, locale } = useTranslation();
  const isCompleted = Number(booking.payment_status) === BookingPaymentStatus.PAID || booking.payment_status === "completed" || booking.payment_status === "paid" || booking.payment_status === "succeeded";
  const isPartiallyPaid = Number(booking.payment_status) === BookingPaymentStatus.PARTIALLY_REFUNDED || booking.payment_status === "partially_paid";
  const isOverdue = Number(booking.payment_status) === BookingPaymentStatus.FAILED || booking.payment_status === "overdue" || booking.payment_status === "scaduto";

  const purchaserName = booking.purchaser_name || t("common.noData");
  const studentName = booking.student_name || purchaserName;
  const isDifferentStudent = studentName !== purchaserName;

  const initials = purchaserName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "U";

  const accentBorder = isCompleted
    ? "border-l-4 border-l-emerald-500"
    : isPartiallyPaid
      ? "border-l-4 border-l-amber-500"
      : isOverdue
        ? "border-l-4 border-l-rose-500"
        : "border-l-4 border-l-sky-500";

  return (
    <Card
      className={`group relative cursor-pointer border bg-card hover:shadow-lg hover:border-primary/50 transition-all duration-200 rounded-xl overflow-hidden flex flex-col justify-between ${accentBorder}`}
      onClick={() => onSelect(booking)}
    >
      {/* Header Section */}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded font-medium">
                #{booking.id.slice(0, 8)}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    className="cursor-pointer transition-all hover:opacity-85 active:scale-95 text-left inline-flex items-center gap-1"
                  >
                    <StatusBadge status={booking.payment_status} />
                    <ChevronDown className="w-3 h-3 text-muted-foreground/70" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-52">
                  <DropdownMenuItem
                    className="cursor-pointer font-medium text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleStatus(booking.id, "completed");
                    }}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mr-2" />
                    {t("common.paid")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer font-medium text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleStatus(booking.id, "partially_paid");
                    }}
                  >
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500 mr-2" />
                    {t("common.partial")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer font-medium text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleStatus(booking.id, "reserved");
                    }}
                  >
                    <AlertCircle className="w-3.5 h-3.5 text-sky-500 mr-2" />
                    {t("common.reserved")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer font-medium text-xs text-rose-600 focus:text-rose-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleStatus(booking.id, "overdue");
                    }}
                  >
                    <AlertCircle className="w-3.5 h-3.5 text-rose-500 mr-2" />
                    {t("common.overdue")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <h3 className="font-bold text-base tracking-tight text-foreground line-clamp-1 group-hover:text-primary transition-colors pt-0.5">
              {booking.course_name}
            </h3>
          </div>

          <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
            <span className="font-bold text-base text-foreground font-mono bg-muted/50 px-2.5 py-1 rounded-lg">
              €{Number(booking.amount_paid || 0).toFixed(2)}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="cursor-pointer" onClick={() => onSelect(booking)}>
                  <Eye className="mr-2 h-4 w-4 text-muted-foreground" />
                  {t("bookings.viewDetails")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() =>
                    onToggleStatus(
                      booking.id,
                      isCompleted ? BookingPaymentStatus.RESERVED : BookingPaymentStatus.PAID,
                    )
                  }
                >
                  {isCompleted ? (
                    <>
                      <AlertCircle className="mr-2 h-4 w-4 text-amber-500" />
                      {t("bookings.markReserved")}
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-500" />
                      {t("bookings.markPaid")}
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  className="cursor-pointer"
                  onClick={() => onDelete(booking.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t("bookings.deleteOrder")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Customer & Student Block */}
        <div className="pt-2 space-y-2 border-t">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 border shrink-0">
              <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-foreground truncate">
                {purchaserName}
              </span>
              <span className="text-[11px] text-muted-foreground truncate">
                {booking.purchaser_email}
              </span>
            </div>
          </div>

          {isDifferentStudent && (
            <div className="flex items-center gap-2 rounded-md bg-muted/50 px-2.5 py-1.5 text-xs text-muted-foreground">
              <GraduationCap className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="truncate">
                {t("common.student")}: <strong className="text-foreground font-medium">{studentName}</strong>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer Bar */}
      <div className="px-4 py-2.5 bg-muted/40 dark:bg-muted/20 border-t flex items-center justify-between text-xs text-muted-foreground">
        <PaymentMethodBadge method={booking.payment_method} />
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 shrink-0" />
          <span>
            {new Date(booking.created_at).toLocaleDateString(locale === "it" ? "it-IT" : "en-US", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>
      </div>
    </Card>
  );
}
