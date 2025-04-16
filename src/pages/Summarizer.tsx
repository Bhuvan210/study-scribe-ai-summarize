
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useSummary } from "@/contexts/SummaryContext";
import { MainLayout } from "@/components/layout/MainLayout";
import { FileUp, Loader2 } from "lucide-react";
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
    
    // Validate file type
    if (!SUPPORTED_FILE_TYPES.includes(file.type)) {
      toast({
        title: "Unsupported file type",
        description: "Please upload a PDF, DOCX, or TXT file.",
        variant: "destructive",
      });
      return;
    }
    
    // Validate file size
    if (file.size > MAX_UPLOAD_SIZE) {
      toast({
        title: "File too large",
        description: "File size must be less than 10MB.",
        variant: "destructive",
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      // In a real app, this would parse the file content
      // For this demo, we'll just read text files
      if (file.type === "text/plain") {
        const text = await file.text();
        form.setValue("text", text);
      } else {
        // For non-text files, we'd normally use a library to extract text
        // But for this demo, we'll simulate it with a delay
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
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            AI Text Summarizer
          </h1>
          <p className="mt-3 text-lg text-gray-600">
            Upload a document or paste text to generate concise summaries
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Input Text</CardTitle>
              <CardDescription>
                Upload a file or paste your text
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="paste">
                <TabsList className="mb-4 grid w-full grid-cols-2">
                  <TabsTrigger value="paste">Paste Text</TabsTrigger>
                  <TabsTrigger value="upload">Upload File</TabsTrigger>
                </TabsList>
                <TabsContent value="paste">
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
                            <FormLabel>Your Text</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Paste your text here to summarize..."
                                className="h-48 resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                            <div className="text-xs text-gray-500">
                              {field.value.length}/50,000 characters
                            </div>
                          </FormItem>
                        )}
                      />

                      <div className="space-y-4">
                        <div>
                          <FormLabel>Summary Length</FormLabel>
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
                                <FormLabel>Percentage (%)</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="1"
                                    max="100"
                                    {...field}
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
                </TabsContent>
                <TabsContent value="upload">
                  <div className="space-y-4">
                    <div className="flex items-center justify-center w-full">
                      <label
                        htmlFor="file-upload"
                        className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          {isUploading ? (
                            <Loader2 className="h-8 w-8 text-study-600 animate-spin" />
                          ) : (
                            <FileUp className="h-8 w-8 text-study-600" />
                          )}
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">
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
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {summary && (
            <Card className="md:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Summary</CardTitle>
                  <CardDescription>
                    Generated {summary.lengthType === "percentage"
                      ? `${summary.lengthValue}%`
                      : summary.lengthType} summary
                  </CardDescription>
                </div>
                <Button onClick={copyToClipboard} variant="outline">
                  Copy to Clipboard
                </Button>
              </CardHeader>
              <CardContent>
                <div className="rounded-md bg-gray-50 p-4">
                  <p className="whitespace-pre-line">{summary.summaryText}</p>
                </div>
              </CardContent>
              <CardFooter>
                <p className="text-sm text-gray-500">
                  Summary created at{" "}
                  {new Date(summary.createdAt).toLocaleString()}
                </p>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
