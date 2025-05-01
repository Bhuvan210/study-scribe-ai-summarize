
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { MessageCircle, Send, Loader2 } from "lucide-react";
import { Summary } from "@/types";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatInterfaceProps {
  summary: Summary;
}

export function ChatInterface({ summary }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I can help you understand this summary better. Feel free to ask any questions about it.",
    },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Simple response generation without external model
  const generateResponse = async (question: string): Promise<string> => {
    // Extract keywords from question
    const questionLower = question.toLowerCase();
    const summaryText = summary.summaryText.toLowerCase();
    
    // Find relevant sentences in the summary that might answer the question
    const sentences = summary.summaryText.split(/[.!?]+/).filter(s => s.trim());
    
    // Generate simple templates based on question type
    if (questionLower.includes("what") || questionLower.includes("tell me about")) {
      const relevantSentence = sentences.find(s => 
        s.toLowerCase().includes(questionLower.replace("what is", "").replace("tell me about", "").trim())
      ) || sentences[0];
      
      return `Based on the summary, ${relevantSentence.trim()}.`;
    }
    
    if (questionLower.includes("how")) {
      return `The summary discusses ${summary.source || "this topic"} but doesn't provide specific details about how. You might want to check the original source for more procedural information.`;
    }
    
    if (questionLower.includes("why")) {
      const relevantSentence = sentences.find(s => 
        s.toLowerCase().includes("because") || s.toLowerCase().includes("reason")
      );
      
      return relevantSentence 
        ? `The summary explains: ${relevantSentence.trim()}.` 
        : `The summary doesn't explicitly state why, but it does mention ${sentences[0].trim()}.`;
    }
    
    // Default response using the first couple of sentences
    return `According to the summary: ${sentences.slice(0, 2).join(". ")}.`;
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: newMessage,
    };

    setMessages((prev) => [...prev, userMessage]);
    setNewMessage("");
    setIsLoading(true);

    try {
      // Generate a simple response without model loading
      const response = await generateResponse(newMessage);
      
      const assistantMessage: Message = {
        role: "assistant",
        content: response,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error generating response:', error);
      const errorMessage: Message = {
        role: "assistant",
        content: "I apologize, but I encountered an error processing your question. Let me know if you'd like to try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  return (
    <Card className="flex flex-col h-[400px]">
      <div className="flex items-center gap-2 p-4 border-b">
        <MessageCircle className="w-5 h-5" />
        <h3 className="font-semibold">Chat about this summary</h3>
      </div>
      
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground ml-auto"
                  : "bg-muted"
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
      </ScrollArea>
      
      <div className="p-4 border-t flex gap-2">
        <Input
          placeholder="Ask a question about this summary..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          disabled={isLoading}
        />
        <Button
          onClick={handleSendMessage}
          disabled={isLoading}
          className="shrink-0"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </Card>
  );
}
