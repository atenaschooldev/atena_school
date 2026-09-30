import { useState } from "react"
import { Plus, CreditCard, Calendar, BookOpen, Users, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { useTranslation } from "@/i18n/context"
import { CreateBookingDialog } from "@/features/bookings/components/create-booking-dialog"
import { PaymentFormDialog } from "@/features/payments/components/payment-form-dialog"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export function QuickActions() {
  const { t, locale } = useTranslation()
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const queryClient = useQueryClient()

  const handleRefreshAll = async () => {
    setIsRefreshing(true)
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["reports"] }),
        queryClient.invalidateQueries({ queryKey: ["schedules"] }),
        queryClient.invalidateQueries({ queryKey: ["bookings"] }),
        queryClient.invalidateQueries({ queryKey: ["payments"] }),
        queryClient.invalidateQueries({ queryKey: ["students"] }),
      ])
      toast.success(locale === "en" ? "Dashboard data updated" : "Dati del cruscotto aggiornati")
    } catch {
      // ignore
    } finally {
      setTimeout(() => setIsRefreshing(false), 500)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* 1. New POS Registration Dialog */}
      <CreateBookingDialog />

      {/* 2. Register Payment Dialog */}
      <Button
        variant="outline"
        onClick={() => setIsPaymentOpen(true)}
        className="cursor-pointer gap-1.5 h-9 text-xs font-semibold bg-background hover:bg-muted/60"
      >
        <CreditCard className="h-4 w-4 text-emerald-500" />
        <span>{locale === "en" ? "Record Payment" : "Registra Pagamento"}</span>
      </Button>

      {/* 3. Quick Navigation to Attendance */}
      <Button asChild variant="outline" className="cursor-pointer gap-1.5 h-9 text-xs font-semibold">
        <Link to="/presenze">
          <Calendar className="h-4 w-4 text-primary" />
          <span>{locale === "en" ? "Attendance" : "Appello Presenze"}</span>
        </Link>
      </Button>

      {/* 4. Quick Refresh Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleRefreshAll}
        disabled={isRefreshing}
        className="h-9 w-9 text-muted-foreground hover:text-foreground cursor-pointer"
        title={locale === "en" ? "Refresh dashboard" : "Aggiorna dati"}
      >
        <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin text-primary" : ""}`} />
      </Button>

      {/* Payment Form Dialog modal */}
      <PaymentFormDialog
        open={isPaymentOpen}
        onOpenChange={setIsPaymentOpen}
      />
    </div>
  )
}
