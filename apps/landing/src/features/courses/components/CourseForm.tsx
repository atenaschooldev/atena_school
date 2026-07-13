"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RichTextEditor } from "@/features/admin/components/RichTextEditor";
import { ImageUpload } from "@/features/admin/components/ImageUpload";
import { LangSection, CATEGORIES, commonFormStyles } from "@/features/admin/components/FormLayout";
import { courseSchema } from "@/lib/schemas";
import { Database } from "@/types/database.types";

type CourseFormData = z.infer<typeof courseSchema>;

interface CourseFormProps {
  initialData?: Partial<Database['public']['Tables']['courses']['Row']>;
  onSubmit: (data: CourseFormData) => void;
  loading: boolean;
}

export function CourseForm({ initialData, onSubmit, loading }: CourseFormProps) {
  const form = useForm<CourseFormData>({ 
    resolver: zodResolver(courseSchema), 
    defaultValues: (initialData as CourseFormData) || { is_active: true } 
  });
  
  const { register, handleSubmit, control, formState: { errors } } = form;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={commonFormStyles.form}>
      <div className="flex items-center space-x-2 pb-2 border-b mb-4">
        <Controller name="is_active" control={control} render={({ field }) => (
          <Switch checked={field.value !== false} onCheckedChange={field.onChange} id="c-active" />
        )} />
        <Label htmlFor="c-active" className="cursor-pointer font-semibold">Attivo (Visibile al pubblico)</Label>
      </div>

      <div className={commonFormStyles.fieldGroup}>
        <Label>Categoria</Label>
        <Controller name="category" control={control} render={({ field }) => (
          <Select value={field.value || ""} onValueChange={field.onChange}>
            <SelectTrigger><SelectValue placeholder="Seleziona categoria" /></SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
            </SelectContent>
          </Select>
        )} />
        {errors.category && <span className={commonFormStyles.error}>{errors.category.message}</span>}
      </div>

      <div className={commonFormStyles.fieldGroup}>
        <Label>Immagine Copertina</Label>
        <Controller name="image_url" control={control} render={({ field }) => (
          <ImageUpload value={field.value || ""} onChange={field.onChange} bucket="course-images" />
        )} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className={commonFormStyles.fieldGroup}>
          <Label>Prezzo (€)</Label>
          <Input type="number" step="0.01" {...register("price_eur")} />
          {errors.price_eur && <span className={commonFormStyles.error}>{errors.price_eur.message}</span>}
        </div>
        <div className={commonFormStyles.fieldGroup}>
          <Label>Durata (min)</Label>
          <Input type="number" {...register("duration_minutes")} />
          {errors.duration_minutes && <span className={commonFormStyles.error}>{errors.duration_minutes.message}</span>}
        </div>
      </div>

      <LangSection lang="IT" flag="🇮🇹" />
      <div className={commonFormStyles.fieldGroup}>
        <Label>Titolo (IT) *</Label>
        <Input {...register("title_it")} />
        {errors.title_it && <span className={commonFormStyles.error}>{errors.title_it.message}</span>}
      </div>
      <div className={commonFormStyles.fieldGroup}>
        <Label>Descrizione Breve (IT)</Label>
        <Textarea {...register("description_it")} rows={3} />
      </div>
      <div className={commonFormStyles.fieldGroup}>
        <Label>Contenuto Completo (IT) — Rich Text</Label>
        <Controller name="full_description_it" control={control} render={({ field }) => (
          <RichTextEditor value={field.value || ""} onChange={field.onChange} />
        )} />
      </div>

      <LangSection lang="EN" flag="🇬🇧" />
      <div className={commonFormStyles.fieldGroup}>
        <Label>Title (EN)</Label>
        <Input {...register("title_en")} placeholder="English title" />
      </div>
      <div className={commonFormStyles.fieldGroup}>
        <Label>Short Description (EN)</Label>
        <Textarea {...register("description_en")} rows={3} placeholder="English short description" />
      </div>
      <div className={commonFormStyles.fieldGroup}>
        <Label>Full Content (EN) — Rich Text</Label>
        <Controller name="full_description_en" control={control} render={({ field }) => (
          <RichTextEditor value={field.value || ""} onChange={field.onChange} />
        )} />
      </div>

      <div className={commonFormStyles.submitSection}>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Salvataggio..." : "Salva Modifiche"}
        </Button>
      </div>
    </form>
  );
}
