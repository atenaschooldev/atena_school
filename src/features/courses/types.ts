export type Level = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
export const LEVELS: Level[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

export interface Course {
  id: string;
  nome: string;
  livello: Level;
  insegnanteId: string;
  insegnanteIds: string[];
  moduli: number;
  capienza: number;
  colore: string; // tailwind token key
  descrizione: string;
  foto?: string;
  categoria: string;
  durata: string;
  prezzo: number;
  stato: "attivo" | "in-programmazione" | "concluso";
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
  stato: "attivo" | "in-programmazione" | "concluso";
}
