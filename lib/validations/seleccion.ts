import { z } from "zod";

export const seleccionApplicationSchema = z.object({
  selection_id: z.string().uuid(),
  demo_url: z.string().url("Debe ser una URL valida").optional(),
  file_path: z.string().optional(),
  file_name: z.string().optional(),
  demo_description: z.string().min(10, "La descripcion debe tener al menos 10 caracteres").max(500),
  tracks_count: z.number().int().min(1).max(20),
});

export type SeleccionApplicationInput = z.infer<typeof seleccionApplicationSchema>;
