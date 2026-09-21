"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  Euro,
  Share2,
  Sparkles,
  Save,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useTranslation } from "@/i18n/context";
import { DEFAULT_SCHOOL_PROFILE, type SchoolProfile } from "@atena/api-types";

const schoolProfileSchema = z.object({
  name: z.string().min(1, "School name is required"),
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
  email: z.string().email("Invalid email").or(z.literal("")).optional(),
  secretariat_email: z.string().email("Invalid email").or(z.literal("")).optional(),
  support_email: z.string().email("Invalid email").or(z.literal("")).optional(),
  secretariat_hours: z.string().optional(),
  // Fiscale & Quota & Bonifico
  vat_code: z.string().optional(),
  registration_fee_enabled: z.boolean().optional(),
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
      registration_fee_enabled: DEFAULT_SCHOOL_PROFILE.registration_fee_enabled ?? true,
      registration_fee_eur: DEFAULT_SCHOOL_PROFILE.registration_fee_eur ?? 30,
      academic_year: DEFAULT_SCHOOL_PROFILE.academic_year || "2026/2027",
      iban: DEFAULT_SCHOOL_PROFILE.iban || "",
      bank_name: DEFAULT_SCHOOL_PROFILE.bank_name || "",
      account_holder: DEFAULT_SCHOOL_PROFILE.account_holder || "",
      instagram: DEFAULT_SCHOOL_PROFILE.instagram || "",
      facebook: DEFAULT_SCHOOL_PROFILE.facebook || "",
      linkedin: DEFAULT_SCHOOL_PROFILE.linkedin || "",
      youtube: DEFAULT_SCHOOL_PROFILE.youtube || "",
      tiktok: DEFAULT_SCHOOL_PROFILE.tiktok || "",
    },
  });

  useEffect(() => {
    let mounted = true;
    async function loadProfile() {
      try {
        setLoading(true);
        const data = await api.get<SchoolProfile>("/school-profile");
        if (mounted && data) {
          form.reset({
            name: data.name || DEFAULT_SCHOOL_PROFILE.name,
            legal_name: data.legal_name || "",
            tagline: data.tagline || "",
            founders: data.founders || "",
            logo_url: data.logo_url || "",
            website: data.website || "",
            address: data.address || "",
            city: data.city || "",
            cap: data.cap || "",
            province: data.province || "",
            country: data.country || "Italia",
            maps_url: data.maps_url || "",
            phone: data.phone || "",
            landline: data.landline || "",
            whatsapp: data.whatsapp || "",
            email: data.email || "",
            secretariat_email: data.secretariat_email || "",
            support_email: data.support_email || "",
            secretariat_hours: data.secretariat_hours || "",
            vat_code: data.vat_code || "",
            registration_fee_enabled: data.registration_fee_enabled !== false,
            registration_fee_eur: data.registration_fee_eur ?? 30,
            academic_year: data.academic_year || "2026/2027",
            iban: data.iban || "",
            bank_name: data.bank_name || "",
            account_holder: data.account_holder || "",
            instagram: data.instagram || "",
            facebook: data.facebook || "",
            linkedin: data.linkedin || "",
            youtube: data.youtube || "",
            tiktok: data.tiktok || "",
          });
        }
      } catch (err) {
        console.warn("[SchoolProfileCard] Failed to fetch profile:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadProfile();
    return () => {
      mounted = false;
    };
  }, [form]);

  const onSubmit = async (values: SchoolProfileFormValues) => {
    try {
      setSaving(true);
      const updated = await api.put<SchoolProfile>("/school-profile", values);
      form.reset({
        name: updated.name || values.name,
        legal_name: updated.legal_name || "",
        tagline: updated.tagline || "",
        founders: updated.founders || "",
        logo_url: updated.logo_url || "",
        website: updated.website || "",
        address: updated.address || "",
        city: updated.city || "",
        cap: updated.cap || "",
        province: updated.province || "",
        country: updated.country || "Italia",
        maps_url: updated.maps_url || "",
        phone: updated.phone || "",
        landline: updated.landline || "",
        whatsapp: updated.whatsapp || "",
        email: updated.email || "",
        secretariat_email: updated.secretariat_email || "",
        support_email: updated.support_email || "",
        secretariat_hours: updated.secretariat_hours || "",
        vat_code: updated.vat_code || "",
        registration_fee_enabled: updated.registration_fee_enabled !== false,
        registration_fee_eur: updated.registration_fee_eur ?? 30,
        academic_year: updated.academic_year || "2026/2027",
        iban: updated.iban || "",
        bank_name: updated.bank_name || "",
        account_holder: updated.account_holder || "",
        instagram: updated.instagram || "",
        facebook: updated.facebook || "",
        linkedin: updated.linkedin || "",
        youtube: updated.youtube || "",
        tiktok: updated.tiktok || "",
      });
      toast.success(t("schoolProfile.profileSaved"));
    } catch (err: any) {
      toast.error(err.message || "Error saving profile");
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
      registration_fee_eur: DEFAULT_SCHOOL_PROFILE.registration_fee_eur ?? 30,
      academic_year: DEFAULT_SCHOOL_PROFILE.academic_year || "2026/2027",
      iban: DEFAULT_SCHOOL_PROFILE.iban || "",
      bank_name: DEFAULT_SCHOOL_PROFILE.bank_name || "",
      account_holder: DEFAULT_SCHOOL_PROFILE.account_holder || "",
      instagram: DEFAULT_SCHOOL_PROFILE.instagram || "",
      facebook: DEFAULT_SCHOOL_PROFILE.facebook || "",
      linkedin: DEFAULT_SCHOOL_PROFILE.linkedin || "",
      youtube: DEFAULT_SCHOOL_PROFILE.youtube || "",
      tiktok: DEFAULT_SCHOOL_PROFILE.tiktok || "",
    });
    toast.info(t("schoolProfile.resetConfirmDesc"));
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
                <span>{t("schoolProfile.title")}</span>
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[10px] font-bold">
                  {t("schoolProfile.whiteLabelReady")}
                </Badge>
              </CardTitle>
              <CardDescription>
                {t("schoolProfile.subtitle")}
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
              {t("schoolProfile.resetDefaults")}
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
                  {t("schoolProfile.saving")}
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5 mr-1.5" />
                  {t("schoolProfile.saveChanges")}
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
                <TabsTrigger value="identity" className="flex items-center gap-1.5 text-xs py-2 cursor-pointer">
                  <Sparkles className="h-3.5 w-3.5" />
                  {t("schoolProfile.tabIdentity")}
                </TabsTrigger>
                <TabsTrigger value="address" className="flex items-center gap-1.5 text-xs py-2 cursor-pointer">
                  <MapPin className="h-3.5 w-3.5" />
                  {t("schoolProfile.tabAddress")}
                </TabsTrigger>
                <TabsTrigger value="contacts" className="flex items-center gap-1.5 text-xs py-2 cursor-pointer">
                  <Phone className="h-3.5 w-3.5" />
                  {t("schoolProfile.tabContacts")}
                </TabsTrigger>
                <TabsTrigger value="finance" className="flex items-center gap-1.5 text-xs py-2 cursor-pointer">
                  <Euro className="h-3.5 w-3.5" />
                  {t("schoolProfile.tabFinance")}
                </TabsTrigger>
                <TabsTrigger value="socials" className="flex items-center gap-1.5 text-xs py-2 cursor-pointer">
                  <Share2 className="h-3.5 w-3.5" />
                  {t("schoolProfile.tabSocials")}
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
                        <FormLabel className="text-xs font-bold">{t("schoolProfile.schoolName")} *</FormLabel>
                        <FormControl>
                          <Input placeholder="Es. Atena School" {...field} />
                        </FormControl>
                        <FormDescription className="text-[11px]">
                          {t("schoolProfile.schoolNameDesc")}
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
                        <FormLabel className="text-xs font-bold">{t("schoolProfile.legalName")}</FormLabel>
                        <FormControl>
                          <Input placeholder="Es. Atena School S.r.l.s." {...field} />
                        </FormControl>
                        <FormDescription className="text-[11px]">
                          {t("schoolProfile.legalNameDesc")}
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
                        <FormLabel className="text-xs font-bold">{t("schoolProfile.tagline")}</FormLabel>
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
                        <FormLabel className="text-xs font-bold">{t("schoolProfile.founders")}</FormLabel>
                        <FormControl>
                          <Input placeholder="Es. Elisabetta & Maria" {...field} />
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
                        <FormLabel className="text-xs font-bold">{t("schoolProfile.logoUrl")}</FormLabel>
                        <FormControl>
                          <Input placeholder="/assets/logo.webp" {...field} />
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
                        <FormLabel className="text-xs font-bold">{t("schoolProfile.website")}</FormLabel>
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
                      {t("schoolProfile.addressPreview")}
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
                          <FormLabel className="text-xs font-bold">{t("schoolProfile.streetAndNumber")}</FormLabel>
                          <FormControl>
                            <Input placeholder="Es. Via Matteotti 11" {...field} />
                          </FormControl>
                          <FormDescription className="text-[11px]">
                            {t("schoolProfile.streetAndNumberDesc")}
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
                          <FormLabel className="text-xs font-bold">{t("schoolProfile.zipCode")}</FormLabel>
                          <FormControl>
                            <Input placeholder="89022" {...field} />
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
                          <FormLabel className="text-xs font-bold">{t("schoolProfile.city")}</FormLabel>
                          <FormControl>
                            <Input placeholder="Polistena" {...field} />
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
                          <FormLabel className="text-xs font-bold">{t("schoolProfile.province")}</FormLabel>
                          <FormControl>
                            <Input placeholder="RC" maxLength={4} {...field} />
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
                          <FormLabel className="text-xs font-bold">{t("schoolProfile.country")}</FormLabel>
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
                      <FormLabel className="text-xs font-bold">{t("schoolProfile.mapsUrl")}</FormLabel>
                      <FormControl>
                        <Input placeholder="https://maps.app.goo.gl/..." {...field} />
                      </FormControl>
                      <FormDescription className="text-[11px]">
                        {t("schoolProfile.mapsUrlDesc")}
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
                        <FormLabel className="text-xs font-bold">{t("schoolProfile.primaryPhone")}</FormLabel>
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
                        <FormLabel className="text-xs font-bold">{t("schoolProfile.landline")}</FormLabel>
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
                        <FormLabel className="text-xs font-bold">{t("schoolProfile.whatsapp")}</FormLabel>
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
                        <FormLabel className="text-xs font-bold">{t("schoolProfile.generalEmail")}</FormLabel>
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
                        <FormLabel className="text-xs font-bold">{t("schoolProfile.secretariatEmail")}</FormLabel>
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
                        <FormLabel className="text-xs font-bold">{t("schoolProfile.supportEmail")}</FormLabel>
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
                      <FormLabel className="text-xs font-bold">{t("schoolProfile.secretariatHours")}</FormLabel>
                      <FormControl>
                        <Input placeholder="Martedì e Giovedì dalle ore 15:00 alle ore 18:00" {...field} />
                      </FormControl>
                      <FormDescription className="text-[11px]">
                        {t("schoolProfile.secretariatHoursDesc")}
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
                        <FormLabel className="text-xs font-bold">{t("schoolProfile.vatCode")}</FormLabel>
                        <FormControl>
                          <Input placeholder="P.IVA/C.F. 03321620803" {...field} />
                        </FormControl>
                        <FormDescription className="text-[11px]">
                          {t("schoolProfile.vatCode")}
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
                        <FormLabel className="text-xs font-bold">{t("schoolProfile.registrationFee")}</FormLabel>
                        <FormControl>
                          <Input type="number" min={0} max={500} step={1} {...field} />
                        </FormControl>
                        <FormDescription className="text-[11px]">
                          {t("schoolProfile.registrationFeeDesc")}
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
                        <FormLabel className="text-xs font-bold">{t("schoolProfile.academicYear")}</FormLabel>
                        <FormControl>
                          <Input placeholder="2026/2027" {...field} />
                        </FormControl>
                        <FormDescription className="text-[11px]">
                          {t("schoolProfile.academicYearDesc")}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="pt-2 border-t border-border">
                  <h4 className="text-xs font-bold text-foreground mb-1">{t("schoolProfile.iban")}</h4>
                  <p className="text-[11px] text-muted-foreground mb-3">
                    {t("schoolProfile.ibanDesc")}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="iban"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold">{t("schoolProfile.iban")}</FormLabel>
                          <FormControl>
                            <Input placeholder="IT60X..." {...field} />
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
                          <FormLabel className="text-xs font-bold">{t("schoolProfile.bankName")}</FormLabel>
                          <FormControl>
                            <Input placeholder="Banca..." {...field} />
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
                          <FormLabel className="text-xs font-bold">{t("schoolProfile.accountHolder")}</FormLabel>
                          <FormControl>
                            <Input placeholder="Atena School" {...field} />
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
                        <FormLabel className="text-xs font-bold">{t("schoolProfile.instagram")}</FormLabel>
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
                        <FormLabel className="text-xs font-bold">{t("schoolProfile.facebook")}</FormLabel>
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
                        <FormLabel className="text-xs font-bold">{t("schoolProfile.linkedin")}</FormLabel>
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
                        <FormLabel className="text-xs font-bold">{t("schoolProfile.youtube")}</FormLabel>
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
                        <FormLabel className="text-xs font-bold">{t("schoolProfile.tiktok")}</FormLabel>
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
