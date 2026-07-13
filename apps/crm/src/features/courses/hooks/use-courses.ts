import { useState, useMemo } from "react";
import { useAppStore } from "@/stores/app-store";
import { type Course, type CourseFormValues } from "../types";
import { toast } from "sonner";

export function useCourses() {
  const coursesList = useAppStore((s) => s.courses);
  const addCourse = useAppStore((s) => s.addCourse);
  const updateCourse = useAppStore((s) => s.updateCourse);
  const removeCourse = useAppStore((s) => s.removeCourse);
  const teachers = useAppStore((s) => s.teachers);
  const students = useAppStore((s) => s.students);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);

  const handleNewClick = () => {
    setEditing(null);
    setOpen(true);
  };

  const handleEditClick = (course: Course) => {
    setEditing(course);
    setOpen(true);
  };

  const handleDeleteClick = (course: Course) => {
    removeCourse(course.id);
    toast.success("Corso eliminato");
  };

  const handleDeleteSelected = (ids: string[]) => {
    ids.forEach((id) => removeCourse(id));
    toast.success("Corsi eliminati");
  };

  const handleFormSubmit = (formData: CourseFormValues) => {
    // Primary teacher is mapped to the first teacher in teachers array
    const primaryId = formData.insegnanteIds[0] || "";
    const payload = {
      ...formData,
      insegnanteId: primaryId,
    };
    if (editing) {
      updateCourse(editing.id, payload);
      toast.success("Corso aggiornato");
    } else {
      addCourse(payload);
      toast.success("Corso creato");
    }
    setOpen(false);
    setEditing(null);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setEditing(null);
  };

  const initialFormValues = useMemo<CourseFormValues>(() => {
    if (editing) {
      return {
        nome: editing.nome,
        livello: editing.livello || "A1",
        insegnanteIds: editing.insegnanteIds || [editing.insegnanteId].filter(Boolean),
        moduli: editing.moduli || 1,
        capienza: editing.capienza || 10,
        colore: editing.colore || "chart-1",
        descrizione: editing.descrizione || "",
        foto: editing.foto || "",
        categoria: editing.categoria || "General English",
        durata: editing.durata || "60 ore",
        prezzo: editing.prezzo || 0,
        stato: editing.stato || "attivo",
      };
    }
    return {
      nome: "",
      livello: "A1",
      insegnanteIds: [],
      moduli: 8,
      capienza: 15,
      colore: "chart-1",
      descrizione: "",
      foto: "",
      categoria: "General English",
      durata: "60 ore",
      prezzo: 0,
      stato: "attivo",
    };
  }, [editing]);

  return {
    coursesList,
    teachers,
    students,
    open,
    editing,
    initialFormValues,
    handleNewClick,
    handleEditClick,
    handleDeleteClick,
    handleDeleteSelected,
    handleFormSubmit,
    handleCloseDialog,
  };
}
