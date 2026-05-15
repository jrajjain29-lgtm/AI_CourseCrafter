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
  readJsonBody,
  startApiRequest,
} from "@/lib/server/api";
import { courseProgressSchema } from "@/lib/server/schemas";
import { ZodError } from "zod";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const context = startApiRequest(request, "courses:progress");

  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return finishApiRequest(context, jsonError("Unauthorized", 401, undefined, context));
    }

    const rateLimit = enforceRateLimit({
      key: getRateLimitKey("courses:progress", session.user.id),
      limit: 30,
      windowMs: 60_000,
    });

    if (!rateLimit.allowed) {
      const response = jsonError("Too many course progress updates", 429, "Please wait before updating progress again.", context);
      response.headers.set("retry-after", String(rateLimit.retryAfterSeconds));
      return finishApiRequest(context, response);
    }

    const { progress, isCompleted } = await readJsonBody<{ progress?: number; isCompleted?: boolean }>(
      request,
      courseProgressSchema
    );

    // Verify the course belongs to the user
    const course = await prisma.course.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
    });

    if (!course) {
      return finishApiRequest(context, jsonError("Course not found", 404, undefined, context));
    }

    const updateData: any = {
      progress: Math.min(100, Math.max(0, progress || 0)),
    };

    if (isCompleted && !course.isCompleted) {
      updateData.isCompleted = true;
      updateData.completedAt = new Date();
    }

    const updatedCourse = await prisma.course.update({
      where: { id: id },
      data: updateData,
    });

    // Log activity
    if (isCompleted && !course.isCompleted) {
      await prisma.activity.create({
        data: {
          userId: session.user.id,
          courseId: id,
          type: "course_completed",
          description: `Completed course: ${course.title}`,
        },
      });
    } else if (typeof progress === "number" && progress > course.progress) {
      await prisma.activity.create({
        data: {
          userId: session.user.id,
          courseId: id,
          type: "course_progress",
          description: `Made progress on course: ${course.title} (${progress}%)`,
        },
      });
    }

    return finishApiRequest(
      context,
      jsonResponse(
        {
          progress: updatedCourse.progress,
          isCompleted: updatedCourse.isCompleted,
          completedAt: updatedCourse.completedAt,
        },
        undefined,
        context
      )
    );
  } catch (error) {
    logApiError(context, error);

    if (error instanceof ZodError) {
      return finishApiRequest(context, jsonError("Invalid progress payload", 400, error.message, context));
    }

    return finishApiRequest(context, jsonError("Failed to update course progress", 500, undefined, context));
  }
}