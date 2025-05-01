
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { urlService } from "@/services/url";

interface TextAnalysisProps {
  text: string;
}

export function TextAnalysis({ text }: TextAnalysisProps) {
  const [analysis, setAnalysis] = useState<{
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
  } | null>(null);

  useEffect(() => {
    if (text && text.trim().length > 0) {
      const analysisResult = urlService.analyzeText(text);
      setAnalysis(analysisResult);
    } else {
      setAnalysis(null);
    }
  }, [text]);

  if (!analysis) {
    return null;
  }

  // Get appropriate color for sentiment
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

  // Get appropriate color for readability
  const getReadabilityColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
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
