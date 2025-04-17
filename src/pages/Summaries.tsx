
import { MainLayout } from "@/components/layout/MainLayout";
import { useSummary } from "@/contexts/SummaryContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function Summaries() {
  const { summaries, deleteSummary, isLoading } = useSummary();

  return (
    <MainLayout>
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
            My Summaries
          </h1>
          <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">
            View and manage your saved summaries
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center">
            <div className="loading dark:text-white">Loading...</div>
          </div>
        ) : summaries.length === 0 ? (
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="flex flex-col items-center justify-center p-6">
              <p className="text-center text-gray-500 dark:text-gray-400">
                You haven't created any summaries yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {summaries.map((summary) => (
              <Card key={summary.id} className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium dark:text-white">
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
                      <h3 className="mb-2 font-semibold dark:text-white">Original Text</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                        {summary.originalText}
                      </p>
                    </div>
                    <div>
                      <h3 className="mb-2 font-semibold dark:text-white">Summary</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {summary.summaryText}
                      </p>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500">
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
