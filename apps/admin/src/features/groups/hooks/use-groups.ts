import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import type {
  Group,
  CreateGroupFormValues,
  UpdateGroupFormValues,
  AddGroupMemberFormValues,
} from "../types";

export function useGroups(filters?: {
  courseId?: string;
  teacherId?: string;
  status?: number;
  search?: string;
}) {
  const queryClient = useQueryClient();

  const queryParams = new URLSearchParams();
  if (filters?.courseId) queryParams.set("courseId", filters.courseId);
  if (filters?.teacherId) queryParams.set("teacherId", filters.teacherId);
  if (filters?.status) queryParams.set("status", String(filters.status));
  if (filters?.search) queryParams.set("search", filters.search);

  const endpoint = `/admin/groups${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

  const {
    data: groups = [],
    isLoading,
    refetch,
  } = useQuery<Group[]>({
    queryKey: ["groups", filters],
    queryFn: async () => {
      const data = await apiFetch<Group[]>(endpoint);
      return Array.isArray(data) ? data : [];
    },
    staleTime: 1000 * 20,
  });

  const createGroupMutation = useMutation({
    mutationFn: async (values: CreateGroupFormValues) => {
      return apiFetch<Group>("/admin/groups", {
        method: "POST",
        body: JSON.stringify(values),
      });
    },
    onSuccess: () => {
      toast.success("Nuovo gruppo creato con successo");
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
    },
    onError: (e: any) => {
      toast.error(e?.message || "Errore nella creazione del gruppo");
    },
  });

  const updateGroupMutation = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: UpdateGroupFormValues }) => {
      return apiFetch<Group>(`/admin/groups/${id}`, {
        method: "PUT",
        body: JSON.stringify(values),
      });
    },
    onSuccess: () => {
      toast.success("Gruppo aggiornato");
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
    onError: (e: any) => {
      toast.error(e?.message || "Errore nell'aggiornamento del gruppo");
    },
  });

  const deleteGroupMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiFetch(`/admin/groups/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      toast.success("Gruppo eliminato");
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
    onError: (e: any) => {
      toast.error(e?.message || "Errore nell'eliminazione del gruppo");
    },
  });

  const addMemberMutation = useMutation({
    mutationFn: async ({ groupId, values }: { groupId: string; values: AddGroupMemberFormValues }) => {
      return apiFetch(`/admin/groups/${groupId}/members`, {
        method: "POST",
        body: JSON.stringify(values),
      });
    },
    onSuccess: () => {
      toast.success("Studente aggiunto al gruppo");
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
    onError: (e: any) => {
      toast.error(e?.message || "Errore nell'aggiunta dello studente");
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: async ({ groupId, studentId }: { groupId: string; studentId: string }) => {
      return apiFetch(`/admin/groups/${groupId}/members/${studentId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      toast.success("Studente rimosso dal gruppo");
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
    onError: (e: any) => {
      toast.error(e?.message || "Errore nella rimozione dello studente");
    },
  });

  return {
    groups,
    isLoading,
    refetch,
    createGroup: createGroupMutation.mutateAsync,
    isCreating: createGroupMutation.isPending,
    updateGroup: updateGroupMutation.mutateAsync,
    isUpdating: updateGroupMutation.isPending,
    deleteGroup: deleteGroupMutation.mutateAsync,
    isDeleting: deleteGroupMutation.isPending,
    addMember: addMemberMutation.mutateAsync,
    isAddingMember: addMemberMutation.isPending,
    removeMember: removeMemberMutation.mutateAsync,
    isRemovingMember: removeMemberMutation.isPending,
  };
}
