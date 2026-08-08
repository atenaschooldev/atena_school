import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { LessonAttendanceItem } from "../types";

import { apiFetch } from "@/lib/api";

export interface AttendanceResponse {
  lessons: LessonAttendanceItem[];
  stats: {
    total: number;
    present: number;
    absent: number;
    pending: number;
    pendingPayment: number;
  };
}

export function useAttendance(selectedDateStr?: string) {
  const queryClient = useQueryClient();
  const dateStr = selectedDateStr || new Date().toISOString().split("T")[0];

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const {
    data,
    isLoading,
    refetch,
  } = useQuery<AttendanceResponse>({
    queryKey: ["attendance", dateStr],
    queryFn: async () => {
      const res = await apiFetch<any>(`/admin/attendance?date=${dateStr}`);
      if (res && Array.isArray(res.lessons)) {
        return res as AttendanceResponse;
      }
      // Fallback for array response
      const lessonsArr = Array.isArray(res) ? res : [];
      return {
        lessons: lessonsArr,
        stats: {
          total: lessonsArr.length,
          present: lessonsArr.filter((l: any) => l.attendance_record?.status === "present" || l.attendance_record?.status === "late").length,
          absent: lessonsArr.filter((l: any) => l.attendance_record?.status === "absent").length,
          pending: lessonsArr.filter((l: any) => !l.attendance_record).length,
          pendingPayment: 0,
        },
      };
    },
    staleTime: 1000 * 15,
  });

  const lessons = data?.lessons || [];
  const serverStats = data?.stats || { total: 0, present: 0, absent: 0, pending: 0, pendingPayment: 0 };

  const markMutation = useMutation({
    mutationFn: async ({
      lessonId,
      status,
      notes,
    }: {
      lessonId: string;
      status: string;
      notes?: string;
    }) => {
      return apiFetch("/admin/attendance/mark", {
        method: "POST",
        body: JSON.stringify({ lessonId, status, notes }),
      });
    },
    onSuccess: () => {
      toast.success("Presenza registrata");
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: (err) => {
      console.error(err);
      toast.error("Errore nella registrazione della presenza");
    },
  });

  const payLessonMutation = useMutation({
    mutationFn: async ({
      lessonId,
      paymentMethod,
      amount,
    }: {
      lessonId: string;
      paymentMethod?: string;
      amount?: number;
    }) => {
      return apiFetch(`/admin/attendance/${lessonId}/pay-lesson`, {
        method: "POST",
        body: JSON.stringify({ paymentMethod, amount }),
      });
    },
    onSuccess: () => {
      toast.success("Pagamento lezione registrato con successo!");
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
    onError: (err) => {
      console.error(err);
      toast.error("Errore nel pagamento della lezione");
    },
  });

  const markAttendance = useCallback(
    (lessonId: string, status: string, notes?: string) => {
      return markMutation.mutateAsync({ lessonId, status, notes });
    },
    [markMutation]
  );

  const payLesson = useCallback(
    (lessonId: string, paymentMethod?: string, amount?: number) => {
      return payLessonMutation.mutateAsync({ lessonId, paymentMethod, amount });
    },
    [payLessonMutation]
  );

  const filteredLessons = useMemo(() => {
    return lessons.filter((l) => {
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const matchStudent = (l.student_name || "").toLowerCase().includes(q);
        const matchCourse = (l.course_name || "").toLowerCase().includes(q);
        const matchTeacher = (l.teacher_name || "").toLowerCase().includes(q);
        if (!matchStudent && !matchCourse && !matchTeacher) return false;
      }

      if (statusFilter !== "all") {
        const currentAtt = l.attendance_record?.status || "pending";
        if (statusFilter === "marked" && currentAtt === "pending") return false;
        if (statusFilter === "unmarked" && currentAtt !== "pending") return false;
        if (statusFilter !== "marked" && statusFilter !== "unmarked" && currentAtt !== statusFilter) {
          return false;
        }
      }

      return true;
    });
  }, [lessons, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    const rate = serverStats.total > 0 ? Math.round((serverStats.present / serverStats.total) * 100) : 0;
    return {
      ...serverStats,
      rate,
    };
  }, [serverStats]);

  const deleteMutation = useMutation({
    mutationFn: async (lessonId: string) => {
      return apiFetch(`/admin/attendance/${lessonId}`, { method: "DELETE" });
    },
    onSuccess: () => {
      toast.success("Presenza resettata");
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: (err) => {
      console.error(err);
      toast.error("Errore nel reset della presenza");
    },
  });

  const deleteAttendance = useCallback(
    (lessonId: string) => {
      return deleteMutation.mutateAsync(lessonId);
    },
    [deleteMutation]
  );

  return {
    lessons: filteredLessons,
    allLessons: lessons,
    stats,
    loading: isLoading,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    markAttendance,
    payLesson,
    deleteAttendance,
    refresh: refetch,
  };
}
