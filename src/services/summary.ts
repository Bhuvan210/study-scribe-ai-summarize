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
            return;
          }
          
          // Simple text-based summarization using extraction
          const sentences = text
            .replace(/\s+/g, " ")
            .split(/[.!?]+/)
            .map(s => s.trim())
            .filter(s => s.length > 0);
            
          if (sentences.length === 0) {
            reject(new Error("Could not extract meaningful sentences from the text."));
            return;
          }
          
          let targetSentenceCount;
          let summaryText = '';
          
          if (lengthType === "percentage" && typeof lengthValue === "number") {
            targetSentenceCount = Math.max(1, Math.ceil(sentences.length * (lengthValue / 100)));
          } else {
            // Predefined lengths
            const lengthMapping = {
              short: 0.15, // ~15% of original content
              medium: 0.3, // ~30% of original content
              long: 0.5, // ~50% of original content
            };
            const percentage = lengthMapping[lengthType as keyof typeof lengthMapping] || 0.3;
            targetSentenceCount = Math.max(1, Math.ceil(sentences.length * percentage));
          }
          
          // Simple importance ranking based on sentence length and position
          const rankedSentences = sentences.map((sentence, index) => {
            // Simple ranking formula: 
            // - Earlier sentences are more important (especially first few)
            // - Medium-length sentences are favored over very short or very long ones
            // - Sentences with certain keywords get bonus points
            
            const positionScore = index < 3 ? (3 - index) * 3 : 
                                 index < sentences.length * 0.2 ? 2 : 
                                 index < sentences.length * 0.8 ? 1 : 0;
                                 
            const lengthScore = sentence.length > 20 && sentence.length < 200 ? 2 : 
                              sentence.length >= 200 ? 1 : 0;
            
            // Keywords that might indicate important content
            const keywordBonus = /important|significant|key|critical|essential|main|primary|fundamental|crucial/i.test(sentence) ? 2 : 0;
            
            return {
              index,
              sentence,
              score: positionScore + lengthScore + keywordBonus
            };
          });
          
          // Sort by original position to maintain narrative flow
          const selectedSentences = rankedSentences
            .sort((a, b) => b.score - a.score)
            .slice(0, targetSentenceCount)
            .sort((a, b) => a.index - b.index);
            
          summaryText = selectedSentences.map(item => item.sentence).join(". ") + ".";
          
          // Generate summary ID
          const id = `fallback-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
          
          const summary: Summary = {
            id,
            summaryText,
            originalText: text,
            createdAt: new Date().toISOString(),
            model: "legacy-extraction",
            lengthType,
            lengthValue,
            source: params.source,
            userId: null
          };

          resolve(summary);
        } catch (error) {
          reject(new Error(`Legacy summarization failed: ${error instanceof Error ? error.message : "Unknown error"}`));
        }
      }, 1000);
    });
  }

  // Save summary to local storage
  private saveSummary(summary: Summary): void {
    try {
      const summariesJSON = localStorage.getItem(SummaryService.HISTORY_KEY);
      const summaries: Summary[] = summariesJSON ? JSON.parse(summariesJSON) : [];
      
      // Add new summary to the beginning of the array
      summaries.unshift(summary);
      
      // Keep only the last 20 summaries to avoid localStorage limits
      const trimmedSummaries = summaries.slice(0, 20);
      
      localStorage.setItem(SummaryService.HISTORY_KEY, JSON.stringify(trimmedSummaries));
    } catch (error) {
      console.error("Error saving summary to history:", error);
      // Non-critical error, don't throw
    }
  }

  // Get summaries from history
  getSummariesFromHistory(): Summary[] {
    try {
      const summariesJSON = localStorage.getItem(SummaryService.HISTORY_KEY);
      return summariesJSON ? JSON.parse(summariesJSON) : [];
    } catch (error) {
      console.error("Error retrieving summaries from history:", error);
      return [];
    }
  }
  
  // Clear summary history
  clearSummaryHistory(): void {
    try {
      localStorage.removeItem(SummaryService.HISTORY_KEY);
    } catch (error) {
      console.error("Error clearing summary history:", error);
    }
  }
}

export const summaryService = new SummaryService();
