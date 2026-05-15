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
import { activityUpdateSchema } from "@/lib/server/schemas";
import { ZodError } from "zod";

type ActivityUpdateBody = {
  courseId?: string | null;
  type?: string;
  description?: string;
  metadata?: unknown;
};

function serializeActivityMetadata(metadata: unknown) {
  if (metadata === undefined) {
    return undefined;
  }

  if (metadata === null) {
    return null;
  }

  if (typeof metadata === "string") {
    return metadata;
  }

  return JSON.stringify(metadata);
}

function parseActivityMetadata(metadata: string | null) {
  if (!metadata) {
    return null;
  }

  try {
    return JSON.parse(metadata);
  } catch {
    return metadata;
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const context = startApiRequest(request, "activities:get");

  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return finishApiRequest(context, jsonError("Unauthorized", 401, undefined, context));
    }

    const activity = await prisma.activity.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!activity) {
      return finishApiRequest(context, jsonError("Activity not found", 404, undefined, context));
    }

    return finishApiRequest(
      context,
      jsonResponse(
        {
          ...activity,
          metadata: parseActivityMetadata(activity.metadata),
        },
        undefined,
        context
      )
    );
  } catch (error) {
    logApiError(context, error);
    return finishApiRequest(context, jsonError("Failed to fetch activity", 500, undefined, context));
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const context = startApiRequest(request, "activities:update");

  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return finishApiRequest(context, jsonError("Unauthorized", 401, undefined, context));
    }

    const rateLimit = enforceRateLimit({
      key: getRateLimitKey("activities:update", session.user.id),
      limit: 30,
      windowMs: 60_000,
    });

    if (!rateLimit.allowed) {
      const response = jsonError("Too many activity updates", 429, "Please wait before updating activities again.", context);
      response.headers.set("retry-after", String(rateLimit.retryAfterSeconds));
      return finishApiRequest(context, response);
    }

    const body = await readJsonBody<ActivityUpdateBody>(request, activityUpdateSchema);

    const activity = await prisma.activity.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!activity) {
      return finishApiRequest(context, jsonError("Activity not found", 404, undefined, context));
    }

    if (body.courseId) {
      const course = await prisma.course.findFirst({
        where: {
          id: body.courseId,
          userId: session.user.id,
        },
      });

      if (!course) {
        return jsonError("Course not found", 404);
      }
    }

    const updatedActivity = await prisma.activity.update({
      where: { id },
      data: {
        courseId: body.courseId === undefined ? activity.courseId : body.courseId,
        type: body.type ?? activity.type,
        description: body.description ?? activity.description,
        metadata:
          body.metadata === undefined
            ? activity.metadata
            : serializeActivityMetadata(body.metadata),
      },
    });

    return finishApiRequest(
      context,
      jsonResponse(
        {
          ...updatedActivity,
          metadata: parseActivityMetadata(updatedActivity.metadata),
        },
        undefined,
        context
      )
    );
  } catch (error) {
    logApiError(context, error);

    if (error instanceof ZodError) {
      return finishApiRequest(context, jsonError("Invalid activity update payload", 400, error.message, context));
    }

    return finishApiRequest(context, jsonError("Failed to update activity", 500, undefined, context));
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const context = startApiRequest(request, "activities:delete");

  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return finishApiRequest(context, jsonError("Unauthorized", 401, undefined, context));
    }

    const rateLimit = enforceRateLimit({
      key: getRateLimitKey("activities:delete", session.user.id),
      limit: 20,
      windowMs: 60_000,
    });

    if (!rateLimit.allowed) {
      const response = jsonError("Too many activity deletions", 429, "Please wait before deleting more activities.", context);
      response.headers.set("retry-after", String(rateLimit.retryAfterSeconds));
      return finishApiRequest(context, response);
    }

    const activity = await prisma.activity.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!activity) {
      return finishApiRequest(context, jsonError("Activity not found", 404, undefined, context));
    }

    await prisma.activity.delete({
      where: { id },
    });

    return finishApiRequest(context, jsonResponse({ deleted: true }, undefined, context));
  } catch (error) {
    logApiError(context, error);
    return finishApiRequest(context, jsonError("Failed to delete activity", 500, undefined, context));
  }
}