import { prisma } from "@/lib/prisma";
import type { AssistantMessage } from "@/lib/assistant/openai";

function buildAssistantConversationTitle(messages: AssistantMessage[]) {
  const firstUserMessage = messages.find((message) => message.role === "user")?.content.trim();

  if (!firstUserMessage) {
    return "AI Mentor chat";
  }

  return firstUserMessage.length > 60 ? `${firstUserMessage.slice(0, 57)}...` : firstUserMessage;
}

export async function saveAssistantConversation(params: {
  userId: string;
  conversationId?: string;
  messages: AssistantMessage[];
}) {
  const title = buildAssistantConversationTitle(params.messages);
  const messages = JSON.stringify(params.messages);

  if (params.conversationId) {
    const existing = await prisma.assistantConversation.findFirst({
      where: {
        id: params.conversationId,
        userId: params.userId,
      },
    });

    if (existing) {
      return prisma.assistantConversation.update({
        where: { id: existing.id },
        data: {
          title,
          messages,
          lastMessageAt: new Date(),
        },
      });
    }
  }

  return prisma.assistantConversation.create({
    data: {
      userId: params.userId,
      title,
      messages,
      lastMessageAt: new Date(),
    },
  });
}
