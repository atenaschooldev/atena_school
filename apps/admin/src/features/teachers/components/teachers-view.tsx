"use client";

import { useState, useMemo } from "react";
import { useTeachers } from "../hooks/use-teachers";
import type { Teacher } from "../types";
import {
  UserCheck,
  GraduationCap,
  BookOpen,
  Search,
  MoreVertical,
  Pencil,
  Calendar,
  Building2,
  Award,
  LayoutGrid,
  List,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table";

function formatDate(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
}

export function TeachersView() {
  const { teachers, loading, updateTeacher } = useTeachers();
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  // Edit form state
  const [editName, setEditName] = useState("");
  const [editStatus, setEditStatus] = useState("active");
  const [editPhoto, setEditPhoto] = useState("");
  const [editExp, setEditExp] = useState("");

  const handleOpenEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setEditName(teacher.fullName || "");
    setEditStatus(teacher.status || "active");
    setEditPhoto(teacher.photoUrl || "");
    setEditExp(teacher.experience || "");
  };

  const handleSaveEdit = async () => {
    if (!editingTeacher) return;
    await updateTeacher(editingTeacher.id, {
      fullName: editName,
      status: editStatus,
      photoUrl: editPhoto || undefined,
      experience: editExp || undefined,
    });
    setEditingTeacher(null);
  };

  const filteredTeachers = useMemo(() => {
    return teachers.filter((t) => {
      const matchSearch =
        t.fullName?.toLowerCase().includes(globalFilter.toLowerCase()) ||
        t.email?.toLowerCase().includes(globalFilter.toLowerCase());
      const matchStatus = statusFilter === "all" || t.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [teachers, globalFilter, statusFilter]);

  const stats = useMemo(() => {
    const total = teachers.length;
    const active = teachers.filter((t) => t.status === "active").length;
    const totalCourses = teachers.reduce((sum, t) => sum + (t.courseCount || 0), 0);
    const totalLessons = teachers.reduce((sum, t) => sum + (t.lessonCount || 0), 0);
    return { total, active, totalCourses, totalLessons };
  }, [teachers]);

  const columns = useMemo<ColumnDef<Teacher>[]>(
    () => [
      {
        id: "teacher",
        header: "Docente",
        cell: ({ row }) => {
          const t = row.original;
          return (
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 border">
                <AvatarImage src={t.photoUrl || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                  {getInitials(t.fullName || "")}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-semibold text-sm">{t.fullName}</span>
                {t.email && (
                  <span className="text-xs text-muted-foreground">{t.email}</span>
                )}
              </div>
            </div>
          );
        },
      },
      {
        id: "status",
        header: "Stato",
        cell: ({ row }) => {
          const status = row.original.status;
          return status === "active" ? (
            <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30">
              Attivo
            </Badge>
          ) : (
            <Badge variant="secondary">Inattivo</Badge>
          );
        },
      },
      {
        id: "courses",
        header: "Corsi Assegnati",
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 font-medium text-sm">
            <BookOpen className="h-4 w-4 text-blue-500" />
            <span>{row.original.courseCount ?? 0} corsi</span>
          </div>
        ),
      },
      {
        id: "lessons",
        header: "Lezioni Totali",
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 font-medium text-sm">
            <Award className="h-4 w-4 text-amber-500" />
            <span>{row.original.lessonCount ?? 0} lezioni</span>
          </div>
        ),
      },
      {
        id: "hireDate",
        header: "Data Assunzione",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {formatDate(row.original.hireDate)}
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const teacher = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => handleOpenEdit(teacher)}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Modifica Profilo
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: filteredTeachers,
    columns,
    state: { sorting, columnFilters },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Docenti e Insegnanti</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gestisci il corpo docente della scuola e le assegnazioni ai corsi
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 rounded-lg border p-1 bg-muted/30">
          <Button
            variant={viewMode === "table" ? "secondary" : "ghost"}
            size="sm"
            className="h-8 gap-1 text-xs cursor-pointer"
            onClick={() => setViewMode("table")}
          >
            <List className="h-4 w-4" />
            Tabella
          </Button>
          <Button
            variant={viewMode === "cards" ? "secondary" : "ghost"}
            size="sm"
            className="h-8 gap-1 text-xs cursor-pointer"
            onClick={() => setViewMode("cards")}
          >
            <LayoutGrid className="h-4 w-4" />
            Griglia
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <GraduationCap className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Totale Docenti</p>
              <p className="text-xl font-bold">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <UserCheck className="h-4 w-4 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Attivi</p>
              <p className="text-xl font-bold text-emerald-600">{stats.active}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <BookOpen className="h-4 w-4 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Corsi Assegnati</p>
              <p className="text-xl font-bold text-blue-600">{stats.totalCourses}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Building2 className="h-4 w-4 text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Lezioni Totali</p>
              <p className="text-xl font-bold text-amber-600">{stats.totalLessons}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cerca per nome docente..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Stato" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti gli stati</SelectItem>
            <SelectItem value="active">Attivo</SelectItem>
            <SelectItem value="inactive">Inattivo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Main Content */}
      {viewMode === "table" ? (
        /* Table View (Default) */
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id}>
                  {hg.headers.map((header) => (
                    <TableHead key={header.id}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableSkeletonRows columnsCount={columns.length} rowCount={5} />
              ) : table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} className="hover:bg-muted/50">
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
                    Nessun docente trovato.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <span className="text-sm text-muted-foreground">
              {table.getFilteredRowModel().rows.length} docenti
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="cursor-pointer"
              >
                Indietro
              </Button>
              <span className="text-sm text-muted-foreground">
                Pag. {table.getState().pagination.pageIndex + 1} di {table.getPageCount() || 1}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="cursor-pointer"
              >
                Avanti
              </Button>
            </div>
          </div>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-5 h-44 animate-pulse bg-muted/40" />
          ))}
        </div>
      ) : filteredTeachers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 rounded-lg border bg-card text-muted-foreground">
          <GraduationCap className="h-10 w-10 opacity-30 mb-2" />
          <p className="text-sm font-medium">Nessun docente trovato</p>
        </div>
      ) : (
        /* Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTeachers.map((teacher) => (
            <Card key={teacher.id} className="relative overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="p-5 pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border">
                      <AvatarImage src={teacher.photoUrl || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {getInitials(teacher.fullName || "")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base font-semibold">
                        {teacher.fullName}
                      </CardTitle>
                      {teacher.status === "active" ? (
                        <Badge className="mt-1 bg-emerald-500/15 text-emerald-600 border-emerald-500/30">
                          Attivo
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="mt-1">
                          Inattivo
                        </Badge>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => handleOpenEdit(teacher)}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Modifica Profilo
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="p-5 pt-2 flex flex-col gap-3 text-sm">
                {teacher.experience && (
                  <p className="text-muted-foreground line-clamp-2 text-xs italic">
                    "{teacher.experience}"
                  </p>
                )}

                <div className="grid grid-cols-2 gap-2 pt-2 border-t text-xs">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <BookOpen className="h-3.5 w-3.5 text-primary" />
                    <span>Corsi: <strong>{teacher.courseCount}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Award className="h-3.5 w-3.5 text-primary" />
                    <span>Lezioni: <strong>{teacher.lessonCount}</strong></span>
                  </div>
                  {teacher.hireDate && (
                    <div className="flex items-center gap-1.5 text-muted-foreground col-span-2">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>Assunzione: {formatDate(teacher.hireDate)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Teacher Dialog */}
      <Dialog open={!!editingTeacher} onOpenChange={(open) => !open && setEditingTeacher(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Modifica Docente</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Stato</Label>
              <Select value={editStatus} onValueChange={setEditStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Attivo</SelectItem>
                  <SelectItem value="inactive">Inattivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="photo">URL Foto Profilo</Label>
              <Input
                id="photo"
                placeholder="https://..."
                value={editPhoto}
                onChange={(e) => setEditPhoto(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="exp">Esperienza / Bio</Label>
              <Textarea
                id="exp"
                placeholder="Note su qualifica, esperienza..."
                value={editExp}
                onChange={(e) => setEditExp(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTeacher(null)}>
              Annulla
            </Button>
            <Button onClick={handleSaveEdit}>Salva Modifiche</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
