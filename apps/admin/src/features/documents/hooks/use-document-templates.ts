import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api';
import type { DocumentTemplateRecord, UpdateDocumentTemplateDto } from '../types';

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

  return {
    templates,
    isLoading,
    refetch,
    updateTemplate: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
}
