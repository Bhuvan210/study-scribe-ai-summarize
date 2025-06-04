import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker with a more reliable configuration
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url,
).toString();

export interface FileAnalysisResult {
  text: string;
  metadata: {
    fileType: string;
    fileName: string;
    wordCount: number;
    characterCount: number;
    pageCount?: number;
    extractionQuality: 'high' | 'medium' | 'low';
    language?: string;
  };
}

class FileAnalysisService {
  async analyzeFile(file: File): Promise<FileAnalysisResult> {
    const fileType = file.type;
    const fileName = file.name;

    console.log(`Analyzing file: ${fileName} (${fileType})`);

    let extractedText = '';
    let pageCount: number | undefined;
    let extractionQuality: 'high' | 'medium' | 'low' = 'high';

    try {
      switch (fileType) {
        case 'application/pdf':
          const pdfResult = await this.extractTextFromPDF(file);
          extractedText = pdfResult.text;
          pageCount = pdfResult.pageCount;
          extractionQuality = pdfResult.quality;
          break;
        
        case 'text/plain':
          extractedText = await this.extractTextFromPlainText(file);
          break;
        
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          // For now, we'll use a placeholder for DOCX
          extractedText = await this.extractTextFromDOCX(file);
          extractionQuality = 'medium';
          break;
        
        default:
          throw new Error(`Unsupported file type: ${fileType}`);
      }

      // Clean and enhance the extracted text
      const cleanedText = this.cleanExtractedText(extractedText);
      
      // Detect language (simple detection)
      const language = this.detectLanguage(cleanedText);

      return {
        text: cleanedText,
        metadata: {
          fileType,
          fileName,
          wordCount: this.countWords(cleanedText),
          characterCount: cleanedText.length,
          pageCount,
          extractionQuality,
          language
        }
      };
    } catch (error) {
      console.error('File analysis error:', error);
      throw new Error(`Failed to analyze file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async extractTextFromPDF(file: File): Promise<{ text: string; pageCount: number; quality: 'high' | 'medium' | 'low' }> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      
      const pdf = await pdfjsLib.getDocument({
        data: arrayBuffer,
        // Remove cMapUrl and cMapPacked to avoid CDN issues
      }).promise;

      const pageCount = pdf.numPages;
      let fullText = '';
      let totalTextItems = 0;

      console.log(`PDF has ${pageCount} pages`);

      for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
        try {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          
          // Extract text with better formatting
          const pageText = textContent.items
            .filter((item): item is any => 'str' in item)
            .map((item, index, array) => {
              const nextItem = array[index + 1];
              let text = item.str;
              
              // Add spacing based on positioning
              if (nextItem && 'transform' in item && 'transform' in nextItem) {
                const currentX = item.transform[4];
                const nextX = nextItem.transform[4];
                const currentY = item.transform[5];
                const nextY = nextItem.transform[5];
                
                // Add line break if significant Y position change
                if (Math.abs(currentY - nextY) > 5) {
                  text += '\n';
                }
                // Add space if significant X position gap
                else if (nextX - currentX > item.width + 2) {
                  text += ' ';
                }
              }
              
              return text;
            })
            .join('');

          fullText += `\n--- Page ${pageNum} ---\n${pageText}\n`;
          totalTextItems += textContent.items.length;

        } catch (pageError) {
          console.warn(`Error extracting text from page ${pageNum}:`, pageError);
          fullText += `\n--- Page ${pageNum} (extraction failed) ---\n`;
        }
      }

      // Determine extraction quality
      const avgItemsPerPage = totalTextItems / pageCount;
      const quality: 'high' | 'medium' | 'low' = 
        avgItemsPerPage > 50 ? 'high' : 
        avgItemsPerPage > 20 ? 'medium' : 'low';

      return { text: fullText, pageCount, quality };
    } catch (error) {
      console.error('PDF extraction error:', error);
      // Fallback: return a basic message if PDF extraction fails
      return {
        text: `Failed to extract text from PDF: ${file.name}. The file may be corrupted or use unsupported features.`,
        pageCount: 1,
        quality: 'low'
      };
    }
  }

  private async extractTextFromPlainText(file: File): Promise<string> {
    return await file.text();
  }

  private async extractTextFromDOCX(file: File): Promise<string> {
    // This is a simplified DOCX extraction
    // In a real implementation, you'd use a library like mammoth.js
    const text = await file.text();
    return `Extracted content from ${file.name}:\n\n${text.substring(0, 1000)}...\n\n[Note: This is a simplified DOCX extraction. For better results, please convert to PDF or plain text.]`;
  }

  private cleanExtractedText(text: string): string {
    return text
      // Remove excessive whitespace
      .replace(/\s+/g, ' ')
      // Clean up page markers
      .replace(/--- Page \d+ ---/g, '')
      .replace(/--- Page \d+ \(extraction failed\) ---/g, '')
      // Remove multiple consecutive newlines
      .replace(/\n{3,}/g, '\n\n')
      // Trim whitespace
      .trim();
  }

  private countWords(text: string): number {
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }

  private detectLanguage(text: string): string {
    // Simple language detection based on common words
    const englishWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    const words = text.toLowerCase().split(/\s+/).slice(0, 100); // Check first 100 words
    
    const englishCount = words.filter(word => englishWords.includes(word)).length;
    const englishRatio = englishCount / Math.min(words.length, 100);
    
    return englishRatio > 0.1 ? 'en' : 'unknown';
  }
}

export const fileAnalysisService = new FileAnalysisService();
