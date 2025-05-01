
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
      // In a real app, we would use a library like jsPDF to generate a PDF
      // Here we're simulating the PDF generation process
      const pdfContent = urlService.generatePdfContent(summary);
      
      // Simulate a delay for the PDF generation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, we would create a Blob and use it to download the PDF
      // Here we'll just show a toast message
      console.log("Generated PDF content:", pdfContent);
      
      toast({
        title: "PDF Generated",
        description: "Your summary has been exported as a PDF file.",
      });
      
      // Simulate downloading a file
      const element = document.createElement("a");
      const file = new Blob([pdfContent], { type: "application/pdf" });
      element.href = URL.createObjectURL(file);
      element.download = `summary-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "PDF Generation Failed",
        description: "There was an error generating your PDF file.",
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
      {isGenerating ? "Generating..." : "Export as PDF"}
    </Button>
  );
}
