import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { finishApiRequest, jsonError, jsonResponse, logApiError, startApiRequest } from "@/lib/server/api";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const context = startApiRequest(request, "courses:get");

  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return finishApiRequest(context, jsonError("Unauthorized", 401, undefined, context));
    }

    const course = await prisma.course.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
    });

    if (!course) {
      return finishApiRequest(context, jsonError("Course not found", 404, undefined, context));
    }

    // Parse JSON fields
    const courseData = {
      ...course,
      modules: JSON.parse(course.modules),
      roadmap: JSON.parse(course.roadmap),
      youtubeLinks: JSON.parse(course.youtubeLinks),
      recommendedCourses: JSON.parse(course.recommendedCourses),
    };

    return finishApiRequest(context, jsonResponse(courseData, undefined, context));
  } catch (error) {
    logApiError(context, error);
    return finishApiRequest(context, jsonError("Failed to fetch course", 500, undefined, context));
  }
}