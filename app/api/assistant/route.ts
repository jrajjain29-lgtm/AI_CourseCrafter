import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { buildFallbackReply, generateAssistantReply, normalizeAssistantMessages, type AssistantMessage, type AssistantRequest } from "@/lib/assistant/openai";
import { saveAssistantConversation } from "@/lib/assistant/storage";
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
import { assistantRequestSchema } from "@/lib/server/schemas";
import { ZodError } from "zod";

export async function POST(request: Request) {
  const context = startApiRequest(request, "assistant:chat");

  try {
    const session = await getServerSession(authOptions);
    const body = await readJsonBody<AssistantRequest & { conversationId?: string }>(request, assistantRequestSchema);
    const messages = normalizeAssistantMessages(body.messages);

    const rateLimitKey = session?.user?.id
      ? getRateLimitKey("assistant:chat", session.user.id)
      : getRateLimitKey("assistant:chat", getRequestIp(request));

    const rateLimit = enforceRateLimit({
      key: rateLimitKey,
      limit: 20,
      windowMs: 60_000,
    });

    if (!rateLimit.allowed) {
      const response = jsonError("Too many assistant requests", 429, "Please wait before sending another message.", context);
      response.headers.set("retry-after", String(rateLimit.retryAfterSeconds));
      return finishApiRequest(context, response);
    }

    if (messages.length === 0) {
      return finishApiRequest(
        context,
        jsonResponse({ reply: "Ask me anything about AI CourseCrafter or your learning path." }, undefined, context)
      );
    }

    const reply = await generateAssistantReply(messages, body.userName);
    const assistantMessages: AssistantMessage[] = [...messages, { role: "assistant", content: reply }];

    if (session?.user?.id) {
      const conversation = await saveAssistantConversation({
        userId: session.user.id,
        conversationId: body.conversationId,
        messages: assistantMessages,
      });

      return finishApiRequest(context, jsonResponse({ reply, conversationId: conversation.id }, undefined, context));
    }

    return finishApiRequest(context, jsonResponse({ reply, conversationId: body.conversationId || null }, undefined, context));
  } catch (error) {
    logApiError(context, error);

    if (error instanceof ZodError) {
      return finishApiRequest(context, jsonError("Invalid assistant payload", 400, error.message, context));
    }

    const fallback = buildFallbackReply("", undefined);
    return finishApiRequest(context, jsonResponse({ reply: fallback }, undefined, context));
  }
}