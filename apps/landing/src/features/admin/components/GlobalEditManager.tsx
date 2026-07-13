"use client";

import { useSearchParams } from "next/navigation";
import { useRouter, usePathname } from "@/i18n/routing";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAdmin } from "@/features/admin/components/AdminProvider";
import { toast } from "sonner";
import { revalidateCache, saveAdminRecord } from "@/app/actions";

// Modular Forms
import { CourseForm } from "@/features/courses/components/CourseForm";
import { TeacherForm } from "@/features/teachers/components/TeacherForm";
import { BlogForm } from "@/features/blog/components/BlogForm";
import { ShopForm } from "@/features/shop/components/ShopForm";
import { ReviewForm } from "@/features/reviews/components/ReviewForm";
import { ADMIN_SCHEMAS } from "@/lib/schemas";

const TYPE_CONFIG: Record<string, { table: string; label: string; tag: string }> = {
  course: { table: "courses", label: "Corso", tag: "courses" },
  shop_item: { table: "shop_items", label: "Servizio", tag: "courses" },
  teacher: { table: "profiles", label: "Insegnante", tag: "teachers" },
  blog: { table: "blog_posts", label: "Articolo", tag: "blog" },
  review: { table: "course_reviews", label: "Recensione", tag: "testimonials" },
};

export function GlobalEditManager() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { isAdmin } = useAdmin();
  const supabase = createClient();

  const editType = searchParams.get("editType") as keyof typeof ADMIN_SCHEMAS | null;
  const editId = searchParams.get("editId");

  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  const fetchData = useCallback(async (type: string, id: string) => {
    if (id === "new") {
      setData({});
      return;
    }

    setLoading(true);
    try {
      const config = TYPE_CONFIG[type];
      if (config) {
        const { data: record, error } = await supabase.from(config.table).select("*").eq("id", id).single();
        if (error) throw error;
        setData(record);
      }
    } catch (e: any) {
      toast.error(e.message);
      handleOpenChange(false);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    if (editType && editId && isAdmin) {
      setIsOpen(true);
      fetchData(editType, editId);
    } else {
      setIsOpen(false);
      setData(null);
    }
  }, [editType, editId, isAdmin, fetchData]);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setIsOpen(false);
      setTimeout(() => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("editType");
        params.delete("editId");
        // @ts-ignore
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      }, 100);
    }
  };

  const handleSave = async (formData: any) => {
    if (!editType || !editId) return;

    setLoading(true);
    try {
      const result = await saveAdminRecord(editType, editId, formData);
      
      if (!result.success) {
        throw new Error(result.error);
      }

      toast.success("Salvato con successo.");
      router.refresh();
      handleOpenChange(false);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) return null;

  const currentConfig = editType ? TYPE_CONFIG[editType] : null;

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>
            {editId === "new" ? "Nuovo" : "Modifica"} {currentConfig?.label ?? editType}
          </SheetTitle>
          <SheetDescription>
            {editId === "new" ? "Compila i campi qui sotto." : "Verifica che i campi siano corretti prima di salvare."}
          </SheetDescription>
        </SheetHeader>

        {loading && !data ? (
          <div className="flex justify-center p-8 text-muted-foreground animate-pulse">Caricamento in corso...</div>
        ) : data ? (
          <>
            {editType === "course" && <CourseForm initialData={data} onSubmit={handleSave} loading={loading} />}
            {editType === "shop_item" && <ShopForm initialData={data} onSubmit={handleSave} loading={loading} />}
            {editType === "teacher" && <TeacherForm initialData={data} onSubmit={handleSave} loading={loading} />}
            {editType === "blog" && <BlogForm initialData={data} onSubmit={handleSave} loading={loading} />}
            {editType === "review" && <ReviewForm initialData={data} onSubmit={handleSave} loading={loading} />}
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
