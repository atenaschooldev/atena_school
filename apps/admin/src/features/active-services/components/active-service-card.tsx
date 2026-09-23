import { Sparkles, Calendar, User, BookOpen, RefreshCw, CheckCircle2, AlertCircle, Eye } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CellFormattedDate } from "@/components/shared/cell-formatted-date";
import { CellCurrency } from "@/components/shared/cell-currency";
import { useTranslation } from "@/i18n/context";
import type { ActiveServiceItem } from "../types/active-service";

export interface ActiveServiceCardProps {
  item: ActiveServiceItem;
  onSelect: (item: ActiveServiceItem) => void;
}

export function ActiveServiceCard({ item, onSelect }: ActiveServiceCardProps) {
  const { t } = useTranslation();

  const total = item.total_lessons_count || item.scheduled_lessons_count || 0;
  const completed = item.completed_lessons_count || 0;
  const remaining = item.remaining_lessons_count || 0;
  const percentage = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;
  const isSub = item.billing_scheme === 2;

  return (
    <Card className="flex flex-col justify-between hover:border-primary/50 transition-all duration-200 shadow-xs">
      <CardHeader className="p-4 pb-2 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <h3 className="font-semibold text-base leading-tight text-foreground line-clamp-1">
              {item.course_name}
            </h3>
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
              {item.course_category && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                  {item.course_category}
                </Badge>
              )}
              {item.course_format && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                  {item.course_format}
                </Badge>
              )}
            </div>
          </div>
          {isSub ? (
            <Badge variant="default" className="bg-blue-600 text-white text-[10px] px-2 py-0.5 shrink-0">
              <RefreshCw className="h-3 w-3 mr-1 animate-spin-slow" />
              {t("activeServices.subscription") || "Abbonamento"}
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[10px] px-2 py-0.5 shrink-0">
              {t("activeServices.fullPayment") || "Unico"}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-2 space-y-3">
        {/* Student & Parent */}
        <div className="flex items-center gap-2 p-2 rounded-md bg-muted/40 text-xs">
          <User className="h-4 w-4 text-muted-foreground shrink-0" />
          <div className="overflow-hidden">
            <p className="font-medium text-foreground truncate">{item.student_name}</p>
            {item.student_email && (
              <p className="text-muted-foreground truncate text-[11px]">{item.student_email}</p>
            )}
          </div>
        </div>

        {/* Lesson Progress */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {completed} / {total} {t("activeServices.lessons") || "lezioni"}
            </span>
            <span className="font-semibold text-foreground">{percentage}%</span>
          </div>
          <Progress value={percentage} className="h-2" />
        </div>

        {/* Next Lesson & Annual Fee */}
        <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-border/50">
          <div className="space-y-0.5">
            <span className="text-muted-foreground text-[10px] block">
              {t("activeServices.nextLesson") || "Prossima Lezione"}
            </span>
            {item.next_lesson_at ? (
              <div className="flex items-center gap-1 font-medium text-foreground text-[11px]">
                <Calendar className="h-3 w-3 text-primary shrink-0" />
                <CellFormattedDate value={item.next_lesson_at} />
              </div>
            ) : (
              <span className="text-muted-foreground italic text-[11px]">—</span>
            )}
          </div>

          <div className="space-y-0.5">
            <span className="text-muted-foreground text-[10px] block">
              {t("activeServices.annualFee") || "Quota €30"}
            </span>
            {item.student_annual_fee_paid ? (
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 text-[10px] px-1.5 py-0">
                <CheckCircle2 className="h-2.5 w-2.5 mr-1" />
                {t("activeServices.feePaid") || "Regolare"}
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 text-[10px] px-1.5 py-0">
                <AlertCircle className="h-2.5 w-2.5 mr-1" />
                {t("activeServices.feePending") || "Da pagare"}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-1.5 text-xs font-medium"
          onClick={() => onSelect(item)}
        >
          <Eye className="h-3.5 w-3.5" />
          <span>{t("common.viewDetails") || "Visualizza Dettagli"}</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
