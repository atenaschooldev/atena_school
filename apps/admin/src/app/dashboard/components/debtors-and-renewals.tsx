"use client"

import { useState } from "react"
import { AlertCircle, CreditCard, Mail, Phone, Send, ShieldAlert, CheckCircle, ArrowRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { formatCurrency } from "@atena/utils"
import { useTranslation } from "@/i18n/context"
import { StatusBadge } from "@/components/shared/status-badge"
import { PaymentFormDialog } from "@/features/payments/components/payment-form-dialog"
import { toast } from "sonner"

export function DebtorsAndRenewals() {
  const { t, locale } = useTranslation()
  const [activeTab, setActiveTab] = useState("debtors")
  const [sendingId, setSendingId] = useState<string | null>(null)
  const [paymentBooking, setPaymentBooking] = useState<any | null>(null)
  const queryClient = useQueryClient()

  const { data: debtorsData, isLoading } = useQuery({
    queryKey: ["reports", "debtors"],
    queryFn: () => api.get<any>("/admin/reports/debtors"),
  })

  const debtorsList = Array.isArray(debtorsData?.debtors) ? debtorsData.debtors : []
  const totalOutstanding = debtorsData?.totalOutstandingEstimate ?? 0

  const handleSendReminder = async (bookingId: string) => {
    setSendingId(bookingId)
    try {
      await api.post("/admin/mail/send-payment-reminder", { bookingId })
      toast.success(locale === "en" ? "Reminder sent successfully" : "Sollecito inviato con successo")
    } catch {
      toast.error(locale === "en" ? "Failed to send reminder" : "Errore durante l'invio del sollecito")
    } finally {
      setTimeout(() => setSendingId(null), 800)
    }
  }

  return (
    <>
      <Card className="h-fit border-amber-500/20 bg-gradient-to-br from-amber-500/5 via-card to-card">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-amber-500" />
                {t("dashboard.debtorsTitle")}
              </CardTitle>
              <CardDescription>{t("dashboard.debtorsSubtitle")}</CardDescription>
            </div>
            <Badge variant={totalOutstanding > 0 ? "destructive" : "secondary"} className="text-xs px-2.5 py-1 font-semibold">
              {t("dashboard.totalOutstanding")}: {formatCurrency(totalOutstanding)}
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="debtors" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="w-full max-w-xs">
              <TabsTrigger value="debtors" className="w-full">
                <AlertCircle className="w-4 h-4 mr-2 text-rose-500" />
                {t("dashboard.debtorsTab")} ({debtorsList.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="debtors" className="space-y-3">
              {isLoading ? (
                <div className="p-8 text-center text-sm text-muted-foreground">{t("common.loading")}</div>
              ) : debtorsList.length === 0 ? (
                <div className="p-8 border border-dashed rounded-xl text-center space-y-2 bg-card/40">
                  <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto" />
                  <p className="font-semibold text-sm">{t("common.noData")}</p>
                  <p className="text-xs text-muted-foreground">{t("bookings.subtitle")}</p>
                </div>
              ) : (
                debtorsList.map((d: any) => (
                  <div key={d.bookingId} className="p-3.5 rounded-xl border bg-card/70 backdrop-blur-xs flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-amber-500/40 transition-all">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm">{d.purchaserName || t("common.purchaser")}</span>
                        <StatusBadge status={d.paymentStatus} />
                      </div>
                      <p className="text-xs text-muted-foreground font-medium">{d.courseName || t("common.course")}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground pt-0.5 flex-wrap">
                        {d.purchaserEmail && <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-muted-foreground/80" /> {d.purchaserEmail}</span>}
                        {d.purchaserPhone && <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-muted-foreground/80" /> {d.purchaserPhone}</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end md:self-center flex-wrap">
                      <div className="text-right">
                        <p className="text-[11px] text-muted-foreground uppercase font-medium">{t("common.amount")}</p>
                        <p className="text-base font-bold text-rose-600 dark:text-rose-400">
                          {formatCurrency(d.outstandingEstimate ?? 0)}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs cursor-pointer h-8"
                          disabled={sendingId === d.bookingId}
                          onClick={() => handleSendReminder(d.bookingId)}
                        >
                          <Send className="w-3.5 h-3.5 mr-1 text-primary" />
                          {sendingId === d.bookingId ? t("common.saving") : t("dashboard.sendReminder")}
                        </Button>

                        <Button
                          size="sm"
                          className="text-xs cursor-pointer h-8 bg-emerald-600 hover:bg-emerald-700 text-white"
                          onClick={() => setPaymentBooking(d)}
                        >
                          <CreditCard className="w-3.5 h-3.5 mr-1" />
                          {locale === "en" ? "Settle" : "Saldare"}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Direct Payment Dialog */}
      {paymentBooking && (
        <PaymentFormDialog
          open={!!paymentBooking}
          onOpenChange={(open) => {
            if (!open) {
              setPaymentBooking(null)
              queryClient.invalidateQueries({ queryKey: ["reports"] })
            }
          }}
          initialData={{
            bookingId: paymentBooking.bookingId,
            amount: paymentBooking.outstandingEstimate || 30,
            type: 1, // Course payment
            paymentMethod: 1, // POS/Card
            status: 2, // Succeeded
          } as any}
        />
      )}
    </>
  )
}
