import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api';
import {
  DocumentCategoryType,
  DocumentRecord,
  DocumentStatus,
  DocumentType,
  GenerateDocumentDto,
} from '../types';

export function useDocuments(filters?: {
  category_type?: DocumentCategoryType;
  document_type?: DocumentType;
  status?: DocumentStatus;
  search?: string;
  student_id?: string;
  booking_id?: string;
}) {
  const queryClient = useQueryClient();

  const queryParams = new URLSearchParams();
  if (filters?.category_type) queryParams.set('category_type', String(filters.category_type));
  if (filters?.document_type) queryParams.set('document_type', String(filters.document_type));
  if (filters?.status) queryParams.set('status', String(filters.status));
  if (filters?.search) queryParams.set('search', filters.search);
  if (filters?.student_id) queryParams.set('student_id', filters.student_id);
  if (filters?.booking_id) queryParams.set('booking_id', filters.booking_id);

  const queryString = queryParams.toString();
  const endpoint = `/admin/documents${queryString ? `?${queryString}` : ''}`;

  const {
    data: documents = [],
    isLoading,
    refetch,
  } = useQuery<DocumentRecord[]>({
    queryKey: ['admin-documents', filters],
    queryFn: async () => {
      try {
        const res = await apiFetch<DocumentRecord[]>(endpoint);
        return Array.isArray(res) ? res : [];
      } catch (err) {
        console.error('Failed to fetch documents:', err);
        return [];
      }
    },
    staleTime: 0,
  });

  const generateMutation = useMutation({
    mutationFn: async (payload: GenerateDocumentDto) => {
      return apiFetch<DocumentRecord>('/admin/documents/generate', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    onSuccess: (newDoc) => {
      toast.success(`Documento ${newDoc.document_number} generato con successo!`);
      queryClient.invalidateQueries({ queryKey: ['admin-documents'] });
      queryClient.invalidateQueries({ queryKey: ['admin-document-logs'] });
    },
    onError: (err: any) => {
      toast.error(`Errore nella generazione del documento: ${err?.message || 'Errore sconosciuto'}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiFetch(`/admin/documents/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      toast.success('Documento eliminato con successo');
      queryClient.invalidateQueries({ queryKey: ['admin-documents'] });
      queryClient.invalidateQueries({ queryKey: ['admin-document-logs'] });
    },
    onError: (err: any) => {
      toast.error(`Errore nell'eliminazione: ${err?.message}`);
    },
  });

  return {
    documents,
    isLoading,
    refetch,
    generateDocument: generateMutation.mutateAsync,
    isGenerating: generateMutation.isPending,
    deleteDocument: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
