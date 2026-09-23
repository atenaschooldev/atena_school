"use client";

import type { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  UserCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CreateBookingValues, ClientItem } from "./types";
import { useSchoolProfile } from "@/hooks/use-school-profile";

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
  const { profile } = useSchoolProfile();
  const feeAmount = profile?.registration_fee_eur != null ? Number(profile.registration_fee_eur) : 30;
  const academicYear = profile?.academic_year || "2026/2027";

  const handleCustomerTypeChange = (forChild: boolean) => {
    form.setValue("isForChild", forChild);
    if (forChild) {
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

        form.setValue("purchaserFirstName", "");
        form.setValue("purchaserLastName", "");
        form.setValue("purchaserEmail", "");
        form.setValue("purchaserPhone", "");
        form.setValue("purchaserTaxCode", "");
      }
    } else {
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
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/70" />
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
                className="pl-9 pr-8 h-9 text-xs bg-background rounded-lg"
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
              className="h-9 px-3.5 text-xs font-semibold cursor-pointer shrink-0"
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

      {/* 3. Form Cards */}
      <div className="space-y-4">
        {/* Genitore / Acquirente Card */}
        <div className="p-4 bg-muted/20 rounded-xl border border-border/60 space-y-3">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-primary" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              {isForChild ? "Genitore / Intestatario Pagamento" : "Dati Anagrafici Cliente"}
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="purchaserFirstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold">{isForChild ? "Nome Genitore *" : "Nome *"}</FormLabel>
                  <FormControl><Input placeholder="Mario" className="h-9 text-xs bg-background" {...field} /></FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="purchaserLastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold">{isForChild ? "Cognome Genitore *" : "Cognome *"}</FormLabel>
                  <FormControl><Input placeholder="Rossi" className="h-9 text-xs bg-background" {...field} /></FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="purchaserEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold">{isForChild ? "Email Genitore *" : "Email *"}</FormLabel>
                  <FormControl><Input type="email" placeholder="mario.rossi@email.com" className="h-9 text-xs bg-background" {...field} /></FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="purchaserPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold">{isForChild ? "Telefono Genitore" : "Telefono"}</FormLabel>
                  <FormControl><Input placeholder="+39 340 1234567" className="h-9 text-xs bg-background" {...field} /></FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="purchaserTaxCode"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel className="text-xs font-semibold">Codice Fiscale {isForChild ? "Genitore" : "Cliente"}</FormLabel>
                  <FormControl><Input placeholder="RSSMRA80A01H501Z" className="uppercase font-mono h-9 text-xs bg-background" {...field} /></FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Studente (Figlio) Card - Only shown when isForChild is true */}
        {isForChild && (
          <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 space-y-3">
            <div className="flex items-center gap-2">
              <Baby className="w-4 h-4 text-primary" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
                Dati dello Studente Minorenne (Figlio)
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="studentFirstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold">Nome Figlio *</FormLabel>
                    <FormControl><Input placeholder="Luca" className="h-9 text-xs bg-background" {...field} /></FormControl>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="studentLastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold">Cognome Figlio *</FormLabel>
                    <FormControl><Input placeholder="Rossi" className="h-9 text-xs bg-background" {...field} /></FormControl>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="studentBirthDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold">Data Nascita Figlio</FormLabel>
                    <FormControl><Input type="date" className="h-9 text-xs bg-background" {...field} /></FormControl>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="studentTaxCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold">Codice Fiscale Figlio</FormLabel>
                    <FormControl><Input placeholder="RSSLCU10A01H501Z" className="uppercase font-mono h-9 text-xs bg-background" {...field} /></FormControl>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="studentEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold">Email Figlio (opzionale)</FormLabel>
                    <FormControl><Input type="email" placeholder="luca@email.com" className="h-9 text-xs bg-background" {...field} /></FormControl>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="studentPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold">Tel. Figlio (opzionale)</FormLabel>
                    <FormControl><Input placeholder="+39 340 9876543" className="h-9 text-xs bg-background" {...field} /></FormControl>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
