
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { MessageCircle, Send, Loader2 } from "lucide-react";
import { Summary } from "@/types";
import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js to use browser cache
env.allowLocalModels = false;
env.useBrowserCache = true;

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
  const [model, setModel] = useState<any>(null);

  const initializeModel = async () => {
    try {
      const pipe = await pipeline(
        'text-generation',
        'Xenova/gpt2-tiny',
        { device: 'webgpu' }
      );
      setModel(pipe);
    } catch (error) {
      console.error('Error initializing model:', error);
    }
  };

  useEffect(() => {
    initializeModel();
  }, []);

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
      let response = "I'm processing your question...";

      if (model) {
        // Prepare context for the model
        const context = `Summary: ${summary.summaryText}\n\nQuestion: ${newMessage}\n\nAnswer:`;
        
        const result = await model(context, {
          max_length: 100,
          temperature: 0.7,
        });

        response = result[0].generated_text.split('Answer:')[1]?.trim() || 
                  "I understand your question. Based on the summary: " + summary.summaryText.slice(0, 100) + "...";
      }

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

  return (
    <Card className="flex flex-col h-[400px]">
      <div className="flex items-center gap-2 p-4 border-b">
        <MessageCircle className="w-5 h-5" />
        <h3 className="font-semibold">Chat about this summary</h3>
      </div>
      
      <ScrollArea className="flex-1 p-4 space-y-4">
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
