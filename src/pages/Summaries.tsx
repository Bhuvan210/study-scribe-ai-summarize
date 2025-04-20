
import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useSummary } from "@/contexts/SummaryContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Sparkles, Copy, Eye, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";

export default function Summaries() {
  const { summaries, deleteSummary, isLoading } = useSummary();
  const { toast } = useToast();
  const [expandedSummaries, setExpandedSummaries] = useState<Record<string, boolean>>({});

  const toggleSummary = (id: string) => {
    setExpandedSummaries(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Summary text has been copied to your clipboard.",
    });
  };

  return (
    <MainLayout>
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50 sm:text-4xl">
            My Summaries
          </h1>
          <p className="mt-3 text-lg text-gray-600 dark:text-gray-300">
            View and manage your saved summaries
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center">
            <div className="loading dark:text-gray-200">Loading...</div>
          </div>
        ) : summaries.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <p className="text-center text-gray-500 dark:text-gray-400">
                You haven't created any summaries yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {summaries.map((summary) => (
              <Card key={summary.id} className="hover:shadow-md transition-shadow duration-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium dark:text-gray-200">
                    Summary created {format(new Date(summary.createdAt), "PPpp")}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {summary.model && (
                      <Badge variant={summary.model === "Gemini Flash 2.0" ? "default" : "outline"} className="flex items-center gap-1">
                        {summary.model === "Gemini Flash 2.0" && <Sparkles className="h-3 w-3" />}
                        {summary.model}
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteSummary(summary.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold dark:text-gray-200">Original Text</h3>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => toggleSummary(summary.id)}
                          className="h-6 w-6 p-0"
                        >
                          {expandedSummaries[summary.id] ? 
                            <ChevronUp className="h-4 w-4" /> : 
                            <ChevronDown className="h-4 w-4" />
                          }
                        </Button>
                      </div>
                      <p 
                        className={`text-sm text-gray-600 dark:text-gray-300 ${
                          !expandedSummaries[summary.id] ? "line-clamp-3" : ""
                        }`}
                      >
                        {summary.originalText}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold dark:text-gray-200">Summary</h3>
                        <div className="flex space-x-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => copyToClipboard(summary.summaryText)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 bg-muted/40 dark:bg-gray-800 p-3 rounded-md">
                        {summary.summaryText}
                      </p>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Summary length: {summary.lengthType === "percentage"
                        ? `${summary.lengthValue}%`
                        : summary.lengthType}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
