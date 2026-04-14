import { NextResponse } from "next/server";
import { cloudinary } from "@/lib/cloudinary/config";

// We'll search for videos in the 'cursos' folder
const SEARCH_EXPRESSION = "folder:cursos AND resource_type:video";

export async function GET() {
  try {
    // Use the Search API to get all videos in the folders
    // we include 'context' field for descriptions and 'metadata' if used.
    const result = await cloudinary.search
      .expression(SEARCH_EXPRESSION)
      .with_field("context")
      .with_field("tags")
      .sort_by("public_id", "asc") // Optional: sorting by public_id
      .max_results(500)
      .execute();

    const resources = result.resources || [];
    
    // Group resources by folder (which represents the Course)
    // Structure: folder/course-name/lesson-name
    const coursesMap: Record<string, any> = {};

    resources.forEach((resource: any) => {
      // Extract the path parts. e.g. "cursos/nombre-del-curso/leccion-01"
      const pathParts = resource.public_id.split("/");
      
      // If it doesn't have at least 'cursos/course/lesson', we skip it
      if (pathParts.length < 3) return;

      const courseName = pathParts[1];
      const lessonTitle = pathParts.slice(2).join(" / ").replace(/\//g, " - ");
      
      if (!coursesMap[courseName]) {
        coursesMap[courseName] = {
          name: courseName.replace(/[-_]/g, " "),
          slug: courseName,
          lessons: [],
        };
      }

      coursesMap[courseName].lessons.push({
        id: resource.public_id,
        title: resource.context?.custom?.caption || resource.context?.custom?.alt || lessonTitle,
        description: resource.context?.custom?.description || null,
        public_id: resource.public_id,
        duration: resource.duration || 0,
        thumbnail: resource.secure_url.replace(/\.[^/.]+$/, ".jpg"), // auto-thumb
      });
    });

    // Convert map to array and return
    const catalog = Object.values(coursesMap);

    return NextResponse.json(catalog);
  } catch (error: any) {
    console.error("[GET /api/cursos/catalog]", error);
    return NextResponse.json({ error: "No se pudo cargar el catálogo.", details: error.message }, { status: 500 });
  }
}
