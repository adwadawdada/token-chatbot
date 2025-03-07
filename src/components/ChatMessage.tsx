
import React from "react";
import { cn } from "@/lib/utils";

export type MessageRole = "user" | "assistant";

interface ChatMessageProps {
  content: string;
  role: MessageRole;
  isTyping?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ content, role, isTyping = false }) => {
  const isUser = role === "user";

  return (
    <div className={cn(
      "flex w-full animate-slide-up",
      isUser ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "flex items-start max-w-[80%] md:max-w-[70%]",
        isUser ? "flex-row-reverse" : "flex-row"
      )}>
        <div className={cn(
          "flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center",
          isUser ? "bg-primary/20 ml-3" : "bg-secondary mr-3"
        )}>
          {isUser ? (
            <span className="text-primary font-medium">U</span>
          ) : (
            <span className="text-secondary-foreground">AI</span>
          )}
        </div>
        
        <div className={cn(
          "px-4 py-3 rounded-2xl text-sm md:text-base",
          isUser 
            ? "bg-primary text-primary-foreground rounded-tr-none" 
            : "glass-morphism text-foreground rounded-tl-none",
          isTyping && "typing-cursor"
        )}>
          {content}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
