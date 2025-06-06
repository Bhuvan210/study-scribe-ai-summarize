
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  Loader2,
  Search,
  AlertCircle,
  FileText,
  Link as LinkIcon,
} from "lucide-react";
import { urlService } from "@/services/url";
import { Input } from "@/components/ui/input";
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UrlSummarizerProps {
  onContentFetched: (content: string) => void;
}

export function UrlSummarizer({ onContentFetched }: UrlSummarizerProps) {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractMode, setExtractMode] = useState<"full" | "main" | "title">(
    "main"
  );
  const [metadata, setMetadata] = useState<{
    title?: string;
    author?: string;
    publishDate?: string;
    source?: string;
    wordCount?: number;
  } | null>(null);

  const { toast } = useToast();

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    setError(null);
    setMetadata(null);
  };

  const handleExtractModeChange = (value: string) => {
    setExtractMode(value as "full" | "main" | "title");
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
    setMetadata(null);

    try {
      const result = await urlService.fetchContentFromUrl(url, extractMode);
      const { content, metadata } = result;
      onContentFetched(content);
      setMetadata(metadata);
      toast({
        title: "Article fetched",
        description: "The article content has been retrieved successfully.",
      });
    } catch (err) {
      console.error("Error fetching content:", err);
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
        <LinkIcon className="h-5 w-5 text-indigo-600 mr-2" />
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
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Fetching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" /> Fetch
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="extract-mode" className="text-sm font-medium">
            Content extraction mode:
          </label>
          <Select
            value={extractMode}
            onValueChange={handleExtractModeChange}
          >
            <SelectTrigger id="extract-mode" className="w-full">
              <SelectValue placeholder="Select extraction mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="main">Main content only</SelectItem>
              <SelectItem value="full">Full page</SelectItem>
              <SelectItem value="title">Title and summary</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {metadata && (
          <div className="p-3 bg-muted/30 rounded-md border">
            <h4 className="text-sm font-medium mb-1 flex items-center">
              <FileText className="h-4 w-4 mr-1" /> Article Information
            </h4>
            <dl className="text-xs space-y-1 text-muted-foreground">
              {metadata.title && (
                <div className="flex">
                  <dt className="font-medium w-20">Title:</dt>
                  <dd>{metadata.title}</dd>
                </div>
              )}
              {metadata.author && (
                <div className="flex">
                  <dt className="font-medium w-20">Author:</dt>
                  <dd>{metadata.author}</dd>
                </div>
              )}
              {metadata.publishDate && (
                <div className="flex">
                  <dt className="font-medium w-20">Published:</dt>
                  <dd>{metadata.publishDate}</dd>
                </div>
              )}
              {metadata.source && (
                <div className="flex">
                  <dt className="font-medium w-20">Source:</dt>
                  <dd>{metadata.source}</dd>
                </div>
              )}
              {metadata.wordCount && (
                <div className="flex">
                  <dt className="font-medium w-20">Words:</dt>
                  <dd>{metadata.wordCount.toLocaleString()}</dd>
                </div>
              )}
            </dl>
          </div>
        )}

        <div className="text-sm text-muted-foreground">
          <p>Enter a valid URL to fetch and summarize an article from the web.</p>
          <p className="mt-1">Note: This is a simulated service for demonstration purposes.</p>
        </div>
      </div>
    </div>
  );
}
