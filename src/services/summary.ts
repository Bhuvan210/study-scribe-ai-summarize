
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
      
      // Check if API key exists
      const apiKey = geminiService.getApiKey();
      
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
      
      if (!analysisResult.text || analysisResult.text.trim().length === 0) {
        throw new Error(`Unable to extract readable text from ${file.name}. The file may be corrupted, encrypted, or in an unsupported format.`);
      }
      
      console.log(`Successfully extracted ${analysisResult.metadata.wordCount} words from ${file.name}`);
      console.log(`Extraction quality: ${analysisResult.metadata.extractionQuality}`);
      
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
      throw new Error(`Failed to summarize file: ${error instanceof Error ? error.message : 'Unknown error occurred during file processing'}`);
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
          
          // Create an enhanced mock summary
          const summaryText = this.createEnhancedMockSummary(text, lengthType, lengthValue);
          
          if (!summaryText || summaryText.trim().length === 0) {
            reject(new Error("Failed to generate summary content."));
            return;
          }
          
          const summary: Summary = {
            id: crypto.randomUUID(),
            originalText: text,
            summaryText,
            lengthType,
            lengthValue,
            createdAt: new Date().toISOString(),
            model: "Enhanced Legacy Summarizer",
            source: params.source
          };
          
          this.saveSummary(summary);
          resolve(summary);
        } catch (error) {
          reject(new Error(`Legacy summarization failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
        }
      }, 1500); // Reduced timeout for better UX
    });
  }

  async getSummaryHistory(): Promise<Summary[]> {
    try {
      const savedSummaries = localStorage.getItem(SummaryService.HISTORY_KEY);
      return Promise.resolve(savedSummaries ? JSON.parse(savedSummaries) : []);
    } catch (error) {
      console.error("Error loading summary history:", error);
      return Promise.resolve([]);
    }
  }

  async deleteSummary(id: string): Promise<void> {
    try {
      const summaries = await this.getSummaryHistory();
      const updatedSummaries = summaries.filter(summary => summary.id !== id);
      localStorage.setItem(SummaryService.HISTORY_KEY, JSON.stringify(updatedSummaries));
      return Promise.resolve();
    } catch (error) {
      console.error("Error deleting summary:", error);
      throw new Error("Failed to delete summary. Please try again.");
    }
  }

  private saveSummary(summary: Summary): void {
    try {
      const savedSummaries = localStorage.getItem(SummaryService.HISTORY_KEY);
      const summaries: Summary[] = savedSummaries ? JSON.parse(savedSummaries) : [];
      summaries.unshift(summary);
      
      // Limit history to 50 summaries to prevent localStorage bloat
      if (summaries.length > 50) {
        summaries.splice(50);
      }
      
      localStorage.setItem(SummaryService.HISTORY_KEY, JSON.stringify(summaries));
    } catch (error) {
      console.error("Error saving summary to history:", error);
      // Don't throw here as the summary was generated successfully
    }
  }

  // Enhanced mock summary creation with better algorithm
  private createEnhancedMockSummary(text: string, lengthType: string, lengthValue: string | number): string {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    const words = text.split(/\s+/).filter(word => word.length > 0);
    
    if (sentences.length === 0 || words.length === 0) {
      return "Unable to generate summary from the provided text.";
    }
    
    let percentToKeep = 0.3; // Default to medium
    
    // Calculate target percentage based on length type
    switch (lengthType) {
      case 'short':
        percentToKeep = 0.15;
        break;
      case 'medium':
        percentToKeep = 0.35;
        break;
      case 'long':
        percentToKeep = 0.55;
        break;
      case 'percentage':
        if (typeof lengthValue === 'number' && lengthValue > 0 && lengthValue <= 100) {
          percentToKeep = lengthValue / 100;
        }
        break;
    }
    
    const targetSentences = Math.max(1, Math.ceil(sentences.length * percentToKeep));
    const selectedSentences = [];
    
    // Enhanced sentence selection algorithm
    if (sentences.length === 1) {
      selectedSentences.push(sentences[0]);
    } else {
      // Always include first sentence (often contains main topic)
      selectedSentences.push(sentences[0]);
      
      if (targetSentences > 1) {
        // Calculate importance scores for remaining sentences
        const sentenceScores = sentences.slice(1).map((sentence, index) => ({
          sentence,
          index: index + 1,
          score: this.calculateSentenceImportance(sentence, text)
        }));
        
        // Sort by importance and select top sentences
        sentenceScores.sort((a, b) => b.score - a.score);
        
        const remainingSlots = targetSentences - 1;
        const selectedMiddleSentences = sentenceScores
          .slice(0, remainingSlots)
          .sort((a, b) => a.index - b.index) // Restore original order
          .map(item => item.sentence);
        
        selectedSentences.push(...selectedMiddleSentences);
      }
    }
    
    // Clean and format the summary
    const summary = selectedSentences
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    return summary || "Summary could not be generated from the provided text.";
  }
  
  private calculateSentenceImportance(sentence: string, fullText: string): number {
    const words = sentence.toLowerCase().split(/\s+/);
    const fullTextWords = fullText.toLowerCase().split(/\s+/);
    
    // Calculate word frequency in full text
    const wordFreq: Record<string, number> = {};
    fullTextWords.forEach(word => {
      const cleanWord = word.replace(/[^a-z]/g, '');
      if (cleanWord.length > 3) {
        wordFreq[cleanWord] = (wordFreq[cleanWord] || 0) + 1;
      }
    });
    
    // Score based on word importance and sentence characteristics
    let score = 0;
    
    // Word frequency score
    words.forEach(word => {
      const cleanWord = word.replace(/[^a-z]/g, '');
      if (cleanWord.length > 3) {
        score += wordFreq[cleanWord] || 0;
      }
    });
    
    // Length penalty for very long or very short sentences
    const wordCount = words.length;
    if (wordCount < 5 || wordCount > 40) {
      score *= 0.7;
    }
    
    // Boost for sentences with numbers or proper nouns
    if (/\b[A-Z][a-z]+\b/.test(sentence) || /\b\d+\b/.test(sentence)) {
      score *= 1.2;
    }
    
    return score;
  }
}

export const summaryService = new SummaryService();
