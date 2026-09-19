import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { Plus, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePayments } from "../hooks/use-payments";
import { PaymentsMetrics } from "./payments-metrics";
import { getPaymentsTableColumns } from "./payments-table-columns";
import { DataViewToolbar } from "@/components/shared/data-view-toolbar";
import { UniversalPosCheckoutModal } from "./universal-pos-checkout-modal";
import { PaymentFormDialog } from "./payment-form-dialog";
import { PaymentDetailDialog } from "./payment-detail-dialog";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { TableSkeletonRows } from "@/components/ui/table-skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  type SortingState,
  flexRender,
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
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="flex flex-col gap-4">
      <PaymentsMetrics summary={summary} />

      <div className="@container/main px-4 lg:px-6 space-y-4">
        <DataViewToolbar
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          searchPlaceholder={t("common.search")}
          filters={[
            {
              value: methodFilter,
              onChange: setMethodFilter,
              placeholder: t("payments.filterMethod"),
              options: [
                { value: "all", label: t("common.all") },
                { value: String(PaymentMethod.CASH), label: t("common.cash") },
                { value: String(PaymentMethod.POS), label: t("common.card") },
                { value: String(PaymentMethod.STRIPE), label: "Stripe Online" },
                { value: String(PaymentMethod.BANK_TRANSFER), label: t("common.transfer") },
              ],
            },
            {
              value: statusFilter,
              onChange: setStatusFilter,
              placeholder: t("common.status"),
              options: [
                { value: "all", label: t("common.all") },
                { value: String(PaymentRecordStatus.SUCCEEDED), label: t("common.paid") },
                { value: String(PaymentRecordStatus.PENDING), label: t("common.pending") },
                { value: String(PaymentRecordStatus.FAILED), label: t("common.failed") },
                { value: String(PaymentRecordStatus.REFUNDED), label: t("common.refunded") },
              ],
            },
          ]}
          actionElement={
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPosCheckoutOpen(true)}
                className="cursor-pointer font-medium text-xs border-primary/30 text-primary hover:bg-primary/5"
              >
                <Plus className="mr-1.5 h-4 w-4" /> {t("payments.recordPayment")}
              </Button>
            </div>
          }
        />

        <div className="space-y-4">
          <div className="rounded-md border bg-card">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableSkeletonRows columnsCount={columns.length} rowCount={6} />
                ) : table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} className="hover:bg-muted/50 transition-all duration-200">
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                      {t("payments.noPaymentsFound")}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <DataTablePagination table={table} />
        </div>
      </div>

      <UniversalPosCheckoutModal open={posCheckoutOpen} onOpenChange={setPosCheckoutOpen} />

      <PaymentFormDialog
        open={createDialogOpen || !!editingPayment}
        onOpenChange={(v) => {
          if (!v) {
            setCreateDialogOpen(false);
            setEditingPayment(null);
          }
        }}
        initialValues={editingPayment || undefined}
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
        onOpenChange={(v) => !v && setSelectedPaymentDetail(null)}
      />

      <DeleteConfirmDialog
        open={!!deletingPaymentId}
        onOpenChange={(v) => !v && setDeletingPaymentId(null)}
        title={t("payments.deletePaymentTitle")}
        description={t("payments.deletePaymentDesc")}
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
