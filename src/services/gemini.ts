
import { SummaryParams, Summary } from "@/types";

class GeminiService {
  private apiKey: string | null = null;
  private API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent";

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
    const apiKey = this.getApiKey();
    
    if (!apiKey) {
      throw new Error("Gemini API key is required");
    }

    try {
      console.log("Using Gemini Flash for summarization...");
      console.log("API Key available:", !!apiKey);

      const lengthInstruction = this.getLengthInstruction(params.lengthType, params.lengthValue);
      
      const prompt = `
        Summarize the following text. ${lengthInstruction}
        
        Text to summarize:
        "${params.text}"
      `;

      const response = await fetch(`${this.API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Gemini API error:", error);
        throw new Error(error.error?.message || 'Failed to generate summary');
      }

      const data = await response.json();
      const summaryText = data.candidates[0].content.parts[0].text;

      const summary: Summary = {
        id: crypto.randomUUID(),
        originalText: params.text,
        summaryText: summaryText.trim(),
        lengthType: params.lengthType,
        lengthValue: params.lengthValue,
        createdAt: new Date().toISOString(),
        model: "Gemini Flash 1.5",
        source: params.source
      };

      return summary;
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      throw error;
    }
  }

  private getLengthInstruction(lengthType: string, lengthValue: string | number): string {
    switch (lengthType) {
      case 'short':
        return 'Make the summary very concise, about 10% of the original length.';
      case 'medium':
        return 'Create a moderate summary, about 30% of the original length.';
      case 'long':
        return 'Provide a detailed summary, about 50% of the original length.';
      case 'percentage':
        return `Make the summary approximately ${lengthValue}% of the original length.`;
      default:
        return 'Create a moderate summary, about 30% of the original length.';
    }
  }
}

export const geminiService = new GeminiService();
