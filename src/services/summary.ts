import { Summary, SummaryParams } from "@/types";
import { geminiService } from "./gemini";
import { fileAnalysisService } from "./fileAnalysis";

// Enhanced summarization service
class SummaryService {
  private static HISTORY_KEY = "study_scribe_summaries";

  async summarizeText(params: SummaryParams): Promise<Summary> {
    try {
      console.log("Starting summarization with params:", {
        textLength: params.text.length,
        lengthType: params.lengthType,
        lengthValue: params.lengthValue,
        source: params.source
      });

      const apiKey = geminiService.getApiKey();

      // If you want to force only the advanced summarizer (no legacy fallback), uncomment below:
      /*
      if (!apiKey) {
        throw new Error("No Gemini API key found. Please set your API key in the environment settings for accurate summaries.");
      }
      */

      if (!apiKey) {
        console.warn("No Gemini API key found - using fallback summarization");
        return this.legacySummarize(params);
      }

      // Enhanced text validation
      if (!params.text || params.text.trim().length === 0) {
        throw new Error("No text content provided for summarization.");
      }

      if (params.text.length < 50) {
        throw new Error("Text is too short to summarize meaningfully. Please provide at least 50 characters.");
      }

      if (params.text.length > 100000) {
        throw new Error("Text is too long. Please limit to 100,000 characters or break it into smaller sections.");
      }

      // Use Gemini Flash 1.5 for enhanced summarization
      console.log("Using Gemini Flash 1.5 for summarization...");
      const summary = await geminiService.summarizeText(params);

      // Validate summary was generated
      if (!summary.summaryText || summary.summaryText.trim().length === 0) {
        throw new Error("Failed to generate summary content. Please try again.");
      }

      this.saveSummary(summary);
      console.log("Summary generated successfully:", { id: summary.id, length: summary.summaryText.length });
      return summary;
    } catch (error) {
      console.error("Error using Gemini service:", error);

      // Enhanced error handling - only fallback for certain errors
      if (error instanceof Error && error.message.includes("API key")) {
        throw error; // Don't fallback for API key issues
      }

      console.log("Falling back to legacy summarization...");
      return this.legacySummarize(params);
    }
  }

  async summarizeFile(file: File, lengthType: string, lengthValue: string | number): Promise<Summary> {
    try {
      console.log(`Starting file summarization for: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);

      // Validate file before processing
      if (!file) {
        throw new Error("No file provided for summarization.");
      }

      if (file.size === 0) {
        throw new Error("The uploaded file is empty. Please select a file with content.");
      }

      // Analyze and extract text from file
      const analysisResult = await fileAnalysisService.analyzeFile(file);

      // Log first 500 chars for debugging
      console.log("Extracted text preview:", analysisResult.text.slice(0, 500));
      console.log(`Word count: ${analysisResult.metadata.wordCount}`);
      console.log(`Extraction quality: ${analysisResult.metadata.extractionQuality}`);

      // Warn and fail if text extraction is too short or garbled
      if (!analysisResult.text || analysisResult.text.trim().length < 50) {
        throw new Error(
          `Extracted text from the PDF is too short or unreadable. The PDF may be scanned, image-based, or corrupted.`
        );
      }

      // Create enhanced summary params with file metadata
      const params: SummaryParams = {
        text: analysisResult.text,
        lengthType: lengthType as "short" | "medium" | "long" | "percentage",
        lengthValue,
        source: `${file.name} (${analysisResult.metadata.fileType})`
      };

      // Generate summary
      const summary = await this.summarizeText(params);

      // Enhance summary with file metadata for better context
      const fileInfo = `[File: ${file.name} | ${analysisResult.metadata.wordCount} words | ${analysisResult.metadata.extractionQuality} extraction quality]`;
      summary.summaryText = `${fileInfo}\n\n${summary.summaryText}`;

      return summary;
    } catch (error) {
      console.error("File summarization error:", error);
      throw new Error(
        `Failed to summarize file: ${error instanceof Error ? error.message : "Unknown error occurred during file processing"}`
      );
    }
  }

  // Enhanced legacy summarization method as fallback
  private async legacySummarize(params: SummaryParams): Promise<Summary> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const { text, lengthType, lengthValue } = params;

          if (!text || text.trim().length === 0) {
            reject(new Error("No text content provided for summarization."));
