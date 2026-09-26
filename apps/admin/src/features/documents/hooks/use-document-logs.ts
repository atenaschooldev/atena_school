import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { DocumentLogRecord } from '../types';

export function useDocumentLogs(documentId?: string) {
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

  return {
    logs,
    isLoading,
    refetch,
  };
}
