
import { SummaryParams, Summary } from "@/types";

// Simulated Gemini Flash 2.0 API service
class GeminiService {
  private apiKey: string | null = null;

  setApiKey(key: string) {
    this.apiKey = key;
    localStorage.setItem('gemini_api_key', key);
  }
  
  getApiKey(): string | null {
    if (!this.apiKey) {
      this.apiKey = localStorage.getItem('gemini_api_key');
    }
    return this.apiKey;
  }

  async summarizeText(params: SummaryParams): Promise<Summary> {
    // Check if we have an API key
    const apiKey = this.getApiKey();
    
    // This is a mock implementation that simulates Gemini Flash 2.0 API call
    // In a real app, this would call the actual Gemini API
    return new Promise((resolve) => {
      console.log("Using Gemini Flash 2.0 for summarization...");
      console.log("API Key available:", !!apiKey);
      
      setTimeout(() => {
        const { text, lengthType, lengthValue } = params;
        
        // Create a simulated summary with Gemini Flash 2.0 branding
        const summaryText = this.createGeminiSummary(text, lengthType, lengthValue);
        
        const summary: Summary = {
          id: crypto.randomUUID(),
          originalText: text,
          summaryText,
          lengthType,
          lengthValue,
          createdAt: new Date().toISOString(),
          model: apiKey ? "Gemini Flash 2.0 (Authenticated)" : "Gemini Flash 2.0 (Demo)",
        };
        
        resolve(summary);
      }, 1500);
    });
  }

  // Helper method to create a mock Gemini summary
  private createGeminiSummary(text: string, lengthType: string, lengthValue: string | number): string {
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
    
    // Extract sentences to create a coherent summary
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    const numSentences = Math.max(1, Math.ceil(sentences.length * percentToKeep));
    
    // Select sentences with Gemini's improved algorithm (simulated)
    // In a real implementation, this would use Gemini's advanced ML summarization
    const selectedSentences = [];
    
    // Gemini Flash 2.0 simulated improvements:
    // 1. Better topic sentence selection
    if (sentences.length > 0) {
      selectedSentences.push(sentences[0]); // Always include the first sentence
    }
    
    // 2. Key information extraction (simulated)
    const middleStart = Math.floor(sentences.length * 0.2);
    const middleEnd = Math.floor(sentences.length * 0.8);
    
    // Simulate Gemini's advanced selection algorithm
    for (let i = middleStart; i < middleEnd; i++) {
      // Imagine this is where Gemini selects the most important sentences
      if (i % 3 === 0 && selectedSentences.length < numSentences - 1) {
        selectedSentences.push(sentences[i]);
      }
    }
    
    // Always include last sentence for conclusion if available
    if (sentences.length > 1 && selectedSentences.length < numSentences) {
      selectedSentences.push(sentences[sentences.length - 1]);
    }
    
    // Fill any remaining slots with sentences from the middle
    while (selectedSentences.length < numSentences && selectedSentences.length < sentences.length) {
      const randomIndex = middleStart + Math.floor(Math.random() * (middleEnd - middleStart));
      if (sentences[randomIndex] && !selectedSentences.includes(sentences[randomIndex])) {
        selectedSentences.push(sentences[randomIndex]);
      }
    }
    
    // Sort the sentences to maintain the original flow
    selectedSentences.sort((a, b) => {
      return text.indexOf(a) - text.indexOf(b);
    });
    
    const summaryText = selectedSentences.join(' ');
    
    return summaryText.trim();
  }
}

export const geminiService = new GeminiService();
