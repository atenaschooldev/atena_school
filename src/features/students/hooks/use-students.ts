import { useState, useMemo } from "react";
import { useAppStore } from "@/stores/app-store";
import { type Student, type StudentStatus, type StudentFormValues } from "../types";
import { type Level } from "@/features/courses";
import { type DocumentRecord } from "@/features/documents";
import { CONTRATTI } from "@/lib/utils";
import { toast } from "sonner";

export function useStudents() {
  const students = useAppStore((s) => s.students);
  const documents = useAppStore((s) => s.documents);
  const addStudent = useAppStore((s) => s.addStudent);
  const updateStudent = useAppStore((s) => s.updateStudent);
  const removeStudent = useAppStore((s) => s.removeStudent);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);

  const [previewDoc, setPreviewDoc] = useState<DocumentRecord | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const handleNewClick = () => {
    setEditing(null);
    setOpen(true);
  };

  const handleEditClick = (student: Student) => {
    setEditing(student);
    setOpen(true);
  };

  const handleDeleteClick = (student: Student) => {
    removeStudent(student.id);
    toast.success("Studente eliminato");
  };

  const handleDeleteSelected = (ids: string[]) => {
    ids.forEach((id) => removeStudent(id));
    toast.success("Studenti eliminati");
  };

  const handleLevelChange = (studentId: string, level: Level) => {
    updateStudent(studentId, { livello: level });
    toast.success(`Livello aggiornato a ${level}`);
  };

  const handleStatusChange = (studentId: string, status: StudentStatus) => {
    updateStudent(studentId, { stato: status });
    toast.success(`Stato aggiornato a ${status}`);
  };

  const handleViewDocument = (student: Student) => {
    const doc = documents.find(
      (d) =>
        d.studentName.toLowerCase() === student.nome.toLowerCase() &&
        d.studentLastName.toLowerCase() === student.cognome.toLowerCase(),
    );
    if (doc) {
      setPreviewDoc(doc);
      setPreviewOpen(true);
    } else {
      toast.error("Nessun contratto di iscrizione trovato per questo studente.");
    }
  };

  const handleFormSubmit = (formData: StudentFormValues) => {
    if (editing) {
      updateStudent(editing.id, formData);
      toast.success("Studente aggiornato");
    } else {
      addStudent(formData);
      toast.success("Studente aggiunto");
    }
    setOpen(false);
    setEditing(null);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setEditing(null);
  };

  const handleClosePreview = () => {
    setPreviewOpen(false);
    setPreviewDoc(null);
  };

  const initialFormValues = useMemo<StudentFormValues>(() => {
    if (editing) {
      return {
        nome: editing.nome,
        cognome: editing.cognome,
        email: editing.email,
        telefono: editing.telefono,
        livello: editing.livello,
        dataNascita: editing.dataNascita,
        stato: editing.stato,
        foto: editing.foto ?? "",
        dataIscrizione: editing.dataIscrizione,
        contratto: editing.contratto ?? CONTRATTI[0],
        corsiIds: [...editing.corsiIds],
      };
    }
    return {
      nome: "",
      cognome: "",
      email: "",
      telefono: "",
      livello: "A1" as Level,
      dataNascita: "2005-01-01",
      foto: "",
      stato: "attivo" as StudentStatus,
      dataIscrizione: new Date().toISOString().slice(0, 10),
      contratto: CONTRATTI[0] as string,
      corsiIds: [],
    };
  }, [editing]);

  return {
    students,
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
    handleLevelChange,
    handleStatusChange,
    handleViewDocument,
    handleFormSubmit,
    handleCloseDialog,
    handleClosePreview,
  };
}
