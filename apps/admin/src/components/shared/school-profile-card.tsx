"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Euro,
  Share2,
  Sparkles,
  Save,
  RotateCcw,
  Loader2,
  CheckCircle2,
  Globe,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useTranslation } from "@/i18n/context";
import { DEFAULT_SCHOOL_PROFILE, type SchoolProfile } from "@atena/api-types";

const schoolProfileSchema = z.object({
  name: z.string().min(1, "Il nome della scuola è obbligatorio"),
  legal_name: z.string().optional(),
  tagline: z.string().optional(),
  founders: z.string().optional(),
  logo_url: z.string().optional(),
  website: z.string().optional(),
  // Sede & Indirizzo
  address: z.string().optional(),
  city: z.string().optional(),
  cap: z.string().optional(),
  province: z.string().optional(),
  country: z.string().optional(),
  maps_url: z.string().optional(),
  // Contatti
  phone: z.string().optional(),
  landline: z.string().optional(),
  whatsapp: z.string().optional(),
  email: z.string().email("Email non valida").or(z.literal("")).optional(),
  secretariat_email: z.string().email("Email non valida").or(z.literal("")).optional(),
  support_email: z.string().email("Email non valida").or(z.literal("")).optional(),
  secretariat_hours: z.string().optional(),
  // Fiscale & Quota & Bonifico
  vat_code: z.string().optional(),
  registration_fee_eur: z.coerce.number().min(0).max(500),
  academic_year: z.string().optional(),
  iban: z.string().optional(),
  bank_name: z.string().optional(),
  account_holder: z.string().optional(),
  // Socials
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  linkedin: z.string().optional(),
  youtube: z.string().optional(),
  tiktok: z.string().optional(),
});

type SchoolProfileFormValues = z.infer<typeof schoolProfileSchema>;

