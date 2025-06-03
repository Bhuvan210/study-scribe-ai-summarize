import { useState, useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useSummary } from "@/contexts/SummaryContext";
import { MainLayout } from "@/components/layout/MainLayout";
import { FileUp, Loader2, FileText, Link, Upload, Key, AlertCircle } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Summary } from "@/types";
import { geminiService } from "@/services/gemini";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ChatInterface } from "@/components/summary/ChatInterface";
import { UrlSummarizer } from "@/components/integrations/UrlSummarizer";
import { TextAnalysis } from "@/components/summary/TextAnalysis";
import { PdfExport } from "@/components/summary/PdfExport";
import { SharingOptions } from "@/components/summary/SharingOptions";

const MAX_UPLOAD_SIZE = 10 * 1024 * 1024; // 10MB
const SUPPORTED_FILE_TYPES = ["application/pdf", "text/plain", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];

const formSchema = z.object({
  text: z.string().min(10, {
    message: "Text must be at least 10 characters",
  }).max(50000, {
    message: "Text cannot exceed 50,000 characters",
  }),
  summaryLength: z.enum(["short", "medium", "long", "percentage"]),
  percentageValue: z.string().optional(),
});

export default function Summarizer() {
  const { summarizeText, isLoading } = useSummary();
  const { toast } = useToast();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState("paste");
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  
  useEffect(() => {
    const apiKey = geminiService.getApiKey();
    if (!apiKey) {
      geminiService.setApiKey("AIzaSyCS4ynduDtHdAwhv9dKDlMw9DZ6hpZ6q9I");
      setHasApiKey(true);
    } else {
      setHasApiKey(!!apiKey);
    }
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: "",
      summaryLength: "medium",
      percentageValue: "30",
    },
  });

  const watchSummaryLength = form.watch("summaryLength");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      let lengthValue: string | number = values.summaryLength;
      
      if (values.summaryLength === 'percentage' && values.percentageValue) {
        const percentage = parseInt(values.percentageValue);
        if (percentage > 0 && percentage <= 100) {
          lengthValue = percentage;
        } else {
          toast({
            title: "Invalid percentage",
            description: "Percentage must be between 1 and 100",
            variant: "destructive",
          });
          return;
        }
      }
      
      let source: string | undefined = undefined;
      
      if (activeTab === "upload" && uploadedFile) {
        source = uploadedFile.name;
      } else if (activeTab === "google") {
        source = "google";
      } else if (activeTab === "url") {
        source = "url";
      }
      
      const result = await summarizeText({
        text: values.text,
        lengthType: values.summaryLength,
        lengthValue,
        source,
      });
      
      setSummary(result);
    } catch (error) {
      console.error("Summarization error:", error);
      toast({
        title: "Summarization failed",
        description: "There was an error generating the summary. Please try again.",
        variant: "destructive",
      });
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    
    if (!SUPPORTED_FILE_TYPES.includes(file.type)) {
      toast({
        title: "Unsupported file type",
        description: "Please upload a PDF, DOCX, or TXT file.",
        variant: "destructive",
      });
      return;
    }
    
    if (file.size > MAX_UPLOAD_SIZE) {
      toast({
        title: "File too large",
        description: "File size must be less than 10MB.",
        variant: "destructive",
      });
      return;
    }
    
    setIsUploading(true);
    setUploadedFile(file);
    
    try {
      if (file.type === "text/plain") {
        const text = await file.text();
        form.setValue("text", text);
      } else {
        setTimeout(() => {
          form.setValue("text", `This is sample text extracted from ${file.name}. In a real application, we would parse the actual content of ${file.type === "application/pdf" ? "PDF" : "DOCX"} files.`);
        }, 1000);
      }
      
      toast({
        title: "File uploaded",
        description: `Successfully processed ${file.name}`,
      });
    } catch (error) {
      toast({
        title: "File processing failed",
        description: "There was an error processing your file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const importFromGoogleDocs = () => {
    setActiveTab("external");
    toast({
      title: "Google Docs Integration",
      description: "This would open Google OAuth for document selection (implementation pending)",
    });
  };

  const handleContentFetched = (content: string) => {
    form.setValue("text", content);
    toast({
      title: "Content imported",
      description: "Article content imported successfully",
    });
  };

  const copyToClipboard = () => {
    if (summary) {
      navigator.clipboard.writeText(summary.summaryText);
      toast({
        title: "Copied to clipboard",
        description: "Summary has been copied to your clipboard.",
      });
    }
  };

  return (
    <MainLayout>
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
            AI Text Summarizer
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Upload a document or paste text to generate concise summaries
          </p>
        </div>
        
        {!hasApiKey && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>API Key Required</AlertTitle>
            <AlertDescription>
              For better summarization quality, please add your Gemini API key in the Profile page.
              The app will use a basic fallback summarization method until an API key is provided.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-foreground">Input Text</CardTitle>
              <CardDescription className="text-muted-foreground">
                Upload a file or paste your text
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="paste" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4 grid w-full grid-cols-4">
                  <TabsTrigger value="paste">Paste Text</TabsTrigger>
                  <TabsTrigger value="upload">Upload File</TabsTrigger>
                  <TabsTrigger value="google">Google Docs</TabsTrigger>
                  <TabsTrigger value="url">URL</TabsTrigger>
                </TabsList>
                
                <TabsContent value="paste">
                  <FormProvider {...form}>
                    <Form {...form}>
                      <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4"
                      >
                        <FormField
                          control={form.control}
                          name="text"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-foreground">Your Text</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Paste your text here to summarize..."
                                  className="h-48 resize-none text-foreground"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                              <div className="text-xs text-muted-foreground">
                                {field.value.length}/50,000 characters
                              </div>
                            </FormItem>
                          )}
                        />

                        <div className="space-y-4">
                          <div>
                            <FormLabel className="text-foreground">Summary Length</FormLabel>
                            <div className="mt-1.5">
                              <FormField
                                control={form.control}
                                name="summaryLength"
                                render={({ field }) => (
                                  <FormItem>
                                    <Select
                                      onValueChange={field.onChange}
                                      defaultValue={field.value}
                                    >
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select summary length" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="short">
                                          Short (~10% of original)
                                        </SelectItem>
                                        <SelectItem value="medium">
                                          Medium (~30% of original)
                                        </SelectItem>
                                        <SelectItem value="long">
                                          Long (~50% of original)
                                        </SelectItem>
                                        <SelectItem value="percentage">
                                          Custom percentage
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>

                          {watchSummaryLength === "percentage" && (
                            <FormField
                              control={form.control}
                              name="percentageValue"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-foreground">Percentage (%)</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min="1"
                                      max="100"
                                      {...field}
                                      className="text-foreground"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}
                        </div>

                        <Button
                          type="submit"
                          className="w-full"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Summarizing...
                            </>
                          ) : (
                            "Summarize Text"
                          )}
                        </Button>
                      </form>
                    </Form>
                  </FormProvider>
                </TabsContent>
                
                <TabsContent value="upload">
                  <div className="space-y-6">
                    <div className="flex items-center justify-center w-full">
                      <label
                        htmlFor="file-upload"
                        className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted dark:border-gray-600 dark:hover:border-gray-500"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          {isUploading ? (
                            <Loader2 className="h-8 w-8 text-primary animate-spin" />
                          ) : (
                            <FileUp className="h-8 w-8 text-primary" />
                          )}
                          <p className="mb-2 text-sm text-foreground">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-muted-foreground">
                            PDF, DOCX, TXT (MAX. 10MB)
                          </p>
                        </div>
                        <input
                          id="file-upload"
                          type="file"
                          className="hidden"
                          accept=".pdf,.docx,.txt"
                          onChange={handleFileUpload}
                          disabled={isUploading}
                        />
                      </label>
                    </div>

                    {uploadedFile && (
                      <div className="p-3 rounded-md border bg-muted/30 dark:bg-muted flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <FileUp className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium text-foreground">
                            {uploadedFile.name}
                          </span>
                        </div>
                      </div>
                    )}

                    {form.watch("text") && (
                      <div className="space-y-4">
                        <div className="p-4 rounded-lg bg-muted/50 dark:bg-muted">
                          <p className="text-sm text-foreground break-all">
                            {form.watch("text")}
                          </p>
                        </div>

                        <div>
                          <FormLabel className="text-foreground">Summary Length</FormLabel>
                          <div className="mt-1.5">
                            <FormField
                              control={form.control}
                              name="summaryLength"
                              render={({ field }) => (
                                <FormItem>
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select summary length" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="short">
                                        Short (~10% of original)
                                      </SelectItem>
                                      <SelectItem value="medium">
                                        Medium (~30% of original)
                                      </SelectItem>
                                      <SelectItem value="long">
                                        Long (~50% of original)
                                      </SelectItem>
                                      <SelectItem value="percentage">
                                        Custom percentage
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>

                        {watchSummaryLength === "percentage" && (
                          <FormField
                            control={form.control}
                            name="percentageValue"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-foreground">Percentage (%)</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="1"
                                    max="100"
                                    {...field}
                                    className="text-foreground"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}

                        <Button
                          type="submit"
                          className="w-full"
                          disabled={isLoading}
                          onClick={form.handleSubmit(onSubmit)}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Summarizing...
                            </>
                          ) : (
                            "Summarize Text"
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="google">
                  <div className="space-y-6 py-4">
                    <Button 
                      className="w-full flex items-center justify-center gap-2" 
                      variant="outline"
                      onClick={importFromGoogleDocs}
                    >
                      <FileText className="h-5 w-5" />
                      Connect to Google Docs
                    </Button>
                    <p className="text-center text-sm text-muted-foreground">
                      Import documents directly from your Google Drive.
                      <br />Sign in with your Google account to access your docs.
                    </p>
                  </div>
                </TabsContent>
                
                <TabsContent value="url">
                  <UrlSummarizer onContentFetched={handleContentFetched} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {summary && (
            <>
              <Card className="md:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-foreground">Summary</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Generated {summary.lengthType === "percentage"
                        ? `${summary.lengthValue}%`
                        : summary.lengthType} summary
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <SharingOptions 
                      summaryText={summary.summaryText} 
                      title={summary.source ? `Summary from ${summary.source}` : "Text Summary"}
                    />
                    <PdfExport summary={summary} />
                    <Button 
                      onClick={() => setShowAnalysis(!showAnalysis)} 
                      variant="ghost" 
                      size="sm"
                    >
                      {showAnalysis ? "Hide" : "Show"} Analysis
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-md bg-muted p-4">
                    <p className="whitespace-pre-line text-foreground">{summary.summaryText}</p>
                  </div>
                  
                  {showAnalysis && (
                    <TextAnalysis text={summary.summaryText} />
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <p className="text-sm text-muted-foreground">
                    Summary created at{" "}
                    {new Date(summary.createdAt).toLocaleString()}
                  </p>
                </CardFooter>
              </Card>
              <div className="md:col-span-2">
                <ChatInterface summary={summary} />
              </div>
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
