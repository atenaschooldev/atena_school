import { Label } from "@/components/ui/label";

export const CATEGORIES = [
  "Corsi di lingua",
  "Recupero materie scolastiche",
  "Tutoraggio & Doposcuola",
  "Specialistico"
];

export function LangSection({ lang, flag }: { lang: "IT" | "EN"; flag: string }) {
  return (
    <div className="flex items-center gap-3 mt-6 mb-3">
      <span className="text-base font-bold tracking-widest uppercase text-muted-foreground">
        {flag} {lang}
      </span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

export const commonFormStyles = {
  form: "space-y-4",
  fieldGroup: "grid gap-2",
  error: "text-red-500 text-sm",
  submitSection: "pt-6",
};
