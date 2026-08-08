"use client";

import { useState, useMemo } from "react";
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

export function PaymentsView() {
  const { payments, summary, loading, createPayment, updatePayment, deletePayment } = usePayments();

  const [searchQuery, setSearchQuery] = useState("");
  const [methodFilter, setMethodFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const [posCheckoutOpen, setPosCheckoutOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [selectedPaymentDetail, setSelectedPaymentDetail] = useState<Payment | null>(null);
  const [deletingPaymentId, setDeletingPaymentId] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "created_at", desc: true },
  ]);

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const matchName = (p.purchaser_name || p.student_name || "").toLowerCase().includes(q);
        const matchEmail = (p.purchaser_email || p.student_email || "").toLowerCase().includes(q);
        const matchDesc = (p.description || "").toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchDesc) return false;
      }
      if (methodFilter !== "all" && p.payment_method !== methodFilter) return false;
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (typeFilter !== "all" && p.type !== typeFilter) return false;
      return true;
    });
  }, [payments, searchQuery, methodFilter, statusFilter, typeFilter]);

  const columns = useMemo(
    () =>
      getPaymentsTableColumns({
        onViewDetail: (p) => setSelectedPaymentDetail(p),
        onEdit: (p) => setEditingPayment(p),
        onDelete: (id) => setDeletingPaymentId(id),
      }),
    []
  );

  const table = useReactTable({
    data: filteredPayments,
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
          onSearchChange={setSearchQuery}
          searchPlaceholder="Cerca per cliente, email o descrizione..."
          filters={[
            {
              value: methodFilter,
              onChange: setMethodFilter,
              placeholder: "Metodo Pagamento",
              options: [
                { value: "all", label: "Tutti i metodi" },
                { value: "cash", label: "Contanti" },
                { value: "pos", label: "Carta / POS" },
                { value: "stripe", label: "Stripe Online" },
                { value: "bank_transfer", label: "Bonifico" },
              ],
            },
            {
              value: statusFilter,
              onChange: setStatusFilter,
              placeholder: "Stato Incasso",
              options: [
                { value: "all", label: "Tutti gli stati" },
                { value: "completed", label: "Completato" },
                { value: "pending", label: "In attesa" },
              ],
            },
          ]}
          actionElement={
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setPosCheckoutOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer shadow-sm text-xs"
              >
                <Receipt className="mr-1.5 h-4 w-4" /> Registra POS / Contanti
              </Button>
              <Button
                variant="outline"
                onClick={() => setCreateDialogOpen(true)}
                className="cursor-pointer text-xs font-semibold"
              >
                <Plus className="mr-1.5 h-4 w-4" /> Nuovo Incasso Manuale
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
                      Nessun incasso trovato.
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
        title="Elimina Pagamento"
        description="Sei sicuro di voler eliminare questo incasso? L'operazione non può essere annullata."
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
