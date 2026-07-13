import type { Level } from "@/features/courses";

export type StudentStatus = "attivo" | "sospeso" | "ritirato";

export interface Student {
  id: string;
  nome: string;
  cognome: string;
  email: string;
  telefono: string;
  livello: Level;
  dataNascita: string; // ISO
  corsiIds: string[];
  documenti: number;
  stato: StudentStatus;
  dataIscrizione: string;
  foto?: string;
  contratto?: string;
}

export interface StudentFormValues {
  nome: string;
  cognome: string;
  email: string;
  telefono: string;
  livello: Level;
  dataNascita: string;
  foto: string;
  stato: StudentStatus;
  dataIscrizione: string;
  contratto: string;
  corsiIds: string[];
}
