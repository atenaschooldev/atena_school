"use client";

import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePayments } from "../hooks/use-payments";
import { PaymentsMetrics } from "./payments-metrics";
import { getPaymentsTableColumns } from "./payments-table-columns";
import { UniversalPosCheckoutModal } from "./universal-pos-checkout-modal";
import { PaymentFormDialog } from "./payment-form-dialog";
import { PaymentDetailDialog } from "./payment-detail-dialog";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
import { AtenaDataTable } from "@/components/shared/data-table/atena-data-table";
import { DataTableToolbar } from "@/components/shared/data-table/data-table-toolbar";
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
import type { Payment } from "../types";
import {
  PaymentMethod,
  PaymentRecordStatus,
} from "@atena/api-types";
import { useTranslation } from "@/i18n/context";

export function PaymentsView() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [methodFilter, setMethodFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = useCallback((q: string) => {
    setSearchQuery(q);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => setDebouncedSearch(q), 300);
  }, []);

  useEffect(() => () => { if (debounceTimer.current) clearTimeout(debounceTimer.current); }, []);

  const { payments, summary, loading, createPayment, updatePayment, deletePayment } = usePayments({
    search: debouncedSearch,
    method: methodFilter,
    status: statusFilter,
    type: typeFilter,
  });

  const [posCheckoutOpen, setPosCheckoutOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [selectedPaymentDetail, setSelectedPaymentDetail] = useState<Payment | null>(null);
  const [deletingPaymentId, setDeletingPaymentId] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "created_at", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const columns = useMemo(
    () =>
      getPaymentsTableColumns({
        onViewDetail: (p) => setSelectedPaymentDetail(p),
        onEdit: (p) => setEditingPayment(p),
        onDelete: (id) => setDeletingPaymentId(id),
        onStatusChange: async (id, status) => {
          await updatePayment({ id, status });
        },
        t,
      }),
    [updatePayment, t]
  );

  const table = useReactTable({
    data: payments,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const methodOptions = [
    { value: "all", label: t("common.all") },
    { value: String(PaymentMethod.CASH), label: t("common.cash") },
    { value: String(PaymentMethod.POS), label: t("common.card") },
    { value: String(PaymentMethod.STRIPE), label: "Stripe Online" },
    { value: String(PaymentMethod.BANK_TRANSFER), label: t("common.transfer") },
  ];

  const statusOptions = [
    { value: "all", label: t("common.all") },
    { value: String(PaymentRecordStatus.SUCCEEDED), label: t("common.paid") },
    { value: String(PaymentRecordStatus.PENDING), label: t("common.pending") },
    { value: String(PaymentRecordStatus.FAILED), label: t("common.failed") },
    { value: String(PaymentRecordStatus.REFUNDED), label: t("common.refunded") },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PaymentsMetrics summary={summary} />

      <div className="@container/main px-4 lg:px-6 space-y-4">
        <DataTableToolbar
          table={table}
          searchKey="purchaser_name"
          searchPlaceholder={t("common.search")}
          searchValue={searchQuery}
          onSearchChange={handleSearchChange}
          filterKey="status"
          filterTitle={t("common.status")}
          filterValue={statusFilter}
          onFilterChange={setStatusFilter}
          filterOptions={statusOptions}
          actionButton={
            <Button
              size="sm"
              onClick={() => setPosCheckoutOpen(true)}
              className="h-8 text-xs font-semibold gap-1.5 cursor-pointer rounded-lg shadow-xs"
            >
              <Plus className="h-4 w-4" />
              <span>{t("payments.recordPayment")}</span>
            </Button>
          }
        />

        <AtenaDataTable
          table={table}
          columns={columns}
          loading={loading}
          emptyMessage={t("payments.emptyState.title") || t("common.search")}
        />
      </div>

      <UniversalPosCheckoutModal
        open={posCheckoutOpen}
        onOpenChange={setPosCheckoutOpen}
        onSuccess={() => {}}
      />

      <PaymentFormDialog
        open={createDialogOpen || !!editingPayment}
        onOpenChange={(open) => {
          if (!open) {
            setCreateDialogOpen(false);
            setEditingPayment(null);
          }
        }}
        initialData={editingPayment}
        onSubmit={async (values) => {
          if (editingPayment) {
            await updatePayment({ id: editingPayment.id, ...values });
          } else {
            await createPayment(values);
          }
          setCreateDialogOpen(false);
          setEditingPayment(null);
        }}
      />

      <PaymentDetailDialog
        payment={selectedPaymentDetail}
        open={!!selectedPaymentDetail}
        onOpenChange={(open) => !open && setSelectedPaymentDetail(null)}
      />

      <DeleteConfirmDialog
        open={!!deletingPaymentId}
        onOpenChange={(open) => !open && setDeletingPaymentId(null)}
        onConfirm={async () => {
          if (deletingPaymentId) {
            await deletePayment(deletingPaymentId);
            setDeletingPaymentId(null);
          }
        }}
      />
    </div>
  );
}
