"use client";

import type { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  User,
  Baby,
  Mail,
  Phone,
  CreditCard,
  Calendar as CalendarIcon,
  UserCheck,
  Plus,
  Trash,
  MapPin,
  Sparkles,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { sanitizeTaxCode } from "@atena/utils";
import type { CreateBookingValues, ClientItem, StudentItem, SavedStudentItem } from "./types";
import { useSchoolProfile } from "@/hooks/use-school-profile";

interface StepClientInfoProps {
  form: UseFormReturn<CreateBookingValues>;
  studentsList: StudentItem[];
  availableSavedStudents: SavedStudentItem[];
  studentFeeStatuses: Record<number, { checked: boolean; paid: boolean }>;
  addStudent: () => void;
  removeStudent: (index: number) => void;
  updateStudent: (index: number, field: keyof StudentItem, value: string) => void;
  onSelectSavedStudent: (saved: SavedStudentItem, targetIndex?: number) => void;
  coursePrice?: number;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  isSearchingClient: boolean;
  clientFound: boolean | null;
  setClientFound: (val: boolean | null) => void;
  clientsList: ClientItem[];
  isLoadingClients: boolean;
  isSearchOpen: boolean;
  setIsSearchOpen: (val: boolean) => void;
  filteredClients: ClientItem[];
  applyClientData: (found: ClientItem) => void;
  handleManualLookup: () => Promise<void>;
}

export function StepClientInfo({
  form,
  studentsList,
  availableSavedStudents,
  studentFeeStatuses,
  addStudent,
  removeStudent,
  updateStudent,
  onSelectSavedStudent,
  coursePrice = 0,
  searchQuery,
  setSearchQuery,
  isSearchingClient,
  clientFound,
  setClientFound,
  isLoadingClients,
  isSearchOpen,
  setIsSearchOpen,
  filteredClients,
  applyClientData,
  handleManualLookup,
}: StepClientInfoProps) {
  const isForChild = form.watch("isForChild");
  const { profile } = useSchoolProfile();
  const feeAmount = profile?.registration_fee_eur != null ? Number(profile.registration_fee_eur) : 30;
  const academicYear = profile?.academic_year || "2026/2027";

  const handleCustomerTypeChange = (forChild: boolean) => {
    form.setValue("isForChild", forChild);
    setSearchQuery("");
    setClientFound(null);
  };

  return (
    <div className="space-y-4">
      {/* 1. Customer Type Segmented Switch */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
          Tipologia Cliente
        </label>
        <div className="grid grid-cols-2 gap-2 bg-muted/40 p-1 rounded-xl border border-border/60">
          <button
            type="button"
            onClick={() => handleCustomerTypeChange(false)}
            className={cn(
              "flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer",
              !isForChild
                ? "bg-background text-foreground shadow-xs ring-1 ring-border/80"
                : "text-muted-foreground hover:text-foreground hover:bg-background/40 font-medium"
            )}
          >
            <User className="h-4 w-4 text-primary" />
            <span>Studente Adulto</span>
          </button>
          <button
            type="button"
            onClick={() => handleCustomerTypeChange(true)}
            className={cn(
              "flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer",
              isForChild
                ? "bg-background text-foreground shadow-xs ring-1 ring-border/80"
                : "text-muted-foreground hover:text-foreground hover:bg-background/40 font-medium"
            )}
          >
            <Baby className="h-4 w-4 text-primary" />
            <span>Genitore + Figlio (Minorenne)</span>
          </button>
        </div>
      </div>

      {/* 2. Fast Autocomplete Search Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-primary" />
            Cerca Cliente in Anagrafica
          </label>
          {clientFound === true && (
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Trovato in anagrafica
            </span>
          )}
        </div>

        <div className="relative">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                startIcon={<Search />}
                endIcon={
                  searchQuery ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setIsSearchOpen(false);
                        setClientFound(null);
                      }}
                      className="text-xs text-muted-foreground hover:text-foreground cursor-pointer p-0.5"
                    >
                      ✕
                    </button>
                  ) : undefined
                }
                placeholder="Digita Nome, Codice Fiscale, Email..."
                value={searchQuery}
                onFocus={() => setIsSearchOpen(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                  setClientFound(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleManualLookup();
                  }
                }}
              />
            </div>

            <Button
              type="button"
              variant="secondary"
              disabled={isSearchingClient || !searchQuery.trim()}
              onClick={handleManualLookup}
              className="h-9 px-3.5 text-xs font-semibold cursor-pointer shrink-0 rounded-xl"
            >
              {isSearchingClient ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Cerca"}
            </Button>
          </div>

          {/* Filtered Dropdown List */}
          {isSearchOpen && (
            <div className="absolute z-50 left-0 right-0 top-full mt-1.5 bg-popover text-popover-foreground border border-border/80 rounded-xl shadow-xl overflow-hidden max-h-52 overflow-y-auto">
              {isLoadingClients ? (
                <div className="p-3 text-xs text-muted-foreground text-center flex items-center justify-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Caricamento anagrafica...
                </div>
              ) : filteredClients.length > 0 ? (
                <div className="py-1 divide-y divide-border/40">
                  {filteredClients.map((client, idx) => (
                    <button
                      key={client.id || `${client.taxCode}-${idx}`}
                      type="button"
                      onClick={() => {
                        applyClientData(client);
                        setSearchQuery(client.name || client.purchaserName || "");
                        setIsSearchOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-muted/80 transition-colors flex flex-col gap-0.5 cursor-pointer text-xs"
                    >
                      <div className="font-bold text-foreground flex items-center justify-between">
                        <span>{client.name}</span>
                        {client.isForChild && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-primary/40 text-primary">
                            Genitore + Figlio
                          </Badge>
                        )}
                      </div>
                      <div className="text-[11px] text-muted-foreground flex items-center gap-3">
                        {client.taxCode && <span>CF: {client.taxCode}</span>}
                        {client.email && <span>{client.email}</span>}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-3 text-xs text-muted-foreground text-center">
                  Nessun cliente trovato in anagrafica locale. Premi Cerca per cercare sul server.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 3. Form Cards (Landing-style Inputs with Left Icons) */}
      <div className="space-y-4">
        {/* Genitore / Acquirente Card */}
        <div className="p-4 bg-muted/20 rounded-xl border border-border/60 space-y-3">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-primary" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              {isForChild ? "Dati del Genitore / Acquirente" : "Dati Anagrafici e Fiscali"}
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Nome */}
            <FormField
              control={form.control}
              name="purchaserFirstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-foreground">
                    {isForChild ? "Nome Genitore *" : "Nome *"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      startIcon={<User />}
                      placeholder="Mario"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />

            {/* Cognome */}
            <FormField
              control={form.control}
              name="purchaserLastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-foreground">
                    {isForChild ? "Cognome Genitore *" : "Cognome *"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      startIcon={<User />}
                      placeholder="Rossi"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={form.control}
              name="purchaserEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-foreground">
                    {isForChild ? "Email Genitore *" : "Email *"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      startIcon={<Mail />}
                      type="email"
                      placeholder="mario.rossi@email.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />

            {/* Telefono */}
            <FormField
              control={form.control}
              name="purchaserPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-foreground">
                    {isForChild ? "Telefono Genitore" : "Telefono (WhatsApp)"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      startIcon={<Phone />}
                      placeholder="+39 340 1234567"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />

            {/* Codice Fiscale */}
            <FormField
              control={form.control}
              name="purchaserTaxCode"
              render={({ field }) => (
                <FormItem className={isForChild ? "col-span-2" : "col-span-2"}>
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-xs font-bold text-foreground">
                      Codice Fiscale {isForChild ? "Genitore" : "Cliente"} *
                    </FormLabel>
                    {field.value && field.value.length < 16 && (
                      <span className="text-[10px] font-mono font-semibold text-muted-foreground">
                        {field.value.length}/16
                      </span>
                    )}
                  </div>
                  <FormControl>
                    <Input
                      startIcon={<CreditCard />}
                      placeholder="RSSMRA80A01H501Z"
                      maxLength={16}
                      className="uppercase font-mono tracking-wider"
                      {...field}
                      onChange={(e) => field.onChange(sanitizeTaxCode(e.target.value).slice(0, 16))}
                    />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />

            {/* Adult Extra Fields (Birth date & place) */}
            {!isForChild && (
              <>
                <FormField
                  control={form.control}
                  name="studentBirthDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-foreground">Data di Nascita</FormLabel>
                      <FormControl>
                        <Input
                          startIcon={<CalendarIcon />}
                          type="date"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />

                <div className="space-y-1">
                  <FormLabel className="text-xs font-bold text-foreground">Luogo di Nascita</FormLabel>
                  <Input
                    startIcon={<MapPin />}
                    placeholder="es. Milano (MI)"
                    value={studentsList[0]?.birthPlace || ""}
                    onChange={(e) => updateStudent(0, "birthPlace", e.target.value)}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* 4. Studenti / Figli Section (Only shown when isForChild is true) */}
        {isForChild && (
          <div className="space-y-4 pt-1">
            {/* Quick-chips for saved students / children from past bookings */}
            {availableSavedStudents && availableSavedStudents.length > 0 && (
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 space-y-2">
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#F8861D]" />
                  Figli registrati in precedenza (clicca per inserire):
                </span>
                <div className="flex flex-wrap gap-2">
                  {availableSavedStudents.map((saved, sIdx) => (
                    <button
                      key={sIdx}
                      type="button"
                      onClick={() => onSelectSavedStudent(saved, 0)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-foreground bg-background hover:bg-muted/80 border border-border/80 hover:border-primary px-3 py-1.5 rounded-lg transition-all shadow-2xs cursor-pointer"
                    >
                      <User className="w-3 h-3 text-primary" />
                      <span>{saved.firstName} {saved.lastName}</span>
                      {saved.taxCode && <span className="text-[10px] font-mono text-muted-foreground">({saved.taxCode.slice(0, 6)}...)</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* List of Children Cards */}
            <div className="space-y-3">
              {studentsList.map((student, idx) => {
                const fee = studentFeeStatuses[idx];
                return (
                  <div
                    key={idx}
                    className="p-4 bg-primary/[0.03] border border-primary/20 rounded-xl space-y-3 transition-all"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-border/50">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-black flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <h4 className="text-xs font-black uppercase tracking-wider text-primary">
                          Studente #{idx + 1} {student.firstName ? `— ${student.firstName} ${student.lastName}` : ""}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Status Badge */}
                        {fee?.checked && fee?.paid && (
                          <span className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" />
                            Quota 2026/2027 saldata (0€)
                          </span>
                        )}
                        {fee?.checked && !fee?.paid && (
                          <span className="flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                            <Info className="w-3 h-3" />
                            Quota annuale (+30€)
                          </span>
                        )}

                        {/* Remove Student Button */}
                        {studentsList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeStudent(idx)}
                            className="text-muted-foreground hover:text-destructive p-1 rounded-md hover:bg-destructive/10 transition-colors cursor-pointer"
                            title="Rimuovi studente"
                          >
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Inputs */}
                    <div className="grid grid-cols-2 gap-3">
                      {/* Nome Figlio */}
                      <div>
                        <label className="block text-xs font-bold text-foreground mb-1">Nome Figlio *</label>
                        <Input
                          startIcon={<User />}
                          placeholder="Luca"
                          value={student.firstName}
                          onChange={(e) => updateStudent(idx, "firstName", e.target.value)}
                        />
                      </div>

                      {/* Cognome Figlio */}
                      <div>
                        <label className="block text-xs font-bold text-foreground mb-1">Cognome Figlio *</label>
                        <Input
                          startIcon={<User />}
                          placeholder="Rossi"
                          value={student.lastName}
                          onChange={(e) => updateStudent(idx, "lastName", e.target.value)}
                        />
                      </div>

                      {/* Codice Fiscale Figlio */}
                      <div className="col-span-2">
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-bold text-foreground">Codice Fiscale Figlio *</label>
                          {student.taxCode && student.taxCode.length < 16 && (
                            <span className="text-[10px] font-mono font-semibold text-muted-foreground">
                              {student.taxCode.length}/16
                            </span>
                          )}
                        </div>
                        <Input
                          startIcon={<CreditCard />}
                          placeholder="RSSLCU10A01H501Z"
                          maxLength={16}
                          className="uppercase font-mono tracking-wider"
                          value={student.taxCode}
                          onChange={(e) => updateStudent(idx, "taxCode", e.target.value)}
                        />
                      </div>

                      {/* Data di Nascita Figlio */}
                      <div>
                        <label className="block text-xs font-bold text-foreground mb-1">Data di Nascita</label>
                        <Input
                          startIcon={<CalendarIcon />}
                          type="date"
                          value={student.birthDate || ""}
                          onChange={(e) => updateStudent(idx, "birthDate", e.target.value)}
                        />
                      </div>

                      {/* Luogo di Nascita */}
                      <div>
                        <label className="block text-xs font-bold text-foreground mb-1">Luogo di Nascita</label>
                        <Input
                          startIcon={<MapPin />}
                          placeholder="es. Roma (RM)"
                          value={student.birthPlace || ""}
                          onChange={(e) => updateStudent(idx, "birthPlace", e.target.value)}
                        />
                      </div>

                      {/* Email Figlio (opzionale) */}
                      <div>
                        <label className="block text-xs font-bold text-foreground mb-1">Email Figlio (opzionale)</label>
                        <Input
                          startIcon={<Mail />}
                          type="email"
                          placeholder="luca@email.com"
                          value={student.email || ""}
                          onChange={(e) => updateStudent(idx, "email", e.target.value)}
                        />
                      </div>

                      {/* Tel Figlio (opzionale) */}
                      <div>
                        <label className="block text-xs font-bold text-foreground mb-1">Tel Figlio (opzionale)</label>
                        <Input
                          startIcon={<Phone />}
                          placeholder="+39 340 0000000"
                          value={student.phone || ""}
                          onChange={(e) => updateStudent(idx, "phone", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add Another Student Button */}
            <button
              type="button"
              onClick={addStudent}
              disabled={studentsList.length >= 10}
              className="w-full py-2.5 px-3 rounded-xl border-2 border-dashed border-primary/30 hover:border-primary text-primary hover:bg-primary/5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              <span>Aggiungi un altro figlio / studente {coursePrice > 0 ? `(+${coursePrice.toFixed(2)}€)` : ""}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

