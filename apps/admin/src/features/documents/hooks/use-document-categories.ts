import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api';
import type {
  DocumentCategoryRecord,
  CreateDocumentCategoryDto,
  UpdateDocumentCategoryDto,
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
      toast.success(`Categoria "${created.name_it}" creata con successo!`);
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
      toast.success(`Categoria "${updated.name_it}" salvata con successo!`);
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
    updateCategory: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteCategory: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
