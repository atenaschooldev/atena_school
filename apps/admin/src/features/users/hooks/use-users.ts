import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type User, type UserFormValues } from "../types";
import { toast } from "sonner";

import { apiFetch } from "@/lib/api";

export function useUsers() {
  const queryClient = useQueryClient();
  const [selectedRole, setSelectedRole] = useState<string>("all");

  const {
    data: users = [],
    isLoading,
    refetch,
  } = useQuery<User[]>({
    queryKey: ["users", selectedRole],
    queryFn: async () => {
      const query = selectedRole !== "all" ? `?role=${selectedRole}` : "";
      const data = await apiFetch<User[]>(`/admin/users${query}`);
      return Array.isArray(data) ? data : [];
    },
    staleTime: 1000 * 30, // 30s stale time for instant 0ms cached render
  });

  const addMutation = useMutation({
    mutationFn: async (values: UserFormValues) => {
      return apiFetch<User>("/admin/users", {
        method: "POST",
        body: JSON.stringify(values),
      });
    },
    onSuccess: () => {
      toast.success("Utente creato con successo");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (e) => {
      console.error("Failed to create user:", e);
      toast.error(e instanceof Error ? e.message : "Errore nella creazione dell'utente");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Partial<User> }) => {
      return apiFetch<User>(`/admin/users/${id}`, {
        method: "PATCH",
        body: JSON.stringify(values),
      });
    },
    onSuccess: () => {
      toast.success("Utente aggiornato");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (e) => {
      console.error("Failed to update user:", e);
      toast.error("Errore nell'aggiornamento dell'utente");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiFetch<{ success: boolean }>(`/admin/users/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      toast.success("Utente eliminato");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (e) => {
      console.error("Failed to delete user:", e);
      toast.error("Errore nell'eliminazione dell'utente");
    },
  });

  return {
    users,
    loading: isLoading,
    selectedRole,
    setSelectedRole,
    addUser: addMutation.mutateAsync,
    updateUser: (id: string, values: Partial<User>) => updateMutation.mutateAsync({ id, values }),
    deleteUser: deleteMutation.mutateAsync,
    refresh: refetch,
  };
}
