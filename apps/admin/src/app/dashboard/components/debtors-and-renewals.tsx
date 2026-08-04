"use client"

import { useState } from "react"
import { AlertCircle, CreditCard, Mail, Phone, RefreshCw, Send, ShieldAlert, CheckCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { formatCurrency } from "@atena/utils"

export function DebtorsAndRenewals() {
  const [activeTab, setActiveTab] = useState("debtors")
  const [sendingId, setSendingId] = useState<string | null>(null)

  const { data: debtorsData, isLoading } = useQuery({
    queryKey: ["reports", "debtors"],
    queryFn: () => api.get<any>("/admin/reports/debtors"),
  })

  const debtorsList = Array.isArray(debtorsData?.debtors) ? debtorsData.debtors : []
  const totalOutstanding = debtorsData?.totalOutstandingEstimate ?? 0

  const handleSendReminder = async (bookingId: string) => {
    setSendingId(bookingId)
    try {
      await api.post("/mail/send-payment-reminder", { bookingId })
    } catch {
      // Non-blocking
    } finally {
      setTimeout(() => setSendingId(null), 1000)
    }
  }

  return (
    <Card className="h-fit border-amber-500/20 bg-gradient-to-br from-amber-500/5 via-card to-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-amber-500" />
              Оперативный реестр задолженностей
            </CardTitle>
            <CardDescription>Студенты и задолженности по оплате курсов</CardDescription>
          </div>
          <Badge variant={totalOutstanding > 0 ? "destructive" : "secondary"} className="text-xs px-2.5 py-1">
            Задолженность: {formatCurrency(totalOutstanding)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="debtors" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="w-full max-w-xs">
            <TabsTrigger value="debtors" className="w-full">
              <AlertCircle className="w-4 h-4 mr-2 text-rose-500" />
              Должники ({debtorsList.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="debtors" className="space-y-3">
            {isLoading ? (
              <div className="p-8 text-center text-sm text-muted-foreground">Загрузка данных по задолженностям...</div>
            ) : debtorsList.length === 0 ? (
              <div className="p-8 border border-dashed rounded-xl text-center space-y-2 bg-card/40">
                <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="font-semibold text-sm">Нет активных задолженностей</p>
                <p className="text-xs text-muted-foreground">Все текущие бронирования и курсы полностью оплачены.</p>
              </div>
            ) : (
              debtorsList.map((d: any) => (
                <div key={d.bookingId} className="p-3.5 rounded-xl border bg-card/60 backdrop-blur-xs flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-amber-500/30 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{d.purchaserName || "Покупатель"}</span>
                      <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
                        {d.paymentStatus}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{d.courseName || "Курс"}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
                      {d.purchaserEmail && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {d.purchaserEmail}</span>}
                      {d.purchaserPhone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {d.purchaserPhone}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end md:self-center">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Остаток</p>
                      <p className="text-base font-bold text-rose-600 dark:text-rose-400">
                        {formatCurrency(d.outstandingEstimate ?? 0)}
                      </p>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      disabled={sendingId === d.bookingId}
                      onClick={() => handleSendReminder(d.bookingId)}
                    >
                      <Send className="w-3.5 h-3.5 mr-1 text-primary" />
                      {sendingId === d.bookingId ? "Отправка..." : "Напомнить"}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
