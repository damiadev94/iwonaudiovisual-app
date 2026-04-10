import { z } from "zod";

export const courseSchema = z.object({
  title: z.string().min(3, "El titulo debe tener al menos 3 caracteres"),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/, "Solo letras minusculas, numeros y guiones"),
  description: z.string().optional(),
  thumbnail_url: z.string().url().optional(),
  category: z.enum(["finanzas", "marketing", "branding", "distribucion", "legal", "estrategia"]),
  is_published: z.boolean().default(false),
  sort_order: z.number().int().default(0),
});

export const lessonSchema = z.object({
  course_id: z.string().uuid(),
  title: z.string().min(3, "El titulo debe tener al menos 3 caracteres"),
  description: z.string().optional(),
  video_url: z.string().url().optional(),
  video_public_id: z.string().optional(),
  duration_minutes: z.number().int().positive().optional(),
  sort_order: z.number().int().default(0),
  is_published: z.boolean().default(false),
});

export type CourseInput = z.infer<typeof courseSchema>;
export type LessonInput = z.infer<typeof lessonSchema>;
