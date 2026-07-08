import { useState, useEffect, useRef } from "react";
import { courses, teachers, lessons, GIORNI } from "@/lib/mock-data";
import type { Lesson, LessonFormValues } from "../types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Video, Link2, CalendarDays, Check, ChevronsUpDown, Copy } from "lucide-react";

interface LessonFormProps {
  defaultValues?: Partial<LessonFormValues>;
  onSubmit: (values: LessonFormValues) => void;
  onCancel: () => void;
  compact?: boolean;
  submitLabel?: string;
}

function generateMeetLink(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz";
  const seg = (n: number) =>
    Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `https://meet.google.com/${seg(3)}-${seg(4)}-${seg(3)}`;
}

const AULA_SUGGESTIONS = [...new Set(lessons.map((l) => l.aula))].sort();

/** Inline autocomplete — type in the field, see filtered options below */
function InlineCombobox({
  value,
  onChange,
  options,
  placeholder,
  compact,
  renderOption,
  allowCustom = false,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { key: string; label: string; searchLabel?: string; display?: React.ReactNode }[];
  placeholder: string;
  compact?: boolean;
  renderOption?: (opt: { key: string; label: string }) => React.ReactNode;
  allowCustom?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  // Tracks if the dropdown is actively open (user interacting)
  const isOpenRef = useRef(false);

  // Sync display query when value changes externally (e.g. auto-fill from course)
  // but only when the field is NOT open/focused
  useEffect(() => {
    if (isOpenRef.current) return;
    const found = options.find((o) => o.key === value);
    setQuery(found ? found.label : value);
  }, [value, options]);

  // When filtering: if query is empty show all, otherwise filter
  const filtered = query
    ? options.filter((o) => (o.searchLabel ?? o.label).toLowerCase().includes(query.toLowerCase()))
    : options;

  const select = (key: string, label: string) => {
    onChange(key);
    setQuery(label);
    setOpen(false);
    isOpenRef.current = false;
    setActiveIdx(0);
  };

  const restoreLabel = () => {
    const found = options.find((o) => o.key === value);
    setQuery(found ? found.label : allowCustom ? value : "");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter") setOpen(true);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[activeIdx]) {
        select(filtered[activeIdx].key, filtered[activeIdx].label);
      } else if (allowCustom && query) {
        onChange(query);
        setOpen(false);
        isOpenRef.current = false;
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      isOpenRef.current = false;
      restoreLabel();
    }
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
        isOpenRef.current = false;
        restoreLabel();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [value, options]);

  return (
    <div ref={containerRef} className="relative flex items-center">
      <input
        type="text"
        value={query}
        placeholder={placeholder}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setActiveIdx(0);
          if (allowCustom) onChange(e.target.value);
        }}
        onFocus={() => {
          isOpenRef.current = true;
        }}
        onClick={() => {
          // Clear query so the full list is shown, not just what matches current value
          setQuery("");
          setOpen(true);
        }}
        onKeyDown={handleKeyDown}
        className={`flex w-full rounded-md border border-input bg-background pl-3 pr-8 text-sm ring-offset-background
          placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2
          focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors
          ${compact ? "h-8 text-xs" : "h-9 text-sm"}`}
        autoComplete="off"
      />
      <ChevronsUpDown className="absolute right-2.5 h-4 w-4 shrink-0 opacity-50 pointer-events-none text-muted-foreground" />
      {open && filtered.length > 0 && (
        <div className="absolute z-[60] top-full mt-1 left-0 right-0 rounded-md border bg-popover shadow-lg overflow-hidden overflow-x-hidden">
          <ul className="max-h-48 overflow-y-auto overflow-x-hidden py-1">
            {filtered.map((opt, i) => (
              <li
                key={opt.key}
                onMouseDown={(e) => {
                  e.preventDefault();
                  select(opt.key, opt.label);
                }}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm cursor-pointer select-none transition-colors min-w-0
                  ${i === activeIdx ? "bg-accent text-accent-foreground" : "hover:bg-muted/60"}`}
              >
                <Check
                  className={`h-3.5 w-3.5 shrink-0 ${value === opt.key ? "opacity-100 text-primary" : "opacity-0"}`}
                />
                <span className="min-w-0 flex-1 overflow-hidden">
                  {renderOption ? (
                    renderOption(opt)
                  ) : (
                    <span className="truncate block">{opt.label}</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {open &&
        allowCustom &&
        query &&
        !options.find((o) => o.label.toLowerCase() === query.toLowerCase()) && (
          <div className="absolute z-[60] top-full mt-1 left-0 right-0 rounded-md border bg-popover shadow-lg overflow-hidden">
            <ul className="py-1">
              {filtered.map((opt, i) => (
                <li
                  key={opt.key}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    select(opt.key, opt.label);
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 text-sm cursor-pointer select-none transition-colors
                  ${i === activeIdx ? "bg-accent text-accent-foreground" : "hover:bg-muted/60"}`}
                >
                  <Check
                    className={`h-3.5 w-3.5 shrink-0 ${value === opt.key ? "opacity-100 text-primary" : "opacity-0"}`}
                  />
                  <span className="truncate">{opt.label}</span>
                </li>
              ))}
              <li
                onMouseDown={(e) => {
                  e.preventDefault();
                  onChange(query);
                  setOpen(false);
                }}
                className="flex items-center gap-2 px-3 py-1.5 text-sm cursor-pointer select-none text-primary hover:bg-muted/60 border-t border-border/40"
              >
                <span className="text-[11px]">✦</span>
                <span className="truncate">Usa &ldquo;{query}&rdquo;</span>
              </li>
            </ul>
          </div>
        )}
    </div>
  );
}

