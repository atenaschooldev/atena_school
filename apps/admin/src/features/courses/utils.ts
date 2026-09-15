import type { Level } from "./types";

export function levelColor(l: Level | string): string {
  switch (l) {
    case "A1":
      return "bg-emerald-100/90 text-emerald-900 border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60";
    case "A2":
      return "bg-amber-100/90 text-amber-900 border-amber-200/80 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60";
    case "B1":
      return "bg-teal-100/90 text-teal-900 border-teal-200/80 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800/60";
    case "B2":
      return "bg-purple-100/90 text-purple-900 border-purple-200/80 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800/60";
    case "C1":
      return "bg-rose-100/90 text-rose-900 border-rose-200/80 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/60";
    case "C2":
      return "bg-slate-200/80 text-slate-900 border-slate-300/80 dark:bg-slate-800/60 dark:text-slate-200 dark:border-slate-700/60";
    default:
      return "bg-indigo-100/90 text-indigo-900 border-indigo-200/80 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800/60";
  }
}

export function levelColorSolid(l: Level | string): string {
  switch (l) {
    case "A1":
      return "bg-emerald-600 text-white border-emerald-600 shadow-md";
    case "A2":
      return "bg-amber-600 text-white border-amber-600 shadow-md";
    case "B1":
      return "bg-teal-600 text-white border-teal-600 shadow-md";
    case "B2":
      return "bg-purple-600 text-white border-purple-600 shadow-md";
    case "C1":
      return "bg-rose-600 text-white border-rose-600 shadow-md";
    case "C2":
      return "bg-slate-700 text-white border-slate-700 shadow-md";
    default:
      return "bg-indigo-600 text-white border-indigo-600 shadow-md";
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
  { value: 1, label: "Di Gruppo" },
  { value: 2, label: "Individuale" },
  { value: 3, label: "Online" },
  { value: 4, label: "Certificazione" },
] as const;

export function formatCourseFormatLabel(fmt?: string | number | null): string {
  if (fmt === null || fmt === undefined || fmt === "") return "Di Gruppo";
  const str = String(fmt).toLowerCase().trim();
  if (str === "1" || str === "group" || str === "gruppo" || str === "di gruppo" || str === "in sede") return "Di Gruppo";
  if (str === "2" || str === "private" || str === "individual" || str === "individuale" || str === "privato") return "Individuale";
  if (str === "3" || str === "online") return "Online";
  if (str === "4" || str === "certification" || str === "certificazione" || str === "esame" || str === "certipass") return "Certificazione";
  if (str === "ibrido" || str === "hybrid") return "Ibrido";
  return str.charAt(0).toUpperCase() + str.slice(1);
}
