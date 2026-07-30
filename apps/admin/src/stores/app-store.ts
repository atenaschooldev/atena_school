import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type Course, type Level } from "@/features/courses/types";
import { courses as seedCourses } from "@/lib/mock-data";

export type Role = "admin" | "insegnante" | "studente";

export interface TableActions {
  cols: { key: string; label: string }[];
  hiddenCols: Set<string>;
  toggleCol: (key: string) => void;
  exportToCSV: () => void;
  clearFilters?: () => void;
  activeFiltersColCount?: number;
}

type State = {
  role: Role;
  setRole: (r: Role) => void;
  courses: Course[];
  addCourse: (c: Omit<Course, "id">) => void;
  updateCourse: (id: string, patch: Partial<Course>) => void;
  removeCourse: (id: string) => void;
  viewMode: Record<string, "table" | "cards">;
  setViewMode: (key: string, mode: "table" | "cards") => void;
  tableSearch: string;
  setTableSearch: (s: string) => void;
  tableActions: TableActions | null;
  setTableActions: (actions: TableActions | null) => void;
};

export const useAppStore = create<State>()(
  persist(
    (set) => ({
      role: "admin",
      setRole: (role) => set({ role }),
      courses: seedCourses,
      addCourse: (data) =>
        set((s) => ({
          courses: [
            ...s.courses,
            {
              ...data,
              id: `c${Date.now()}`,
            } as Course,
          ],
        })),
      updateCourse: (id, patch) =>
        set((s) => ({
          courses: s.courses.map((co) => (co.id === id ? { ...co, ...patch } : co)),
        })),
      removeCourse: (id) =>
        set((s) => ({
          courses: s.courses.filter((co) => co.id !== id),
        })),
      viewMode: { corsi: "table", orari: "table", prenotazioni: "table" },
      setViewMode: (key, mode) =>
        set((s) => ({
          viewMode: {
            ...s.viewMode,
            [key]: mode,
          },
        })),
      tableSearch: "",
      setTableSearch: (tableSearch) => set({ tableSearch }),
      tableActions: null,
      setTableActions: (tableActions) => set({ tableActions }),
    }),
    {
      name: "atena-scuola",
      partialize: (state) => ({
        role: state.role,
        courses: state.courses,
        viewMode: state.viewMode,
      }),
    },
  ),
);

export const LEVELS_UI: Level[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
