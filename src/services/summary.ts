
import { Summary, SummaryParams } from "@/types";
import { geminiService } from "./gemini";

// Summarization service
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
      
      // Use Gemini Flash 2.0 for summarization
      const summary = await geminiService.summarizeText(params);
      this.saveSummary(summary);
      return summary;
    } catch (error) {
      console.error("Error using Gemini service:", error);
      
      // Fallback to legacy summarization if Gemini fails
      return this.legacySummarize(params);
    }
  }
  
  // Legacy summarization method as fallback
  private async legacySummarize(params: SummaryParams): Promise<Summary> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const { text, lengthType, lengthValue } = params;
        
        // Create a more comprehensive mock summary
        const summaryText = this.createImprovedMockSummary(text, lengthType, lengthValue);
        
        const summary: Summary = {
          id: crypto.randomUUID(),
          originalText: text,
          summaryText,
          lengthType,
          lengthValue,
          createdAt: new Date().toISOString(),
          model: "Legacy",
          source: params.source
        };
        
        this.saveSummary(summary);
        resolve(summary);
      }, 2000);
    });
  }

  async getSummaryHistory(): Promise<Summary[]> {
    // Get saved summaries from local storage
    const savedSummaries = localStorage.getItem(SummaryService.HISTORY_KEY);
    return Promise.resolve(savedSummaries ? JSON.parse(savedSummaries) : []);
  }

  async deleteSummary(id: string): Promise<void> {
    // Delete a summary from history
    const summaries = await this.getSummaryHistory();
    const updatedSummaries = summaries.filter(summary => summary.id !== id);
    localStorage.setItem(SummaryService.HISTORY_KEY, JSON.stringify(updatedSummaries));
    return Promise.resolve();
  }

  private saveSummary(summary: Summary): void {
    // Save summary to history
    const savedSummaries = localStorage.getItem(SummaryService.HISTORY_KEY);
    const summaries: Summary[] = savedSummaries ? JSON.parse(savedSummaries) : [];
    summaries.unshift(summary); // Add new summary at the beginning
    localStorage.setItem(SummaryService.HISTORY_KEY, JSON.stringify(summaries));
  }

  // Improved mock summary method for better length and accuracy
  private createImprovedMockSummary(text: string, lengthType: string, lengthValue: string | number): string {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    const words = text.split(/\s+/);
    
    let targetLength = 0.3; // Default to medium length (30%)
    
    // Determine target length based on type
    if (lengthType === 'short') targetLength = 0.25;
    else if (lengthType === 'medium') targetLength = 0.4;
    else if (lengthType === 'long') targetLength = 0.6;
    else if (lengthType === 'percentage' && typeof lengthValue === 'number') {
      targetLength = Math.min(0.8, lengthValue / 100); // Cap at 80% for better quality
    }
    
    const targetSentenceCount = Math.max(3, Math.floor(sentences.length * targetLength));
    const selectedSentences = [];
    
    // Better sentence selection for more comprehensive summaries
    if (sentences.length <= targetSentenceCount) {
      return sentences.join(' ').trim();
    }
    
    // Select first sentence (introduction)
    if (sentences.length > 0) selectedSentences.push(sentences[0]);
    
    // Select evenly distributed sentences from the middle
    const step = Math.max(1, Math.floor(sentences.length / targetSentenceCount));
    for (let i = step; i < sentences.length - 1 && selectedSentences.length < targetSentenceCount - 1; i += step) {
      selectedSentences.push(sentences[i]);
    }
    
    // Add last sentence if we have room and it exists
    if (selectedSentences.length < targetSentenceCount && sentences.length > 1) {
      selectedSentences.push(sentences[sentences.length - 1]);
    }
    
    let summaryText = selectedSentences.join(' ').trim();
    
    // Add a note about using fallback method
    summaryText += "\n\n[Note: This summary was generated using a basic fallback method. For better accuracy and quality, please add your Gemini API key in the Profile settings.]";
    
    return summaryText;
  }
}

export const summaryService = new SummaryService();
