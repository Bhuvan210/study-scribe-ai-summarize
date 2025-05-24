
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { MessageCircle, Send, Loader2 } from "lucide-react";
import { Summary } from "@/types";
import { FlashCards } from "./FlashCards";

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
  const [showFlashCards, setShowFlashCards] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Enhanced response generation using summary context
  const generateResponse = async (question: string): Promise<string> => {
    // Extract keywords from question and summary
    const questionLower = question.toLowerCase();
    const summaryLower = summary.summaryText.toLowerCase();
    
    // Break summary into sentences and paragraphs for more contextual responses
    const sentences = summary.summaryText.split(/[.!?]+/).filter(s => s.trim());
    const paragraphs = summary.summaryText.split(/\n+/).filter(p => p.trim());
    
    // Check if question is about the summary topic/source
    if (questionLower.includes("what is this about") || 
        questionLower.includes("what's this about") ||
        questionLower.includes("topic") ||
        questionLower.includes("subject")) {
      
      if (summary.source) {
        return `This summary is about content from ${summary.source}. It covers: ${sentences[0].trim()}`;
      } else {
        return `This summary covers: ${sentences[0].trim()}`;
      }
    }
    
    // Check if asking about the original text length or source
    if (questionLower.includes("original") && 
        (questionLower.includes("length") || questionLower.includes("words") || questionLower.includes("size"))) {
      const originalLength = summary.originalText?.length || "unknown";
      const summaryLength = summary.summaryText.length;
      const ratio = summary.originalText ? Math.round((summaryLength / summary.originalText.length) * 100) : null;
      
      return `The original text was ${originalLength} characters long, while this summary is ${summaryLength} characters${ratio ? ` (about ${ratio}% of the original)` : ""}.`;
    }
    
    // Find relevant sentences based on keyword matching
    const findRelevantContent = () => {
      // Extract meaningful keywords from question (excluding common words)
      const questionWords = questionLower
        .replace(/[.,?!;:'"()\[\]{}]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 3 && !['what', 'when', 'where', 'which', 'who', 'whom', 'whose', 'why', 'how', 'this', 'that', 'these', 'those', 'does', 'did', 'have', 'has', 'could', 'would', 'should', 'about'].includes(word));
      
      // Score each sentence based on keyword matches
      const scoredSentences = sentences.map(sentence => {
        const sentenceLower = sentence.toLowerCase();
        const matchCount = questionWords.reduce((count, word) => {
          return count + (sentenceLower.includes(word) ? 1 : 0);
        }, 0);
        
        return { sentence, score: matchCount };
      });
      
      // Get top 2 relevant sentences
      return scoredSentences
        .sort((a, b) => b.score - a.score)
        .slice(0, 2)
        .map(item => item.sentence.trim());
    };
    
    // Generate response based on question type
    if (questionLower.startsWith("what") || 
        questionLower.startsWith("tell me about") ||
        questionLower.startsWith("explain")) {
      
      const relevantContent = findRelevantContent();
      
      if (relevantContent.length > 0) {
        return `Based on the summary: ${relevantContent.join(' ')}`;
      } else {
        // If no direct match, provide a general overview
        return `The summary doesn't specifically address that, but it mentions: ${sentences.slice(0, 2).join(' ')}`;
      }
    }
    
    if (questionLower.startsWith("how") || questionLower.includes("process") || questionLower.includes("method")) {
      const relevantSentences = sentences.filter(s => 
        s.toLowerCase().includes("by") || 
        s.toLowerCase().includes("through") || 
        s.toLowerCase().includes("using") ||
        s.toLowerCase().includes("with")
      );
      
      if (relevantSentences.length > 0) {
        return `According to the summary: ${relevantSentences[0].trim()}`;
      } else {
        return `The summary doesn't explain the process in detail, but it mentions: ${findRelevantContent().join(' ')}`;
      }
    }
    
    if (questionLower.startsWith("why") || questionLower.includes("reason") || questionLower.includes("cause")) {
      const relevantSentences = sentences.filter(s => 
        s.toLowerCase().includes("because") || 
        s.toLowerCase().includes("due to") || 
        s.toLowerCase().includes("reason") ||
        s.toLowerCase().includes("result of")
      );
      
      if (relevantSentences.length > 0) {
        return `The summary explains: ${relevantSentences[0].trim()}`;
      } else {
        return `The summary doesn't explicitly state why, but it notes: ${findRelevantContent().join(' ')}`;
      }
    }
    
    if (questionLower.startsWith("when") || 
        questionLower.includes("time") || 
        questionLower.includes("date") ||
        questionLower.includes("year")) {
      
      const timePatterns = [/\d{4}/, /\d{1,2}\/\d{1,2}\/\d{2,4}/, /january|february|march|april|may|june|july|august|september|october|november|december/i];
      
      for (const pattern of timePatterns) {
        const timeMatches = summary.summaryText.match(pattern);
        if (timeMatches) {
          const relevantSentence = sentences.find(s => s.match(pattern));
          if (relevantSentence) {
            return `According to the summary: ${relevantSentence.trim()}`;
          }
        }
      }
      
      return `The summary doesn't specify exact timing information, but it mentions: ${findRelevantContent().join(' ')}`;
    }
    
    if (questionLower.startsWith("who") || questionLower.includes("person") || questionLower.includes("people")) {
      const relevantContent = findRelevantContent();
      return `Based on the summary: ${relevantContent.join(' ')}`;
    }
    
    // Default response using the most relevant sentences
    const relevantContent = findRelevantContent();
    if (relevantContent.length > 0) {
      return `According to the summary: ${relevantContent.join(' ')}`;
    } else {
      return `I don't see specific information about that in the summary. The summary mainly discusses: ${sentences[0].trim()}`;
    }
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
      // Generate response using the enhanced context-aware function
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
    <div className="space-y-4">
      <Card className="flex flex-col h-[400px]">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            <h3 className="font-semibold">Chat about this summary</h3>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowFlashCards(!showFlashCards)}
          >
            {showFlashCards ? "Hide" : "Show"} Flash Cards
          </Button>
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
      
      {showFlashCards && (
        <FlashCards summary={summary} />
      )}
    </div>
  );
}
