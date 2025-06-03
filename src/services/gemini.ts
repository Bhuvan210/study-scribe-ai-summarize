
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
      console.log("Using Gemini Flash 1.5 for enhanced summarization...");
      console.log("API Key available:", !!apiKey);

      const enhancedPrompt = this.buildEnhancedPrompt(params);
      
      const response = await fetch(`${this.API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: enhancedPrompt
            }]
          }],
          generationConfig: {
            temperature: 0.3,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
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
        model: "Gemini Flash 1.5 Enhanced",
        source: params.source
      };

      return summary;
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      throw error;
    }
  }

  private buildEnhancedPrompt(params: SummaryParams): string {
    const { text, lengthType, lengthValue } = params;
    
    // Analyze text characteristics
    const wordCount = text.split(/\s+/).length;
    const hasStructure = text.includes('\n') || text.includes('•') || text.includes('-');
    const isAcademic = /\b(research|study|analysis|conclusion|methodology|hypothesis)\b/i.test(text);
    const isNews = /\b(reported|according to|breaking|update|sources)\b/i.test(text);
    const isTechnical = /\b(implementation|algorithm|framework|architecture|protocol)\b/i.test(text);
    
    let contextualInstructions = "";
    
    if (isAcademic) {
      contextualInstructions = "This appears to be academic content. Focus on key findings, methodology, and conclusions. Preserve important research terminology and statistical information.";
    } else if (isNews) {
      contextualInstructions = "This appears to be news content. Focus on the who, what, when, where, and why. Lead with the most important information.";
    } else if (isTechnical) {
      contextualInstructions = "This appears to be technical content. Preserve important technical terms, processes, and implementation details while making it accessible.";
    } else {
      contextualInstructions = "Focus on the main ideas, key points, and essential information while maintaining the original tone and context.";
    }

    const lengthInstruction = this.getEnhancedLengthInstruction(lengthType, lengthValue, wordCount);
    
    return `You are an expert summarization AI. Your task is to create a precise, contextually relevant summary that captures the essence of the provided text.

CONTEXT ANALYSIS: ${contextualInstructions}

LENGTH REQUIREMENTS: ${lengthInstruction}

QUALITY GUIDELINES:
- Maintain the original meaning and tone
- Preserve critical details, names, dates, and numbers
- Use clear, concise language
- Ensure logical flow and coherence
- Include key supporting evidence or examples when space allows
- Avoid redundancy and filler words

TEXT TO SUMMARIZE:
"""
${text}
"""

Please provide a high-quality summary that follows these guidelines:`;
  }

  private getEnhancedLengthInstruction(lengthType: string, lengthValue: string | number, originalWordCount: number): string {
    switch (lengthType) {
      case 'short':
        const shortTarget = Math.max(20, Math.floor(originalWordCount * 0.1));
        return `Create a very concise summary of approximately ${shortTarget} words (about 10% of original length). Focus only on the most essential points.`;
      case 'medium':
        const mediumTarget = Math.max(50, Math.floor(originalWordCount * 0.3));
        return `Create a moderate summary of approximately ${mediumTarget} words (about 30% of original length). Include main points and key supporting details.`;
      case 'long':
        const longTarget = Math.max(100, Math.floor(originalWordCount * 0.5));
        return `Create a detailed summary of approximately ${longTarget} words (about 50% of original length). Include comprehensive coverage of all major points and important details.`;
      case 'percentage':
        const percentTarget = Math.max(20, Math.floor(originalWordCount * (Number(lengthValue) / 100)));
        return `Create a summary of approximately ${percentTarget} words (${lengthValue}% of original length). Adjust detail level accordingly.`;
      default:
        const defaultTarget = Math.max(50, Math.floor(originalWordCount * 0.3));
        return `Create a moderate summary of approximately ${defaultTarget} words (about 30% of original length).`;
    }
  }
}

export const geminiService = new GeminiService();
