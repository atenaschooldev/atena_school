export interface Teacher {
  id: string;
  nome: string;
  cognome: string;
  email: string;
  corsiIds: string[];
  oreSettimana: number;
  stato: "attivo" | "in-ferie";
  telefono: string;
  esperienzaAnni: number;
  esperienzaMesi: number;
  dataNascita: string;
  dataAssunzione: string;
  foto?: string;
  documenti: number;
}

export interface TeacherFormValues {
  nome: string;
  cognome: string;
  email: string;
  telefono: string;
  esperienzaAnni: number;
  esperienzaMesi: number;
  stato: "attivo" | "in-ferie";
  dataNascita: string;
  dataAssunzione: string;
  foto: string;
  corsiIds: string[];
}
