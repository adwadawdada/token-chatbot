
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

  useEffect(() => {
    if (!token) {
      toast.error("You need to log in first");
      logout();
    }
  }, [token, logout]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, assistantResponse]);

  const createThreadIfNeeded = async () => {
    if (!threadId && token) {
      try {
        console.log("Creating new thread...");
        const newThreadId = await api.createThread(token);
        if (newThreadId) {
          console.log("Thread created:", newThreadId);
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

      console.log(`Sending message to thread ${currentThreadId}: ${content}`);

      // Send message and handle the streaming response
      await api.sendMessage(
        currentThreadId,
        content,
        token,
        (chunk) => {
          // Process each chunk of the SSE stream
          // The expected format is "data: <content>"
          // Just in case the format is different, we'll handle it accordingly
          setAssistantResponse((prev) => {
            // If chunk starts with "data: ", remove it
            const cleanChunk = chunk.startsWith("data: ") ? chunk.substring(6) : chunk;
            return prev + cleanChunk;
          });
        }
      );
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      // Wait a moment before finalizing to ensure all chunks are received
      setTimeout(() => {
        setIsLoading(false);
        setIsTyping(false);
        
        // Add assistant message to chat history after typing is complete
        if (assistantResponse) {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: assistantResponse }
          ]);
          setAssistantResponse("");
        }
      }, 500);
    }
  };

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
      <div className="chat-container">
        {/* Messages */}
        <div className="message-container">
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
