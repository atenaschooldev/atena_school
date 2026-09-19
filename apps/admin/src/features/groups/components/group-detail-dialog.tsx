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
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { useTranslation } from "@/i18n/context";
import type { Group } from "../types";

interface GroupDetailDialogProps {
  group: Group | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddMember: (groupId: string, values: { studentId: string }) => Promise<any>;
  onRemoveMember: (groupId: string, studentId: string) => Promise<any>;
}

const WEEKDAY_KEYS: Record<number, string> = {
  1: "monday",
  2: "tuesday",
  3: "wednesday",
  4: "thursday",
  5: "friday",
  6: "saturday",
  0: "sunday",
  7: "sunday",
};

export function GroupDetailDialog({
  group,
  open,
  onOpenChange,
  onAddMember,
  onRemoveMember,
}: GroupDetailDialogProps) {
  const { t, locale } = useTranslation();
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
      toast.error(t("groups.selectStudent"));
      return;
    }
    try {
      setIsAdding(true);
      await onAddMember(group.id, { studentId: selectedStudentId });
      toast.success(t("groups.memberAddedSuccess"));
      setSelectedStudentId("");
    } catch (err) {
      // Error handled in mutation
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    if (confirm(t("groups.removeStudentConfirm"))) {
      await onRemoveMember(group.id, studentId);
      toast.success(t("groups.memberRemovedSuccess"));
    }
  };

  const formatScheduleDays = (days?: number[]) => {
    if (!days || days.length === 0) return t("common.flexible");
    return days
      .map((d) => {
        const key = WEEKDAY_KEYS[d % 7] || "monday";
        return t(`weekdays.${key}`);
      })
      .join(` ${t("weekdays.and")} `);
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
                {group.courseName || t("groups.defaultGroupCourse")}
              </p>
            </div>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              {currentCount} / {maxCount} {t("groups.spotsOccupied")}
            </Badge>
          </div>
        </DialogHeader>

        {/* Info Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-muted/30 rounded-xl border border-border/50 text-xs">
          <div className="space-y-0.5">
            <span className="text-muted-foreground flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5" /> {t("groups.teacher")}
            </span>
            <p className="font-semibold text-foreground truncate">{group.teacherName || t("groups.unassigned")}</p>
          </div>

          <div className="space-y-0.5">
            <span className="text-muted-foreground flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> {t("courses.scheduleDays")}
            </span>
            <p className="font-semibold text-foreground truncate">{formatScheduleDays(group.scheduleDays)}</p>
          </div>

          <div className="space-y-0.5">
            <span className="text-muted-foreground flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {t("common.time")}
            </span>
            <p className="font-semibold text-foreground">
              {group.startTime || "18:00"}{group.endTime ? ` - ${group.endTime}` : ""}
            </p>
          </div>

          <div className="space-y-0.5">
            <span className="text-muted-foreground flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> {t("groups.classroom")}
            </span>
            <p className="font-semibold text-foreground truncate">{group.room || "Aula 1"}</p>
          </div>
        </div>

        {/* Capacity Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{t("groups.fillRate")}</span>
            <span className="font-semibold text-foreground">{fillPercent}%</span>
          </div>
          <Progress value={fillPercent} className="h-2" />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="pt-2">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="students" className="text-xs">
              {t("groups.members")} ({currentCount})
            </TabsTrigger>
            <TabsTrigger value="lessons" className="text-xs">
              {t("groups.lessonsList")} ({group.lessons?.length || 0})
            </TabsTrigger>
          </TabsList>

          {/* Tab Studenti */}
          <TabsContent value="students" className="space-y-4 pt-3">
            {/* Add Student Section */}
            <div className="p-3.5 bg-muted/20 border border-border/60 rounded-xl space-y-2.5">
              <Label className="text-xs font-semibold flex items-center gap-1.5">
                <UserPlus className="w-4 h-4 text-primary" />
                {t("groups.addStudent")}
              </Label>
              <div className="flex gap-2">
                <Select
                  value={selectedStudentId}
                  onValueChange={setSelectedStudentId}
                  disabled={currentCount >= maxCount || isLoadingStudents}
                >
                  <SelectTrigger className="text-xs cursor-pointer">
                    <SelectValue
                      placeholder={
                        currentCount >= maxCount
                          ? t("groups.spotsOccupied")
                          : isLoadingStudents
                          ? t("common.loading")
                          : t("groups.selectStudent")
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="max-h-56">
                    {selectableStudents.map((s) => (
                      <SelectItem key={s.id} value={s.id} className="text-xs cursor-pointer">
                        {s.full_name || `${s.first_name || ""} ${s.last_name || ""}`.trim() || s.email} {s.tax_code ? `(${s.tax_code})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  onClick={handleAddStudent}
                  disabled={!selectedStudentId || isAdding || currentCount >= maxCount}
                  className="shrink-0 cursor-pointer"
                >
                  {isAdding ? t("common.saving") : t("common.create")}
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
                        {m.student?.fullName || t("common.student")}
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
                      className="text-muted-foreground hover:text-destructive shrink-0 cursor-pointer"
                      onClick={() => handleRemoveStudent(m.studentId)}
                      title={t("groups.removeStudent")}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground text-xs">
                {t("groups.noGroupsFound")}
              </div>
            )}
          </TabsContent>

          {/* Tab Lezioni */}
          <TabsContent value="lessons" className="space-y-2 pt-3">
            {group.lessons && group.lessons.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {group.lessons.map((l, idx) => {
                  const startDate = new Date(l.startsAt);
                  const dateLocale = locale === "en" ? "en-US" : "it-IT";
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
                            {startDate.toLocaleDateString(dateLocale, {
                              weekday: "short",
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                          <p className="text-muted-foreground text-[11px]">
                            {startDate.toLocaleTimeString(dateLocale, {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[10px]">
                        {l.status === 2 ? t("groups.lessonCompleted") : t("groups.lessonScheduled")}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground text-xs">
                {t("bookings.noLessonsFound")}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
