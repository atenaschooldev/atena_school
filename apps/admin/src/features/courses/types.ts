export type Level = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
export const LEVELS: Level[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

export type CourseStatus = "attivo" | "in-programmazione" | "concluso" | "archiviato";

export interface Course {
  id: string;
  nome: string; // mapped to name
  categoria: string;
  prezzo: number;
  stato: CourseStatus;
  foto?: string; // mapped to photoUrl
  descrizione: string;
  insegnanteId: string;
  insegnanteIds: string[];
  teacherName?: string | null;
  
  // New fields
  lessonsPerWeek: number | null;
  sortOrder: number | null;
  scheduleType: string | null;
  totalLessons: number | null;
  scheduleDays: string[];
  startTime: string | null;
  endTime: string | null;
  lessonDurationMinutes: number | null;
  totalHours: number | null;
  courseFormat: string | null;
  slug: string | null;
}

export interface CourseFormValues {
  nome: string;
  categoria: string;
  prezzo: number;
  stato: CourseStatus;
  foto: string;
  descrizione: string;
  insegnanteIds: string[];
  
  // New fields
  lessonsPerWeek: number | null;
  sortOrder: number;
  scheduleType: string;
  totalLessons: number | null;
  scheduleDays: string[];
  startTime: string;
  endTime: string;
  lessonDurationMinutes: number | null;
  totalHours: number | null;
  courseFormat: string;
  slug: string;
}

export interface CourseApiResponse {
  id: string;
  name: string;
  title: string;
  category: string | null;
  price: number | null;
  status: string | null;
  photoUrl: string | null;
  description: string | null;
  teacherId: string | null;
  teacherName: string | null;
  lessonsPerWeek: number | null;
  sortOrder: number | null;
  scheduleType: string | null;
  totalLessons: number | null;
  scheduleDays: string[] | null;
  startTime: string | null;
  endTime: string | null;
  lessonDurationMinutes: number | null;
  totalHours: number | null;
  courseFormat: string | null;
  slug: string | null;
  updatedAt: string | null;
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
    archived: "archiviato",
    "in-programmazione": "in-programmazione",
    attivo: "attivo",
    concluso: "concluso",
    archiviato: "archiviato",
  };

  return {
    id: api.id,
    nome: api.name || api.title || "",
    categoria: api.category || "",
    prezzo: Number(api.price || 0),
    stato: statusMap[api.status || "active"] || "attivo",
    foto: api.photoUrl || undefined,
    descrizione: api.description || "",
    insegnanteId: api.teacherId || "",
    insegnanteIds: api.teacherId ? [api.teacherId] : [],
    teacherName: api.teacherName || null,
    
    lessonsPerWeek: api.lessonsPerWeek ?? null,
    sortOrder: api.sortOrder ?? 0,
    scheduleType: api.scheduleType ?? "",
    totalLessons: api.totalLessons ?? null,
    scheduleDays: api.scheduleDays ?? [],
    startTime: api.startTime ?? "",
    endTime: api.endTime ?? "",
    lessonDurationMinutes: api.lessonDurationMinutes ?? null,
    totalHours: api.totalHours ?? null,
    courseFormat: api.courseFormat ?? "",
    slug: api.slug ?? "",
  };
}

export function mapCourseToApiPayload(
  form: CourseFormValues,
): Record<string, unknown> {
  const statusMap: Record<CourseStatus, string> = {
    attivo: "active",
    "in-programmazione": "draft",
    concluso: "concluded",
    archiviato: "archived",
  };

  const primaryId = form.insegnanteIds[0] || "";

  return {
    title: form.nome,
    name: form.nome,
    category: form.categoria,
    price: Number(form.prezzo || 0),
    status: statusMap[form.stato],
    teacherId: primaryId || null,
    description: form.descrizione,
    photoUrl: form.foto || null,
    
    lessonsPerWeek: form.lessonsPerWeek != null ? Number(form.lessonsPerWeek) : null,
    sortOrder: Number(form.sortOrder || 0),
    scheduleType: form.scheduleType || null,
    totalLessons: form.totalLessons != null ? Number(form.totalLessons) : null,
    scheduleDays: form.scheduleDays || [],
    startTime: form.startTime || null,
    endTime: form.endTime || null,
    lessonDurationMinutes: form.lessonDurationMinutes != null ? Number(form.lessonDurationMinutes) : null,
    totalHours: form.totalHours != null ? Number(form.totalHours) : null,
    courseFormat: form.courseFormat || null,
    slug: form.slug || null,
  };
}
