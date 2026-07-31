import { useState, useEffect, useCallback } from "react";
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
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<string>("all");

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const query = selectedRole !== "all" ? `?role=${selectedRole}` : "";
      const data = await apiFetch<User[]>(`/users${query}`);
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to fetch users:", e);
      toast.error("Errore nel caricamento utenti");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [selectedRole]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const addUser = async (values: UserFormValues) => {
    try {
      const newUser = await apiFetch<User>("/users", {
        method: "POST",
        body: JSON.stringify(values),
      });
      setUsers((prev) => [newUser, ...prev]);
      toast.success("Utente creato con successo");
      return newUser;
    } catch (e) {
      console.error("Failed to create user:", e);
      toast.error(e instanceof Error ? e.message : "Errore nella creazione dell'utente");
      throw e;
    }
  };

  const updateUser = async (id: string, values: Partial<User>) => {
    try {
      const updated = await apiFetch<User>(`/users/${id}`, {
        method: "PATCH",
        body: JSON.stringify(values),
      });
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
      toast.success("Utente aggiornato");
      return updated;
    } catch (e) {
      console.error("Failed to update user:", e);
      toast.error("Errore nell'aggiornamento dell'utente");
      throw e;
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await apiFetch<{ success: boolean }>(`/users/${id}`, {
        method: "DELETE",
      });
      setUsers((prev) => prev.filter((u) => u.id !== id));
      toast.success("Utente eliminato");
    } catch (e) {
      console.error("Failed to delete user:", e);
      toast.error("Errore nell'eliminazione dell'utente");
      throw e;
    }
  };

  return {
    users,
    loading,
    selectedRole,
    setSelectedRole,
    addUser,
    updateUser,
    deleteUser,
    refresh: loadUsers,
  };
}
