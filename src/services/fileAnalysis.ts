
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker to use local worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

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
          const docxResult = await this.extractTextFromDOCX(file);
          extractedText = docxResult.text;
          extractionQuality = docxResult.quality;
          break;
        
        default:
          throw new Error(`Unsupported file type: ${fileType}. Please upload PDF, DOCX, or TXT files.`);
      }

      // Validate extracted text quality
      if (!extractedText || extractedText.trim().length < 10) {
        throw new Error(`Unable to extract readable text from ${fileName}. The file may be corrupted, password-protected, or contain only images.`);
      }

      // Clean and enhance the extracted text
      const cleanedText = this.cleanExtractedText(extractedText);
      
      // Final validation after cleaning
      if (cleanedText.length < 50) {
        throw new Error(`Extracted text is too short (${cleanedText.length} characters). Please ensure the file contains sufficient readable content.`);
      }

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
      throw new Error(`Failed to analyze file: ${error instanceof Error ? error.message : 'Unknown error occurred during file processing'}`);
    }
  }

  private async extractTextFromPDF(file: File): Promise<{ text: string; pageCount: number; quality: 'high' | 'medium' | 'low' }> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;
      let fullText = '';
      let extractionSuccessCount = 0;

      for (let i = 1; i <= numPages; i++) {
        try {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const pageText = content.items
            .map((item: any) => item.str)
            .join(' ')
            .trim();
          
          if (pageText.length > 0) {
            extractionSuccessCount++;
            fullText += `${pageText}\n\n`;
          } else {
            fullText += `--- Page ${i} (extraction failed) ---\n\n`;
          }
        } catch (err) {
          console.error(`Error extracting text from page ${i}:`, err);
          fullText += `--- Page ${i} (extraction failed) ---\n\n`;
        }
      }

      // Determine extraction quality
      const successRate = extractionSuccessCount / numPages;
      let quality: 'high' | 'medium' | 'low';
      
      if (successRate > 0.8) quality = 'high';
      else if (successRate > 0.5) quality = 'medium';
      else quality = 'low';

      return { 
        text: fullText, 
        pageCount: numPages,
        quality
      };
    } catch (error) {
      console.error('PDF extraction error:', error);
      throw new Error('Failed to extract text from PDF. The file may be corrupted or password-protected.');
    }
  }

  private async extractTextFromPlainText(file: File): Promise<string> {
    return await file.text();
  }

  private async extractTextFromDOCX(file: File): Promise<{ text: string; quality: 'high' | 'medium' | 'low' }> {
    try {
      console.log('Starting DOCX text extraction...');
      
      // Read file as array buffer
      const arrayBuffer = await file.arrayBuffer();
      
      // Convert to ZIP and extract document.xml
      const zipData = new Uint8Array(arrayBuffer);
      
      // Simple DOCX text extraction by finding document.xml content
      const textContent = await this.extractDocxText(zipData);
      
      if (!textContent || textContent.trim().length === 0) {
        throw new Error('No readable text found in DOCX file. The document may be empty or contain only images.');
      }

      // Determine quality based on extraction success
      const quality: 'high' | 'medium' | 'low' = textContent.length > 100 ? 'medium' : 'low';
      
      console.log(`DOCX extraction complete. Extracted ${textContent.length} characters with ${quality} quality.`);
      
      return { text: textContent, quality };
    } catch (error) {
      console.error('DOCX extraction error:', error);
      throw new Error(`Failed to extract text from DOCX file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async extractDocxText(zipData: Uint8Array): Promise<string> {
    try {
      // This is a simplified DOCX extraction
      // For production use, consider using a library like mammoth.js
      
      // Convert to string to search for text content
      const decoder = new TextDecoder('utf-8', { fatal: false });
      const content = decoder.decode(zipData);
      
      // Look for text content patterns in the DOCX structure
      const textMatches = content.match(/<w:t[^>]*>([^<]+)<\/w:t>/g);
      
      if (textMatches && textMatches.length > 0) {
        // Extract text from XML tags
        const extractedText = textMatches
          .map(match => {
            const textMatch = match.match(/<w:t[^>]*>([^<]+)<\/w:t>/);
            return textMatch ? textMatch[1] : '';
          })
          .filter(text => text.trim().length > 0)
          .join(' ');
        
        if (extractedText.length > 0) {
          return extractedText;
        }
      }
      
      // Fallback: try to find any readable text in the content
      const readableText = content
        .replace(/[^\x20-\x7E\s]/g, ' ') // Keep only printable ASCII and whitespace
        .replace(/\s+/g, ' ')
        .trim();
      
      // Extract meaningful sentences (at least 10 characters with some words)
      const sentences = readableText
        .split(/[.!?]+/)
        .filter(sentence => sentence.trim().length > 10 && /\w+/.test(sentence))
        .map(sentence => sentence.trim())
        .slice(0, 50); // Limit to first 50 sentences
      
      if (sentences.length > 0) {
        return sentences.join('. ') + '.';
      }
      
      throw new Error('No readable text content found in DOCX file');
    } catch (error) {
      throw new Error(`DOCX text extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
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
      // Remove common DOCX artifacts
      .replace(/PK![^a-zA-Z]*[a-zA-Z]{1,3}[^a-zA-Z]*/g, '')
      .replace(/\[Content_Types\]\.xml/g, '')
      .replace(/_rels\/\.\.\./g, '')
      // Remove XML-like tags
      .replace(/<[^>]*>/g, ' ')
      // Clean up multiple spaces again
      .replace(/\s+/g, ' ')
      // Trim whitespace
      .trim();
  }

  private countWords(text: string): number {
    // Count words using regex to split by whitespace
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }

  private detectLanguage(text: string): string {
    // Simple language detection - just a sample implementation
    // In a real application, use a proper language detection library
    
    // Check for common English words
    const englishWordCount = (text.match(/\b(the|and|is|in|to|of|that|it|with|for|as|be|on|not|this)\b/gi) || []).length;
    
    // Check for common Spanish words
    const spanishWordCount = (text.match(/\b(el|la|los|las|en|de|que|y|a|es|por|un|una|para|con|no)\b/gi) || []).length;
    
    // Check for common French words
    const frenchWordCount = (text.match(/\b(le|la|les|un|une|des|et|est|à|de|que|qui|dans|pour|en|ce|cette)\b/gi) || []).length;
    
    // Determine language based on highest word count
    const counts = {
      'English': englishWordCount,
      'Spanish': spanishWordCount,
      'French': frenchWordCount
    };
    
    const detectedLanguage = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])[0][0];
      
    // If no clear detection, default to English
    return counts[detectedLanguage as keyof typeof counts] > 5 ? detectedLanguage : 'English';
  }
}

export const fileAnalysisService = new FileAnalysisService();
