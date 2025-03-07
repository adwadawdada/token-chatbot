
import { toast } from "sonner";

const BASE_URL = "https://cb62-2804-1b3-6148-ea69-7859-bd28-71fb-4d89.ngrok-free.app";

export const api = {
  validateToken: async (token: string): Promise<boolean> => {
    try {
      const response = await fetch(`${BASE_URL}/Auth/ValidateToken/${token}`);
      return response.status === 200;
    } catch (error) {
      console.error("Error validating token:", error);
      toast.error("Failed to validate token. Please try again.");
      return false;
    }
  },

  createThread: async (token: string): Promise<string | null> => {
    try {
      const response = await fetch(`${BASE_URL}/AssistantAi/Thread/Create`, {
        method: "GET",
        headers: {
          "Token": token,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to create thread: ${response.status}`);
      }

      const data = await response.json();
      return data.id;
    } catch (error) {
      console.error("Error creating thread:", error);
      toast.error("Failed to start conversation. Please try again.");
      return null;
    }
  },

  sendMessage: async (
    threadId: string,
    message: string,
    token: string,
    onChunk: (chunk: string) => void
  ): Promise<void> => {
    try {
      const response = await fetch(`${BASE_URL}/AssistantAi/Message/Send/${threadId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Token": token,
        },
        body: JSON.stringify({
          role: "user",
          content: message,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.status}`);
      }

      // Handle stream response
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Response body is not readable");
      }

      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;

        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        // Process chunks which come in format "data: part of the message here"
        const parts = chunk.split("data: ");
        for (let i = 1; i < parts.length; i++) { // Start from 1 to skip empty first part
          onChunk(parts[i].trim());
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again.");
    }
  },
};
