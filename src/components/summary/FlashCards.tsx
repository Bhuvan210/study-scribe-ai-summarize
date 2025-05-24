
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";
import { Summary } from "@/types";

interface FlashCardsProps {
  summary: Summary;
}

interface FlashCard {
  question: string;
  answer: string;
}

export function FlashCards({ summary }: FlashCardsProps) {
  const [flashCards, setFlashCards] = useState<FlashCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);

  // Generate flash cards from the summary
  useEffect(() => {
    if (!summary?.summaryText) {
      setLoading(false);
      return;
    }

    setLoading(true);
    generateFlashCardsFromSummary(summary.summaryText)
      .then(cards => {
        setFlashCards(cards);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error generating flash cards:", error);
        setLoading(false);
      });
  }, [summary]);

  const generateFlashCardsFromSummary = async (text: string): Promise<FlashCard[]> => {
    // Simple algorithm to generate flash cards:
    // 1. Split into sentences or paragraphs
    // 2. For each significant sentence, generate a question/answer pair

    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    const paragraphs = text.split(/\n+/).filter(p => p.trim().length > 30);
    
    // Use paragraphs if available, otherwise use sentences
    const contentSegments = paragraphs.length > 1 ? paragraphs : sentences;
    
    // Generate flash cards (limit to 5-7 cards for better UX)
    const cards: FlashCard[] = [];
    
    // Select segments with important keywords first
    const keywordPatterns = [
      /important|significant|crucial|key|main|primary|essential/i,
      /first|second|third|finally|lastly|conclusion/i,
      /increased|decreased|improved|reduced|caused|resulted/i,
      /according to|research shows|study indicates/i
    ];
    
    // First pass - extract segments with keywords
    const selectedSegments = new Set<string>();
    for (const pattern of keywordPatterns) {
      for (const segment of contentSegments) {
        if (pattern.test(segment) && !selectedSegments.has(segment) && cards.length < 7) {
          selectedSegments.add(segment);
          
          // Generate question from segment
          const segmentText = segment.trim();
          let question = "";
          
          if (segmentText.includes("because") || segmentText.includes("due to")) {
            question = createReasonQuestion(segmentText);
          } else if (/what|which|who|when|where|why|how/.test(segmentText.toLowerCase())) {
            question = createFactQuestion(segmentText);
          } else {
            question = createGenericQuestion(segmentText);
          }
          
          cards.push({
            question,
            answer: segmentText
          });
        }
      }
    }
    
    // Second pass - if we don't have enough cards, add more from remaining segments
    if (cards.length < 5) {
      for (const segment of contentSegments) {
        if (!selectedSegments.has(segment) && cards.length < 7 && segment.length > 40) {
          const segmentText = segment.trim();
          cards.push({
            question: createGenericQuestion(segmentText),
            answer: segmentText
          });
        }
        
        if (cards.length >= 5) break;
      }
    }
    
    return cards;
  };
  
  const createFactQuestion = (text: string): string => {
    // Try to identify subject and create "What is/are..." question
    const words = text.split(" ");
    const firstThreeWords = words.slice(0, 3).join(" ");
    return `What is described regarding "${firstThreeWords}..."?`;
  };
  
  const createReasonQuestion = (text: string): string => {
    // For cause-effect relationships
    return "What is the reason or explanation for this point?";
  };
  
  const createGenericQuestion = (text: string): string => {
    // Fallback generic question
    const words = text.split(" ");
    const subject = words.slice(0, Math.min(3, words.length)).join(" ");
    return `What does the summary say about "${subject}..."?`;
  };

  const nextCard = () => {
    if (currentIndex < flashCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setFlipped(false);
    }
  };

  const prevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setFlipped(false);
    }
  };

  const toggleFlip = () => {
    setFlipped(!flipped);
  };

  if (loading) {
    return (
      <Card className="mt-4">
        <CardContent className="p-6 flex justify-center items-center min-h-[200px]">
          <div className="text-center text-muted-foreground">
            Generating flash cards...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (flashCards.length === 0) {
    return (
      <Card className="mt-4">
        <CardContent className="p-6 flex justify-center items-center min-h-[120px]">
          <div className="text-center text-muted-foreground">
            Not enough content to generate flash cards.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-4">
      <CardContent className="p-6">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold">Flash Cards</h3>
          <p className="text-sm text-muted-foreground">
            Click the card to see the answer ({currentIndex + 1}/{flashCards.length})
          </p>
        </div>
        
        <div 
          className="min-h-[180px] flex items-center justify-center cursor-pointer bg-card rounded-md border p-4 transition-all duration-300"
          onClick={toggleFlip}
          style={{
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            transformStyle: "preserve-3d"
          }}
        >
          {!flipped ? (
            <div className="p-4 text-center font-medium">
              {flashCards[currentIndex]?.question}
            </div>
          ) : (
            <div 
              className="p-4 text-center"
              style={{ transform: "rotateY(180deg)" }}
            >
              {flashCards[currentIndex]?.answer}
            </div>
          )}
        </div>
        
        <div className="flex justify-between mt-4">
          <Button 
            variant="outline" 
            onClick={prevCard} 
            disabled={currentIndex === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={toggleFlip}
          >
            {flipped ? <Check className="w-4 h-4 mr-2" /> : <X className="w-4 h-4 mr-2" />}
            {flipped ? "Got it" : "Flip"}
          </Button>
          <Button 
            variant="outline" 
            onClick={nextCard} 
            disabled={currentIndex === flashCards.length - 1}
          >
            Next
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
