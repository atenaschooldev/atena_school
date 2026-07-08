export type Lesson = {
  id: string;
  corsoId: string;
  insegnanteId: string; // can differ from course's default teacher
  giorno: number; // 0=lun ... 5=sab (for recurring lessons)
  data?: string; // ISO "YYYY-MM-DD" — if present: one-off lesson
  oraInizio: string; // "HH:mm"
  oraFine: string;
  aula: string;
  isOnline?: boolean;
  meetLink?: string; // auto-generated Google Meet link
};

export type LessonFormValues = Omit<Lesson, "id">;
