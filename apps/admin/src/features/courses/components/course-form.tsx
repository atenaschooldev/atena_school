import * as React from "react";
import { useState } from "react";
import { LEVELS_UI } from "@/stores/app-store";
import type { CourseFormValues } from "../types";
import { levelColorSolid } from "../utils";
import { X, Check, Euro } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface CourseFormProps {
  initialValues: CourseFormValues;
  onSubmit: (values: CourseFormValues) => void;
  onCancel: () => void;
  submitLabel: string;
}

const CATEGORIES = [
  "General English",
  "Business English",
  "Preparazione Esami",
  "Conversazione",
  "Letteratura",
];

const COLORS = [
  { value: "chart-1", label: "Rosso Atena", class: "bg-chart-1" },
  { value: "chart-2", label: "Verde Smeraldo", class: "bg-chart-2" },
  { value: "chart-3", label: "Blu Zaffiro", class: "bg-chart-3" },
  { value: "chart-4", label: "Viola Ametista", class: "bg-chart-4" },
  { value: "chart-5", label: "Arancione Ambra", class: "bg-chart-5" },
];

export function CourseForm({ initialValues, onSubmit, onCancel, submitLabel }: CourseFormProps) {
  const [form, setForm] = useState<CourseFormValues>(initialValues);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 min-h-0">
      <div className="grid grid-cols-2 gap-x-4 gap-y-3 max-h-[70vh] overflow-y-visible">
        {/* Course Banner Photo */}
        <div className="col-span-2 flex items-center gap-4 bg-muted/15 rounded-xl p-3 border border-border/20">
          <div className="relative shrink-0 group h-14 w-20 rounded-lg overflow-hidden border border-border/40 bg-muted/30">
            {form.foto ? (
              <img
                src={form.foto}
                alt={form.nome}
                className="h-full w-full object-cover transition-all duration-250 group-hover:scale-105"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-muted-foreground/60 text-xs font-semibold">
                Nessuna
              </div>
            )}
            {form.foto && (
              <button
                type="button"
                onClick={() => setForm({ ...form, foto: "" })}
                className="absolute top-1 right-1 h-5 w-5 bg-destructive hover:bg-destructive/90 text-white rounded-full flex items-center justify-center shadow-md hover:scale-110 active:scale-90 transition-all cursor-pointer z-10"
                title="Rimuovi foto"
              >
                <X className="h-3 w-3 stroke-[2.5]" />
              </button>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              URL Immagine Corso
            </Label>
            <Input
              placeholder="https://images.unsplash.com/... (opzionale)"
              value={form.foto}
              onChange={(e) => setForm({ ...form, foto: e.target.value })}
              className="h-9 text-xs bg-background/50 mt-1 focus-visible:ring-1 focus-visible:ring-primary/45"
            />
          </div>
        </div>

        {/* Course name */}
        <div className="col-span-2">
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Nome Corso
          </Label>
          <Input
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            className="h-9 text-xs mt-1.5 focus-visible:ring-1 focus-visible:ring-primary/45"
            placeholder="Esempio: Business English Avanzato"
            required
          />
        </div>

        {/* Category & Level */}
        <div>
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Categoria
          </Label>
          <Select value={form.categoria} onValueChange={(v) => setForm({ ...form, categoria: v })}>
            <SelectTrigger className="h-9 text-xs mt-1.5 bg-background focus:ring-1 focus:ring-primary/45">
              <SelectValue placeholder="Seleziona categoria..." />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat} className="text-xs">
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Livello di Lingua
          </Label>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {LEVELS_UI.map((l) => {
              const isSelected = form.livello === l;
              return (
                <button
                  key={l}
                  type="button"
                  onClick={() => setForm({ ...form, livello: l })}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-150 cursor-pointer border select-none
                    ${
                      isSelected
                        ? levelColorSolid(l)
                        : "bg-muted/20 border-border/40 text-muted-foreground hover:bg-muted/50 hover:text-foreground hover:scale-[1.02] active:scale-98"
                    }`}
                >
                  {l}
                </button>
              );
            })}
          </div>
        </div>

        {/* Duration & Price */}
        <div>
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Durata
          </Label>
          <Input
            value={form.durata}
            onChange={(e) => setForm({ ...form, durata: e.target.value })}
            className="h-9 text-xs mt-1.5 focus-visible:ring-1 focus-visible:ring-primary/45"
            placeholder="Esempio: 60 ore"
            required
          />
        </div>

        <div>
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Prezzo (€)
          </Label>
          <div className="relative mt-1.5">
            <Euro className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/45" />
            <Input
              type="number"
              value={form.prezzo || ""}
              onChange={(e) => setForm({ ...form, prezzo: parseInt(e.target.value) || 0 })}
              className="pl-9 h-9 text-xs focus-visible:ring-1 focus-visible:ring-primary/45"
              placeholder="Esempio: 540"
              min={0}
              required
            />
          </div>
        </div>

        {/* Modules & Capacity */}
        <div>
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Numero di Moduli
          </Label>
          <Input
            type="number"
            value={form.moduli || ""}
            onChange={(e) => setForm({ ...form, moduli: parseInt(e.target.value) || 0 })}
            className="h-9 text-xs mt-1.5 focus-visible:ring-1 focus-visible:ring-primary/45"
            placeholder="Esempio: 8"
            min={1}
            required
          />
        </div>

        <div>
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Capienza Massima
          </Label>
          <Input
            type="number"
            value={form.capienza || ""}
            onChange={(e) => setForm({ ...form, capienza: parseInt(e.target.value) || 0 })}
            className="h-9 text-xs mt-1.5 focus-visible:ring-1 focus-visible:ring-primary/45"
            placeholder="Esempio: 15"
            min={1}
            required
          />
        </div>

        {/* Status & Color theme */}
        <div>
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Stato Corso
          </Label>
          <div className="flex gap-2 mt-1.5">
            {[
              {
                value: "attivo",
                label: "Attivo",
                color: "bg-emerald-500 hover:bg-emerald-500/90 text-white border-transparent",
              },
              {
                value: "in-programmazione",
                label: "Pianificato",
                color: "bg-amber-500 hover:bg-amber-500/90 text-white border-transparent",
              },
              {
                value: "concluso",
                label: "Concluso",
                color: "bg-slate-500 hover:bg-slate-500/90 text-white border-transparent",
              },
            ].map((opt) => {
              const isSelected = form.stato === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    setForm({
                      ...form,
                      stato: opt.value as "attivo" | "in-programmazione" | "concluso",
                    })
                  }
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

        <div>
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider font-semibold">
            Tema Colore
          </Label>
          <div className="flex gap-2 mt-1.5">
            {COLORS.map((col) => {
              const isSelected = form.colore === col.value;
              return (
                <button
                  key={col.value}
                  type="button"
                  onClick={() => setForm({ ...form, colore: col.value })}
                  className={`h-7 w-7 rounded-full transition-all duration-150 cursor-pointer border relative flex items-center justify-center hover:scale-105 active:scale-95
                    ${col.class} ${isSelected ? "border-foreground ring-2 ring-primary/40" : "border-border/30"}`}
                  title={col.label}
                >
                  {isSelected && <Check className="h-3 w-3 text-white stroke-[2.5]" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Description */}
        <div className="col-span-2">
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Descrizione
          </Label>
          <Textarea
            value={form.descrizione}
            onChange={(e) => setForm({ ...form, descrizione: e.target.value })}
            className="text-xs mt-1.5 focus-visible:ring-1 focus-visible:ring-primary/45 bg-background resize-none h-20"
            placeholder="Descrivi gli argomenti e gli obiettivi del corso..."
            required
          />
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
