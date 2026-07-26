export type Level = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
export const LEVELS: Level[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

export type CourseStatus = "attivo" | "in-programmazione" | "concluso";

export interface Course {
  id: string;
  nome: string;
  livello: Level;
  insegnanteId: string;
  insegnanteIds: string[];
  moduli: number;
  capienza: number;
  colore: string;
  descrizione: string;
  foto?: string;
  categoria: string;
  durata: string;
  prezzo: number;
  stato: CourseStatus;
  studentCount?: number;
  teacherName?: string | null;
}

export interface CourseFormValues {
  nome: string;
  livello: Level;
  insegnanteIds: string[];
  moduli: number;
  capienza: number;
  colore: string;
  descrizione: string;
  foto: string;
  categoria: string;
  durata: string;
  prezzo: number;
  stato: CourseStatus;
}

export interface CourseApiResponse {
  id: string;
  name: string;
  title: string;
  category: string;
  duration: string;
  price: number;
  status: string;
  studentCount: number;
  studentsCount: number;
  teacherId: string | null;
  teacherName: string | null;
  description: string | null;
  imageUrl: string | null;
  level: string | null;
  capacity: number;
}

export function mapApiToCourse(api: CourseApiResponse): Course {
  const statusMap: Record<string, CourseStatus> = {
    active: "attivo",
    published: "attivo",
    draft: "in-programmazione",
    scheduled: "in-programmazione",
    planned: "in-programmazione",
    archived: "concluso",
    completed: "concluso",
    ended: "concluso",
    concluded: "concluso",
    "in-programmazione": "in-programmazione",
    attivo: "attivo",
    concluso: "concluso",
  };

  return {
    id: api.id,
    nome: api.name || api.title || "",
    livello: (api.level as Level) || "A1",
    insegnanteId: api.teacherId || "",
    insegnanteIds: api.teacherId ? [api.teacherId] : [],
    moduli: 8,
    capienza: api.capacity ?? 10,
    colore: "chart-1",
    descrizione: api.description || "",
    foto: api.imageUrl || undefined,
    categoria: api.category || "General English",
    durata: api.duration || "60 ore",
    prezzo: Number(api.price || 0),
    stato: statusMap[api.status] || "attivo",
    studentCount: api.studentCount || api.studentsCount || 0,
    teacherName: api.teacherName || null,
  };
}

export function mapCourseToApiPayload(
  form: CourseFormValues,
): Record<string, unknown> {
  const statusMap: Record<CourseStatus, string> = {
    attivo: "active",
    "in-programmazione": "draft",
    concluso: "archived",
  };

  const primaryId = form.insegnanteIds[0] || "";

  return {
    title: form.nome,
    name: form.nome,
    category: form.categoria,
    duration: form.durata,
    price: Number(form.prezzo || 0),
    status: statusMap[form.stato],
    teacherId: primaryId || null,
    description: form.descrizione,
    imageUrl: form.foto || null,
    level: form.livello,
    capacity: Number(form.capienza || 10),
    studentCount: 0,
  };
}
