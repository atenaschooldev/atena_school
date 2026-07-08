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
