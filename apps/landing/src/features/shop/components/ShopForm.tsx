"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LangSection, CATEGORIES, commonFormStyles } from "@/features/admin/components/FormLayout";
import { shopSchema } from "@/lib/schemas";
import { Database } from "@/types/database.types";

type ShopFormData = z.infer<typeof shopSchema>;

interface ShopFormProps {
  initialData?: any;
  onSubmit: (data: ShopFormData) => void;
  loading: boolean;
}

export function ShopForm({ initialData, onSubmit, loading }: ShopFormProps) {
  const form = useForm<ShopFormData>({ 
    resolver: zodResolver(shopSchema), 
    defaultValues: (initialData as ShopFormData) || {} 
  });
  
  const { register, handleSubmit, control, formState: { errors } } = form;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={commonFormStyles.form}>
      <div className={commonFormStyles.fieldGroup}>
        <Label>Prezzo (€)</Label>
        <Input type="number" step="0.01" {...register("price")} />
        {errors.price && <span className={commonFormStyles.error}>{errors.price.message}</span>}
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

      <LangSection lang="IT" flag="🇮🇹" />
      <div className={commonFormStyles.fieldGroup}>
        <Label>Titolo (IT) *</Label>
        <Input {...register("title_it")} />
        {errors.title_it && <span className={commonFormStyles.error}>{errors.title_it.message}</span>}
      </div>
      <div className={commonFormStyles.fieldGroup}>
        <Label>Durata (IT) es. "4 settimane"</Label>
        <Input {...register("duration_it")} placeholder="es. 4 settimane" />
      </div>

      <LangSection lang="EN" flag="🇬🇧" />
      <div className={commonFormStyles.fieldGroup}>
        <Label>Title (EN)</Label>
        <Input {...register("title_en")} placeholder="e.g. Beginner English Package" />
      </div>
      <div className={commonFormStyles.fieldGroup}>
        <Label>Duration (EN) e.g. "4 weeks"</Label>
        <Input {...register("duration_en")} placeholder="e.g. 4 weeks" />
      </div>

      <div className={commonFormStyles.submitSection}>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Salvataggio..." : "Salva Modifiche"}
        </Button>
      </div>
    </form>
  );
}
