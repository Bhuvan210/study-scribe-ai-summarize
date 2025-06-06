
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { urlService } from "@/services/url";

interface TextAnalysisProps {
  text: string;
  originalText?: string;
}

interface AnalysisResult {
  readability: {
    score: number;
    level: string;
    readingTime: number;
  };
  keywords: string[];
  sentiment: {
    score: number;
    label: "positive" | "neutral" | "negative";
  };
  accuracy?: {
    score: number;
    label: string;
  };
}

export function TextAnalysis({ text, originalText }: TextAnalysisProps) {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    if (text && text.trim().length > 0) {
      const analysisResult = urlService.analyzeText(text);
      
      // Calculate accuracy if original text is provided
      let finalAnalysis: AnalysisResult = { ...analysisResult };
      if (originalText && originalText.trim().length > 0) {
        const accuracyScore = calculateAccuracy(text, originalText);
        finalAnalysis.accuracy = {
          score: accuracyScore,
          label: getAccuracyLabel(accuracyScore)
        };
      }
      
      setAnalysis(finalAnalysis);
    } else {
      setAnalysis(null);
    }
  }, [text, originalText]);

  const calculateAccuracy = (summary: string, original: string): number => {
    try {
      const originalKeywords = extractKeywords(original);
      const summaryKeywords = extractKeywords(summary);
      
      let matchCount = 0;
      originalKeywords.forEach(word => {
        if (summaryKeywords.includes(word)) {
          matchCount++;
        }
      });
      
      const overlapScore = originalKeywords.length > 0 
        ? (matchCount / originalKeywords.length) * 100
        : 0;
        
      const lengthRatio = Math.min(summary.length / original.length * 10, 1);
      const adjustedScore = overlapScore * lengthRatio;
      
      return Math.min(Math.round(adjustedScore), 100);
    } catch (error) {
      console.error("Error calculating accuracy:", error);
      return 50;
    }
  };
  
  const extractKeywords = (text: string): string[] => {
    const cleanText = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ');
      
    const words = cleanText.split(' ');
    
    const stopWords = ['the', 'and', 'is', 'in', 'to', 'of', 'that', 'it', 'with', 
                      'for', 'as', 'be', 'on', 'not', 'this', 'by', 'are', 'a', 'an'];
    const filteredWords = words.filter(word => 
      word.length > 3 && !stopWords.includes(word));
    
    const wordCounts: Record<string, number> = {};
    filteredWords.forEach(word => {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    });
    
    return Object.entries(wordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([word]) => word);
  };
  
  const getAccuracyLabel = (score: number): string => {
    if (score >= 85) return "Excellent";
    if (score >= 70) return "Good";
    if (score >= 50) return "Fair";
    if (score >= 30) return "Basic";
    return "Limited";
  };

  if (!analysis) {
    return null;
  }

  const getSentimentColor = (label: string) => {
    switch (label) {
      case "positive":
        return "bg-green-500";
      case "negative":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getReadabilityColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };
  
  const getAccuracyColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    if (score >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Text Analysis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium">Readability</span>
            <span className="text-sm">{analysis.readability.score}/100</span>
          </div>
          <Progress 
            value={analysis.readability.score} 
            className={`h-2 ${getReadabilityColor(analysis.readability.score)}`}
          />
          <div className="flex justify-between mt-1">
            <span className="text-xs text-muted-foreground">{analysis.readability.level}</span>
            <span className="text-xs text-muted-foreground">
              ~{analysis.readability.readingTime} min read
            </span>
          </div>
        </div>

        {analysis.accuracy && (
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Summary Accuracy</span>
              <span className="text-sm">{analysis.accuracy.score}/100</span>
            </div>
            <Progress 
              value={analysis.accuracy.score} 
              className={`h-2 ${getAccuracyColor(analysis.accuracy.score)}`}
            />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-muted-foreground">{analysis.accuracy.label}</span>
              <span className="text-xs text-muted-foreground">
                Based on key content coverage
              </span>
            </div>
          </div>
        )}

        <div>
          <h4 className="text-sm font-medium mb-2">Keywords</h4>
          <div className="flex flex-wrap gap-1">
            {analysis.keywords.map((keyword) => (
              <Badge key={keyword} variant="outline" className="capitalize">
                {keyword}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-1">Sentiment</h4>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div 
                className={`w-3 h-3 rounded-full ${getSentimentColor(analysis.sentiment.label)}`}
              />
              <span className="text-sm capitalize">{analysis.sentiment.label}</span>
            </div>
            <span className="text-xs text-muted-foreground">
              Score: {analysis.sentiment.score}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
