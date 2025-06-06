
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
    const fileExtension = fileName.toLowerCase().split('.').pop();

    console.log(`Analyzing file: ${fileName} (${fileType}) - Extension: ${fileExtension}`);

    let extractedText = '';
    let pageCount: number | undefined;
    let extractionQuality: 'high' | 'medium' | 'low' = 'high';

    try {
      // Handle different file types based on MIME type and extension
      if (fileType === 'application/pdf' || fileExtension === 'pdf') {
        const pdfResult = await this.extractTextFromPDF(file);
        extractedText = pdfResult.text;
        pageCount = pdfResult.pageCount;
        extractionQuality = pdfResult.quality;
      } else if (fileType === 'text/plain' || fileExtension === 'txt') {
        extractedText = await this.extractTextFromPlainText(file);
      } else if (
        fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        fileExtension === 'docx'
      ) {
        const docxResult = await this.extractTextFromDOCX(file);
        extractedText = docxResult.text;
        extractionQuality = docxResult.quality;
      } else if (
        fileType === 'application/msword' ||
        fileExtension === 'doc'
      ) {
        // Handle legacy DOC files
        const docResult = await this.extractTextFromDOC(file);
        extractedText = docResult.text;
        extractionQuality = docResult.quality;
      } else if (
        fileType === 'application/rtf' ||
        fileExtension === 'rtf'
      ) {
        // Handle RTF files
        const rtfResult = await this.extractTextFromRTF(file);
        extractedText = rtfResult.text;
        extractionQuality = rtfResult.quality;
      } else {
        // Try to read as plain text for unknown types
        console.log(`Unknown file type ${fileType}, attempting plain text extraction...`);
        try {
          extractedText = await this.extractTextFromPlainText(file);
          extractionQuality = 'medium';
        } catch (error) {
          throw new Error(`Unsupported file type: ${fileType}. Supported formats: PDF, DOCX, DOC, RTF, TXT`);
        }
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
          fileType: fileType || `unknown (${fileExtension})`,
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
          }
        } catch (err) {
          console.error(`Error extracting text from page ${i}:`, err);
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
    try {
      return await file.text();
    } catch (error) {
      throw new Error('Failed to read text file. The file may be corrupted or use an unsupported encoding.');
    }
  }

  private async extractTextFromDOCX(file: File): Promise<{ text: string; quality: 'high' | 'medium' | 'low' }> {
    try {
      console.log('Starting DOCX text extraction...');
      
      // Read file as array buffer
      const arrayBuffer = await file.arrayBuffer();
      
      // Basic DOCX extraction using XML parsing
      const text = await this.parseDocxContent(arrayBuffer);
      
      if (!text || text.trim().length < 10) {
        throw new Error('Unable to extract meaningful text from DOCX file');
      }
      
      return { 
        text, 
        quality: 'medium' // Medium quality for basic XML extraction
      };
    } catch (error) {
      console.error('DOCX extraction error:', error);
      throw new Error(`Failed to extract text from DOCX file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async extractTextFromDOC(file: File): Promise<{ text: string; quality: 'high' | 'medium' | 'low' }> {
    try {
      // For legacy DOC files, we'll provide a helpful message
      const fallbackText = `This appears to be a legacy Microsoft Word document (.doc).

For best results, please:
1. Open the document in Microsoft Word
2. Save it as a .docx file or .pdf
3. Upload the converted file

Alternatively, you can copy the text content directly and paste it into the text input tab.

File: ${file.name}
Size: ${(file.size / 1024 / 1024).toFixed(2)}MB`;

      return {
        text: fallbackText,
        quality: 'low'
      };
    } catch (error) {
      throw new Error('Unable to process legacy DOC file. Please convert to DOCX or PDF format.');
    }
  }

  private async extractTextFromRTF(file: File): Promise<{ text: string; quality: 'high' | 'medium' | 'low' }> {
    try {
      const content = await file.text();
      
      // Basic RTF parsing - remove RTF control codes
      const cleanText = content
        .replace(/\\[a-z]+\d*\s?/g, '') // Remove RTF control words
        .replace(/[{}]/g, '') // Remove braces
        .replace(/\\\\/g, '\\') // Unescape backslashes
        .replace(/\\'/g, "'") // Unescape quotes
        .trim();
      
      if (cleanText.length < 10) {
        throw new Error('Unable to extract meaningful text from RTF file');
      }
      
      return {
        text: cleanText,
        quality: 'medium'
      };
    } catch (error) {
      throw new Error('Failed to process RTF file. Please try converting to PDF or plain text.');
    }
  }

  private async parseDocxContent(arrayBuffer: ArrayBuffer): Promise<string> {
    try {
      // Convert ArrayBuffer to Uint8Array for processing
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // For a proper DOCX parser, we would need to:
      // 1. Unzip the DOCX file (it's a ZIP archive)
      // 2. Parse the word/document.xml file
      // 3. Extract text content from XML nodes
      
      // This is a simplified approach that tries to find readable text
      const decoder = new TextDecoder('utf-8', { fatal: false });
      const content = decoder.decode(uint8Array);
      
      // Look for XML content patterns and extract text
      const xmlMatches = content.match(/<w:t[^>]*>([^<]*)<\/w:t>/g);
      if (xmlMatches) {
        const extractedText = xmlMatches
          .map(match => match.replace(/<w:t[^>]*>([^<]*)<\/w:t>/, '$1'))
          .join(' ')
          .trim();
        
        if (extractedText.length > 0) {
          return extractedText;
        }
      }
      
      // Fallback: look for any readable text patterns
      const textPattern = /[a-zA-Z0-9\s.,!?;:'"()-]{20,}/g;
      const textMatches = content.match(textPattern);
      
      if (textMatches && textMatches.length > 0) {
        return textMatches.join(' ').substring(0, 10000); // Limit to prevent memory issues
      }
      
      throw new Error('No readable text found in DOCX file');
    } catch (error) {
      console.error('DOCX parsing error:', error);
      throw new Error('Failed to parse DOCX content. The file may be corrupted or use an unsupported format.');
    }
  }

  private cleanExtractedText(text: string): string {
    return text
      // Remove excessive whitespace
      .replace(/\s+/g, ' ')
      // Remove common file artifacts
      .replace(/PK![^a-zA-Z]*[a-zA-Z]{1,3}[^a-zA-Z]*/g, '')
      .replace(/\[Content_Types\]\.xml/g, '')
      .replace(/_rels\/\.\.\./g, '')
      // Remove XML-like tags
      .replace(/<[^>]*>/g, ' ')
      // Remove special characters that might cause issues
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      // Clean up multiple spaces again
      .replace(/\s+/g, ' ')
      // Remove multiple consecutive newlines
      .replace(/\n{3,}/g, '\n\n')
      // Trim whitespace
      .trim();
  }

  private countWords(text: string): number {
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }

  private detectLanguage(text: string): string {
    // Simple language detection
    const englishWordCount = (text.match(/\b(the|and|is|in|to|of|that|it|with|for|as|be|on|not|this)\b/gi) || []).length;
    const spanishWordCount = (text.match(/\b(el|la|los|las|en|de|que|y|a|es|por|un|una|para|con|no)\b/gi) || []).length;
    const frenchWordCount = (text.match(/\b(le|la|les|un|une|des|et|est|à|de|que|qui|dans|pour|en|ce|cette)\b/gi) || []).length;
    
    const counts = {
      'English': englishWordCount,
      'Spanish': spanishWordCount,
      'French': frenchWordCount
    };
    
    const detectedLanguage = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])[0][0];
      
    return counts[detectedLanguage as keyof typeof counts] > 5 ? detectedLanguage : 'English';
  }
}

export const fileAnalysisService = new FileAnalysisService();
