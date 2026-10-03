"use client";

import { useState, useMemo } from "react";
import { useStudents } from "../hooks/use-students";
import { StudentsMetrics } from "./students-metrics";
import { getStudentsTableColumns } from "./students-table-columns";
import { CreateStudentDialog } from "./create-student-dialog";
import { StudentDetailDialog } from "./student-detail-dialog";
import { ExportStudentsDropdown } from "./export-students-dropdown";
import { Button } from "@/components/ui/button";
import { Plus, UserCheck, RefreshCw } from "lucide-react";
import {
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { AtenaDataTable } from "@/components/shared/data-table/atena-data-table";
import { DataTableToolbar } from "@/components/shared/data-table/data-table-toolbar";
import { useTranslation } from "@/i18n/context";
import type { Student } from "../types";

export function StudentsView() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [feeFilter, setFeeFilter] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const {
    students,
    isLoading,
    refetch,
    createStudent,
    updateStudent,
    deleteStudent,
  } = useStudents();

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const matchName = (s.full_name || "").toLowerCase().includes(q);
        const matchEmail = (s.email || "").toLowerCase().includes(q);
        const matchTax = (s.tax_code || "").toLowerCase().includes(q);
        const matchPhone = (s.phone || "").toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchTax && !matchPhone) return false;
      }
      if (feeFilter === "paid" && !s.annual_fee_paid) return false;
      if (feeFilter === "pending" && s.annual_fee_paid) return false;
      return true;
    });
  }, [students, searchQuery, feeFilter]);

  const handleViewDetails = (student: Student) => {
    setSelectedStudent(student);
    setIsDetailOpen(true);
  };

  const columns = useMemo(
    () =>
      getStudentsTableColumns({
        onViewDetails: handleViewDetails,
        onDeleteStudent: deleteStudent,
        t,
      }),
    [deleteStudent, t]
  );

  const table = useReactTable({
    data: filteredStudents,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const feeOptions = [
    { label: t("common.all"), value: "all" },
    { label: t("students.feePaidBadge"), value: "paid" },
    { label: t("students.feePendingBadge"), value: "pending" },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="px-4 lg:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-primary" />
            {t("students.title")}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t("students.subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="h-8 gap-1.5 text-xs cursor-pointer rounded-lg border-border/60 hover:bg-muted/80"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            {t("common.refresh")}
          </Button>
          <ExportStudentsDropdown
            students={students}
            filteredStudents={filteredStudents}
          />
          <Button
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="h-8 gap-1.5 text-xs shadow-xs cursor-pointer rounded-lg font-medium"
          >
            <Plus className="w-4 h-4" />
            {t("students.newStudent")}
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="@container/main px-4 lg:px-6">
        <StudentsMetrics students={students} />
      </div>

      {/* Main Container */}
      <div className="@container/main px-4 lg:px-6 space-y-4">
        <DataTableToolbar
          table={table}
          searchKey="full_name"
          searchPlaceholder={t("students.searchPlaceholder")}
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          filterKey="annual_fee_paid"
          filterTitle={t("students.annualFee")}
          filterValue={feeFilter}
          onFilterChange={setFeeFilter}
          filterOptions={feeOptions}
          actionButton={
            <Button
              size="sm"
              onClick={() => setIsCreateOpen(true)}
              className="h-8 text-xs font-semibold gap-1.5 cursor-pointer rounded-lg"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">{t("students.newStudent")}</span>
            </Button>
          }
        />

        <AtenaDataTable
          table={table}
          columns={columns}
          loading={isLoading}
          emptyMessage={t("students.noStudentsFound")}
        />
      </div>

      {/* Create Dialog */}
      <CreateStudentDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={createStudent}
      />

      {/* Detail / Edit Dialog */}
      <StudentDetailDialog
        student={selectedStudent}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        onUpdate={async (id, values) => {
          const updated = await updateStudent({ id, values });
          setSelectedStudent(updated);
        }}
      />
    </div>
  );
}
