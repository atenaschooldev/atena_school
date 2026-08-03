import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type User, type UserFormValues } from "../types";
import { toast } from "sonner";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
const ADMIN_TOKEN =
  import.meta.env.VITE_ADMIN_TOKEN || "DEVELOPMENT_TEST_TOKEN";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BACKEND_URL}/api/v1${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ADMIN_TOKEN}`,
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Backend error ${res.status}: ${text}`);
  }

  if (res.status === 204) {
    return {} as T;
  }

  const text = await res.text();
  return text ? JSON.parse(text) : ({} as T);
}

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
      const data = await apiFetch<User[]>(`/users${query}`);
      return Array.isArray(data) ? data : [];
    },
    staleTime: 1000 * 30, // 30s stale time for instant 0ms cached render
  });

  const addMutation = useMutation({
    mutationFn: async (values: UserFormValues) => {
      return apiFetch<User>("/users", {
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
      return apiFetch<User>(`/users/${id}`, {
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
      return apiFetch<{ success: boolean }>(`/users/${id}`, { method: "DELETE" });
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
