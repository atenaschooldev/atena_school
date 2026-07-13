"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { commonFormStyles } from "@/features/admin/components/FormLayout";
import { reviewSchema } from "@/lib/schemas";
import { Database } from "@/types/database.types";

type ReviewFormData = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
  initialData?: any;
  onSubmit: (data: ReviewFormData) => void;
  loading: boolean;
}

export function ReviewForm({ initialData, onSubmit, loading }: ReviewFormProps) {
  const form = useForm<ReviewFormData>({ 
    resolver: zodResolver(reviewSchema), 
    defaultValues: (initialData as ReviewFormData) || { is_published: false } 
  });
  
  const { register, handleSubmit, control, formState: { errors } } = form;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={commonFormStyles.form}>
      <div className="flex items-center space-x-2 pb-2 border-b mb-4">
        <Controller name="is_published" control={control} render={({ field }) => (
          <Switch checked={field.value === true} onCheckedChange={field.onChange} id="r-pub" />
        )} />
        <Label htmlFor="r-pub" className="cursor-pointer font-semibold">Approvata (Visibile al pubblico)</Label>
      </div>
      <div className={commonFormStyles.fieldGroup}>
        <Label>Nome Studente</Label>
        <Input {...register("student_name")} />
        {errors.student_name && <span className={commonFormStyles.error}>{errors.student_name.message}</span>}
      </div>
      <div className={commonFormStyles.fieldGroup}>
        <Label>Voto (1-5)</Label>
        <Input type="number" min="1" max="5" {...register("rating")} />
        {errors.rating && <span className={commonFormStyles.error}>{errors.rating.message}</span>}
      </div>
      <div className={commonFormStyles.fieldGroup}>
        <Label>Testo Recensione</Label>
        <Textarea rows={4} {...register("content")} />
        {errors.content && <span className={commonFormStyles.error}>{errors.content.message}</span>}
      </div>
      <div className={commonFormStyles.submitSection}>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Salvataggio..." : "Salva Modifiche"}
        </Button>
      </div>
    </form>
  );
}
