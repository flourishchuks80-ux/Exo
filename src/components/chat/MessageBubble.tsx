"use client";

import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

export function MessageBubble({ role, content, isStreaming }: MessageBubbleProps) {
  const isUser = role === "user";

  // Highlight [Memory: topic] citations in assistant responses
  const formattedContent = content.replace(
    /\[Memory: ([^\]]+)\]/g,
    '<span class="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[rgba(0,212,170,0.12)] text-[#00D4AA] text-[10px] font-mono border border-[rgba(0,212,170,0.2)]">⛓ $1</span>'
  );

  return (
    <div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
      {/* Avatar */}
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1",
          isUser ? "bg-[#192235] border border-[rgba(0,212,170,0.2)]" : "bg-[rgba(0,212,170,0.12)] border border-[rgba(0,212,170,0.2)]"
        )}
      >
        {isUser ? (
          <User className="w-4 h-4 text-[#8B9CC8]" />
        ) : (
          <Bot className="w-4 h-4 text-[#00D4AA]" />
        )}
      </div>

      {/* Bubble */}
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
          isUser
            ? "bg-[#192235] text-[#F0F4FF] rounded-tr-sm"
            : "bg-[#121A2E] border border-[rgba(0,212,170,0.08)] text-[#F0F4FF] rounded-tl-sm"
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{content}</p>
        ) : (
          <div
            className="prose prose-invert prose-sm max-w-none [&_code]:text-[#00D4AA] [&_code]:bg-[rgba(0,212,170,0.08)] [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: formattedContent }}
          />
        )}

        {isStreaming && (
          <span className="inline-block w-0.5 h-4 bg-[#00D4AA] ml-0.5 animate-blink" />
        )}
      </div>
    </div>
  );
}
