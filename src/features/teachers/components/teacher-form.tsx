import * as React from "react";
import { useState } from "react";
import { LEVELS_UI } from "@/stores/app-store";
import { courses } from "@/lib/mock-data";
import type { TeacherFormValues } from "../types";
import { X, Mail, Phone, Calendar, User, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Popover, PopoverTrigger } from "@/components/ui/popover";

export interface TeacherFormProps {
  initialValues: TeacherFormValues;
  onSubmit: (values: TeacherFormValues) => void;
  onCancel: () => void;
  submitLabel: string;
}

export function TeacherForm({ initialValues, onSubmit, onCancel, submitLabel }: TeacherFormProps) {
  const [form, setForm] = useState<TeacherFormValues>(initialValues);
  const [searchQuery, setSearchQuery] = useState("");
  const [popoverOpen, setPopoverOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  const filteredCourses = courses.filter(
    (c) =>
      c.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.livello.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const toggleCourse = (cid: string) => {
    const checked = form.corsiIds.includes(cid);
    setForm({
      ...form,
      corsiIds: checked ? form.corsiIds.filter((x) => x !== cid) : [...form.corsiIds, cid],
    });
    setSearchQuery("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 min-h-0">
      <div className="grid grid-cols-2 gap-x-4 gap-y-3 max-h-[70vh] overflow-y-visible">
        {/* Profile photo */}
        <div className="col-span-2 flex items-center gap-4 bg-muted/15 rounded-xl p-3 border border-border/20">
          <div className="relative shrink-0 group">
            <Avatar className="h-14 w-14 border-2 border-primary/10 shadow-sm transition-all duration-250 group-hover:scale-105">
              {form.foto ? (
                <AvatarImage
                  src={form.foto}
                  alt={form.nome}
                  className="object-cover"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              ) : null}
              <AvatarFallback className="bg-primary/5 text-primary text-base font-bold">
                {form.nome[0] || "?"}
                {form.cognome[0] || ""}
              </AvatarFallback>
            </Avatar>
            {form.foto && (
              <button
                type="button"
                onClick={() => setForm({ ...form, foto: "" })}
                className="absolute -top-1 -right-1 h-5 w-5 bg-destructive hover:bg-destructive/90 text-white rounded-full flex items-center justify-center shadow-md hover:scale-110 active:scale-90 transition-all cursor-pointer"
                title="Rimuovi foto"
              >
                <X className="h-3 w-3 stroke-[2.5]" />
              </button>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              URL Foto Insegnante
            </Label>
            <Input
              placeholder="https://images.unsplash.com/... (opzionale)"
              value={form.foto}
              onChange={(e) => setForm({ ...form, foto: e.target.value })}
              className="h-9 text-xs bg-background/50 mt-1 focus-visible:ring-1 focus-visible:ring-primary/45"
            />
          </div>
        </div>

        {/* Name & Surname */}
        <div>
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Nome
          </Label>
          <div className="relative mt-1.5">
            <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/45" />
            <Input
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              className="pl-9 h-9 text-xs focus-visible:ring-1 focus-visible:ring-primary/45"
              placeholder="Esempio: Emma"
              required
            />
          </div>
        </div>
        <div>
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Cognome
          </Label>
          <div className="relative mt-1.5">
            <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/45" />
            <Input
              value={form.cognome}
              onChange={(e) => setForm({ ...form, cognome: e.target.value })}
              className="pl-9 h-9 text-xs focus-visible:ring-1 focus-visible:ring-primary/45"
              placeholder="Esempio: Whitfield"
              required
            />
          </div>
        </div>

        {/* Contact info */}
        <div>
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Email
          </Label>
          <div className="relative mt-1.5">
            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/45" />
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="pl-9 h-9 text-xs focus-visible:ring-1 focus-visible:ring-primary/45"
              placeholder="emma.whitfield@atena.it"
              required
            />
          </div>
        </div>
        <div>
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Telefono
          </Label>
          <div className="relative mt-1.5">
            <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/45" />
            <Input
              value={form.telefono}
              onChange={(e) => setForm({ ...form, telefono: e.target.value })}
              className="pl-9 h-9 text-xs focus-visible:ring-1 focus-visible:ring-primary/45"
              placeholder="+39 345 678 9011"
              required
            />
          </div>
        </div>

        {/* Dates */}
        <div>
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Data di Nascita
          </Label>
          <div className="relative mt-1.5">
            <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/45" />
            <Input
              type="date"
              value={form.dataNascita}
              onChange={(e) => setForm({ ...form, dataNascita: e.target.value })}
              className="pl-9 h-9 text-xs focus-visible:ring-1 focus-visible:ring-primary/45"
              required
            />
          </div>
        </div>
        <div>
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Data Inizio Lavoro
          </Label>
          <div className="relative mt-1.5">
            <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/45" />
            <Input
              type="date"
              value={form.dataAssunzione}
              onChange={(e) => setForm({ ...form, dataAssunzione: e.target.value })}
              className="pl-9 h-9 text-xs focus-visible:ring-1 focus-visible:ring-primary/45"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Esp. (Anni)
            </Label>
            <Input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={form.esperienzaAnni || ""}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                setForm({ ...form, esperienzaAnni: val ? parseInt(val) : 0 });
              }}
              className="h-9 text-xs mt-1.5 focus-visible:ring-1 focus-visible:ring-primary/45"
              placeholder="Anni"
              required
            />
          </div>
          <div>
            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Esp. (Mesi)
            </Label>
            <Input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={form.esperienzaMesi || ""}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                setForm({ ...form, esperienzaMesi: val ? Math.min(11, parseInt(val)) : 0 });
              }}
              className="h-9 text-xs mt-1.5 focus-visible:ring-1 focus-visible:ring-primary/45"
              placeholder="Mesi"
              required
            />
          </div>
        </div>
        <div>
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Stato Insegnante
          </Label>
          <div className="flex gap-2 mt-1.5">
            {[
              {
                value: "attivo",
                label: "Attivo",
                color: "bg-emerald-500 hover:bg-emerald-500/90 text-white border-transparent",
              },
              {
                value: "in-ferie",
                label: "In ferie",
                color: "bg-amber-500 hover:bg-amber-500/90 text-white border-transparent",
              },
            ].map((opt) => {
              const isSelected = form.stato === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm({ ...form, stato: opt.value as "attivo" | "in-ferie" })}
                  className={`flex-1 py-2 rounded-full text-xs font-semibold transition-all duration-150 cursor-pointer border select-none text-center
                    ${
                      isSelected
                        ? opt.color + " shadow-sm font-bold"
                        : "bg-muted/20 border-border/40 text-muted-foreground hover:bg-muted/50 hover:text-foreground hover:scale-[1.02] active:scale-98"
                    }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Assigned courses */}
        <div className="col-span-2 relative">
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Corsi Assegnati
          </Label>
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <div
                className="mt-1.5 w-full min-h-9 p-1.5 rounded-md border border-input bg-background flex flex-wrap gap-1.5 items-center focus-within:ring-1 focus-within:ring-primary/45 cursor-text select-none"
                onClick={() => {
                  const input = document.getElementById("teacher-course-search-input");
                  if (input) input.focus();
                }}
              >
                {form.corsiIds.map((cid) => {
                  const course = courses.find((c) => c.id === cid);
                  if (!course) return null;
                  return (
                    <Badge
                      key={cid}
                      variant="secondary"
                      className="h-7 pl-2.5 pr-1 py-0 text-xs font-semibold bg-primary/10 text-primary border-primary/20 gap-1.5 flex items-center shrink-0 rounded-md"
                    >
                      <span>{course.nome}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCourse(cid);
                        }}
                        className="h-5 w-5 rounded-full flex items-center justify-center hover:bg-primary/20 hover:text-primary active:scale-90 transition-all cursor-pointer"
                        title="Rimuovi corso"
                      >
                        <X className="h-3 w-3 stroke-[2.5]" />
                      </button>
                    </Badge>
                  );
                })}
                <input
                  id="teacher-course-search-input"
                  type="text"
                  placeholder={form.corsiIds.length === 0 ? "Cerca corsi..." : ""}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPopoverOpen(true);
                  }}
                  className="flex-1 min-w-[150px] bg-transparent border-0 outline-none text-xs h-6 p-0 px-1 text-foreground placeholder:text-muted-foreground/50"
                />
              </div>
            </PopoverTrigger>

            <PopoverPrimitive.Content
              align="start"
              sideOffset={4}
              className="z-50 p-1 flex flex-col w-[340px] rounded-xl shadow-lg border border-border bg-popover text-popover-foreground overflow-hidden"
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <div className="p-1 flex flex-col gap-1 max-h-48 overflow-y-auto">
                {filteredCourses.length === 0 ? (
                  <div className="text-xs text-muted-foreground p-4 text-center">
                    Nessun corso trovato
                  </div>
                ) : (
                  filteredCourses.map((c) => {
                    const checked = form.corsiIds.includes(c.id);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => toggleCourse(c.id)}
                        className={`rounded-full px-3.5 py-1.5 flex items-center justify-between text-xs cursor-pointer select-none outline-none transition-all duration-150 w-full text-left
                          ${
                            checked
                              ? "bg-primary hover:bg-primary/90 focus:bg-primary text-white font-semibold hover:scale-[1.02] focus:scale-[1.02] hover:shadow-md focus:shadow-md active:scale-95"
                              : "bg-muted/40 hover:bg-muted/70 focus:bg-muted/70 text-muted-foreground hover:text-foreground focus:text-foreground font-medium hover:scale-[1.02] focus:scale-[1.02] hover:shadow-sm focus:shadow-sm active:scale-95"
                          }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${checked ? "bg-white" : "bg-primary/45"}`}
                          />
                          <span>{c.nome}</span>
                          <span
                            className={`text-[10px] font-medium px-1.5 py-0.2 rounded-full border ${checked ? "border-white/30 text-white/90 bg-white/10" : "border-muted-foreground/20 text-muted-foreground bg-muted/40"}`}
                          >
                            {c.livello}
                          </span>
                        </div>
                        {checked && <Check className="h-3 w-3 shrink-0 stroke-[2.5]" />}
                      </button>
                    );
                  })
                )}
              </div>
            </PopoverPrimitive.Content>
          </Popover>
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-border/20 shrink-0">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          className="text-xs h-8 hover:bg-muted/70 rounded-full px-4"
        >
          Annulla
        </Button>
        <Button
          type="submit"
          className="text-xs h-8 bg-primary hover:bg-primary/95 text-white font-semibold rounded-full px-5 shadow-sm hover:scale-[1.02] active:scale-98 transition-all"
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
