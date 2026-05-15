"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { Bot, ChevronDown, MessageCircle, Send, Sparkles, X } from "lucide-react";

type ChatRole = "user" | "assistant";

type ChatMessage = {
  role: ChatRole;
  content: string;
};

const starterPrompts = [
  "How does AI CourseCrafter work?",
  "What should I learn after React?",
  "How do I increase my streak?",
  "Explain the dashboard features",
];

const welcomeMessage: ChatMessage = {
  role: "assistant",
  content:
    "Hi, I’m your AI mentor. Ask me anything about courses, learning paths, progress, streaks, or how to use AI CourseCrafter.",
};

export default function AssistantWidget() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("assistantMessages");
    const storedConversationId = localStorage.getItem("assistantConversationId");

    if (storedConversationId) {
      setConversationId(storedConversationId);
    }

    if (!stored) return;

    try {
      const parsed = JSON.parse(stored) as ChatMessage[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        setMessages(parsed);
      }
    } catch {
      localStorage.removeItem("assistantMessages");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("assistantMessages", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (conversationId) {
      localStorage.setItem("assistantConversationId", conversationId);
      return;
    }

    localStorage.removeItem("assistantConversationId");
  }, [conversationId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const assistantName = useMemo(() => session?.user?.name || "Learner", [session?.user?.name]);

  const closeAssistant = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeAssistant();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  const sendMessage = async (messageText: string) => {
    const trimmed = messageText.trim();
    if (!trimmed || isLoading) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages,
          userName: assistantName,
          conversationId,
        }),
      });

      const data = await response.json();

      if (typeof data.conversationId === "string") {
        setConversationId(data.conversationId);
      }

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          role: "assistant",
          content: data.reply || "I could not generate a response right now.",
        },
      ]);
    } catch {
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          role: "assistant",
          content: "I’m having trouble reaching the assistant right now. Please try again in a moment.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {isOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]"
            onClick={closeAssistant}
            aria-label="Close assistant overlay"
          />

          <div className="fixed inset-3 z-50 flex h-[calc(100vh-1.5rem)] flex-col overflow-hidden rounded-3xl border border-border bg-background shadow-2xl sm:inset-auto sm:bottom-5 sm:right-5 sm:h-[min(42rem,88vh)] sm:w-[min(92vw,24rem)]">
            <div className="flex items-start justify-between gap-4 border-b border-border px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-black text-white dark:bg-white dark:text-black">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-foreground">AI Mentor</h3>
                    <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      <Sparkles className="h-3 w-3" />
                      Live
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">Ask about learning, progress, or the platform</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={closeAssistant}
                  className="rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-gray-100 hover:text-foreground"
                >
                  Minimize
                </button>
                <button
                  type="button"
                  onClick={closeAssistant}
                  className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-gray-100 hover:text-foreground"
                  aria-label="Close assistant"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                      message.role === "user"
                        ? "bg-black text-white dark:bg-white dark:text-black"
                        : "bg-gray-100 text-foreground dark:bg-gray-800"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl bg-gray-100 px-4 py-3 text-sm text-muted-foreground dark:bg-gray-800">
                    Thinking...
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>

            <div className="border-t border-border px-4 py-4">
              <div className="mb-3 flex flex-wrap gap-2">
                {starterPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => sendMessage(prompt)}
                    className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-gray-100 hover:text-foreground"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  void sendMessage(input);
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Ask anything..."
                  className="flex-1 rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        </>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group inline-flex items-center gap-3 rounded-full border border-border bg-background px-4 py-3 shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
          aria-label="Open AI assistant"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black text-white dark:bg-white dark:text-black">
            <MessageCircle className="h-5 w-5" />
          </span>
          <span className="text-left">
            <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              AI Mentor
            </span>
            <span className="block text-sm font-semibold text-foreground">Ask a question</span>
          </span>
          <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-y-0.5" />
        </button>
      )}
    </div>
  );
}