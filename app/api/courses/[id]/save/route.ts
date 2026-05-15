import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  enforceRateLimit,
  finishApiRequest,
  getRateLimitKey,
  jsonError,
  jsonResponse,
  logApiError,
  startApiRequest,
} from "@/lib/server/api";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const context = startApiRequest(request, "courses:save");

  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return finishApiRequest(context, jsonError("Unauthorized", 401, undefined, context));
    }

    const rateLimit = enforceRateLimit({
      key: getRateLimitKey("courses:save", session.user.id),
      limit: 30,
      windowMs: 60_000,
    });

    if (!rateLimit.allowed) {
      const response = jsonError("Too many course save requests", 429, "Please wait before toggling save again.", context);
      response.headers.set("retry-after", String(rateLimit.retryAfterSeconds));
      return finishApiRequest(context, response);
    }

    const courseId = id;

    // Verify the course belongs to the user
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        userId: session.user.id,
      },
    });

    if (!course) {
      return finishApiRequest(context, jsonError("Course not found", 404, undefined, context));
    }

    // Toggle save status
    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: { isSaved: !course.isSaved },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        userId: session.user.id,
        courseId: courseId,
        type: updatedCourse.isSaved ? "course_saved" : "course_unsaved",
        description: updatedCourse.isSaved
          ? `Saved course: ${course.title}`
          : `Unsaved course: ${course.title}`,
      },
    });

    return finishApiRequest(context, jsonResponse({ isSaved: updatedCourse.isSaved }, undefined, context));
  } catch (error) {
    logApiError(context, error);
    return finishApiRequest(context, jsonError("Failed to save course", 500, undefined, context));
  }
}