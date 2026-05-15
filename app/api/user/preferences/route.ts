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
import { preferencesUpdateSchema } from "@/lib/server/schemas";
import { ZodError } from "zod";

type PreferencesBody = {
  theme?: "light" | "dark";
  notifications?: boolean;
  defaultFocus?: string;
  defaultLevel?: string;
};

const defaultPreferences = {
  theme: "light" as const,
  notifications: true,
  defaultFocus: "",
  defaultLevel: "Beginner",
};

function normalizePreferencesBody(body: PreferencesBody) {
  return {
    theme: body.theme === "dark" ? "dark" : "light",
    notifications: typeof body.notifications === "boolean" ? body.notifications : defaultPreferences.notifications,
    defaultFocus: typeof body.defaultFocus === "string" ? body.defaultFocus : defaultPreferences.defaultFocus,
    defaultLevel:
      typeof body.defaultLevel === "string" && body.defaultLevel.trim()
        ? body.defaultLevel
        : defaultPreferences.defaultLevel,
  };
}

export async function GET(request: Request) {
  const context = startApiRequest(request, "preferences:get");

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return finishApiRequest(context, jsonError("Unauthorized", 401, undefined, context));
    }

    const preferences = await prisma.userPreferences.findUnique({
      where: { userId: session.user.id },
    });

    return finishApiRequest(context, jsonResponse(preferences || defaultPreferences, undefined, context));
  } catch (error) {
    logApiError(context, error);
    return finishApiRequest(context, jsonError("Failed to fetch preferences", 500, undefined, context));
  }
}

export async function PUT(request: Request) {
  const context = startApiRequest(request, "preferences:update");

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return finishApiRequest(context, jsonError("Unauthorized", 401, undefined, context));
    }

    const rateLimit = enforceRateLimit({
      key: getRateLimitKey("preferences:update", session.user.id),
      limit: 20,
      windowMs: 60_000,
    });

    if (!rateLimit.allowed) {
      const response = jsonError("Too many preference updates", 429, "Please wait before updating preferences again.", context);
      response.headers.set("retry-after", String(rateLimit.retryAfterSeconds));
      return finishApiRequest(context, response);
    }

    const body = await readJsonBody<PreferencesBody>(request, preferencesUpdateSchema);
    const preferencesInput = normalizePreferencesBody(body);

    const preferences = await prisma.userPreferences.upsert({
      where: { userId: session.user.id },
      update: {
        ...preferencesInput,
      },
      create: {
        userId: session.user.id,
        ...preferencesInput,
      },
    });

    return finishApiRequest(context, jsonResponse(preferences, undefined, context));
  } catch (error) {
    logApiError(context, error);

    if (error instanceof ZodError) {
      return finishApiRequest(context, jsonError("Invalid preferences payload", 400, error.message, context));
    }

    return finishApiRequest(context, jsonError("Failed to update preferences", 500, undefined, context));
  }
}