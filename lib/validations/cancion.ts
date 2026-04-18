import { z } from "zod";

const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024; // 100 MB

const ALLOWED_AUDIO_TYPES = [
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/aac",
  "audio/ogg",
  "audio/flac",
] as const;

export const cancionRegistrarSchema = z.object({
  file_path: z.string().min(1, "Ruta de archivo requerida"),
  file_name: z.string().min(1, "Nombre de archivo requerido").max(255),
  file_size: z
    .number()
    .int()
    .positive()
    .max(MAX_FILE_SIZE_BYTES, "El archivo no puede superar 100 MB")
    .optional(),
  file_type: z.enum(ALLOWED_AUDIO_TYPES).optional(),
  song_title: z
    .string()
    .min(1, "El título es requerido")
    .max(200, "El título no puede superar 200 caracteres"),
  genre: z
    .string()
    .min(1, "El género es requerido")
    .max(50, "El género no puede superar 50 caracteres"),
  notes: z.string().max(1000, "Las notas no pueden superar 1000 caracteres").optional(),
});

export type CancionRegistrarInput = z.infer<typeof cancionRegistrarSchema>;
