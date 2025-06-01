
export interface FileMetadata {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  wordCount?: number;
  characterCount?: number;
  lineCount?: number;
  readingTime?: number;
  language?: string;
  encoding?: string;
  pageCount?: number;
}

export class FileAnalysisService {
  // Extract comprehensive metadata from uploaded files
  static async analyzeFile(file: File): Promise<{ content: string; metadata: FileMetadata }> {
    const baseMetadata: FileMetadata = {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
    };

    try {
      let content = '';
      
      if (file.type === "text/plain") {
        content = await file.text();
        return {
          content,
          metadata: {
            ...baseMetadata,
            ...this.analyzeTextContent(content)
          }
        };
      } else if (file.type === "application/pdf") {
        content = await this.extractPdfContent(file);
        const textAnalysis = this.analyzeTextContent(content);
        return {
          content,
          metadata: {
            ...baseMetadata,
            ...textAnalysis,
            encoding: 'PDF Binary'
          }
        };
      } else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        content = await this.extractDocxContent(file);
        return {
          content,
          metadata: {
            ...baseMetadata,
            ...this.analyzeTextContent(content),
            encoding: 'DOCX Binary'
          }
        };
      } else {
        throw new Error(`Unsupported file type: ${file.type}`);
      }
    } catch (error) {
      console.error('Error analyzing file:', error);
      throw new Error(`Failed to analyze file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Extract content from PDF files using PDF.js with better error handling
  private static async extractPdfContent(file: File): Promise<string> {
    try {
      // Import PDF.js dynamically
      const pdfjsLib = await import('pdfjs-dist');
      
      // Use built-in worker or disable worker entirely
      // This avoids the "Invalid workerSrc type" error
      if (typeof pdfjsLib.GlobalWorkerOptions !== 'undefined') {
        // Disable worker to use main thread processing
        delete (pdfjsLib.GlobalWorkerOptions as any).workerSrc;
      }
      
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ 
        data: arrayBuffer,
        // Disable worker-related features that might cause issues
        disableWorker: true,
        isEvalSupported: false,
        useSystemFonts: true,
        verbosity: 0 // Reduce logging
      }).promise;
      
      let fullText = '';
      
      // Extract text from each page
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        // Combine text items into readable content
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        
        fullText += pageText + '\n\n';
      }
      
      if (fullText.trim().length === 0) {
        return `PDF file "${file.name}" was processed but no readable text was found. This might be because:
- The PDF contains only images or scanned content
- The PDF is password-protected
- The PDF uses non-standard encoding

File details:
- Name: ${file.name}
- Size: ${this.formatFileSize(file.size)}
- Pages: ${pdf.numPages}

For better results, try:
1. Converting the PDF to text format
2. Using OCR software if it contains scanned images
3. Copying and pasting the text directly from the PDF viewer`;
      }
      
      return fullText.trim();
    } catch (error) {
      console.error('PDF extraction error:', error);
      
      // If PDF processing fails, provide a helpful fallback message
      return `PDF file "${file.name}" could not be processed automatically. 

File details:
- Name: ${file.name}
- Size: ${this.formatFileSize(file.size)}

This might be due to:
- Complex PDF formatting
- Encrypted/protected PDF
- Network connectivity issues

Alternative options:
1. Try converting the PDF to a text file (.txt)
2. Copy and paste the text directly from the PDF
3. Use a different PDF that contains selectable text

Error details: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  // Extract content from DOCX files using mammoth
  private static async extractDocxContent(file: File): Promise<string> {
    try {
      // Import mammoth dynamically to avoid build issues
      const mammoth = await import('mammoth');
      
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      
      if (result.value.trim().length === 0) {
        return `DOCX file "${file.name}" was processed but no readable text was found.

File details:
- Name: ${file.name}
- Size: ${this.formatFileSize(file.size)}

For better results, try:
1. Saving the document as a .txt file
2. Copying and pasting the text directly from the document
3. Ensuring the document contains actual text content (not just images)`;
      }
      
      // Log any conversion messages/warnings
      if (result.messages.length > 0) {
        console.log('DOCX conversion messages:', result.messages);
      }
      
      return result.value;
    } catch (error) {
      console.error('DOCX extraction error:', error);
      throw new Error(`Failed to extract DOCX content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Analyze text content for detailed statistics
  private static analyzeTextContent(text: string) {
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, '').length;
    const lines = text.split('\n').length;
    const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0).length;
    const paragraphs = text.split(/\n\s*\n/).filter(paragraph => paragraph.trim().length > 0).length;
    
    // Calculate reading time (average 200 words per minute)
    const readingTime = Math.max(1, Math.ceil(words.length / 200));
    
    // Simple language detection (very basic)
    const language = this.detectLanguage(text);
    
    return {
      wordCount: words.length,
      characterCount: characters,
      characterCountNoSpaces: charactersNoSpaces,
      lineCount: lines,
      sentenceCount: sentences,
      paragraphCount: paragraphs,
      readingTime,
      language,
      encoding: 'UTF-8'
    };
  }

  // Basic language detection
  private static detectLanguage(text: string): string {
    const sample = text.toLowerCase().substring(0, 1000);
    
    // Very simple detection based on common words
    const englishWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    const spanishWords = ['el', 'la', 'en', 'que', 'de', 'un', 'es', 'se', 'no', 'te', 'lo', 'le'];
    const frenchWords = ['le', 'de', 'et', 'à', 'un', 'il', 'être', 'et', 'en', 'avoir', 'que', 'pour'];
    
    const englishCount = englishWords.filter(word => sample.includes(` ${word} `)).length;
    const spanishCount = spanishWords.filter(word => sample.includes(` ${word} `)).length;
    const frenchCount = frenchWords.filter(word => sample.includes(` ${word} `)).length;
    
    const maxCount = Math.max(englishCount, spanishCount, frenchCount);
    
    if (maxCount === 0) return 'Unknown';
    if (englishCount === maxCount) return 'English';
    if (spanishCount === maxCount) return 'Spanish';
    if (frenchCount === maxCount) return 'French';
    
    return 'Unknown';
  }

  // Generate a summary of the file analysis
  static generateAnalysisSummary(metadata: FileMetadata): string {
    const { name, size, type, wordCount, readingTime, language } = metadata;
    
    let summary = `File Analysis Summary for "${name}":\n\n`;
    summary += `• File Type: ${type}\n`;
    summary += `• File Size: ${this.formatFileSize(size)}\n`;
    
    if (wordCount) {
      summary += `• Word Count: ${wordCount.toLocaleString()} words\n`;
    }
    
    if (readingTime) {
      summary += `• Estimated Reading Time: ${readingTime} minute${readingTime > 1 ? 's' : ''}\n`;
    }
    
    if (language && language !== 'Unknown') {
      summary += `• Detected Language: ${language}\n`;
    }
    
    summary += `• Last Modified: ${new Date(metadata.lastModified).toLocaleString()}\n`;
    
    return summary;
  }

  private static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
