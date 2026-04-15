import { NextResponse } from "next/server";

interface CloudflareResource {
  uid: string;
  meta?: {
    name?: string;
    caption?: string;
    title?: string;
    description?: string;
    release_date?: string;
  };
  duration?: number;
  thumbnail?: string;
}

interface CourseLesson {
  id: string;
  title: string;
  description: string | null;
  public_id: string;
  duration: number;
  thumbnail: string;
  releaseDate: string | null;
}

interface CourseMapEntry {
  name: string;
  slug: string;
  releaseDate: string | null;
  isUpcoming: boolean;
  lessons: CourseLesson[];
}

export async function GET() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (!accountId || !apiToken) {
    return NextResponse.json({ error: "Cloudflare credentials missing." }, { status: 500 });
  }

  try {
    // Fetch all videos from Cloudflare Stream
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream?limit=1000`,
      {
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Cloudflare API error: ${response.statusText}`);
    }

    const { result: resources } = await response.json();
    
    // Group resources by course using 'meta.name' as the path (e.g. cursos/course-slug/lesson-name)
    const coursesMap: Record<string, CourseMapEntry> = {};

    resources.forEach((resource: CloudflareResource) => {
      const name = resource.meta?.name || "";
      const pathParts = name.split("/");
      
      // Expected format: cursos/course-slug/lesson-name
      // If it doesn't follow the pattern, we skip or treat as generic
      if (pathParts.length < 3 || pathParts[0] !== "cursos") return;

      const courseSlug = pathParts[1];
      const lessonTitle = pathParts.slice(2).join(" / ").replace(/\//g, " - ");
      
      // Look for release_date in custom metadata
      const releaseDate = resource.meta?.release_date || null;

      if (!coursesMap[courseSlug]) {
        coursesMap[courseSlug] = {
          name: courseSlug.replace(/[-_]/g, " "),
          slug: courseSlug,
          releaseDate: null,
          isUpcoming: false,
          lessons: [],
        };
      }

      // Track release date for the course
      if (releaseDate) {
        coursesMap[courseSlug].releaseDate = releaseDate;
        
        const now = new Date();
        const releaseTime = new Date(releaseDate);
        if (releaseTime > now) {
          coursesMap[courseSlug].isUpcoming = true;
        }
      }

      coursesMap[courseSlug].lessons.push({
        id: resource.uid,
        title: resource.meta?.caption || resource.meta?.title || lessonTitle,
        description: resource.meta?.description || null,
        public_id: resource.uid, // CF UID replaces Cloudinary public_id
        duration: resource.duration || 0,
        thumbnail: resource.thumbnail || `https://customer-${accountId}.cloudflarestream.com/${resource.uid}/thumbnails/thumbnail.jpg`,
        releaseDate: releaseDate,
      });
    });

    // Convert map to array
    const catalog = Object.values(coursesMap);
    
    // Sort lessons within courses by name/path
    catalog.forEach((course: CourseMapEntry) => {
      course.lessons.sort((a: CourseLesson, b: CourseLesson) => a.title.localeCompare(b.title));
    });

    return NextResponse.json(catalog);
  } catch (error: unknown) {
    console.error("[GET /api/cursos/catalog]", error);
    return NextResponse.json({ error: "No se pudo cargar el catálogo.", details: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
