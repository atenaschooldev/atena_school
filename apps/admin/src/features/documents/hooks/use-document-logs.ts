import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api';
import type { DocumentLogRecord } from '../types';

export function useDocumentLogs(documentId?: string) {
  const queryClient = useQueryClient();
  const endpoint = `/admin/documents/logs${documentId ? `?document_id=${documentId}` : ''}`;

  const {
    data: logs = [],
    isLoading,
    refetch,
  } = useQuery<DocumentLogRecord[]>({
    queryKey: ['admin-document-logs', documentId],
    queryFn: async () => {
      try {
        const res = await apiFetch<DocumentLogRecord[]>(endpoint);
        return Array.isArray(res) ? res : [];
      } catch (err) {
        console.error('Failed to fetch document logs:', err);
        return [];
      }
    },
    staleTime: 10 * 1000,
  });

  const deleteLogMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiFetch(`/admin/documents/logs/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      toast.success('Voce di log eliminata con successo');
      queryClient.invalidateQueries({ queryKey: ['admin-document-logs'] });
    },
    onError: (err: any) => {
      toast.error(`Errore nell'eliminazione del log: ${err?.message}`);
    },
  });

  const clearLogsMutation = useMutation({
    mutationFn: async () => {
      return apiFetch('/admin/documents/logs', {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      toast.success('Registro eventi svuotato con successo');
      queryClient.invalidateQueries({ queryKey: ['admin-document-logs'] });
    },
    onError: (err: any) => {
      toast.error(`Errore nello svuotamento dei log: ${err?.message}`);
    },
  });

  return {
    logs,
    isLoading,
    refetch,
    deleteLog: deleteLogMutation.mutateAsync,
    isDeletingLog: deleteLogMutation.isPending,
    clearLogs: clearLogsMutation.mutateAsync,
    isClearingLogs: clearLogsMutation.isPending,
  };
}
