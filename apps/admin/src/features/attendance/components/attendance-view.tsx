"use client";

import { useState, useMemo } from "react";
import { useAttendance } from "../hooks/use-attendance";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { CreateAttendanceDialog } from "./create-attendance-dialog";
import { AttendanceDetailDialog } from "./attendance-detail-dialog";
import { QuickLessonPaymentDialog } from "./quick-lesson-payment-dialog";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Calendar as CalendarIcon,
  Search,
  ChevronLeft,
  ChevronRight,
  Banknote,
  CreditCard,
  Building2,
  GraduationCap,
  Award,
  BookOpen,
  List,
  LayoutGrid,
  MoreVertical,
  Check,
  ChevronDown,
  UserCheck,
  Eye,
  Trash2,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TableSkeletonRows } from "@/components/ui/table-skeleton";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { LessonAttendanceItem } from "../types";

export function AttendanceView() {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [detailBooking, setDetailBooking] = useState<{
    id: string;
    studentName: string;
    courseName: string;
  } | null>(null);
  const [deletingLessonId, setDeletingLessonId] = useState<string | null>(null);
  const [quickPayItem, setQuickPayItem] = useState<LessonAttendanceItem | null>(null);

  const {
    lessons,
    stats,
    loading,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    markAttendance,
    payLesson,
    deleteAttendance,
    refresh,
  } = useAttendance(selectedDate);

  const handleDateChange = (offsetDays: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + offsetDays);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  const handleMarkAttendance = async (item: LessonAttendanceItem, status: string) => {
    await markAttendance(item.id, status);
    // If marked present or late, and payment is still pending/unpaid, trigger quick payment modal
    if (
      (status === "present" || status === "late") &&
      (item.payment_status !== "paid" || item.billing_scheme === "per_lesson")
    ) {
      setQuickPayItem(item);
    }
  };

  const getAttendanceBadge = (item: LessonAttendanceItem) => {
    const status = item.attendance_record?.status;
    if (status === "present") {
      return (
        <Badge
          variant="secondary"
          className="text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20 font-semibold gap-1.5 border border-emerald-500/30 shadow-2xs cursor-pointer"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          Presente
        </Badge>
      );
    }
    if (status === "absent") {
      return (
        <Badge
          variant="secondary"
          className="text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-900/20 font-semibold gap-1.5 border border-rose-500/30 shadow-2xs cursor-pointer"
        >
          <XCircle className="w-3.5 h-3.5 text-rose-500" />
          Assente
        </Badge>
      );
    }
    if (status === "excused") {
      return (
        <Badge
          variant="secondary"
          className="text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20 font-semibold gap-1.5 border border-amber-500/30 shadow-2xs cursor-pointer"
        >
          <Clock className="w-3.5 h-3.5 text-amber-500" />
          Giustificato
        </Badge>
      );
    }
    if (status === "late") {
      return (
        <Badge
          variant="secondary"
          className="text-sky-600 bg-sky-50 dark:text-sky-400 dark:bg-sky-900/20 font-semibold gap-1.5 border border-sky-500/30 shadow-2xs cursor-pointer"
        >
          <AlertCircle className="w-3.5 h-3.5 text-sky-500" />
          In Ritardo
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-muted-foreground border-dashed text-xs cursor-pointer">
        Da Registrare
      </Badge>
    );
  };

  const columns = useMemo<ColumnDef<LessonAttendanceItem>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <div className="flex items-center justify-center px-2">
            <Checkbox
              checked={
                table.getIsAllPageRowsSelected() ||
                (table.getIsSomePageRowsSelected() && "indeterminate")
              }
              onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
              aria-label="Seleziona tutti"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex items-center justify-center px-2">
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label="Seleziona riga"
            />
          </div>
        ),
        enableSorting: false,
        size: 40,
      },
      {
        accessorKey: "starts_at",
        header: "Orario",
        cell: ({ row }) => {
          const startTime = new Date(row.original.starts_at).toLocaleTimeString("it-IT", {
            hour: "2-digit",
            minute: "2-digit",
          });
          const endTime = new Date(row.original.ends_at).toLocaleTimeString("it-IT", {
            hour: "2-digit",
            minute: "2-digit",
          });
          return (
            <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
              <Clock className="w-4 h-4 text-primary shrink-0" />
              <span>
                {startTime} <span className="text-muted-foreground text-xs font-normal">- {endTime}</span>
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "student_name",
        header: "Studente & Corso",
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex flex-col min-w-[200px]">
              <span className="font-medium text-sm text-foreground">{item.student_name}</span>
              <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <BookOpen className="w-3 h-3 text-muted-foreground/70 shrink-0" />
                {item.course_name}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "teacher_name",
        header: "Docente",
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 text-muted-foreground text-sm font-medium">
            <GraduationCap className="w-4 h-4 text-primary/70 shrink-0" />
            <span>{row.original.teacher_name}</span>
          </div>
        ),
      },
      {
        accessorKey: "attendance_status",
        header: "Stato Presenza",
        cell: ({ row }) => {
          const item = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="cursor-pointer transition-all hover:opacity-85 active:scale-95 text-left inline-flex items-center"
                >
                  {getAttendanceBadge(item)}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem
                  onClick={() => handleMarkAttendance(item, "present")}
                  className="cursor-pointer font-medium gap-2 text-emerald-600"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Presente (Esegui Incasso)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleMarkAttendance(item, "absent")}
                  className="cursor-pointer font-medium gap-2 text-rose-600"
                >
                  <XCircle className="w-4 h-4 text-rose-500" />
                  Assente
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleMarkAttendance(item, "late")}
                  className="cursor-pointer font-medium gap-2 text-sky-600"
                >
                  <AlertCircle className="w-4 h-4 text-sky-500" />
                  In Ritardo
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleMarkAttendance(item, "excused")}
                  className="cursor-pointer font-medium gap-2 text-amber-600"
                >
                  <Clock className="w-4 h-4 text-amber-500" />
                  Giustificato
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
      {
        accessorKey: "payment_status",
        header: "Stato Pagamento",
        cell: ({ row }) => {
          const item = row.original;
          const isPaid = item.payment_status === "paid";
          const isPerLesson = item.billing_scheme === "per_lesson";
          const price = item.price_per_lesson || 25;

          if (isPaid) {
            return (
              <Badge variant="secondary" className="text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20 font-semibold gap-1 border border-emerald-500/30 shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Saldato
              </Badge>
            );
          }

          if (isPerLesson) {
            return (
              <Badge variant="secondary" className="text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20 font-semibold gap-1 border border-amber-500/30 shadow-2xs">
                <Banknote className="w-3.5 h-3.5 text-amber-500" />
                Da Incassare (€{price})
              </Badge>
            );
          }

          return (
            <Badge variant="outline" className="text-muted-foreground border-border/60 text-xs">
              Abbonamento / Full
            </Badge>
          );
        },
      },
      {
        id: "actions",
        header: "Azioni",
        enableHiding: false,
        cell: ({ row }) => {
          const item = row.original;
          const isPaid = item.payment_status === "paid";
          const price = item.price_per_lesson || 25;

          return (
            <div className="flex items-center gap-1.5 justify-end">
              {!isPaid ? (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setQuickPayItem(item)}
                  className="h-8 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Banknote className="w-3.5 h-3.5" />
                  Paga €{price}
                </Button>
              ) : (
                <Badge variant="outline" className="text-emerald-600 border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 text-xs gap-1">
                  <Check className="w-3 h-3 text-emerald-500" /> Incassato
                </Badge>
              )}

              {item.booking_id && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-foreground"
                  onClick={() =>
                    setDetailBooking({
                      id: item.booking_id!,
                      studentName: item.student_name,
                      courseName: item.course_name,
                    })
                  }
                  title="Dettagli & Certificato"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              )}

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-rose-600"
                onClick={() => setDeletingLessonId(item.id)}
                title="Resetta Presenza"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        },
      },
    ],
    [markAttendance, payLesson]
  );

  const table = useReactTable({
    data: lessons,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const metrics = [
    {
      title: "Lezioni Programmate",
      value: stats.total,
      description: "Lezioni in calendario per oggi",
      icon: BookOpen,
    },
    {
      title: "Presenti",
      value: stats.present,
      description: "Studenti presenti in aula",
      icon: CheckCircle2,
    },
    {
      title: "Assenti / Giustificati",
      value: stats.absent,
      description: "Assenze e permessi registrati",
      icon: XCircle,
    },
    {
      title: "Tasso Presenza",
      value: `${stats.rate}%`,
      description: "Percentuale presenza odierna",
      icon: Award,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Stat Cards */}
      <div className="@container/main px-4 lg:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric, index) => (
            <Card key={index} className="border">
              <CardContent className="space-y-4 pt-6">
                <div className="flex items-center justify-between">
                  <metric.icon className="text-muted-foreground size-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm font-medium">{metric.title}</p>
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <div className="text-muted-foreground text-xs">{metric.description}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Main Content Section */}
      <div className="@container/main px-4 lg:px-6 space-y-4">
        {/* Toolbar Bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center space-x-2">
            {/* Search Input */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cerca studente, corso, docente..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Filter Dropdown */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] cursor-pointer">
                <SelectValue placeholder="Stato Presenza" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutte le lezioni</SelectItem>
                <SelectItem value="present">Presenti</SelectItem>
                <SelectItem value="absent">Assenti</SelectItem>
                <SelectItem value="late">In Ritardo</SelectItem>
                <SelectItem value="excused">Giustificati</SelectItem>
                <SelectItem value="unmarked">Da Registrare</SelectItem>
              </SelectContent>
            </Select>

            {/* Date Navigator Bar */}
            <div className="flex items-center gap-1 bg-background border rounded-lg p-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDateChange(-1)}
                className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-foreground"
                title="Giorno Precedente"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="h-8 w-36 text-center text-xs font-semibold border-none shadow-none focus-visible:ring-0 cursor-pointer"
              />

              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDateChange(1)}
                className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-foreground"
                title="Giorno Successivo"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedDate(new Date().toISOString().split("T")[0])}
                className="h-8 text-xs font-semibold px-2.5 cursor-pointer"
              >
                Oggi
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* View Switcher */}
            <div className="flex items-center rounded-lg border bg-background p-1">
              <Button
                variant={viewMode === "table" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
                className="h-8 px-2.5 cursor-pointer"
              >
                <List className="h-4 w-4 mr-1" />
                <span>Tabella</span>
              </Button>
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="h-8 px-2.5 cursor-pointer"
              >
                <LayoutGrid className="h-4 w-4 mr-1" />
                <span>Griglia</span>
              </Button>
            </div>

            {/* Manual Create Button */}
            <Button
              variant="default"
              size="sm"
              onClick={() => setCreateDialogOpen(true)}
              className="h-8 text-xs font-semibold gap-1.5 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Registra Presenza</span>
            </Button>
          </div>
        </div>

        {/* Content Render: Table vs Grid */}
        {viewMode === "table" ? (
          <div className="rounded-md border bg-card shadow-2xs">
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
                  <TableSkeletonRows columns={columns.length} rows={5} />
                ) : table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className="hover:bg-muted/40 transition-colors"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground">
                      Nessuna lezione trovata per la data selezionata.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <div className="p-4 border-t">
              <DataTablePagination table={table} />
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse h-44 bg-muted/20" />
              ))
            ) : lessons.length === 0 ? (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                Nessuna lezione trovata per questa data.
              </div>
            ) : (
              lessons.map((item) => {
                const startTime = new Date(item.starts_at).toLocaleTimeString("it-IT", {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                const isPaid = item.payment_status === "paid";
                const price = item.price_per_lesson || 25;

                return (
                  <Card key={item.id} className="border hover:border-primary/50 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-primary" />
                        {startTime}
                      </CardTitle>
                      {getAttendanceBadge(item)}
                    </CardHeader>
                    <CardContent className="space-y-3 pt-2">
                      <div>
                        <p className="font-semibold text-base text-foreground">{item.student_name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <BookOpen className="w-3.5 h-3.5 text-muted-foreground/70" />
                          {item.course_name}
                        </p>
                      </div>

                      <div className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                        <GraduationCap className="w-4 h-4 text-primary/70" />
                        Docente: {item.teacher_name}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t mt-3">
                        <div className="text-xs">
                          {isPaid ? (
                            <Badge variant="secondary" className="text-emerald-600 bg-emerald-50 dark:text-emerald-400 font-semibold gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Saldato
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-amber-600 bg-amber-50 dark:text-amber-400 font-semibold gap-1">
                              Da Incassare (€{price})
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          {!isPaid && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => setQuickPayItem(item)}
                              className="h-8 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                            >
                              <Banknote className="w-3.5 h-3.5" /> Paga €{price}
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-rose-600"
                            onClick={() => setDeletingLessonId(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Instant Post-Lesson Payment Drawer/Dialog */}
      <QuickLessonPaymentDialog
        item={quickPayItem}
        open={Boolean(quickPayItem)}
        onOpenChange={(open) => !open && setQuickPayItem(null)}
        onPay={payLesson}
      />

      {/* Manual Create Dialog */}
      <CreateAttendanceDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={refresh}
      />

      {/* Attendance Detail & Certificate Dialog */}
      {detailBooking && (
        <AttendanceDetailDialog
          open={Boolean(detailBooking)}
          onOpenChange={(open) => !open && setDetailBooking(null)}
          bookingId={detailBooking.id}
          studentName={detailBooking.studentName}
          courseName={detailBooking.courseName}
        />
      )}

      {/* Delete / Reset Confirm Dialog */}
      <DeleteConfirmDialog
        open={Boolean(deletingLessonId)}
        onOpenChange={(open) => !open && setDeletingLessonId(null)}
        onConfirm={async () => {
          if (deletingLessonId) {
            await deleteAttendance(deletingLessonId);
            setDeletingLessonId(null);
          }
        }}
        title="Resettare Presenza?"
        description="La registrazione della presenza per questa lezione verrà rimossa e riportata allo stato iniziale."
      />
    </div>
  );
}
