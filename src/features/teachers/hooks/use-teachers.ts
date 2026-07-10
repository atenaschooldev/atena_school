import { useState, useMemo } from "react";
import { useAppStore } from "@/stores/app-store";
import { type Teacher, type TeacherFormValues } from "../types";
import { type DocumentRecord } from "@/features/documents";
import { toast } from "sonner";

export function useTeachers() {
  const teachers = useAppStore((s) => s.teachers);
  const addTeacher = useAppStore((s) => s.addTeacher);
  const updateTeacher = useAppStore((s) => s.updateTeacher);
  const removeTeacher = useAppStore((s) => s.removeTeacher);
  const documents = useAppStore((s) => s.documents);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Teacher | null>(null);

  const [previewDoc, setPreviewDoc] = useState<DocumentRecord | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const handleNewClick = () => {
    setEditing(null);
    setOpen(true);
  };

  const handleEditClick = (teacher: Teacher) => {
    setEditing(teacher);
    setOpen(true);
  };

  const handleDeleteClick = (teacher: Teacher) => {
    removeTeacher(teacher.id);
    toast.success("Insegnante eliminato");
  };

  const handleDeleteSelected = (ids: string[]) => {
    ids.forEach((id) => removeTeacher(id));
    toast.success("Insegnanti eliminati");
  };

  const handleFormSubmit = (formData: TeacherFormValues) => {
    const payload = {
      ...formData,
      oreSettimana: editing ? editing.oreSettimana : 0,
    };
    if (editing) {
      updateTeacher(editing.id, payload);
      toast.success("Insegnante aggiornato");
    } else {
      addTeacher(payload);
      toast.success("Insegnante creato");
    }
    setOpen(false);
    setEditing(null);
  };

  const handleViewDocument = (teacher: Teacher) => {
    const doc = documents.find(
      (d) =>
        d.studentName.toLowerCase() === teacher.nome.toLowerCase() &&
        d.studentLastName.toLowerCase() === teacher.cognome.toLowerCase(),
    );
    if (doc) {
      setPreviewDoc(doc);
      setPreviewOpen(true);
    } else {
      toast.error("Nessun contratto di assunzione trovato per questo insegnante.");
    }
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setEditing(null);
  };

  const handleClosePreview = () => {
    setPreviewOpen(false);
    setPreviewDoc(null);
  };

  const initialFormValues = useMemo<TeacherFormValues>(() => {
    if (editing) {
      return {
        nome: editing.nome,
        cognome: editing.cognome,
        email: editing.email,
        telefono: editing.telefono || "",
        esperienzaAnni: editing.esperienzaAnni || 0,
        esperienzaMesi: editing.esperienzaMesi || 0,
        stato: editing.stato || "attivo",
        dataNascita: editing.dataNascita || "",
        dataAssunzione: editing.dataAssunzione || "",
        foto: editing.foto || "",
        corsiIds: editing.corsiIds || [],
      };
    }
    return {
      nome: "",
      cognome: "",
      email: "",
      telefono: "",
      esperienzaAnni: 0,
      esperienzaMesi: 0,
      stato: "attivo",
      dataNascita: "",
      dataAssunzione: new Date().toISOString().slice(0, 10),
      foto: "",
      corsiIds: [],
    };
  }, [editing]);

  return {
    teachers,
    documents,
    open,
    editing,
    previewDoc,
    previewOpen,
    initialFormValues,
    handleNewClick,
    handleEditClick,
    handleDeleteClick,
    handleDeleteSelected,
    handleFormSubmit,
    handleViewDocument,
    handleCloseDialog,
    handleClosePreview,
  };
}
