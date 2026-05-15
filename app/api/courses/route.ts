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
import { courseCreateSchema, courseListQuerySchema } from "@/lib/server/schemas";
import { ZodError } from "zod";

type SerializedValue = Array<Record<string, unknown>> | Record<string, unknown> | string;

type CreateCourseBody = {
  title: string;
  focus: string;
  level: string;
  goals: string;
  modules: SerializedValue;
  roadmap: SerializedValue;
  youtubeLinks: SerializedValue;
  recommendedCourses: SerializedValue;
  isSaved?: boolean;
  progress?: number;
  isCompleted?: boolean;
  completedAt?: string | null;
};

type CourseListFilters = {
  take: number;
  skip: number;
  cursor?: string;
  saved?: boolean;
  completed?: boolean;
  focus?: string;
  level?: string;
};

function parseCourseListFilters(request: Request): CourseListFilters {
  const url = new URL(request.url);
  const parsed = courseListQuerySchema.parse(Object.fromEntries(url.searchParams.entries()));

  return parsed;
}

function parseCourseFields(course: {
  modules: string;
  roadmap: string;
  youtubeLinks: string;
  recommendedCourses: string;
}) {
  return {
    modules: JSON.parse(course.modules),
    roadmap: JSON.parse(course.roadmap),
    youtubeLinks: JSON.parse(course.youtubeLinks),
    recommendedCourses: JSON.parse(course.recommendedCourses),
  };
}

function serializeValue(value: SerializedValue | undefined, fallback = "[]") {
  if (value === undefined) {
    return fallback;
  }

  return typeof value === "string" ? value : JSON.stringify(value);
}

export async function GET(request: Request) {
  const context = startApiRequest(request, "courses:list");

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return finishApiRequest(context, jsonError("Unauthorized", 401, undefined, context));
    }

    const filters = parseCourseListFilters(request);
    const queryCursor = filters.cursor;
    const take = filters.take;
    const paginationTake = take + 1;

    const courses = await prisma.course.findMany({
      where: {
        userId: session.user.id,
        ...(filters.saved === undefined ? {} : { isSaved: filters.saved }),
        ...(filters.completed === undefined ? {} : { isCompleted: filters.completed }),
        ...(filters.focus ? { focus: filters.focus } : {}),
        ...(filters.level ? { level: filters.level } : {}),
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: paginationTake,
      ...(queryCursor ? { cursor: { id: queryCursor }, skip: 1 } : filters.skip > 0 ? { skip: filters.skip } : {}),
    });

    const hasMore = courses.length > take;
    const visibleCourses = hasMore ? courses.slice(0, take) : courses;
    const nextCursor = hasMore ? visibleCourses[visibleCourses.length - 1]?.id ?? null : null;

    const serializedCourses = visibleCourses.map((course) => ({
      ...course,
      ...parseCourseFields(course),
    }));

    return finishApiRequest(
      context,
      jsonResponse(
        {
          courses: serializedCourses,
          items: serializedCourses,
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
      return finishApiRequest(context, jsonError("Invalid course query", 400, error.message, context));
    }

    return finishApiRequest(context, jsonError("Failed to fetch courses", 500, undefined, context));
  }
}

export async function POST(request: Request) {
  const context = startApiRequest(request, "courses:create");

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return finishApiRequest(context, jsonError("Unauthorized", 401, undefined, context));
    }

    const rateLimit = enforceRateLimit({
      key: getRateLimitKey("courses:create", session.user.id),
      limit: 20,
      windowMs: 60_000,
    });

    if (!rateLimit.allowed) {
      const response = jsonError("Too many course writes", 429, "Please wait before creating more courses.", context);
      response.headers.set("retry-after", String(rateLimit.retryAfterSeconds));
      return finishApiRequest(context, response);
    }

    const body = await readJsonBody<CreateCourseBody>(request, courseCreateSchema);

    const course = await prisma.course.create({
      data: {
        userId: session.user.id,
        title: body.title,
        focus: body.focus,
        level: body.level,
        goals: body.goals,
        modules: serializeValue(body.modules),
        roadmap: serializeValue(body.roadmap),
        youtubeLinks: serializeValue(body.youtubeLinks),
        recommendedCourses: serializeValue(body.recommendedCourses),
        isSaved: body.isSaved ?? false,
        progress: body.progress ?? 0,
        isCompleted: body.isCompleted ?? false,
        completedAt: body.completedAt ? new Date(body.completedAt) : null,
      },
    });

    return finishApiRequest(
      context,
      jsonResponse(
        {
          ...course,
          ...parseCourseFields(course),
        },
        undefined,
        context
      )
    );
  } catch (error) {
    logApiError(context, error);

    if (error instanceof ZodError) {
      return finishApiRequest(context, jsonError("Course fields cannot be empty", 400, error.message, context));
    }

    return finishApiRequest(context, jsonError("Failed to create course", 500, undefined, context));
  }
}
