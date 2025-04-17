
import { Summary, SummaryParams } from "@/types";
import { geminiService } from "./gemini";

// Summarization service
class SummaryService {
  private static HISTORY_KEY = "study_scribe_summaries";

  async summarizeText(params: SummaryParams): Promise<Summary> {
    try {
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
        
        // Create a simulated summary
        const summaryText = this.createMockSummary(text, lengthType, lengthValue);
        
        const summary: Summary = {
          id: crypto.randomUUID(),
          originalText: text,
          summaryText,
          lengthType,
          lengthValue,
          createdAt: new Date().toISOString(),
          model: "Legacy",
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

  // Helper method to create a mock summary (legacy method)
  private createMockSummary(text: string, lengthType: string, lengthValue: string | number): string {
    const words = text.split(/\s+/);
    let percentToKeep = 0.3; // Default to medium length (30%)
    
    // Determine percentage based on length type
    if (lengthType === 'short') percentToKeep = 0.1;
    else if (lengthType === 'medium') percentToKeep = 0.3;
    else if (lengthType === 'long') percentToKeep = 0.5;
    else if (lengthType === 'percentage' && typeof lengthValue === 'number') {
      percentToKeep = lengthValue / 100;
    }
    
    // Select a subset of words based on the desired percentage
    const numWords = Math.max(3, Math.floor(words.length * percentToKeep));
    let summaryText = '';
    
    // Extract sentences to create a coherent summary
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    const numSentences = Math.max(1, Math.ceil(sentences.length * percentToKeep));
    
    // Select sentences from the beginning, middle, and end for better representation
    const selectedSentences = [];
    if (numSentences >= 3) {
      selectedSentences.push(sentences[0]); // First sentence
      
      // Some middle sentences
      const middleStart = Math.floor(sentences.length * 0.3);
      const middleEnd = Math.floor(sentences.length * 0.7);
      const middleStep = Math.max(1, Math.floor((middleEnd - middleStart) / (numSentences - 2)));
      
      for (let i = middleStart; i < middleEnd; i += middleStep) {
        if (selectedSentences.length < numSentences - 1) {
          selectedSentences.push(sentences[i]);
        }
      }
      
      // Last sentence
      if (selectedSentences.length < numSentences) {
        selectedSentences.push(sentences[sentences.length - 1]);
      }
    } else {
      // If we need fewer sentences, just take from the beginning
      for (let i = 0; i < numSentences && i < sentences.length; i++) {
        selectedSentences.push(sentences[i]);
      }
    }
    
    summaryText = selectedSentences.join(' ');
    
    return summaryText.trim();
  }
}

export const summaryService = new SummaryService();
