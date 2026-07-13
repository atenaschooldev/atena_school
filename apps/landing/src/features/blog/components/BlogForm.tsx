"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/features/admin/components/RichTextEditor";
import { ImageUpload } from "@/features/admin/components/ImageUpload";
import { LangSection, commonFormStyles } from "@/features/admin/components/FormLayout";
import { blogSchema } from "@/lib/schemas";
import { Database } from "@/types/database.types";

type BlogFormData = z.infer<typeof blogSchema>;

interface BlogFormProps {
  initialData?: any;
  onSubmit: (data: BlogFormData) => void;
  loading: boolean;
}

export function BlogForm({ initialData, onSubmit, loading }: BlogFormProps) {
  const form = useForm<BlogFormData>({ 
    resolver: zodResolver(blogSchema), 
    defaultValues: (initialData as BlogFormData) || { is_active: false } 
  });
  
  const { register, handleSubmit, control, formState: { errors }, watch, setValue, getValues } = form;

  // Auto-generate slug from title if empty
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'title_it' && !getValues('slug')) {
        const generated = (value.title_it || "")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');
        setValue('slug', generated);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, setValue, getValues]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={commonFormStyles.form}>
      <div className="flex items-center space-x-2 pb-2 border-b mb-4">
        <Controller name="is_active" control={control} render={({ field }) => (
          <Switch checked={field.value !== false} onCheckedChange={field.onChange} id="b-active" />
        )} />
        <Label htmlFor="b-active" className="cursor-pointer font-semibold">Pubblicato (Visibile al pubblico)</Label>
      </div>

      <div className={commonFormStyles.fieldGroup}>
        <Label>Slug (URL)</Label>
        <Input {...register("slug")} placeholder="auto-generato dal titolo IT" />
        {errors.slug && <span className={commonFormStyles.error}>{errors.slug.message}</span>}
      </div>

      <div className={commonFormStyles.fieldGroup}>
        <Label>Immagine Principale</Label>
        <Controller name="main_image" control={control} render={({ field }) => (
          <ImageUpload value={field.value || ""} onChange={field.onChange} bucket="blog-images" />
        )} />
      </div>

      <LangSection lang="IT" flag="🇮🇹" />
      <div className={commonFormStyles.fieldGroup}>
        <Label>Titolo (IT) *</Label>
        <Input {...register("title_it")} />
        {errors.title_it && <span className={commonFormStyles.error}>{errors.title_it.message}</span>}
      </div>
      <div className={commonFormStyles.fieldGroup}>
        <Label>Riassunto / Excerpt (IT)</Label>
        <Textarea {...register("excerpt_it")} rows={3} />
      </div>
      <div className={commonFormStyles.fieldGroup}>
        <Label>Contenuto (IT) — Rich Text</Label>
        <Controller name="content_it" control={control} render={({ field }) => (
          <RichTextEditor value={field.value || ""} onChange={field.onChange} />
        )} />
      </div>

      <LangSection lang="EN" flag="🇬🇧" />
      <div className={commonFormStyles.fieldGroup}>
        <Label>Title (EN)</Label>
        <Input {...register("title_en")} placeholder="English title" />
      </div>
      <div className={commonFormStyles.fieldGroup}>
        <Label>Excerpt (EN)</Label>
        <Textarea {...register("excerpt_en")} rows={3} placeholder="English summary" />
      </div>
      <div className={commonFormStyles.fieldGroup}>
        <Label>Content (EN) — Rich Text</Label>
        <Controller name="content_en" control={control} render={({ field }) => (
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
