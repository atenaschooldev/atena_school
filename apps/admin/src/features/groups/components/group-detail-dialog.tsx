"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Users,
  Calendar,
  Clock,
  MapPin,
  GraduationCap,
  Trash2,
  UserPlus,
  BookOpen,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { WEEKDAY_DICTIONARY } from "@atena/api-types";
import type { Group } from "../types";

interface GroupDetailDialogProps {
  group: Group | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddMember: (groupId: string, values: { studentId: string }) => Promise<any>;
  onRemoveMember: (groupId: string, studentId: string) => Promise<any>;
}

export function GroupDetailDialog({
  group,
  open,
  onOpenChange,
  onAddMember,
  onRemoveMember,
}: GroupDetailDialogProps) {
  const [activeTab, setActiveTab] = useState("students");
  const [availableStudents, setAvailableStudents] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (open) {
      setIsLoadingStudents(true);
      apiFetch<any>("/admin/students?limit=100")
        .then((res) => {
          const list = Array.isArray(res) ? res : res?.items || res?.data || [];
          setAvailableStudents(list);
        })
        .catch(() => setAvailableStudents([]))
        .finally(() => setIsLoadingStudents(false));
    }
  }, [open]);

  if (!group) return null;

  const currentCount = group.members?.length || 0;
  const maxCount = group.maxStudents || 8;
  const fillPercent = Math.min(100, Math.round((currentCount / maxCount) * 100));

  const enrolledStudentIds = new Set(group.members?.map((m) => m.studentId) || []);
  const selectableStudents = availableStudents.filter(
    (s) => !enrolledStudentIds.has(s.id)
  );

  const handleAddStudent = async () => {
    if (!selectedStudentId) {
      toast.error("Seleziona uno studente");
      return;
    }
    try {
      setIsAdding(true);
      await onAddMember(group.id, { studentId: selectedStudentId });
      setSelectedStudentId("");
    } catch (err) {
      // Error handled in mutation
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    if (confirm("Sei sicuro di voler rimuovere lo studente dal gruppo?")) {
      await onRemoveMember(group.id, studentId);
    }
  };

  const formatScheduleDays = (days?: number[]) => {
    if (!days || days.length === 0) return "Flessibile";
    return days.map((d) => WEEKDAY_DICTIONARY[d % 7]?.label_it || String(d)).join(" e ");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                {group.name}
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {group.courseName || "Corso di Gruppo"}
              </p>
            </div>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              {currentCount} / {maxCount} Posti Occupati
            </Badge>
          </div>
        </DialogHeader>

        {/* Info Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-muted/30 rounded-xl border border-border/50 text-xs">
          <div className="space-y-0.5">
            <span className="text-muted-foreground flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5" /> Docente
            </span>
            <p className="font-semibold text-foreground truncate">{group.teacherName || "Non assegnato"}</p>
          </div>

          <div className="space-y-0.5">
            <span className="text-muted-foreground flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Giorni
            </span>
            <p className="font-semibold text-foreground truncate">{formatScheduleDays(group.scheduleDays)}</p>
          </div>

          <div className="space-y-0.5">
            <span className="text-muted-foreground flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Orario
            </span>
            <p className="font-semibold text-foreground">
              {group.startTime || "18:00"}{group.endTime ? ` - ${group.endTime}` : ""}
            </p>
          </div>

          <div className="space-y-0.5">
            <span className="text-muted-foreground flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> Aula
            </span>
            <p className="font-semibold text-foreground truncate">{group.room || "Aula 1"}</p>
          </div>
        </div>

        {/* Capacity Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Riempimento Classe</span>
            <span className="font-semibold text-foreground">{fillPercent}%</span>
          </div>
          <Progress value={fillPercent} className="h-2" />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="pt-2">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="students" className="text-xs">
              Studenti Iscritti ({currentCount})
            </TabsTrigger>
            <TabsTrigger value="lessons" className="text-xs">
              Lezioni Programmate ({group.lessons?.length || 0})
            </TabsTrigger>
          </TabsList>

          {/* Tab Studenti */}
          <TabsContent value="students" className="space-y-4 pt-3">
            {/* Add Student Section */}
            <div className="p-3.5 bg-muted/20 border border-border/60 rounded-xl space-y-2.5">
              <Label className="text-xs font-semibold flex items-center gap-1.5">
                <UserPlus className="w-4 h-4 text-primary" />
                Aggiungi Studente al Gruppo
              </Label>
              <div className="flex gap-2">
                <Select
                  value={selectedStudentId}
                  onValueChange={setSelectedStudentId}
                  disabled={currentCount >= maxCount || isLoadingStudents}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue
                      placeholder={
                        currentCount >= maxCount
                          ? "Gruppo al completo"
                          : isLoadingStudents
                          ? "Caricamento studenti..."
                          : "Seleziona studente da inserire..."
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="max-h-56">
                    {selectableStudents.map((s) => (
                      <SelectItem key={s.id} value={s.id} className="text-xs">
                        {s.full_name || `${s.first_name || ""} ${s.last_name || ""}`.trim() || s.email} {s.tax_code ? `(${s.tax_code})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  onClick={handleAddStudent}
                  disabled={!selectedStudentId || isAdding || currentCount >= maxCount}
                  className="shrink-0"
                >
                  {isAdding ? "Aggiunta..." : "Aggiungi"}
                </Button>
              </div>
            </div>

            {/* Students List */}
            {group.members && group.members.length > 0 ? (
              <div className="space-y-2">
                {group.members.map((m) => (
                  <div
                    key={m.id}
                    className="p-3 bg-card border border-border/60 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <h5 className="font-semibold text-foreground text-sm">
                        {m.student?.fullName || "Studente"}
                      </h5>
                      <div className="flex flex-wrap gap-x-3 text-muted-foreground mt-0.5">
                        {m.student?.email && <span>{m.student.email}</span>}
                        {m.student?.phone && <span>{m.student.phone}</span>}
                        {m.student?.taxCode && <span className="font-mono">{m.student.taxCode}</span>}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive shrink-0"
                      onClick={() => handleRemoveStudent(m.studentId)}
                      title="Rimuovi dal gruppo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground text-xs">
                Nessuno studente ancora iscritto a questa classe.
              </div>
            )}
          </TabsContent>

          {/* Tab Lezioni */}
          <TabsContent value="lessons" className="space-y-2 pt-3">
            {group.lessons && group.lessons.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {group.lessons.map((l, idx) => {
                  const startDate = new Date(l.startsAt);
                  return (
                    <div
                      key={l.id}
                      className="p-3 bg-card border border-border/60 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-[10px]">
                          {idx + 1}
                        </span>
                        <div>
                          <p className="font-semibold text-foreground">
                            {startDate.toLocaleDateString("it-IT", {
                              weekday: "long",
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </p>
                          <p className="text-muted-foreground text-[11px]">
                            {startDate.toLocaleTimeString("it-IT", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[10px]">
                        {l.status === 2 ? "Completata" : "Programmata"}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground text-xs">
                Nessuna lezione programmata nel calendario.
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
