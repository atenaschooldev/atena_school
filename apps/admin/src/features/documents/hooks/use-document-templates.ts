import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api';
import type {
  DocumentTemplateRecord,
  CreateDocumentTemplateDto,
  UpdateDocumentTemplateDto,
} from '../types';

export function useDocumentTemplates() {
  const queryClient = useQueryClient();

  const {
    data: templates = [],
    isLoading,
    refetch,
  } = useQuery<DocumentTemplateRecord[]>({
    queryKey: ['admin-document-templates'],
    queryFn: async () => {
      try {
        const res = await apiFetch<DocumentTemplateRecord[]>('/admin/documents/templates');
        return Array.isArray(res) ? res : [];
      } catch (err) {
        console.error('Failed to fetch document templates:', err);
        return [];
      }
    },
    staleTime: 0,
  });

  const createMutation = useMutation({
    mutationFn: async (dto: CreateDocumentTemplateDto) => {
      return apiFetch<DocumentTemplateRecord>('/admin/documents/templates', {
        method: 'POST',
        body: JSON.stringify(dto),
      });
    },
    onSuccess: (created) => {
      toast.success(`Modello "${created.name}" creato con successo!`);
      queryClient.invalidateQueries({ queryKey: ['admin-document-templates'] });
    },
    onError: (err: any) => {
      toast.error(`Errore nella creazione del modello: ${err?.message}`);
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiFetch<DocumentTemplateRecord>(`/admin/documents/templates/${id}/duplicate`, {
        method: 'POST',
      });
    },
    onSuccess: (duplicated) => {
      toast.success(`Modello duplicato con successo: "${duplicated.name}"`);
      queryClient.invalidateQueries({ queryKey: ['admin-document-templates'] });
    },
    onError: (err: any) => {
      toast.error(`Errore nella duplicazione del modello: ${err?.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateDocumentTemplateDto }) => {
      return apiFetch<DocumentTemplateRecord>(`/admin/documents/templates/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    onSuccess: (updated) => {
      toast.success(`Modello "${updated.name}" salvato con successo!`);
      queryClient.invalidateQueries({ queryKey: ['admin-document-templates'] });
    },
    onError: (err: any) => {
      toast.error(`Errore nel salvataggio del modello: ${err?.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiFetch(`/admin/documents/templates/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      toast.success('Modello eliminato con successo!');
      queryClient.invalidateQueries({ queryKey: ['admin-document-templates'] });
    },
    onError: (err: any) => {
      toast.error(`Errore nell'eliminazione del modello: ${err?.message}`);
    },
  });

  return {
    templates,
    isLoading,
    refetch,
    createTemplate: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    duplicateTemplate: duplicateMutation.mutateAsync,
    isDuplicating: duplicateMutation.isPending,
    updateTemplate: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteTemplate: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
