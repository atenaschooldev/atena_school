"use client";

import type { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  FormControl,
  FormDescription,
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
  UserCheck,
  Baby,
} from "lucide-react";
import type { CreateBookingValues, ClientItem } from "./types";

interface StepClientInfoProps {
  form: UseFormReturn<CreateBookingValues>;
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
  membershipFeeStatus: { checked: boolean; paid: boolean };
}

export function StepClientInfo({
  form,
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
  membershipFeeStatus,
}: StepClientInfoProps) {
  const isForChild = form.watch("isForChild");

  return (
    <div className="space-y-6">
      {/* Top Control Bar: Search & Toggle in One Clean Box */}
      <div className="p-4 bg-muted/20 rounded-2xl border border-border/60 space-y-4">
        {/* Toggle row */}
        <FormField
          control={form.control}
          name="isForChild"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between p-3.5 bg-background rounded-xl border border-border/50 cursor-pointer">
              <div className="space-y-0.5">
                <FormLabel className="text-sm font-bold cursor-pointer flex items-center gap-2">
                  <Baby className="w-4 h-4 text-primary" />
                  Genitore acquista per figlio minorenne
                </FormLabel>
                <FormDescription className="text-xs text-muted-foreground">
                  {field.value
                    ? "Abilita la compilazione di Genitore (pagante) + Figlio (studente)."
                    : "L'acquirente coincide con lo studente (cliente adulto)."}
                </FormDescription>
              </div>
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(v) => {
                    const isEnabling = Boolean(v);
                    field.onChange(isEnabling);

                    if (isEnabling) {
                      // Transfer data from Purchaser -> Student
                      const pFirst = form.getValues("purchaserFirstName");
                      const pLast = form.getValues("purchaserLastName");
                      const pEmail = form.getValues("purchaserEmail");
                      const pPhone = form.getValues("purchaserPhone");
                      const pTax = form.getValues("purchaserTaxCode");

                      if (pFirst || pLast || pEmail || pPhone || pTax) {
                        if (!form.getValues("studentFirstName")) form.setValue("studentFirstName", pFirst || "");
                        if (!form.getValues("studentLastName")) form.setValue("studentLastName", pLast || "");
                        if (!form.getValues("studentEmail")) form.setValue("studentEmail", pEmail || "");
                        if (!form.getValues("studentPhone")) form.setValue("studentPhone", pPhone || "");
                        if (!form.getValues("studentTaxCode")) form.setValue("studentTaxCode", pTax || "");

                        // Clear purchaser fields for parent input
                        form.setValue("purchaserFirstName", "");
                        form.setValue("purchaserLastName", "");
                        form.setValue("purchaserEmail", "");
                        form.setValue("purchaserPhone", "");
                        form.setValue("purchaserTaxCode", "");
                      }
                    } else {
                      // Transfer data from Student -> Purchaser
                      const sFirst = form.getValues("studentFirstName");
                      const sLast = form.getValues("studentLastName");
                      const sEmail = form.getValues("studentEmail");
                      const sPhone = form.getValues("studentPhone");
                      const sTax = form.getValues("studentTaxCode");

                      if (sFirst || sLast || sEmail || sPhone || sTax) {
                        if (!form.getValues("purchaserFirstName")) form.setValue("purchaserFirstName", sFirst || "");
                        if (!form.getValues("purchaserLastName")) form.setValue("purchaserLastName", sLast || "");
                        if (!form.getValues("purchaserEmail")) form.setValue("purchaserEmail", sEmail || "");
                        if (!form.getValues("purchaserPhone")) form.setValue("purchaserPhone", sPhone || "");
                        if (!form.getValues("purchaserTaxCode")) form.setValue("purchaserTaxCode", sTax || "");

                        // Clear student fields
                        form.setValue("studentFirstName", "");
                        form.setValue("studentLastName", "");
                        form.setValue("studentEmail", "");
                        form.setValue("studentPhone", "");
                        form.setValue("studentTaxCode", "");
                        form.setValue("studentBirthDate", "");
                      }
                    }

                    setSearchQuery("");
                    setClientFound(null);
                  }}
                  className="w-5 h-5 cursor-pointer"
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Unified Autocomplete Search Input + Dropdown */}
        <div className="relative space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-primary" />
              Cerca o Seleziona Cliente in Anagrafica
            </label>
            {clientFound === true && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Anagrafica trovata
              </span>
            )}
            {clientFound === false && (
              <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Nessun risultato
              </span>
            )}
          </div>

          <div className="relative">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
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
                  className="pl-9 pr-8 h-10 text-sm bg-background"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setIsSearchOpen(false);
                      setClientFound(null);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>

              <Button
                type="button"
                variant="secondary"
                disabled={isSearchingClient || !searchQuery.trim()}
                onClick={handleManualLookup}
                className="h-10 px-4 text-xs font-semibold cursor-pointer shrink-0"
              >
                {isSearchingClient ? <Loader2 className="w-4 h-4 animate-spin" /> : "Cerca"}
              </Button>
            </div>

            {/* Filtered Dropdown List */}
            {isSearchOpen && (
              <div className="absolute z-50 left-0 right-0 top-full mt-1.5 bg-popover text-popover-foreground border border-border/80 rounded-xl shadow-xl overflow-hidden max-h-60 overflow-y-auto">
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
                        className="w-full text-left px-3.5 py-2.5 hover:bg-muted/80 transition-colors flex flex-col gap-0.5 cursor-pointer text-xs"
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
      </div>

      {/* Form Section */}
      <div className="space-y-5">
        {/* Genitore / Acquirente Card */}
        <div className="p-5 bg-muted/20 rounded-2xl border border-border/60 space-y-4">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4.5 h-4.5 text-primary" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
              {isForChild ? "Genitore / Acquirente (Intestatario Pagamenti)" : "Dati Anagrafici Cliente"}
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <FormField
              control={form.control}
              name="purchaserFirstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold">{isForChild ? "Nome Genitore *" : "Nome *"}</FormLabel>
                  <FormControl><Input placeholder="Mario" className="h-10 text-sm bg-background" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="purchaserLastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold">{isForChild ? "Cognome Genitore *" : "Cognome *"}</FormLabel>
                  <FormControl><Input placeholder="Rossi" className="h-10 text-sm bg-background" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="purchaserEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold">{isForChild ? "Email Genitore *" : "Email *"}</FormLabel>
                  <FormControl><Input type="email" placeholder="mario.rossi@email.com" className="h-10 text-sm bg-background" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="purchaserPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold">{isForChild ? "Telefono Genitore" : "Telefono"}</FormLabel>
                  <FormControl><Input placeholder="+39 340 1234567" className="h-10 text-sm bg-background" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="purchaserTaxCode"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel className="text-xs font-semibold">Codice Fiscale {isForChild ? "Genitore" : "Cliente"}</FormLabel>
                  <FormControl><Input placeholder="RSSMRA80A01H501Z" className="uppercase font-mono h-10 text-sm bg-background" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Studente (Figlio) Card - Only shown when isForChild is true */}
        {isForChild && (
          <div className="p-5 bg-primary/5 rounded-2xl border border-primary/20 space-y-4">
            <div className="flex items-center gap-2">
              <Baby className="w-4.5 h-4.5 text-primary" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-primary">
                Dati dello Studente Minorenne (Figlio)
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <FormField
                control={form.control}
                name="studentFirstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold">Nome Figlio *</FormLabel>
                    <FormControl><Input placeholder="Luca" className="h-10 text-sm bg-background" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="studentLastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold">Cognome Figlio *</FormLabel>
                    <FormControl><Input placeholder="Rossi" className="h-10 text-sm bg-background" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="studentEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold">Email Figlio (opzionale)</FormLabel>
                    <FormControl><Input type="email" placeholder="luca@email.com" className="h-10 text-sm bg-background" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="studentPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold">Tel. Figlio (opzionale)</FormLabel>
                    <FormControl><Input placeholder="+39 340 9876543" className="h-10 text-sm bg-background" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="studentTaxCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold">Codice Fiscale Figlio</FormLabel>
                    <FormControl><Input placeholder="RSSLCU10A01H501Z" className="uppercase font-mono h-10 text-sm bg-background" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="studentBirthDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold">Data Nascita Figlio</FormLabel>
                    <FormControl><Input type="date" className="h-10 text-sm bg-background" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}

        {/* Membership Fee Banner - Rendered at bottom of Step 1 */}
        {membershipFeeStatus.checked && (
          <div
            className={`p-4 rounded-xl border flex items-center justify-between text-xs ${
              membershipFeeStatus.paid
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-300"
                : "bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-300"
            }`}
          >
            <div className="flex items-center gap-2.5">
              {membershipFeeStatus.paid ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              )}
              <div>
                <p className="font-bold text-sm">
                  {membershipFeeStatus.paid
                    ? "Quota Associativa A.A. 2026/2027 già saldata"
                    : "Quota Associativa A.A. 2026/2027 da saldare"}
                </p>
                <p className="text-xs opacity-90">
                  {membershipFeeStatus.paid
                    ? `L'iscrizione annuale di €30 risulta già pagata per ${isForChild ? "lo studente" : "il cliente"}.`
                    : `Il cliente deve pagare la quota associativa di iscrizione (€30).`}
                </p>
              </div>
            </div>
            <Badge
              variant="secondary"
              className={`font-mono font-bold text-xs px-3 py-1 ${
                membershipFeeStatus.paid ? "bg-emerald-600 text-white" : "bg-amber-600 text-white"
              }`}
            >
              {membershipFeeStatus.paid ? "€0.00" : "+ €30.00"}
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
}
