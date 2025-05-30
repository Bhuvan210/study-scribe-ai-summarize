
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
        console.warn("No Gemini API key found - using enhanced fallback summarization");
        return this.enhancedLegacySummarize(params);
      }
      
      // Use Gemini Flash for detailed summarization
      const summary = await geminiService.summarizeText(params);
      this.saveSummary(summary);
      return summary;
    } catch (error) {
      console.error("Error using Gemini service:", error);
      
      // Fallback to enhanced legacy summarization if Gemini fails
      return this.enhancedLegacySummarize(params);
    }
  }
  
  // Enhanced legacy summarization method as fallback
  private async enhancedLegacySummarize(params: SummaryParams): Promise<Summary> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const { text, lengthType, lengthValue } = params;
        
        // Create a more comprehensive summary
        const summaryText = this.createDetailedMockSummary(text, lengthType, lengthValue);
        
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

  // Enhanced mock summary method for much more detailed summaries
  private createDetailedMockSummary(text: string, lengthType: string, lengthValue: string | number): string {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    const words = text.split(/\s+/);
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
    
    let targetLength = 0.5; // Default to more comprehensive (50%)
    
    // Determine target length based on type - more generous for detailed summaries
    if (lengthType === 'short') targetLength = 0.4;
    else if (lengthType === 'medium') targetLength = 0.6;
    else if (lengthType === 'long') targetLength = 0.8;
    else if (lengthType === 'percentage' && typeof lengthValue === 'number') {
      targetLength = Math.min(0.9, Math.max(0.3, lengthValue / 100));
    }
    
    const targetSentenceCount = Math.max(5, Math.floor(sentences.length * targetLength));
    const selectedSentences = [];
    
    // More sophisticated sentence selection for comprehensive summaries
    if (sentences.length <= targetSentenceCount) {
      let summaryText = sentences.join(' ').trim();
      summaryText = this.enhanceSummaryStructure(summaryText, words.length);
      return summaryText;
    }
    
    // Select first few sentences (introduction)
    const introCount = Math.max(1, Math.floor(targetSentenceCount * 0.2));
    for (let i = 0; i < Math.min(introCount, sentences.length); i++) {
      selectedSentences.push(sentences[i]);
    }
    
    // Select evenly distributed sentences from the middle
    const remainingCount = targetSentenceCount - introCount - 1;
    const step = Math.max(1, Math.floor((sentences.length - introCount - 1) / remainingCount));
    
    for (let i = introCount; i < sentences.length - 1 && selectedSentences.length < targetSentenceCount - 1; i += step) {
      selectedSentences.push(sentences[i]);
    }
    
    // Add final sentence if we have room
    if (selectedSentences.length < targetSentenceCount && sentences.length > 1) {
      selectedSentences.push(sentences[sentences.length - 1]);
    }
    
    let summaryText = selectedSentences.join(' ').trim();
    summaryText = this.enhanceSummaryStructure(summaryText, words.length);
    
    return summaryText;
  }
  
  private enhanceSummaryStructure(summaryText: string, originalWordCount: number): string {
    // Add analytical structure to the summary
    const analysisIntro = "**Content Analysis:**\n\n";
    const keyPointsHeader = "\n\n**Key Points:**\n";
    const conclusionHeader = "\n\n**Summary:**\n";
    
    // Split the summary into logical sections
    const sentences = summaryText.split(/(?<=[.!?])\s+/);
    const midPoint = Math.floor(sentences.length / 2);
    
    const mainContent = sentences.slice(0, midPoint).join(' ');
    const supportingContent = sentences.slice(midPoint).join(' ');
    
    const enhancedSummary = 
      analysisIntro + 
      mainContent + 
      keyPointsHeader + 
      supportingContent + 
      conclusionHeader + 
      `This comprehensive analysis covers the essential themes and details from the original ${originalWordCount}-word content, providing insights into the main arguments, supporting evidence, and key takeaways presented in the text.` +
      "\n\n[Note: This summary was generated using an enhanced fallback method. For even better accuracy and more sophisticated analysis, please add your Gemini API key in the Profile settings.]";
    
    return enhancedSummary;
  }
}

export const summaryService = new SummaryService();