export function LessonForm({
  defaultValues,
  onSubmit,
  onCancel,
  compact = false,
  submitLabel = "✓ Crea Lezione",
}: LessonFormProps) {
  const [corsoId, setCorsoId] = useState(defaultValues?.corsoId ?? "");
  const [insegnanteId, setInsegnanteId] = useState(defaultValues?.insegnanteId ?? "");
  const [giorno, setGiorno] = useState<number>(defaultValues?.giorno ?? 0);
  const [data, setData] = useState(defaultValues?.data ?? "");
  const [oraInizio, setOraInizio] = useState(defaultValues?.oraInizio ?? "09:00");
  const [oraFine, setOraFine] = useState(defaultValues?.oraFine ?? "10:30");
  const [aula, setAula] = useState(defaultValues?.aula ?? "");
  const [isOnline, setIsOnline] = useState(defaultValues?.isOnline ?? false);
  const [meetLink] = useState(defaultValues?.meetLink ?? generateMeetLink());
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(meetLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (!corsoId) return;
    const course = courses.find((c) => c.id === corsoId);
    if (course) setInsegnanteId(course.insegnanteId);
  }, [corsoId]);

  const selectedCourse = courses.find((c) => c.id === corsoId);
  const isValid = corsoId && insegnanteId && aula && oraInizio && oraFine;

  const handleSubmit = () => {
    if (!isValid) return;
    onSubmit({
      corsoId,
      insegnanteId,
      giorno,
      data: data || undefined,
      oraInizio,
      oraFine,
      aula,
      isOnline,
      meetLink: isOnline ? meetLink : undefined,
    });
  };

  const corsoOptions = courses.map((c) => ({
    key: c.id,
    label: c.nome,
    searchLabel: `${c.livello} ${c.nome}`,
  }));

  const teacherOptions = teachers.map((t) => ({
    key: t.id,
    label: `${t.nome} ${t.cognome}`,
  }));

  const aulaOptions = AULA_SUGGESTIONS.map((a) => ({ key: a, label: a }));

  return (
    <div className="flex flex-col gap-3">
      {/* Corso */}
      <div className="flex flex-col gap-1.5">
        {!compact && (
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Corso
          </Label>
        )}
        <InlineCombobox
          value={corsoId}
          onChange={setCorsoId}
          options={corsoOptions}
          placeholder="Scrivi per cercare corso..."
          compact={compact}
          renderOption={(opt) => {
            const c = courses.find((x) => x.id === opt.key);
            return (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0">
                  {c?.livello}
                </Badge>
                <span className="truncate">{opt.label}</span>
              </div>
            );
          }}
        />
      </div>

      {/* Insegnante */}
      <div className="flex flex-col gap-1.5">
        {!compact && (
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Insegnante
          </Label>
        )}
        <InlineCombobox
          value={insegnanteId}
          onChange={setInsegnanteId}
          options={teacherOptions}
          placeholder="Scrivi per cercare insegnante..."
          compact={compact}
          renderOption={(opt) => (
            <span className="flex items-center gap-1.5">
              {opt.label}
              {selectedCourse?.insegnanteId === opt.key && (
                <span className="text-[10px] text-muted-foreground">(predefinito)</span>
              )}
            </span>
          )}
        />
      </div>

      {/* Aula */}
      <div className="flex flex-col gap-1.5">
        {!compact && (
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Aula
          </Label>
        )}
        <InlineCombobox
          value={aula}
          onChange={setAula}
          options={aulaOptions}
          placeholder="Scrivi aula (es. Aula 3)"
          compact={compact}
          allowCustom
        />
      </div>

      {/* Day + Time */}
      <div className="flex gap-2">
        {!compact && (
          <div className="flex flex-col gap-1.5 flex-1">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Giorno
            </Label>
            <Select value={String(giorno)} onValueChange={(v) => setGiorno(Number(v))}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GIORNI.map((g, i) => (
                  <SelectItem key={i} value={String(i)}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="flex flex-col gap-1.5 flex-1">
          {!compact && (
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Inizio
            </Label>
          )}
          <Input
            type="time"
            className={compact ? "h-8 text-xs" : "h-9 text-sm"}
            value={oraInizio}
            onChange={(e) => setOraInizio(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5 flex-1">
          {!compact && (
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Fine
            </Label>
          )}
          <Input
            type="time"
            className={compact ? "h-8 text-xs" : "h-9 text-sm"}
            value={oraFine}
            onChange={(e) => setOraFine(e.target.value)}
          />
        </div>
      </div>

      {/* Date (full form only) */}
      {!compact && (
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" />
            Data specifica
            <span className="text-[10px] font-normal normal-case text-muted-foreground/60">
              (vuoto = ogni settimana)
            </span>
          </Label>
          <Input
            type="date"
            className="h-9 text-sm"
            value={data}
            onChange={(e) => setData(e.target.value)}
          />
        </div>
      )}

      {/* Online toggle */}
      <div
        className={`flex items-center justify-between rounded-lg border px-3 py-2 ${isOnline ? "border-blue-500/30 bg-blue-500/5" : "border-border/50 bg-muted/20"} transition-colors`}
      >
        <div className="flex items-center gap-2">
          <Video
            className={`h-3.5 w-3.5 ${isOnline ? "text-blue-500" : "text-muted-foreground"}`}
          />
          <span className="text-xs font-semibold">Online</span>
        </div>
        <Switch checked={isOnline} onCheckedChange={setIsOnline} className="scale-90" />
      </div>

      {isOnline && (
        <div className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-md bg-blue-500/10 border border-blue-500/20">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Link2 className="h-3 w-3 text-blue-500 shrink-0" />
            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-mono truncate">
              {meetLink}
            </span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 shrink-0"
            onClick={handleCopy}
            title="Copia link"
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          </Button>
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <Button variant="ghost" size="sm" className="flex-1 h-8 text-xs" onClick={onCancel}>
          Annulla
        </Button>
        <Button
          size="sm"
          className="flex-1 h-8 text-xs font-semibold"
          disabled={!isValid}
          onClick={handleSubmit}
        >
          {submitLabel}
        </Button>
      </div>
    </div>
  );
}
