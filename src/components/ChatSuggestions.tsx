
import React from "react";
import { Button } from "@/components/ui/button";

interface ChatSuggestionsProps {
  onSuggestionClick: (suggestion: string) => void;
}

const ChatSuggestions: React.FC<ChatSuggestionsProps> = ({ onSuggestionClick }) => {
  const suggestions = [
    "How can you help me?",
    "Tell me about your capabilities",
    "What information do you have access to?",
    "Can you explain complex topics?",
  ];

  return (
    <div className="w-full flex flex-col items-center space-y-8 py-6 animate-fade-in">
      <h3 className="text-xl font-medium text-foreground/80">
        How can I assist you today?
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
        {suggestions.map((suggestion, index) => (
          <Button
            key={index}
            variant="outline"
            className="glass-morphism py-6 h-auto text-left justify-start hover:bg-secondary/30 transition-all duration-300 animate-slide-up"
            style={{ animationDelay: `${index * 100}ms` }}
            onClick={() => onSuggestionClick(suggestion)}
          >
            {suggestion}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default ChatSuggestions;
