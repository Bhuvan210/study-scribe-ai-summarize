
import { Summary, SummaryParams } from "@/types";
import { geminiService } from "./gemini";
import { fileAnalysisService } from "./fileAnalysis";

// Enhanced summarization service
class SummaryService {
  private static HISTORY_KEY = "study_scribe_summaries";

  async summarizeText(params: SummaryParams): Promise<Summary> {
    try {
      // Check if API key exists
      const apiKey = geminiService.getApiKey();
      
      if (!apiKey) {
        console.warn("No Gemini API key found - using fallback summarization");
        return this.legacySummarize(params);
      }
      
      // Validate text length
      if (params.text.length < 10) {
        throw new Error("Text is too short to summarize. Please provide at least 10 characters.");
      }
      
      if (params.text.length > 100000) {
        throw new Error("Text is too long. Please limit to 100,000 characters.");
      }
      
      // Use Gemini Flash 1.5 for enhanced summarization
      const summary = await geminiService.summarizeText(params);
      this.saveSummary(summary);
      return summary;
    } catch (error) {
      console.error("Error using Gemini service:", error);
      
      // Fallback to legacy summarization if Gemini fails
      return this.legacySummarize(params);
    }
  }

  async summarizeFile(file: File, lengthType: string, lengthValue: string | number): Promise<Summary> {
    try {
      console.log(`Starting file summarization for: ${file.name}`);
      
      // Analyze and extract text from file
      const analysisResult = await fileAnalysisService.analyzeFile(file);
      
      console.log(`Extracted ${analysisResult.metadata.wordCount} words from ${file.name}`);
      console.log(`Extraction quality: ${analysisResult.metadata.extractionQuality}`);
      
      // Create enhanced summary params with file metadata
      const params: SummaryParams = {
        text: analysisResult.text,
        lengthType,
        lengthValue,
        source: `${file.name} (${analysisResult.metadata.fileType})`
      };
      
      // Add file analysis context to the summary
      const summary = await this.summarizeText(params);
      
      // Enhance summary with file metadata
      summary.summaryText = `[File: ${file.name}, ${analysisResult.metadata.wordCount} words, ${analysisResult.metadata.extractionQuality} quality extraction]\n\n${summary.summaryText}`;
      
      return summary;
    } catch (error) {
      console.error("File summarization error:", error);
      throw new Error(`Failed to summarize file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  // Legacy summarization method as fallback
  private async legacySummarize(params: SummaryParams): Promise<Summary> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const { text, lengthType, lengthValue } = params;
        
        // Create an enhanced mock summary
        const summaryText = this.createEnhancedMockSummary(text, lengthType, lengthValue);
        
        const summary: Summary = {
          id: crypto.randomUUID(),
          originalText: text,
          summaryText,
          lengthType,
          lengthValue,
          createdAt: new Date().toISOString(),
          model: "Enhanced Legacy",
          source: params.source
        };
        
        this.saveSummary(summary);
        resolve(summary);
      }, 2000);
    });
  }

  async getSummaryHistory(): Promise<Summary[]> {
    const savedSummaries = localStorage.getItem(SummaryService.HISTORY_KEY);
    return Promise.resolve(savedSummaries ? JSON.parse(savedSummaries) : []);
  }

  async deleteSummary(id: string): Promise<void> {
    const summaries = await this.getSummaryHistory();
    const updatedSummaries = summaries.filter(summary => summary.id !== id);
    localStorage.setItem(SummaryService.HISTORY_KEY, JSON.stringify(updatedSummaries));
    return Promise.resolve();
  }

  private saveSummary(summary: Summary): void {
    const savedSummaries = localStorage.getItem(SummaryService.HISTORY_KEY);
    const summaries: Summary[] = savedSummaries ? JSON.parse(savedSummaries) : [];
    summaries.unshift(summary);
    
    // Limit history to 50 summaries
    if (summaries.length > 50) {
      summaries.splice(50);
    }
    
    localStorage.setItem(SummaryService.HISTORY_KEY, JSON.stringify(summaries));
  }

  // Enhanced mock summary creation
  private createEnhancedMockSummary(text: string, lengthType: string, lengthValue: string | number): string {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    const words = text.split(/\s+/);
    
    let percentToKeep = 0.3;
    
    if (lengthType === 'short') percentToKeep = 0.1;
    else if (lengthType === 'medium') percentToKeep = 0.3;
    else if (lengthType === 'long') percentToKeep = 0.5;
    else if (lengthType === 'percentage' && typeof lengthValue === 'number') {
      percentToKeep = lengthValue / 100;
    }
    
    const targetSentences = Math.max(1, Math.ceil(sentences.length * percentToKeep));
    
    // Select sentences strategically
    const selectedSentences = [];
    
    // Always include first sentence
    if (sentences.length > 0) {
      selectedSentences.push(sentences[0]);
    }
    
    // Select middle sentences
    if (targetSentences > 2 && sentences.length > 2) {
      const middleStart = Math.floor(sentences.length * 0.2);
      const middleEnd = Math.floor(sentences.length * 0.8);
      const step = Math.max(1, Math.floor((middleEnd - middleStart) / (targetSentences - 2)));
      
      for (let i = middleStart; i < middleEnd && selectedSentences.length < targetSentences - 1; i += step) {
        selectedSentences.push(sentences[i]);
      }
    }
    
    // Include last sentence if we need more
    if (selectedSentences.length < targetSentences && sentences.length > 1) {
      selectedSentences.push(sentences[sentences.length - 1]);
    }
    
    return selectedSentences.join(' ').trim();
  }
}

export const summaryService = new SummaryService();
