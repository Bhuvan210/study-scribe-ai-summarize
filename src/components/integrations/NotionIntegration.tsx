
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Book, ExternalLink, FileText, ChevronRight } from "lucide-react";
import { notionService, NotionPage } from "@/services/notion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";

interface NotionIntegrationProps {
  onPageSelected: (content: string) => void;
}

export function NotionIntegration({ onPageSelected }: NotionIntegrationProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoadingPages, setIsLoadingPages] = useState(false);
  const [isSelectingPage, setIsSelectingPage] = useState(false);
  const [pages, setPages] = useState<NotionPage[]>([]);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check if already connected on component mount
    const connectionStatus = notionService.isAuthenticated();
    setIsConnected(connectionStatus);
    
    if (connectionStatus) {
      loadPages();
    }
  }, []);

  const connectToNotion = async () => {
    setIsConnecting(true);
    try {
      await notionService.connect();
      setIsConnected(true);
      toast({
        title: "Connected to Notion",
        description: "Your Notion account has been successfully connected.",
      });
      loadPages();
    } catch (error) {
      toast({
        title: "Connection failed",
        description: "There was an error connecting to Notion. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectFromNotion = async () => {
    try {
      await notionService.disconnect();
      setIsConnected(false);
      setPages([]);
      toast({
        title: "Disconnected from Notion",
        description: "Your Notion account has been disconnected.",
      });
    } catch (error) {
      toast({
        title: "Error disconnecting",
        description: "There was an error disconnecting from Notion.",
        variant: "destructive",
      });
    }
  };

  const loadPages = async () => {
    setIsLoadingPages(true);
    try {
      const notionPages = await notionService.getPages();
      setPages(notionPages);
      setIsSelectingPage(true);
    } catch (error) {
      toast({
        title: "Error loading pages",
        description: "There was an error loading your Notion pages.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingPages(false);
    }
  };

  const selectPage = async (pageId: string) => {
    setSelectedPageId(pageId);
    try {
      const content = await notionService.getPageContent(pageId);
      onPageSelected(content);
      
      toast({
        title: "Page imported",
        description: "Notion page content has been imported successfully.",
      });
    } catch (error) {
      toast({
        title: "Error importing page",
        description: "There was an error importing the Notion page.",
        variant: "destructive",
      });
      setSelectedPageId(null);
    }
  };

  if (!isConnected) {
    return (
      <div className="space-y-6 py-4">
        <Button 
          className="w-full flex items-center justify-center gap-2" 
          variant="outline"
          onClick={connectToNotion}
          disabled={isConnecting}
        >
          {isConnecting ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Book className="h-5 w-5" />
          )}
          Connect to Notion
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Import pages directly from your Notion workspace.
          <br />Authorize access to select and import Notion pages.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 py-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Book className="h-5 w-5 text-indigo-600 mr-2" />
          <span className="font-medium">Connected to Notion</span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={disconnectFromNotion}
          className="text-muted-foreground hover:text-foreground"
        >
          Disconnect
        </Button>
      </div>

      {isLoadingPages ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      ) : isSelectingPage ? (
        <div className="space-y-4">
          <div className="text-sm font-medium">Select a Notion page to import:</div>
          <ScrollArea className="h-64">
            <div className="space-y-2">
              {pages.map((page) => (
                <Card 
                  key={page.id} 
                  className={`cursor-pointer hover:border-indigo-300 transition-colors ${
                    selectedPageId === page.id ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20' : ''
                  }`}
                  onClick={() => selectPage(page.id)}
                >
                  <CardContent className="p-3 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-4 w-4 text-indigo-600" />
                      <div>
                        <div className="font-medium">{page.title}</div>
                        <div className="text-xs text-muted-foreground">
                          Edited {new Date(page.lastEdited).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>
      ) : null}
    </div>
  );
}
