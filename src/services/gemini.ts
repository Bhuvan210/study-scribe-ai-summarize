
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
        You are an expert summarizer. Create a comprehensive and accurate summary of the following text. 
        
        Requirements:
        - ${lengthInstruction}
        - Maintain accuracy and capture all key points, themes, and important details
        - Use clear, well-structured paragraphs
        - Preserve the tone and context of the original text
        - Include specific examples, data, or quotes when relevant
        - Ensure the summary is coherent and flows logically
        - Do not add information not present in the original text
        
        Text to summarize:
        "${params.text}"
        
        Please provide a detailed and accurate summary that captures the essence and important details of the text:
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
        return 'Create a concise but comprehensive summary that captures the main points in about 150-300 words. Focus on the most important themes and key details.';
      case 'medium':
        return 'Create a detailed summary that thoroughly covers all important points, themes, and supporting details in about 300-600 words. Include context and examples where relevant.';
      case 'long':
        return 'Create an extensive and comprehensive summary that captures all major and minor points, themes, arguments, and supporting details in about 600-1000 words. Include specific examples, data, and maintain the original structure.';
      case 'percentage':
        return `Create a comprehensive summary that is approximately ${lengthValue}% of the original length while maintaining accuracy and including all important details and context.`;
      default:
        return 'Create a detailed summary that thoroughly covers all important points, themes, and supporting details in about 300-600 words. Include context and examples where relevant.';
    }
  }
}

export const geminiService = new GeminiService();
