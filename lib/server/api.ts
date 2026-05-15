import { NextResponse } from "next/server";
import { ZodError, type ZodTypeAny } from "zod";

export type ApiErrorBody = {
  success: false;
  error: string;
  details?: string;
  requestId?: string;
};

export type ApiContext = {
  route: string;
  requestId: string;
  startedAt: number;
};

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type GlobalRateLimitStore = typeof globalThis & {
  __aicrafterRateLimitStore?: Map<string, RateLimitEntry>;
};

const rateLimitStore = ((globalThis as GlobalRateLimitStore).__aicrafterRateLimitStore ??= new Map<string, RateLimitEntry>());

function createRequestId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function createContext(request: Request, route: string): ApiContext {
  return {
    route,
    requestId: createRequestId(),
    startedAt: Date.now(),
  };
}

function attachContextHeaders(response: Response, context?: ApiContext) {
  if (!context) return response;

  response.headers.set("x-request-id", context.requestId);
  response.headers.set("x-api-route", context.route);
  response.headers.set("x-api-duration-ms", String(Date.now() - context.startedAt));
  return response;
}

export function startApiRequest(request: Request, route: string) {
  const context = createContext(request, route);
  const url = new URL(request.url);
  console.info(`[api] ${context.requestId} ${request.method} ${url.pathname} start ${route}`);
  return context;
}

export function finishApiRequest(context: ApiContext, response: Response) {
  console.info(`[api] ${context.requestId} ${response.status} ${Date.now() - context.startedAt}ms ${context.route}`);
  return attachContextHeaders(response, context);
}

export function logApiError(context: ApiContext, error: unknown) {
  if (error instanceof ZodError) {
    console.error(`[api] ${context.requestId} validation failed ${context.route}`, error.flatten());
    return;
  }

  console.error(`[api] ${context.requestId} failed ${context.route}`, error);
}

export function jsonResponse<T>(body: T, init?: ResponseInit, context?: ApiContext) {
  let payload: unknown = body;

  if (Array.isArray(body)) {
    payload = {
      success: true,
      data: body,
      items: body,
      requestId: context?.requestId,
    };
  } else if (body !== null && typeof body === "object") {
    payload = {
      success: true,
      data: body,
      requestId: context?.requestId,
      ...(body as Record<string, unknown>),
    };
  } else {
    payload = {
      success: true,
      data: body,
      requestId: context?.requestId,
    };
  }

  return attachContextHeaders(NextResponse.json(payload, init), context);
}

export function jsonError(message: string, status = 400, details?: string, context?: ApiContext) {
  const body: ApiErrorBody = {
    success: false,
    error: message,
    details,
    requestId: context?.requestId,
  };

  if (!details) {
    delete body.details;
  }

  return attachContextHeaders(NextResponse.json(body, { status }), context);
}

export async function readJsonBody<T>(request: Request, schema?: ZodTypeAny): Promise<T> {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    throw new Error("Invalid JSON body");
  }

  if (schema) {
    return schema.parse(payload) as T;
  }

  return payload as T;
}

export function getRequestIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return request.headers.get("x-real-ip") || "unknown";
}

export function enforceRateLimit({
  key,
  limit,
  windowMs,
}: {
  key: string;
  limit: number;
  windowMs: number;
}) {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || entry.resetAt <= now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true as const };
  }

  if (entry.count >= limit) {
    return {
      allowed: false as const,
      retryAfterSeconds: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)),
    };
  }

  entry.count += 1;
  return { allowed: true as const };
}

export function getRateLimitKey(route: string, actor: string) {
  return `${route}:${actor}`;
}

export function zodErrorDetails(error: unknown) {
  if (!(error instanceof ZodError)) {
    return undefined;
  }

  return error.issues.map((issue) => `${issue.path.join(".") || "body"}: ${issue.message}`).join("; ");
}
