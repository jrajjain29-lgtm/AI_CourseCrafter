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
import { activityCreateSchema, activityListQuerySchema } from "@/lib/server/schemas";
import { ZodError } from "zod";

type ActivityBody = {
  courseId?: string | null;
  type: string;
  description: string;
  metadata?: unknown;
};

function serializeActivityMetadata(metadata: unknown) {
  if (metadata === undefined || metadata === null) {
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

export async function GET(request: Request) {
  const context = startApiRequest(request, "activities:list");

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return finishApiRequest(context, jsonError("Unauthorized", 401, undefined, context));
    }

    const url = new URL(request.url);
    const filters = activityListQuerySchema.parse(Object.fromEntries(url.searchParams.entries()));
    const take = filters.take;
    const paginationTake = take + 1;

    const activities = await prisma.activity.findMany({
      where: {
        userId: session.user.id,
        ...(filters.courseId ? { courseId: filters.courseId } : {}),
        ...(filters.type ? { type: filters.type } : {}),
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: paginationTake,
      ...(filters.cursor ? { cursor: { id: filters.cursor }, skip: 1 } : filters.skip > 0 ? { skip: filters.skip } : {}),
    });

    const hasMore = activities.length > take;
    const visibleActivities = hasMore ? activities.slice(0, take) : activities;
    const nextCursor = hasMore ? visibleActivities[visibleActivities.length - 1]?.id ?? null : null;

    const serializedActivities = visibleActivities.map((activity) => ({
      ...activity,
      metadata: parseActivityMetadata(activity.metadata),
    }));

    return finishApiRequest(
      context,
      jsonResponse(
        {
          activities: serializedActivities,
          items: serializedActivities,
          nextCursor,
          hasMore,
          pageSize: take,
        },
        undefined,
        context
      )
    );
  } catch (error) {
    logApiError(context, error);

    if (error instanceof ZodError) {
      return finishApiRequest(context, jsonError("Invalid activity query", 400, error.message, context));
    }

    return finishApiRequest(context, jsonError("Failed to fetch activities", 500, undefined, context));
  }
}

export async function POST(request: Request) {
  const context = startApiRequest(request, "activities:create");

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return finishApiRequest(context, jsonError("Unauthorized", 401, undefined, context));
    }

    const rateLimit = enforceRateLimit({
      key: getRateLimitKey("activities:create", session.user.id),
      limit: 30,
      windowMs: 60_000,
    });

    if (!rateLimit.allowed) {
      const response = jsonError("Too many activity writes", 429, "Please wait before creating more activities.", context);
      response.headers.set("retry-after", String(rateLimit.retryAfterSeconds));
      return finishApiRequest(context, response);
    }

    const body = await readJsonBody<ActivityBody>(request, activityCreateSchema);

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

    const activity = await prisma.activity.create({
      data: {
        userId: session.user.id,
        courseId: body.courseId || null,
        type: body.type,
        description: body.description,
        metadata: serializeActivityMetadata(body.metadata),
      },
    });

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

    if (error instanceof ZodError) {
      return finishApiRequest(context, jsonError("Invalid activity payload", 400, error.message, context));
    }

    return finishApiRequest(context, jsonError("Failed to create activity", 500, undefined, context));
  }
}