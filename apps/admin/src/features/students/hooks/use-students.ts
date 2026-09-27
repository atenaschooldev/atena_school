import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import type { Student, CreateStudentFormValues, UpdateStudentFormValues } from "../types";

export function useStudents(filters?: {
  search?: string;
  annualFeePaid?: boolean;
  languageLevel?: string | number;
  status?: string | number;
}) {
  const queryClient = useQueryClient();

  const queryParams = new URLSearchParams();
  if (filters?.search) queryParams.set("search", filters.search);
  if (filters?.annualFeePaid !== undefined) queryParams.set("annualFeePaid", String(filters.annualFeePaid));
  if (filters?.languageLevel) queryParams.set("languageLevel", String(filters.languageLevel));
  if (filters?.status) queryParams.set("status", String(filters.status));

  const endpoint = `/admin/students${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

  const {
    data: rawData = [],
    isLoading,
    refetch,
  } = useQuery<any>({
    queryKey: ["students", filters],
    queryFn: async () => {
      const data = await apiFetch<any>(endpoint);
      return Array.isArray(data) ? data : data?.items || data?.data || [];
    },
    staleTime: 1000 * 20,
  });

  const students: Student[] = Array.isArray(rawData) ? rawData : [];

  const createStudentMutation = useMutation({
    mutationFn: async (values: CreateStudentFormValues) => {
      return apiFetch<Student>("/admin/students", {
        method: "POST",
        body: JSON.stringify(values),
      });
    },
    onSuccess: () => {
      toast.success("Studente registrato con successo");
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
    onError: (e: any) => {
      toast.error(e?.message || "Errore nella registrazione dello studente");
    },
  });

  const updateStudentMutation = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: UpdateStudentFormValues }) => {
      return apiFetch<Student>(`/admin/students/${id}`, {
        method: "PATCH",
        body: JSON.stringify(values),
      });
    },
    onSuccess: () => {
      toast.success("Profilo studente aggiornato");
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
    onError: (e: any) => {
      toast.error(e?.message || "Errore nell'aggiornamento dello studente");
    },
  });

  const deleteStudentMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiFetch(`/admin/students/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      toast.success("Studente eliminato dal registro");
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
    onError: (e: any) => {
      toast.error(e?.message || "Errore nell'eliminazione dello studente");
    },
  });

  return {
    students,
    isLoading,
    refetch,
    createStudent: createStudentMutation.mutateAsync,
    isCreating: createStudentMutation.isPending,
    updateStudent: updateStudentMutation.mutateAsync,
    isUpdating: updateStudentMutation.isPending,
    deleteStudent: deleteStudentMutation.mutateAsync,
    isDeleting: deleteStudentMutation.isPending,
  };
}
