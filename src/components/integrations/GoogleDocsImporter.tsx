
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { FileText, Loader2, Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface GoogleDoc {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
  webViewLink: string;
}

interface GoogleDocsImporterProps {
  onContentFetched: (content: string, source?: string) => void;
}

export function GoogleDocsImporter({ onContentFetched }: GoogleDocsImporterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [documents, setDocuments] = useState<GoogleDoc[]>([]);
  const { toast } = useToast();

  const CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID"; // This would need to be configured
  const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
  const SCOPES = 'https://www.googleapis.com/auth/drive.readonly';

  const initializeGoogleAPI = async () => {
    try {
      // In a real implementation, this would load the Google APIs
      // For now, we'll simulate the authentication flow
      setIsAuthenticating(true);
      
      // Simulate OAuth flow
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate getting access token
      const mockToken = `mock_token_${Date.now()}`;
      setAccessToken(mockToken);
      
      toast({
        title: "Connected to Google",
        description: "Successfully authenticated with your Google account",
      });
      
      await loadDocuments(mockToken);
    } catch (error) {
      toast({
        title: "Authentication failed",
        description: "Could not connect to Google Drive. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAuthenticating(false);
    }
  };

  const loadDocuments = async (token: string) => {
    setIsLoadingDocs(true);
    try {
      // In a real implementation, this would call the Google Drive API
      // For now, we'll return mock documents
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockDocs: GoogleDoc[] = [
        {
          id: "1",
          name: "Research Paper Draft",
          mimeType: "application/vnd.google-apps.document",
          modifiedTime: "2024-01-15T10:30:00Z",
          webViewLink: "https://docs.google.com/document/d/1/edit"
        },
        {
          id: "2",
          name: "Project Proposal",
          mimeType: "application/vnd.google-apps.document",
          modifiedTime: "2024-01-10T14:20:00Z",
          webViewLink: "https://docs.google.com/document/d/2/edit"
        },
        {
          id: "3",
          name: "Meeting Notes",
          mimeType: "application/vnd.google-apps.document",
          modifiedTime: "2024-01-05T09:15:00Z",
          webViewLink: "https://docs.google.com/document/d/3/edit"
        }
      ];
      
      setDocuments(mockDocs);
    } catch (error) {
      toast({
        title: "Failed to load documents",
        description: "Could not retrieve your Google Docs. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingDocs(false);
    }
  };

  const importDocument = async (doc: GoogleDoc) => {
    setIsImporting(true);
    try {
      // In a real implementation, this would export the document as plain text
      // and fetch its content from Google Drive API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock document content based on the document name
      const mockContent = generateMockContent(doc.name);
      
      onContentFetched(mockContent, `Google Docs: ${doc.name}`);
      setIsOpen(false);
      
      toast({
        title: "Document imported",
        description: `Successfully imported "${doc.name}" from Google Docs`,
      });
    } catch (error) {
      toast({
        title: "Import failed",
        description: `Could not import "${doc.name}". Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const generateMockContent = (docName: string): string => {
    const templates = {
      "Research Paper Draft": `# ${docName}

## Abstract
This research paper explores the latest developments in artificial intelligence and machine learning technologies. The study examines various applications across different industries and analyzes their impact on productivity and innovation.

## Introduction
Artificial intelligence has become increasingly prevalent in modern society, transforming how we work, communicate, and solve complex problems. This paper provides a comprehensive analysis of current AI trends and their implications for the future.

## Methodology
Our research methodology involved surveying 500 professionals across various industries, conducting in-depth interviews with AI experts, and analyzing performance data from companies implementing AI solutions.

## Results
The findings indicate a 40% increase in productivity among organizations that have successfully integrated AI tools into their workflows. Key benefits include improved decision-making, enhanced customer service, and streamlined operations.

## Conclusion
As AI technology continues to evolve, organizations must adapt their strategies to leverage these powerful tools effectively. Future research should focus on ethical considerations and long-term societal impacts.`,

      "Project Proposal": `# ${docName}

## Executive Summary
This project proposal outlines a comprehensive plan to implement a new customer relationship management (CRM) system that will enhance our organization's ability to manage client interactions and improve sales performance.

## Project Objectives
- Implement a modern CRM system within 6 months
- Improve customer satisfaction scores by 25%
- Increase sales team productivity by 30%
- Enhance data analytics and reporting capabilities

## Scope and Deliverables
The project will include system selection, data migration, staff training, and ongoing support. Key deliverables include a fully functional CRM system, user documentation, and training materials.

## Timeline and Budget
The project is estimated to take 6 months with a budget of $150,000. This includes software licensing, implementation services, and training costs.

## Risk Assessment
Potential risks include data migration challenges, user adoption resistance, and integration complexities. Mitigation strategies have been developed for each identified risk.`,

      "Meeting Notes": `# ${docName}

## Date: January 15, 2024
## Attendees: Sarah Johnson, Mike Chen, Lisa Rodriguez, David Park

## Agenda Items

### 1. Q4 Performance Review
- Revenue exceeded targets by 12%
- Customer satisfaction improved to 4.2/5
- Team productivity metrics showed positive trends

### 2. New Product Launch Strategy
- Market research indicates strong demand
- Launch timeline set for March 2024
- Marketing budget approved at $50,000

### 3. Team Development Initiatives
- Training programs to be implemented in February
- Cross-functional collaboration workshops scheduled
- Performance review process updates discussed

## Action Items
1. Sarah to finalize marketing materials by January 30
2. Mike to coordinate with IT on system upgrades
3. Lisa to schedule team training sessions
4. David to prepare budget analysis for next quarter

## Next Meeting
Scheduled for January 29, 2024, at 2:00 PM`
    };

    return templates[docName as keyof typeof templates] || 
      `# ${docName}

This is sample content from your Google Docs document. In a real implementation, this would contain the actual text content extracted from your Google Drive document.

The document contains multiple paragraphs with various formatting, including headers, bullet points, and other structured content that would be preserved during the import process.

Key topics covered in this document include:
- Introduction to the subject matter
- Detailed analysis and discussion
- Supporting evidence and examples
- Conclusions and recommendations

This content would be automatically extracted and ready for summarization using our AI-powered text summarization tools.`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full flex items-center justify-center gap-2" variant="outline">
          <FileText className="h-5 w-5" />
          Import from Google Docs
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Import from Google Docs</DialogTitle>
          <DialogDescription>
            Connect to your Google Drive and select a document to import for summarization
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {!accessToken ? (
            <div className="text-center py-8">
              <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Connect to Google Drive</h3>
              <p className="text-muted-foreground mb-6">
                Sign in with your Google account to access your documents
              </p>
              <Button 
                onClick={initializeGoogleAPI}
                disabled={isAuthenticating}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isAuthenticating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Sign in with Google
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground mt-4">
                Note: This is a demo implementation. In production, you would need to configure Google OAuth credentials.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {isLoadingDocs ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground">Loading your documents...</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Your Google Docs</h3>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => loadDocuments(accessToken)}
                    >
                      Refresh
                    </Button>
                  </div>
                  
                  <div className="grid gap-3 max-h-96 overflow-y-auto">
                    {documents.map((doc) => (
                      <Card key={doc.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-base flex items-center gap-2">
                                <FileText className="h-4 w-4 text-blue-600" />
                                {doc.name}
                              </CardTitle>
                              <CardDescription className="text-sm">
                                Modified: {formatDate(doc.modifiedTime)}
                              </CardDescription>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => importDocument(doc)}
                              disabled={isImporting}
                              className="ml-2"
                            >
                              {isImporting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <Download className="h-4 w-4 mr-1" />
                                  Import
                                </>
                              )}
                            </Button>
                          </div>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                  
                  {documents.length === 0 && (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">No Google Docs found in your Drive</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
