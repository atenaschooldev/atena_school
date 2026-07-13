"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/features/admin/components/ImageUpload";
import { commonFormStyles } from "@/features/admin/components/FormLayout";
import { teacherSchema } from "@/lib/schemas";
import { Database } from "@/types/database.types";

type TeacherFormData = z.infer<typeof teacherSchema>;

interface TeacherFormProps {
  initialData?: any;
  onSubmit: (data: TeacherFormData) => void;
  loading: boolean;
}

export function TeacherForm({ initialData, onSubmit, loading }: TeacherFormProps) {
  const form = useForm<TeacherFormData>({ 
    resolver: zodResolver(teacherSchema), 
    defaultValues: (initialData as TeacherFormData) || {} 
  });
  
  const { register, handleSubmit, control, formState: { errors } } = form;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={commonFormStyles.form}>
      <div className={commonFormStyles.fieldGroup}>
        <Label>Nome Completo</Label>
        <Input {...register("full_name")} />
        {errors.full_name && <span className={commonFormStyles.error}>{errors.full_name.message}</span>}
      </div>
      <div className={commonFormStyles.fieldGroup}>
        <Label>Livello Lingua</Label>
        <Input {...register("language_level")} />
      </div>
      <div className={commonFormStyles.fieldGroup}>
        <Label>Foto Profilo (Avatar)</Label>
        <Controller name="avatar_url" control={control} render={({ field }) => (
          <ImageUpload value={field.value || ""} onChange={field.onChange} bucket="avatars" />
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
