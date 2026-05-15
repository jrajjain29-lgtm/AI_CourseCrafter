import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import {
  enforceRateLimit,
  finishApiRequest,
  getRateLimitKey,
  getRequestIp,
  jsonError,
  jsonResponse,
  logApiError,
  readJsonBody,
  startApiRequest,
} from "@/lib/server/api";
import { signupSchema } from "@/lib/server/schemas";
import { ZodError } from "zod";

export async function POST(request: Request) {
  const context = startApiRequest(request, "auth:signup");

  try {
    const body = await readJsonBody<{
      name: string;
      email: string;
      password: string;
    }>(request, signupSchema);

    const rateLimit = enforceRateLimit({
      key: getRateLimitKey("auth:signup", getRequestIp(request)),
      limit: 5,
      windowMs: 15 * 60_000,
    });

    if (!rateLimit.allowed) {
      const response = jsonError("Too many signup attempts", 429, "Please wait before trying again.", context);
      response.headers.set("retry-after", String(rateLimit.retryAfterSeconds));
      return finishApiRequest(context, response);
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email }
    });

    if (existingUser) {
      return finishApiRequest(context, jsonError("User with this email already exists", 400, undefined, context));
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(body.password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        password: hashedPassword,
      },
    });

    // Create default user preferences
    await prisma.userPreferences.create({
      data: {
        userId: user.id,
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        userId: user.id,
        type: "account_created",
        description: "User account created",
      },
    });

    return finishApiRequest(
      context,
      jsonResponse(
        {
          message: "User created successfully",
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
          },
        },
        undefined,
        context
      )
    );

  } catch (error) {
    logApiError(context, error);

    if (error instanceof ZodError) {
      return finishApiRequest(context, jsonError("Invalid signup payload", 400, error.message, context));
    }

    return finishApiRequest(context, jsonError("Internal server error", 500, undefined, context));
  }
}