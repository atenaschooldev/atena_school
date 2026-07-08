import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type Student, type StudentStatus } from "@/features/students";
import { type Teacher } from "@/features/teachers";
import { type Course, type Level } from "@/features/courses";
import { type DocumentRecord } from "@/features/documents";
import {
  students as seedStudents,
  teachers as seedTeachers,
  courses as seedCourses,
  documents as seedDocuments,
} from "@/lib/mock-data";

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
  students: Student[];
  addStudent: (
    s: Omit<Student, "id" | "documenti" | "dataIscrizione"> & {
      documenti?: number;
      dataIscrizione?: string;
    },
  ) => void;
  updateStudent: (id: string, patch: Partial<Student>) => void;
  updateStudentStatus: (id: string, stato: StudentStatus) => void;
  removeStudent: (id: string) => void;
  documents: DocumentRecord[];
  addDocument: (doc: Omit<DocumentRecord, "id" | "createdAt">) => void;
  teachers: Teacher[];
  addTeacher: (
    t: Omit<Teacher, "id" | "documenti" | "dataIscrizione"> & {
      documenti?: number;
    },
  ) => void;
  updateTeacher: (id: string, patch: Partial<Teacher>) => void;
  removeTeacher: (id: string) => void;
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
      students: seedStudents,
      addStudent: (data) =>
        set((s) => ({
          students: [
            ...s.students,
            {
              ...data,
              id: `s${Date.now()}`,
              documenti: data.documenti ?? 0,
              dataIscrizione: data.dataIscrizione ?? new Date().toISOString().slice(0, 10),
            } as Student,
          ],
        })),
      updateStudent: (id, patch) =>
        set((s) => ({
          students: s.students.map((st) => (st.id === id ? { ...st, ...patch } : st)),
        })),
      updateStudentStatus: (id, stato) =>
        set((s) => ({ students: s.students.map((st) => (st.id === id ? { ...st, stato } : st)) })),
      removeStudent: (id) => set((s) => ({ students: s.students.filter((st) => st.id !== id) })),
      documents: seedDocuments,
      addDocument: (data) =>
        set((s) => {
          const docId = `DOC-2026-${String(s.documents.length + 1).padStart(3, "0")}`;
          const newDoc: DocumentRecord = {
            ...data,
            id: docId,
            createdAt: new Date().toISOString().slice(0, 10),
          };

          // Also update the documents count on the matching student if any
          const matchingStudent = s.students.find(
            (st) =>
              st.nome.toLowerCase() === data.studentName.toLowerCase() &&
              st.cognome.toLowerCase() === data.studentLastName.toLowerCase(),
          );

          let updatedStudents = s.students;
          if (matchingStudent) {
            updatedStudents = s.students.map((st) =>
              st.id === matchingStudent.id ? { ...st, documenti: (st.documenti || 0) + 1 } : st,
            );
          }

          return {
            documents: [...s.documents, newDoc],
            students: updatedStudents,
          };
        }),
      teachers: seedTeachers,
      addTeacher: (data) =>
        set((s) => ({
          teachers: [
            ...s.teachers,
            {
              ...data,
              id: `t${Date.now()}`,
              documenti: data.documenti ?? 0,
            } as Teacher,
          ],
        })),
      updateTeacher: (id, patch) =>
        set((s) => ({
          teachers: s.teachers.map((te) => (te.id === id ? { ...te, ...patch } : te)),
        })),
      removeTeacher: (id) =>
        set((s) => ({
          teachers: s.teachers.filter((te) => te.id !== id),
        })),
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
      viewMode: { studenti: "table", insegnanti: "table", corsi: "table" },
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
        students: state.students,
        documents: state.documents,
        teachers: state.teachers,
        courses: state.courses,
        viewMode: state.viewMode,
      }),
    },
  ),
);

export const LEVELS_UI: Level[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
