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

      const courseSlug = pathParts[1];
      const lessonTitle = pathParts.slice(2).join(" / ").replace(/\//g, " - ");
      
      // Look for release_date in contextual metadata
      const releaseDate = resource.context?.custom?.release_date || null;

      if (!coursesMap[courseSlug]) {
        coursesMap[courseSlug] = {
          name: courseSlug.replace(/[-_]/g, " "),
          slug: courseSlug,
          releaseDate: null,
          isUpcoming: false,
          lessons: [],
        };
      }

      // If this resource has a release_date, track it for the course
      if (releaseDate) {
        // We keep the release date if it's the first one found or it's later? 
        // Actually, usually it should be consistent per folder.
        coursesMap[courseSlug].releaseDate = releaseDate;
        
        // Check if it's in the future
        const now = new Date();
        const releaseTime = new Date(releaseDate);
        if (releaseTime > now) {
          coursesMap[courseSlug].isUpcoming = true;
        }
      }

      coursesMap[courseSlug].lessons.push({
        id: resource.public_id,
        title: resource.context?.custom?.caption || resource.context?.custom?.alt || lessonTitle,
        description: resource.context?.custom?.description || null,
        public_id: resource.public_id,
        duration: resource.duration || 0,
        thumbnail: resource.secure_url.replace(/\.[^/.]+$/, ".jpg"), // auto-thumb
        releaseDate: releaseDate,
      });
    });

    // Convert map to array and return
    const catalog = Object.values(coursesMap);
    
    // Sort lessons within courses by ID
    catalog.forEach((course: any) => {
      course.lessons.sort((a: any, b: any) => a.id.localeCompare(b.id));
    });

    return NextResponse.json(catalog);
  } catch (error: any) {
    console.error("[GET /api/cursos/catalog]", error);
    return NextResponse.json({ error: "No se pudo cargar el catálogo.", details: error.message }, { status: 500 });
  }
}
