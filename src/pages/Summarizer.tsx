
import { useState, useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useSummary } from "@/contexts/SummaryContext";
import { MainLayout } from "@/components/layout/MainLayout";
import { Loader2, AlertCircle } from "lucide-react";
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
import { Summary } from "@/types";
import { geminiService } from "@/services/gemini";
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
  
  useEffect(() => {
    const apiKey = geminiService.getApiKey();
    if (!apiKey) {
      // Set default API key for enhanced summarization
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
            Paste your text for precise, contextually relevant summaries powered by Gemini Flash 1.5
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
              <CardTitle className="text-foreground">Input Text</CardTitle>
              <CardDescription className="text-muted-foreground">
                Paste your text to summarize
              </CardDescription>
            </CardHeader>
            <CardContent>
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
