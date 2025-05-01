
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { FileText, Loader2 } from "lucide-react";
import { Summary } from "@/types";
import { urlService } from "@/services/url";

interface PdfExportProps {
  summary: Summary;
}

export function PdfExport({ summary }: PdfExportProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleExport = async () => {
    setIsGenerating(true);
    
    try {
      // Generate PDF content
      const pdfContent = urlService.generatePdfContent(summary);
      
      // Simulate a delay for the PDF generation
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Create a Blob with proper MIME type and encoding
      const blob = new Blob([pdfContent], { 
        type: "text/plain;charset=utf-8" 
      });
      
      // Create a download link and trigger it
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const filename = `summary-${new Date().toISOString().split('T')[0]}.txt`;
      
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
      
      toast({
        title: "Export Successful",
        description: "Your summary has been exported as a text file.",
      });
      
    } catch (error) {
      console.error("Error generating export:", error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting your summary.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button 
      onClick={handleExport} 
      variant="outline"
      disabled={isGenerating}
      className="flex items-center gap-2"
    >
      {isGenerating ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <FileText className="h-4 w-4" />
      )}
      {isGenerating ? "Generating..." : "Export as Text"}
    </Button>
  );
}
