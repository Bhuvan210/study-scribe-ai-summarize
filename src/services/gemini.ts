
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
      console.log("Using Gemini Flash 1.5 for summarization...");
      console.log("API Key available:", !!apiKey);

      const lengthInstruction = this.getLengthInstruction(params.lengthType, params.lengthValue);
      
      const prompt = `
        You are an advanced AI analyst with expertise in text comprehension and summarization. Your task is to create a precise, insightful, and well-structured summary that captures the essence and key information of the provided text.

        CORE OBJECTIVES:
        1. **Accuracy & Fidelity**: Maintain complete accuracy to the original content without adding interpretations or external information
        2. **Comprehensive Coverage**: Identify and include all major themes, arguments, and supporting evidence
        3. **Structural Clarity**: Organize information logically with clear relationships between ideas
        4. **Critical Analysis**: Highlight significance, implications, and key takeaways
        5. **Contextual Understanding**: Preserve important context and background information

        ANALYSIS FRAMEWORK:
        - **Main Arguments**: Extract central thesis, primary claims, and key positions
        - **Supporting Evidence**: Include data, examples, case studies, and factual support
        - **Methodology & Process**: Capture any described procedures, methodologies, or systematic approaches
        - **Key Findings**: Highlight discoveries, results, conclusions, and outcomes
        - **Implications**: Note practical applications, consequences, and broader significance
        - **Specific Details**: Preserve important names, dates, numbers, technical terms, and precise information

        SUMMARY STRUCTURE:
        - Begin with a clear statement of the document's main purpose and scope
        - Present key themes and arguments with their supporting evidence
        - Include specific details, data points, and examples that illustrate main concepts
        - Organize information hierarchically from most to least important
        - Conclude with main takeaways and significance

        LENGTH & DETAIL REQUIREMENTS:
        ${lengthInstruction}

        QUALITY STANDARDS:
        - Maintain objectivity and avoid personal opinions or external interpretations
        - Use clear, professional language appropriate for the subject matter
        - Ensure logical flow and smooth transitions between ideas
        - Include specific terminology and technical language when relevant
        - Preserve the original tone and style where appropriate
        - Focus on substance over superficial details

        SOURCE MATERIAL:
        "${params.text}"

        Please provide a comprehensive, accurate summary that thoroughly captures the essential content, structure, and significance of this material:
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
            temperature: 0.2,
            topK: 40,
            topP: 0.9,
            maxOutputTokens: 3000,
            candidateCount: 1
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
        return 'Create a focused, comprehensive summary in 300-500 words. Prioritize the most critical information while ensuring all major themes and key supporting details are covered. Be concise but thorough.';
      case 'medium':
        return 'Create a detailed, well-structured summary in 600-1000 words. Include all major themes, supporting arguments, key evidence, and important details. Provide sufficient depth to serve as a comprehensive overview.';
      case 'long':
        return 'Create an extensive, in-depth summary in 1000-1500 words. Include comprehensive coverage of all themes, detailed supporting evidence, specific examples, methodology details, and thorough analysis of implications and significance.';
      case 'percentage':
        return `Create a summary that captures approximately ${lengthValue}% of the original content's information density. Maintain proportional coverage of all major themes while preserving the most important details and maintaining readability.`;
      default:
        return 'Create a detailed, well-structured summary in 600-1000 words. Include all major themes, supporting arguments, key evidence, and important details. Provide sufficient depth to serve as a comprehensive overview.';
    }
  }
}

export const geminiService = new GeminiService();
