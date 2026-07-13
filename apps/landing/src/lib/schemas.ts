import * as z from "zod";

export const courseSchema = z.object({
  title_it: z.string().min(1, "Il titolo è obbligatorio"),
  title_en: z.string().optional().nullable(),
  description_it: z.string().optional().nullable(),
  description_en: z.string().optional().nullable(),
  full_description_it: z.string().optional().nullable(),
  full_description_en: z.string().optional().nullable(),
  category: z.string().min(1, "Categoria obbligatoria"),
  image_url: z.string().optional().nullable(),
  price_eur: z.coerce.number().min(0, "Deve essere positivo").optional().nullable(),
  duration_minutes: z.coerce.number().min(0, "Deve essere positivo").optional().nullable(),
  is_active: z.boolean().default(true)
});

export const shopSchema = z.object({
  title_it: z.string().min(1, "Il titolo è obbligatorio"),
  title_en: z.string().optional().nullable(),
  duration_it: z.string().optional().nullable(),
  duration_en: z.string().optional().nullable(),
  category: z.string().min(1, "Categoria obbligatoria"),
  price: z.coerce.number().min(0, "Deve essere positivo").optional().nullable()
});

export const teacherSchema = z.object({
  full_name: z.string().min(1, "Il nome è obbligatorio"),
  language_level: z.string().optional().nullable(),
  avatar_url: z.string().optional().nullable()
});

export const blogSchema = z.object({
  title_it: z.string().min(1, "Il titolo è obbligatorio"),
  title_en: z.string().optional().nullable(),
  slug: z.string().min(1, "Lo slug è obbligatorio"),
  excerpt_it: z.string().optional().nullable(),
  excerpt_en: z.string().optional().nullable(),
  main_image: z.string().optional().nullable(),
  content_it: z.string().optional().nullable(),
  content_en: z.string().optional().nullable(),
  is_active: z.boolean().default(false)
});

export const reviewSchema = z.object({
  student_name: z.string().min(1, "Il nome è obbligatorio"),
  rating: z.coerce.number().min(1, "Minimo 1").max(5, "Massimo 5"),
  content: z.string().min(1, "Il testo è obbligatorio"),
  is_published: z.boolean().default(false)
});

export const ADMIN_SCHEMAS = {
  course: courseSchema,
  shop_item: shopSchema,
  teacher: teacherSchema,
  blog: blogSchema,
  review: reviewSchema,
};
