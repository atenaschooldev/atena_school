export interface Attendance {
  studentId: string;
  lessonId: string;
  data: string;
  stato: "presente" | "assente" | "ritardo";
}