export function SchoolProfileCard() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  const form = useForm<SchoolProfileFormValues>({
    resolver: zodResolver(schoolProfileSchema) as any,
    defaultValues: {
      name: DEFAULT_SCHOOL_PROFILE.name,
      legal_name: DEFAULT_SCHOOL_PROFILE.legal_name || "",
      tagline: DEFAULT_SCHOOL_PROFILE.tagline || "",
      founders: DEFAULT_SCHOOL_PROFILE.founders || "",
      logo_url: DEFAULT_SCHOOL_PROFILE.logo_url || "",
      website: DEFAULT_SCHOOL_PROFILE.website || "",
      address: DEFAULT_SCHOOL_PROFILE.address || "",
      city: DEFAULT_SCHOOL_PROFILE.city || "",
      cap: DEFAULT_SCHOOL_PROFILE.cap || "",
      province: DEFAULT_SCHOOL_PROFILE.province || "",
      country: DEFAULT_SCHOOL_PROFILE.country || "Italia",
      maps_url: DEFAULT_SCHOOL_PROFILE.maps_url || "",
      phone: DEFAULT_SCHOOL_PROFILE.phone || "",
      landline: DEFAULT_SCHOOL_PROFILE.landline || "",
      whatsapp: DEFAULT_SCHOOL_PROFILE.whatsapp || "",
      email: DEFAULT_SCHOOL_PROFILE.email || "",
      secretariat_email: DEFAULT_SCHOOL_PROFILE.secretariat_email || "",
      support_email: DEFAULT_SCHOOL_PROFILE.support_email || "",
      secretariat_hours: DEFAULT_SCHOOL_PROFILE.secretariat_hours || "",
      vat_code: DEFAULT_SCHOOL_PROFILE.vat_code || "",
      registration_fee_eur: DEFAULT_SCHOOL_PROFILE.registration_fee_eur || 30,
      academic_year: DEFAULT_SCHOOL_PROFILE.academic_year || "2026/2027",
      iban: DEFAULT_SCHOOL_PROFILE.iban || "",
      bank_name: DEFAULT_SCHOOL_PROFILE.bank_name || "",
      account_holder: DEFAULT_SCHOOL_PROFILE.account_holder || "",
      instagram: DEFAULT_SCHOOL_PROFILE.socials?.instagram || "",
      facebook: DEFAULT_SCHOOL_PROFILE.socials?.facebook || "",
      linkedin: DEFAULT_SCHOOL_PROFILE.socials?.linkedin || "",
      youtube: DEFAULT_SCHOOL_PROFILE.socials?.youtube || "",
      tiktok: DEFAULT_SCHOOL_PROFILE.socials?.tiktok || "",
    },
  });

  useEffect(() => {
    let isMounted = true;
    async function loadProfile() {
      try {
        setLoading(true);
        const res = await api.get<{ success: boolean; profile: SchoolProfile }>("/admin/settings/school-profile");
        if (isMounted && res?.profile) {
          const p = res.profile;
          const cleanAddress = (p.address || "").replace(/,\s*[A-Za-zÀ-ÿ\s'-]+(?:\s*\([A-Za-z]{2}\))?(?:\s*\d{5})?$/i, '').trim() || p.address || "";
          form.reset({
            name: p.name || DEFAULT_SCHOOL_PROFILE.name,
            legal_name: p.legal_name || "",
            tagline: p.tagline || "",
            founders: p.founders || "",
            logo_url: p.logo_url || "",
            website: p.website || "",
            address: cleanAddress,
            city: p.city || "",
            cap: p.cap || "",
            province: p.province || "",
            country: p.country || "Italia",
            maps_url: p.maps_url || "",
            phone: p.phone || "",
            landline: p.landline || "",
            whatsapp: p.whatsapp || "",
            email: p.email || "",
            secretariat_email: p.secretariat_email || "",
            support_email: p.support_email || "",
            secretariat_hours: p.secretariat_hours || "",
            vat_code: p.vat_code || "",
            registration_fee_eur: p.registration_fee_eur ?? 30,
            academic_year: p.academic_year || "2026/2027",
            iban: p.iban || "",
            bank_name: p.bank_name || "",
            account_holder: p.account_holder || "",
            instagram: p.socials?.instagram || "",
            facebook: p.socials?.facebook || "",
            linkedin: p.socials?.linkedin || "",
            youtube: p.socials?.youtube || "",
            tiktok: p.socials?.tiktok || "",
          });
        }
      } catch (err) {
        console.warn("[SchoolProfileCard] Failed to fetch profile:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const onSubmit = async (values: SchoolProfileFormValues) => {
    try {
      setSaving(true);
      const cleanAddress = (values.address || "").replace(/,\s*[A-Za-zÀ-ÿ\s'-]+(?:\s*\([A-Za-z]{2}\))?(?:\s*\d{5})?$/i, '').trim() || values.address;
      const payload: Partial<SchoolProfile> = {
        name: values.name,
        legal_name: values.legal_name,
        tagline: values.tagline,
        founders: values.founders,
        logo_url: values.logo_url,
        website: values.website,
        address: cleanAddress,
        city: values.city,
        cap: values.cap,
        province: values.province,
        country: values.country,
        maps_url: values.maps_url,
        phone: values.phone,
        landline: values.landline,
        whatsapp: values.whatsapp,
        email: values.email,
        secretariat_email: values.secretariat_email,
        support_email: values.support_email,
        secretariat_hours: values.secretariat_hours,
        vat_code: values.vat_code,
        registration_fee_eur: Number(values.registration_fee_eur),
        academic_year: values.academic_year,
        iban: values.iban,
        bank_name: values.bank_name,
        account_holder: values.account_holder,
        socials: {
          instagram: values.instagram,
          facebook: values.facebook,
          linkedin: values.linkedin,
          youtube: values.youtube,
          tiktok: values.tiktok,
        },
      };

      const res = await api.patch<{ success: boolean; profile: SchoolProfile }>("/admin/settings/school-profile", payload);
      if (res?.success) {
        toast.success("Profilo e brand della scuola salvati con successo!");
      }
    } catch (err: any) {
      toast.error(err?.message || "Errore durante il salvataggio");
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    form.reset({
      name: DEFAULT_SCHOOL_PROFILE.name,
      legal_name: DEFAULT_SCHOOL_PROFILE.legal_name || "",
      tagline: DEFAULT_SCHOOL_PROFILE.tagline || "",
      founders: DEFAULT_SCHOOL_PROFILE.founders || "",
      logo_url: DEFAULT_SCHOOL_PROFILE.logo_url || "",
      website: DEFAULT_SCHOOL_PROFILE.website || "",
      address: DEFAULT_SCHOOL_PROFILE.address || "",
      city: DEFAULT_SCHOOL_PROFILE.city || "",
      cap: DEFAULT_SCHOOL_PROFILE.cap || "",
      province: DEFAULT_SCHOOL_PROFILE.province || "",
      country: DEFAULT_SCHOOL_PROFILE.country || "Italia",
      maps_url: DEFAULT_SCHOOL_PROFILE.maps_url || "",
      phone: DEFAULT_SCHOOL_PROFILE.phone || "",
      landline: DEFAULT_SCHOOL_PROFILE.landline || "",
      whatsapp: DEFAULT_SCHOOL_PROFILE.whatsapp || "",
      email: DEFAULT_SCHOOL_PROFILE.email || "",
      secretariat_email: DEFAULT_SCHOOL_PROFILE.secretariat_email || "",
      support_email: DEFAULT_SCHOOL_PROFILE.support_email || "",
      secretariat_hours: DEFAULT_SCHOOL_PROFILE.secretariat_hours || "",
      vat_code: DEFAULT_SCHOOL_PROFILE.vat_code || "",
      registration_fee_eur: DEFAULT_SCHOOL_PROFILE.registration_fee_eur || 30,
      academic_year: DEFAULT_SCHOOL_PROFILE.academic_year || "2026/2027",
      iban: DEFAULT_SCHOOL_PROFILE.iban || "",
      bank_name: DEFAULT_SCHOOL_PROFILE.bank_name || "",
      account_holder: DEFAULT_SCHOOL_PROFILE.account_holder || "",
      instagram: DEFAULT_SCHOOL_PROFILE.socials?.instagram || "",
      facebook: DEFAULT_SCHOOL_PROFILE.socials?.facebook || "",
      linkedin: DEFAULT_SCHOOL_PROFILE.socials?.linkedin || "",
      youtube: DEFAULT_SCHOOL_PROFILE.socials?.youtube || "",
      tiktok: DEFAULT_SCHOOL_PROFILE.socials?.tiktok || "",
    });
    toast.info("Valori predefiniti ripristinati. Ricordati di salvare le modifiche.");
  };

  return (
    <Card className="border-2 border-primary/20 shadow-sm overflow-hidden">
      <CardHeader className="bg-muted/30 pb-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <span>Profilo & White-Label Brand della Scuola</span>
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[10px] font-bold">
                  White-Label Ready
                </Badge>
              </CardTitle>
              <CardDescription>
                Personalizza l'identità, i contatti, la sede e i dati fiscali visibili sul sito, nel portale studenti e nelle email.
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleResetDefaults}
              disabled={loading || saving}
              className="cursor-pointer text-xs"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
              Predefiniti
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={form.handleSubmit(onSubmit)}
              disabled={loading || saving}
              className="cursor-pointer text-xs bg-primary hover:bg-primary/90"
            >
              {saving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  Salvataggio...
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5 mr-1.5" />
                  Salva Modifiche
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="identity" className="w-full">
              <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full h-auto p-1 bg-muted/60">
                <TabsTrigger value="identity" className="flex items-center gap-1.5 text-xs py-2">
                  <Sparkles className="h-3.5 w-3.5" />
                  Identità & Brand
                </TabsTrigger>
                <TabsTrigger value="address" className="flex items-center gap-1.5 text-xs py-2">
                  <MapPin className="h-3.5 w-3.5" />
                  Sede & Indirizzo
                </TabsTrigger>
                <TabsTrigger value="contacts" className="flex items-center gap-1.5 text-xs py-2">
                  <Phone className="h-3.5 w-3.5" />
                  Contatti & Orari
                </TabsTrigger>
                <TabsTrigger value="finance" className="flex items-center gap-1.5 text-xs py-2">
                  <Euro className="h-3.5 w-3.5" />
                  Fiscale & Quota
                </TabsTrigger>
                <TabsTrigger value="socials" className="flex items-center gap-1.5 text-xs py-2">
                  <Share2 className="h-3.5 w-3.5" />
                  Social Media
                </TabsTrigger>
              </TabsList>

              {/* 1. IDENTITÀ & BRAND */}
              <TabsContent value="identity" className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold">Nome Commerciale Scuola *</FormLabel>
                        <FormControl>
                          <Input placeholder="Es. Atena School" {...field} />
                        </FormControl>
                        <FormDescription className="text-[11px]">
                          Nome visualizzato su header, footer, email e ricevute.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="legal_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold">Ragione Sociale (Società)</FormLabel>
                        <FormControl>
                          <Input placeholder="Es. Atena School S.r.l.s." {...field} />
                        </FormControl>
                        <FormDescription className="text-[11px]">
                          Denominazione giuridica usata nei documenti contrattuali.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="tagline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold">Motto / Slogan</FormLabel>
                        <FormControl>
                          <Input placeholder="Es. civitatis ornamento" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="founders"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold">Fondatori / Direzione</FormLabel>
                        <FormControl>
                          <Input placeholder="Es. ELISABETTA & MARIA, FONDATRICI" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="logo_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold">URL Logo</FormLabel>
                        <FormControl>
                          <Input placeholder="/assets/logo.webp o URL esterno" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold">Sito Web Principale</FormLabel>
                        <FormControl>
                          <Input placeholder="https://atenaschool.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              {/* 2. SEDE & INDIRIZZO */}
              <TabsContent value="address" className="space-y-4 pt-4">
                {/* Live Full Address Preview */}
                <div className="p-3.5 bg-slate-900/80 border border-slate-700/80 rounded-xl flex items-center gap-3 text-left">
                  <div className="p-2 bg-orange-500/10 text-orange-400 rounded-lg shrink-0">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div className="text-xs">
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase tracking-wider">
                      Anteprima indirizzo completo visibile sul sito:
                    </span>
                    <span className="font-bold text-white text-xs sm:text-sm">
                      {[
                        form.watch("address")?.replace(/,.*$/, "").trim() || "Via Matteotti 11",
                        [form.watch("cap") || "89022", form.watch("city") || "Cittanova", form.watch("province") ? `(${form.watch("province")})` : "(RC)"].filter(Boolean).join(" ")
                      ].filter(Boolean).join(", ")}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold">Via e Numero Civico</FormLabel>
                          <FormControl>
                            <Input placeholder="Es. Via Matteotti 11" {...field} />
                          </FormControl>
                          <FormDescription className="text-[11px]">
                            Solo il nome della via e civico (es. <em>Via Roma 15</em>). Non inserire città o CAP qui.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div>
                    <FormField
                      control={form.control}
                      name="cap"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold">C.A.P. (Codice Postale)</FormLabel>
                          <FormControl>
                            <Input placeholder="Es. 89022" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold">Città / Comune</FormLabel>
                          <FormControl>
                            <Input placeholder="Es. Polistena" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div>
                    <FormField
                      control={form.control}
                      name="province"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold">Provincia (Sigla)</FormLabel>
                          <FormControl>
                            <Input placeholder="Es. RC" maxLength={4} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div>
                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold">Paese / Nazione</FormLabel>
                          <FormControl>
                            <Input placeholder="Italia" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="maps_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold">Link Google Maps / Scheda Attività</FormLabel>
                      <FormControl>
                        <Input placeholder="https://maps.app.goo.gl/..." {...field} />
                      </FormControl>
                      <FormDescription className="text-[11px]">
                        Link aperto dal pulsante "Apri in Google Maps" e nelle recensioni sul sito.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              {/* 3. CONTATTI & ORARI */}
              <TabsContent value="contacts" className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold">Cellulare Principale</FormLabel>
                        <FormControl>
                          <Input placeholder="+39 375 605 2362" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="landline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold">Telefono Fisso Sede</FormLabel>
                        <FormControl>
                          <Input placeholder="0966 447052" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="whatsapp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold">Numero WhatsApp</FormLabel>
                        <FormControl>
                          <Input placeholder="+39 375 605 2362" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold">Email Pubblica Info</FormLabel>
                        <FormControl>
                          <Input placeholder="info@atenaschool.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="secretariat_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold">Email Segreteria (Notifiche)</FormLabel>
                        <FormControl>
                          <Input placeholder="segreteria@atenaschool.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="support_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold">Email Supporto Tecnico</FormLabel>
                        <FormControl>
                          <Input placeholder="supporto@atenaschool.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="secretariat_hours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold">Orari Apertura Segreteria</FormLabel>
                      <FormControl>
                        <Input placeholder="Martedì e Giovedì dalle ore 15:00 alle ore 18:00" {...field} />
                      </FormControl>
                      <FormDescription className="text-[11px]">
                        Visualizzato nelle email automatiche e nel footer del sito.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              {/* 4. FISCALE & QUOTA */}
              <TabsContent value="finance" className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="vat_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold">P.IVA / Codice Fiscale Scuola</FormLabel>
                        <FormControl>
                          <Input placeholder="P.IVA/C.F. 03321620803" {...field} />
                        </FormControl>
                        <FormDescription className="text-[11px]">
                          Inserito a piè di pagina del sito e sulle ricevute.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="registration_fee_eur"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold">Quota Associativa Annuale (€)</FormLabel>
                        <FormControl>
                          <Input type="number" min={0} max={500} step={1} {...field} />
                        </FormControl>
                        <FormDescription className="text-[11px]">
                          Importo della quota associativa annuale (default standard: €30).
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="academic_year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold">Anno Accademico</FormLabel>
                        <FormControl>
                          <Input placeholder="Es. 2026/2027" {...field} />
                        </FormControl>
                        <FormDescription className="text-[11px]">
                          Visualizzato nel badge della quota associativa al checkout.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="pt-2 border-t border-border">
                  <h4 className="text-xs font-bold text-foreground mb-1">Coordinate Bancarie per Pagamenti Bonifico</h4>
                  <p className="text-[11px] text-muted-foreground mb-3">
                    Dati bancari inseriti automaticamente nelle email di conferma ordine per chi sceglie di saldare via bonifico.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="iban"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold">IBAN Conto Corrente</FormLabel>
                          <FormControl>
                            <Input placeholder="Es. IT60X0542811101000000123456" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="bank_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold">Nome Banca / Istituto</FormLabel>
                          <FormControl>
                            <Input placeholder="Es. Banca Popolare / Intesa Sanpaolo" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="account_holder"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold">Intestatario Conto</FormLabel>
                          <FormControl>
                            <Input placeholder="Es. Atena School S.r.l.s." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* 5. SOCIAL MEDIA */}
              <TabsContent value="socials" className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="instagram"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold">Instagram URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://instagram.com/atenaschool" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="facebook"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold">Facebook URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://facebook.com/atenaschool" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="linkedin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold">LinkedIn URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://linkedin.com/company/atenaschool" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="youtube"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold">YouTube URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://youtube.com/@atenaschool" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tiktok"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold">TikTok URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://tiktok.com/@atenaschool" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
