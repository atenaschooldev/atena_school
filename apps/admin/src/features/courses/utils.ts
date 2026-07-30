import type { Level } from "./types";

export function levelColor(l: Level): string {
  switch (l) {
    case "A1":
      return "bg-chart-2/15 text-chart-2 border-chart-2/30";
    case "A2":
      return "bg-chart-3/15 text-chart-3 border-chart-3/30";
    case "B1":
      return "bg-chart-1/15 text-chart-1 border-chart-1/30";
    case "B2":
      return "bg-chart-5/15 text-chart-5 border-chart-5/30";
    case "C1":
      return "bg-chart-4/15 text-chart-4 border-chart-4/30";
    case "C2":
      return "bg-primary/15 text-primary border-primary/30";
  }
}

export function levelColorSolid(l: Level): string {
  switch (l) {
    case "A1":
      return "bg-chart-2 text-white border-chart-2 shadow-md";
    case "A2":
      return "bg-chart-3 text-white border-chart-3 shadow-md";
    case "B1":
      return "bg-chart-1 text-white border-chart-1 shadow-md";
    case "B2":
      return "bg-chart-5 text-white border-chart-5 shadow-md";
    case "C1":
      return "bg-chart-4 text-white border-chart-4 shadow-md";
    case "C2":
      return "bg-primary text-primary-foreground border-primary shadow-md";
  }
}

export const COURSE_CATEGORIES = [
  { value: "Certipass", label: "Certipass" },
  { value: "languages", label: "Lingue" },
] as const;

export function formatCategoryLabel(category?: string | null): string {
  if (!category) return "Generale";
  const lower = category.toLowerCase().trim();
  if (lower.includes("certipass")) return "Certipass";
  if (lower.includes("lang") || lower.includes("lingu")) return "Lingue";
  if (lower.includes("acad")) return "Accademico";
  return category;
}

export function categoryColor(category?: string | null): string {
  if (!category) return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200/60";
  const lower = category.toLowerCase().trim();
  if (lower.includes("certipass")) {
    return "bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300 border-sky-200/60";
  }
  if (lower.includes("lang") || lower.includes("lingu")) {
    return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200/60";
  }
  if (lower.includes("acad")) {
    return "bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border-purple-200/60";
  }
  return "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200/60";
}

export const COURSE_FORMAT_OPTIONS = [
  { value: "group", label: "Di Gruppo" },
  { value: "private", label: "Individuale" },
  { value: "certification", label: "Certificazione" },
] as const;

export function formatCourseFormatLabel(fmt?: string | null): string {
  if (!fmt) return "In Sede";
  const lower = fmt.toLowerCase().trim();
  if (lower === "group" || lower === "gruppo" || lower === "di gruppo") return "Di Gruppo";
  if (lower === "private" || lower === "individuale" || lower === "privato") return "Individuale";
  if (lower === "certification" || lower === "certificazione") return "Certificazione";
  if (lower === "in sede" || lower === "in_sede") return "In Sede";
  if (lower === "online") return "Online";
  if (lower === "ibrido" || lower === "hybrid") return "Ibrido";
  return fmt.charAt(0).toUpperCase() + fmt.slice(1);
}
