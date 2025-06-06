
import { useState, useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useSummary } from "@/contexts/SummaryContext";
import { MainLayout } from "@/components/layout/MainLayout";
import { Loader2, AlertCircle, Upload, FileText } from "lucide-react";
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
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Summary } from "@/types";
import { geminiService } from "@/services/gemini";
import { summaryService } from "@/services/summary";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ChatInterface } from "@/components/summary/ChatInterface";
import { TextAnalysis } from "@/components/summary/TextAnalysis";

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
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileLoading, setFileLoading] = useState(false);
  
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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }

    setFileLoading(true);
    try {
      const lengthType = form.getValues("summaryLength");
      let lengthValue: string | number = lengthType;
      
      if (lengthType === 'percentage') {
        const percentage = parseInt(form.getValues("percentageValue") || "30");
        if (percentage > 0 && percentage <= 100) {
          lengthValue = percentage;
        } else {
          toast({
            title: "Invalid percentage",
            description: "Percentage must be between 1 and 100",
            variant: "destructive",
          });
          setFileLoading(false);
          return;
        }
      }

      const result = await summaryService.summarizeFile(selectedFile, lengthType, lengthValue);
      setSummary(result);
      
      toast({
        title: "File summarized successfully",
        description: `Generated summary from ${selectedFile.name}`,
      });
    } catch (error) {
      console.error("File summarization error:", error);
      toast({
        title: "File summarization failed",
        description: error instanceof Error ? error.message : "There was an error processing the file",
        variant: "destructive",
      });
    } finally {
      setFileLoading(false);
    }
  };

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
      
      const result = await summarizeText({
        text: values.text,
        lengthType: values.summaryLength,
        lengthValue,
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
            Enhanced AI Text Summarizer
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Paste your text or upload files for precise, contextually relevant summaries powered by Gemini Flash 1.5
          </p>
        </div>
        
        {!hasApiKey && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Enhanced Summarization Active</AlertTitle>
            <AlertDescription>
              Using Gemini Flash 1.5 for superior summarization quality with advanced context understanding and precise content extraction.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-foreground">Input Content</CardTitle>
              <CardDescription className="text-muted-foreground">
                Choose how you want to provide content for summarization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="text" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="text">Text Input</TabsTrigger>
                  <TabsTrigger value="file">File Upload</TabsTrigger>
                </TabsList>
                
                <TabsContent value="text" className="space-y-4">
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
                
                <TabsContent value="file" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <FormLabel className="text-foreground">Upload File</FormLabel>
                      <div className="mt-2">
                        <div className="flex items-center justify-center w-full">
                          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <Upload className="w-8 h-8 mb-2 text-gray-500 dark:text-gray-400" />
                              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                <span className="font-semibold">Click to upload</span> a file
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                PDF, DOCX, TXT files supported
                              </p>
                            </div>
                            <input
                              type="file"
                              className="hidden"
                              accept=".pdf,.docx,.txt,.doc"
                              onChange={handleFileSelect}
                            />
                          </label>
                        </div>
                        {selectedFile && (
                          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                            <FileText className="w-4 h-4" />
                            <span>{selectedFile.name}</span>
                            <span>({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <FormLabel className="text-foreground">Summary Length</FormLabel>
                        <div className="mt-1.5">
                          <Select
                            value={form.watch("summaryLength")}
                            onValueChange={(value) => form.setValue("summaryLength", value as any)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select summary length" />
                            </SelectTrigger>
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
                        </div>
                      </div>

                      {watchSummaryLength === "percentage" && (
                        <div>
                          <FormLabel className="text-foreground">Percentage (%)</FormLabel>
                          <Input
                            type="number"
                            min="1"
                            max="100"
                            value={form.watch("percentageValue")}
                            onChange={(e) => form.setValue("percentageValue", e.target.value)}
                            className="text-foreground"
                          />
                        </div>
                      )}
                    </div>

                    <Button
                      onClick={handleFileUpload}
                      className="w-full"
                      disabled={fileLoading || !selectedFile}
                    >
                      {fileLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing File...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Summarize File
                        </>
                      )}
                    </Button>
                  </div>
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
                    <Button 
                      onClick={copyToClipboard} 
                      variant="outline" 
                      size="sm"
                    >
                      Copy
                    </Button>
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
                    <TextAnalysis 
                      text={summary.summaryText} 
                      originalText={summary.originalText}
                    />
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
