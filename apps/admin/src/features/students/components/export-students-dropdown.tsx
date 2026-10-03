"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileSpreadsheet, FileText, FileJson, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import {
  exportStudentsToCsv,
  exportStudentsToExcel,
  exportStudentsToJson,
} from "../utils/export-students";
import type { Student } from "../types";
import { useTranslation } from "@/i18n/context";

interface ExportStudentsDropdownProps {
  students: Student[];
  filteredStudents: Student[];
}

export function ExportStudentsDropdown({
  students,
  filteredStudents,
}: ExportStudentsDropdownProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const isFiltered = filteredStudents.length !== students.length;

  const handleExport = (
    type: "csv" | "excel" | "json",
    useFiltered: boolean
  ) => {
    const targetData = useFiltered ? filteredStudents : students;
    if (!targetData || targetData.length === 0) {
      toast.error("Nessun dato da esportare");
      return;
    }

    try {
      if (type === "csv") {
        exportStudentsToCsv(targetData);
        toast.success(`Esportati ${targetData.length} studenti in formato CSV`);
      } else if (type === "excel") {
        exportStudentsToExcel(targetData);
        toast.success(`Esportati ${targetData.length} studenti in formato Excel (.xls)`);
      } else if (type === "json") {
        exportStudentsToJson(targetData);
        toast.success(`Esportati ${targetData.length} studenti in formato JSON`);
      }
    } catch (err: any) {
      toast.error("Errore durante l'esportazione: " + (err?.message || "Errore sconosciuto"));
    } finally {
      setIsOpen(false);
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-xs font-medium cursor-pointer rounded-lg border-border/60 hover:bg-muted/80"
        >
          <Download className="w-3.5 h-3.5 text-muted-foreground" />
          <span>{t("students.export")}</span>
          <ChevronDown className="w-3 h-3 text-muted-foreground opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
          {t("students.export")} ({students.length} {t("students.studentName").toLowerCase()})
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* All Students Section */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-[11px] font-normal text-muted-foreground/80 py-0.5 px-2">
            {t("students.exportAll")} ({students.length})
          </DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => handleExport("excel", false)}
            className="cursor-pointer gap-2 text-xs py-1.5"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>{t("students.exportExcel")}</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleExport("csv", false)}
            className="cursor-pointer gap-2 text-xs py-1.5"
          >
            <FileText className="w-4 h-4 text-blue-600" />
            <span>{t("students.exportCsv")}</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleExport("json", false)}
            className="cursor-pointer gap-2 text-xs py-1.5"
          >
            <FileJson className="w-4 h-4 text-amber-600" />
            <span>{t("students.exportJson")}</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        {/* Filtered Students Section (if filters are active) */}
        {isFiltered && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-[11px] font-normal text-muted-foreground/80 py-0.5 px-2">
                {t("students.exportFiltered")} ({filteredStudents.length})
              </DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => handleExport("excel", true)}
                className="cursor-pointer gap-2 text-xs py-1.5"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>{t("students.exportExcel")} (filtrati)</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleExport("csv", true)}
                className="cursor-pointer gap-2 text-xs py-1.5"
              >
                <FileText className="w-4 h-4 text-blue-600" />
                <span>{t("students.exportCsv")} (filtrati)</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleExport("json", true)}
                className="cursor-pointer gap-2 text-xs py-1.5"
              >
                <FileJson className="w-4 h-4 text-amber-600" />
                <span>{t("students.exportJson")} (filtrati)</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
