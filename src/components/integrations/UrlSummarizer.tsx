
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Link, AlertCircle } from "lucide-react";
import { urlService } from "@/services/url";
import { Input } from "@/components/ui/input";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface UrlSummarizerProps {
  onContentFetched: (content: string) => void;
}

export function UrlSummarizer({ onContentFetched }: UrlSummarizerProps) {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    setError(null);
  };

  const fetchContent = async () => {
    if (!url) {
      setError("Please enter a URL");
      return;
    }
    
    if (!urlService.isValidUrl(url)) {
      setError("Please enter a valid URL");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const content = await urlService.fetchContentFromUrl(url);
      onContentFetched(content);
      
      toast({
        title: "Article fetched",
        description: "The article content has been retrieved successfully.",
      });
    } catch (error) {
      console.error("Error fetching content:", error);
      setError("Failed to fetch article content. Please try again.");
      
      toast({
        title: "Error fetching article",
        description: "There was an error retrieving the article content.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 py-2">
      <div className="flex items-center">
        <Link className="h-5 w-5 text-indigo-600 mr-2" />
        <span className="font-medium">Summarize Web Article</span>
      </div>
      
      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="url-input" className="text-sm font-medium">
            Enter article URL:
          </label>
          <div className="flex gap-2">
            <Input
              id="url-input"
              type="url"
              placeholder="https://example.com/article"
              value={url}
              onChange={handleUrlChange}
              className="flex-1"
            />
            <Button
              onClick={fetchContent}
              disabled={isLoading}
              className="whitespace-nowrap"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Link className="h-4 w-4 mr-2" />
              )}
              {isLoading ? "Fetching..." : "Fetch"}
            </Button>
          </div>
        </div>
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="text-sm text-muted-foreground">
          <p>Enter a valid URL to fetch and summarize an article from the web.</p>
          <p className="mt-1">
            Note: This is a simulated service for demonstration purposes.
          </p>
        </div>
      </div>
    </div>
  );
}
