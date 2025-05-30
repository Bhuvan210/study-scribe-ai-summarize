
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
      console.log("Using Gemini Flash for detailed summarization...");
      console.log("API Key available:", !!apiKey);

      const lengthInstruction = this.getLengthInstruction(params.lengthType, params.lengthValue);
      
      const prompt = `
        You are an expert analyst and summarizer. Your task is to create a comprehensive, detailed, and insightful summary that thoroughly analyzes the provided text.

        ANALYSIS REQUIREMENTS:
        1. **Main Themes & Key Points**: Identify and elaborate on all major themes, arguments, and central ideas
        2. **Supporting Details**: Include important supporting information, examples, data, and evidence
        3. **Structure & Organization**: Analyze how the content is organized and flows
        4. **Context & Background**: Provide relevant context and background information mentioned
        5. **Conclusions & Implications**: Highlight any conclusions, recommendations, or implications
        6. **Significant Details**: Capture specific names, dates, numbers, quotes, and factual information
        7. **Tone & Style**: Note the writing style, tone, and intended audience
        8. **Critical Analysis**: Provide analytical insights about the content's significance

        SUMMARY STRUCTURE:
        - Begin with a comprehensive overview of the main topic and purpose
        - Present key themes and arguments in detail with supporting evidence
        - Include specific examples, data, quotes, and factual information
        - Analyze the significance and implications of the content
        - Conclude with the main takeaways and overall assessment

        LENGTH & DETAIL REQUIREMENTS:
        - ${lengthInstruction}
        - Prioritize depth and comprehensiveness over brevity
        - Include specific details that demonstrate thorough understanding
        - Maintain accuracy while providing extensive analysis
        - Use clear, well-structured paragraphs with logical flow
        - Include relevant quotes and specific examples when available

        QUALITY STANDARDS:
        - Be thorough and leave no major point unaddressed
        - Maintain objectivity while providing insightful analysis
        - Use sophisticated vocabulary and clear explanations
        - Ensure the summary could serve as a comprehensive substitute for reading the original
        - Include transitional phrases to connect ideas smoothly

        Text to analyze and summarize:
        "${params.text}"

        Please provide a detailed, comprehensive summary that thoroughly analyzes and captures the essence, details, and significance of this content:
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
          }],
          generationConfig: {
            temperature: 0.3,
            topK: 40,
            topP: 0.8,
            maxOutputTokens: 2048,
          }
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
        return 'Create a detailed yet concise analysis in 400-600 words that covers all major themes, key supporting details, and important insights. Focus on the most critical points while maintaining comprehensiveness.';
      case 'medium':
        return 'Create a comprehensive analysis in 800-1200 words that thoroughly examines all major themes, supporting details, context, examples, and implications. Include specific information and analytical insights.';
      case 'long':
        return 'Create an extensive, in-depth analysis in 1200-1800 words that comprehensively covers every significant aspect, theme, detail, and implication. Include all relevant examples, data, quotes, and provide thorough analytical insights.';
      case 'percentage':
        return `Create a comprehensive analysis that captures approximately ${lengthValue}% of the original content's detail level while maintaining thorough coverage of all important themes, supporting information, and analytical insights.`;
      default:
        return 'Create a comprehensive analysis in 800-1200 words that thoroughly examines all major themes, supporting details, context, examples, and implications. Include specific information and analytical insights.';
    }
  }
}

export const geminiService = new GeminiService();
