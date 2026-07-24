import { Badge } from "@/components/ui/badge";
import { PillSelect } from "@/components/ui/pill-select";
import { levelColor, levelColorSolid, type Level } from "@/features/courses";
import { LEVELS_UI } from "@/stores/app-store";
import { type StudentStatus } from "../types";

interface LevelBadgeSelectorProps {
  value: Level;
  onChange: (level: Level) => void;
}

export function LevelBadgeSelector({ value, onChange }: LevelBadgeSelectorProps) {
  const options = LEVELS_UI.map((l) => ({
    value: l,
    label: l,
    activeClass: levelColorSolid(l),
    inactiveClass: `bg-muted/30 hover:bg-muted/70 focus:bg-muted/70 text-muted-foreground hover:text-foreground focus:text-foreground font-medium ${levelColor(l)} border-transparent hover:border-transparent`,
  }));

  return (
    <PillSelect
      value={value}
      onChange={(val) => onChange(val as Level)}
      options={options}
      minWidth="90px"
      trigger={
        <button
          className="focus:outline-none select-none cursor-pointer"
          onClick={(e) => e.stopPropagation()}
        >
          <Badge
            variant="outline"
            className={`text-[11px] font-semibold transition-all hover:brightness-95 hover:scale-105 active:scale-95 cursor-pointer ${levelColor(value)}`}
          >
            {value}
          </Badge>
        </button>
      }
    />
  );
}

interface StatusBadgeSelectorProps {
  value: StudentStatus;
  onChange: (status: StudentStatus) => void;
}

export function StatusBadgeSelector({ value, onChange }: StatusBadgeSelectorProps) {
  const map = {
    attivo: "bg-success/10 text-success border-success/40",
    sospeso: "bg-warning/15 text-warning-foreground border-warning/40",
    ritirato: "bg-muted text-muted-foreground border-border",
  };
  const label = { attivo: "Attivo", sospeso: "Sospeso", ritirato: "Ritirato" }[value];

  const options = [
    {
      value: "attivo",
      label: "Attivo",
      activeClass:
        "bg-emerald-500 hover:bg-emerald-500/90 focus:bg-emerald-500 text-white font-semibold",
      dotColor: "bg-success",
    },
    {
      value: "sospeso",
      label: "Non attivo",
      activeClass: "bg-amber-500 hover:bg-amber-500/90 focus:bg-amber-500 text-white font-semibold",
      dotColor: "bg-warning",
    },
    {
      value: "ritirato",
      label: "Ritirato",
      activeClass: "bg-slate-500 hover:bg-slate-500/90 focus:bg-slate-500 text-white font-semibold",
      dotColor: "bg-muted-foreground",
    },
  ];

  return (
    <PillSelect
      value={value}
      onChange={(val) => onChange(val as StudentStatus)}
      options={options}
      minWidth="130px"
      trigger={
        <button
          className="focus:outline-none select-none cursor-pointer"
          onClick={(e) => e.stopPropagation()}
        >
          <Badge
            variant="outline"
            className={`text-[11px] font-medium rounded-full gap-1.5 transition-all hover:brightness-95 hover:scale-105 active:scale-95 cursor-pointer ${map[value]}`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {label}
          </Badge>
        </button>
      }
    />
  );
}
