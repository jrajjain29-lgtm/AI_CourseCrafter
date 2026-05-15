export type AssistantMessage = {
  role: "user" | "assistant";
  content: string;
};

export type AssistantRequest = {
  messages?: AssistantMessage[];
  userName?: string;
};

type ChatCompletionMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

const systemPrompt =
  "You are AI CourseCrafter's AI Mentor, similar to an educational helper on a tutoring platform. " +
  "You answer user questions about the website, learning paths, dashboard, streaks, account flow, and general study guidance. " +
  "Be concise, clear, and practical. " +
  "If the question is about the app, explain the relevant feature and next action. " +
  "If the question is general learning advice, give step-by-step guidance. " +
  "If the question asks for something unsafe, illegal, or outside your knowledge, refuse briefly and redirect to safe help.";

function normalizeMessage(message: AssistantMessage | null | undefined): AssistantMessage | null {
  if (!message || typeof message.content !== "string") {
    return null;
  }

  const content = message.content.trim();
  if (!content) {
    return null;
  }

  if (message.role !== "user" && message.role !== "assistant") {
    return null;
  }

  return {
    role: message.role,
    content,
  };
}

export function normalizeAssistantMessages(messages: AssistantRequest["messages"]) {
  if (!Array.isArray(messages)) {
    return [] as AssistantMessage[];
  }

  return messages.map(normalizeMessage).filter(Boolean) as AssistantMessage[];
}

export function buildFallbackReply(latestMessage: string, userName?: string) {
  const namePrefix = userName ? `${userName}, ` : "";
  const text = latestMessage.toLowerCase();

  if (text.includes("course") || text.includes("learning path")) {
    return `${namePrefix}tell me your goal, skill level, and timeframe. I can help you choose a focus area and create a learning path from the Course Generator.`;
  }

  if (text.includes("streak") || text.includes("calendar") || text.includes("dashboard")) {
    return `${namePrefix}the dashboard shows your streak, recent activity, and learning calendar. Keep logging activity daily to grow your streak and active days.`;
  }

  if (text.includes("sign in") || text.includes("login") || text.includes("auth")) {
    return `${namePrefix}use the Sign In page with your registered email and password. If you created a new account, sign up first and then return to the dashboard.`;
  }

  if (text.includes("theme") || text.includes("dark mode") || text.includes("light mode")) {
    return `${namePrefix}you can switch between dark and light mode from the top toggle. Your choice is saved automatically for future visits.`;
  }

  return `${namePrefix}I can help with course recommendations, dashboard usage, streaks, themes, and account flow. Ask a more specific question and I’ll answer directly.`;
}

function buildOpenAIMessages(messages: AssistantMessage[], userName?: string): ChatCompletionMessage[] {
  return [
    { role: "system", content: systemPrompt },
    ...(userName
      ? [
          {
            role: "system" as const,
            content: `The user currently chatting is named ${userName}. Use their name naturally when useful.`,
          },
        ]
      : []),
    ...messages.slice(-10),
  ];
}

export async function generateAssistantReply(messages: AssistantMessage[], userName?: string) {
  const latestMessage = messages[messages.length - 1]?.content || "";
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return buildFallbackReply(latestMessage, userName);
  }

  try {
    const response = await fetch(`${process.env.OPENAI_BASE_URL || "https://api.openai.com/v1"}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        temperature: 0.4,
        messages: buildOpenAIMessages(messages, userName),
      }),
    });

    if (!response.ok) {
      return buildFallbackReply(latestMessage, userName);
    }

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      return buildFallbackReply(latestMessage, userName);
    }

    return reply as string;
  } catch {
    return buildFallbackReply(latestMessage, userName);
  }
}
