import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api';
import {
  resolveI18n,
  type DocumentCategoryRecord,
  type CreateDocumentCategoryDto,
  type UpdateDocumentCategoryDto,
} from '../types';

export function useDocumentCategories() {
  const queryClient = useQueryClient();

  const {
    data: categories = [],
    isLoading,
    refetch,
  } = useQuery<DocumentCategoryRecord[]>({
    queryKey: ['admin-document-categories'],
    queryFn: async () => {
      try {
        const res = await apiFetch<DocumentCategoryRecord[]>('/admin/documents/categories');
        return Array.isArray(res) ? res : [];
      } catch (err) {
        console.error('Failed to fetch document categories:', err);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  const createMutation = useMutation({
    mutationFn: async (dto: CreateDocumentCategoryDto) => {
      return apiFetch<DocumentCategoryRecord>('/admin/documents/categories', {
        method: 'POST',
        body: JSON.stringify(dto),
      });
    },
    onSuccess: (created) => {
      const catName = resolveI18n(created.name, undefined, 'Categoria');
      toast.success(`Categoria "${catName}" creata con successo!`);
      queryClient.invalidateQueries({ queryKey: ['admin-document-categories'] });
    },
    onError: (err: any) => {
      toast.error(`Errore nella creazione della categoria: ${err?.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateDocumentCategoryDto }) => {
      return apiFetch<DocumentCategoryRecord>(`/admin/documents/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    onSuccess: (updated) => {
      const catName = resolveI18n(updated.name, undefined, 'Categoria');
      toast.success(`Categoria "${catName}" salvata con successo!`);
      queryClient.invalidateQueries({ queryKey: ['admin-document-categories'] });
    },
    onError: (err: any) => {
      toast.error(`Errore nel salvataggio della categoria: ${err?.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiFetch(`/admin/documents/categories/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      toast.success('Categoria eliminata con successo!');
      queryClient.invalidateQueries({ queryKey: ['admin-document-categories'] });
    },
    onError: (err: any) => {
      toast.error(`Errore nell'eliminazione della categoria: ${err?.message}`);
    },
  });

  return {
    categories,
    isLoading,
    refetch,
    createCategory: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateCategory: (idOrObj: string | { id: string; name?: string; description?: string }, maybePayload?: { name?: string; description?: string }) => {
      if (typeof idOrObj === "string") {
        return updateMutation.mutateAsync({ id: idOrObj, ...maybePayload });
      }
      return updateMutation.mutateAsync(idOrObj);
    },
    isUpdating: updateMutation.isPending,
    deleteCategory: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
