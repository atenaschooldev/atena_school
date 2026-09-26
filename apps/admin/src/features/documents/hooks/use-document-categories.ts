import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import type { DocumentCategoryRecord } from '../types';

export function useDocumentCategories() {
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

  return {
    categories,
    isLoading,
    refetch,
  };
}
