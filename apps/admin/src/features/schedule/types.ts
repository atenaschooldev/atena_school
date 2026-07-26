export type Lesson = {
  id: string;
  corsoId: string;
  insegnanteId: string;
  giorno: number;
  data?: string;
  oraInizio: string;
  oraFine: string;
  aula: string;
  isOnline?: boolean;
  meetLink?: string;
  corsoName?: string | null;
  insegnanteName?: string | null;
};

export type LessonFormValues = Omit<Lesson, "id">;

export interface ScheduleApiResponse {
  id: string;
  course_id: string;
  teacher_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  room: string | null;
  format: string;
  meeting_url: string | null;
  start_date: string;
  end_date: string;
  course_name: string | null;
  teacher_name: string | null;
}

export function mapApiToLesson(api: ScheduleApiResponse): Lesson {
  const backendDay = api.day_of_week ?? new Date(api.start_date).getDay();
  const giorno = (backendDay + 6) % 7;

  const isOnline = api.format === "online" || !!api.meeting_url;

  return {
    id: api.id,
    corsoId: api.course_id,
    insegnanteId: api.teacher_id,
    giorno,
    oraInizio: api.start_time || "09:00",
    oraFine: api.end_time || "10:30",
    aula: api.room || "Aula 1",
    isOnline,
    meetLink: api.meeting_url || undefined,
    corsoName: api.course_name || null,
    insegnanteName: api.teacher_name || null,
  };
}

export function mapLessonToApiPayload(
  lesson: LessonFormValues,
): Record<string, unknown> {
  const backendDay = (lesson.giorno + 1) % 7;

  return {
    course_id: lesson.corsoId,
    teacher_id: lesson.insegnanteId,
    room: lesson.aula || null,
    day_of_week: backendDay,
    start_time: lesson.oraInizio,
    end_time: lesson.oraFine,
    format: lesson.isOnline ? "online" : "offline",
    meeting_url: lesson.meetLink || (lesson.isOnline ? "https://meet.google.com/mock-meet" : null),
    start_date: lesson.data || new Date().toISOString(),
  };
}
