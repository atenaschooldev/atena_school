import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { useTranslation } from "@/i18n/context";
import type {
  CourseCategoryRecord,
  CreateCourseCategoryDto,
  UpdateCourseCategoryDto,
} from "../types";

export function useCourseCategories() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const {
    data: categories = [],
    isLoading,
    refetch,
  } = useQuery<CourseCategoryRecord[]>({
    queryKey: ["course-categories"],
    queryFn: async () => {
      const data = await apiFetch<CourseCategoryRecord[]>("/admin/courses/categories");
      return Array.isArray(data) ? data : [];
    },
    staleTime: 1000 * 30,
  });

  const createMutation = useMutation({
    mutationFn: async (payload: CreateCourseCategoryDto) => {
      return apiFetch<CourseCategoryRecord>("/admin/courses/categories", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      toast.success(t("courses.categoryCreateSuccess") || "Categoria creata con successo");
      queryClient.invalidateQueries({ queryKey: ["course-categories"] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
    onError: (e: any) => {
      toast.error(e?.message || t("courses.categoryCreateError") || "Errore durante la creazione della categoria");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateCourseCategoryDto }) => {
      return apiFetch<CourseCategoryRecord>(`/admin/courses/categories/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      toast.success(t("courses.categoryUpdateSuccess") || "Categoria aggiornata con successo");
      queryClient.invalidateQueries({ queryKey: ["course-categories"] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
    onError: (e: any) => {
      toast.error(e?.message || t("courses.categoryUpdateError") || "Errore durante il salvataggio");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiFetch<{ success: boolean }>(`/admin/courses/categories/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      toast.success(t("courses.categoryDeleteSuccess") || "Categoria eliminata con successo");
      queryClient.invalidateQueries({ queryKey: ["course-categories"] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
    onError: (e: any) => {
      toast.error(e?.message || t("courses.categoryDeleteError") || "Errore durante l'eliminazione della categoria");
    },
  });

  return {
    categories,
    loading: isLoading,
    refresh: refetch,
    createCategory: (payload: CreateCourseCategoryDto) => createMutation.mutateAsync(payload),
    updateCategory: (id: string, payload: UpdateCourseCategoryDto) =>
      updateMutation.mutateAsync({ id, payload }),
    deleteCategory: (id: string) => deleteMutation.mutateAsync(id),
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
