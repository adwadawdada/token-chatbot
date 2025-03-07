
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/services/api";
import ChatMessage, { MessageRole } from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import ChatSuggestions from "@/components/ChatSuggestions";

interface Message {
  role: MessageRole;
  content: string;
}

const Chat = () => {
  const { token, threadId, setThreadId, logout } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [assistantResponse, setAssistantResponse] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, assistantResponse]);

  const createThreadIfNeeded = async () => {
    if (!threadId && token) {
      try {
        const newThreadId = await api.createThread(token);
        if (newThreadId) {
          setThreadId(newThreadId);
          return newThreadId;
        }
        return null;
      } catch (error) {
        console.error("Error creating thread:", error);
        toast.error("Failed to start conversation");
        return null;
      }
    }
    return threadId;
  };

  const handleSendMessage = async (content: string) => {
    if (!token) {
      toast.error("You need to log in first");
      logout();
      return;
    }

    // Add user message to chat
    setMessages((prev) => [...prev, { role: "user", content }]);
    
    setIsLoading(true);
    setIsTyping(true);
    setAssistantResponse(""); // Clear previous response

    try {
      // Create thread if it doesn't exist
      const currentThreadId = await createThreadIfNeeded();
      
      if (!currentThreadId) {
        toast.error("Failed to create conversation thread");
        setIsLoading(false);
        setIsTyping(false);
        return;
      }

      // Send message
      await api.sendMessage(
        currentThreadId,
        content,
        token,
        (chunk) => {
          setAssistantResponse((prev) => prev + chunk);
        }
      );
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setIsLoading(false);
    }
  };

  // Effect to add assistant message to chat history when typing is complete
  useEffect(() => {
    if (assistantResponse && !isLoading) {
      // Short timeout to ensure the typing animation completes naturally
      const timer = setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: assistantResponse }
        ]);
        setAssistantResponse("");
        setIsTyping(false);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [assistantResponse, isLoading]);

  const handleBack = () => {
    navigate("/");
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="py-4 px-6 glass-morphism border-b border-border sticky top-0 z-10 backdrop-blur-lg">
        <div className="flex items-center max-w-4xl mx-auto">
          <Button
            variant="ghost"
            size="icon"
            className="mr-3 text-foreground hover:text-primary hover:bg-background/20 transition-colors"
            onClick={handleBack}
          >
            <ArrowLeft size={20} />
          </Button>
          
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center mr-3">
              <span className="text-primary font-bold">AI</span>
            </div>
            <h1 className="text-xl font-medium">AI Assistant</h1>
          </div>
        </div>
      </header>

      {/* Chat container */}
      <div className="chat-container flex-1 overflow-auto py-6 px-4 flex flex-col max-w-4xl mx-auto w-full">
        {/* Messages */}
        <div className="message-container flex-1">
          {messages.length === 0 ? (
            <ChatSuggestions onSuggestionClick={handleSuggestionClick} />
          ) : (
            <div className="space-y-6">
              {messages.map((msg, index) => (
                <ChatMessage
                  key={index}
                  role={msg.role}
                  content={msg.content}
                />
              ))}
              
              {isTyping && assistantResponse && (
                <ChatMessage
                  role="assistant"
                  content={assistantResponse}
                  isTyping={true}
                />
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="mt-4">
          <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
          <p className="text-xs text-muted-foreground text-center mt-2">
            AI assistance is in preview and may produce inaccurate information
          </p>
        </div>
      </div>
    </div>
  );
};

export default Chat;
