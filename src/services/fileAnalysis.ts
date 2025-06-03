
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
        // For PDF files, we'll simulate content extraction
        content = `This is sample text extracted from ${file.name}. In a real application, we would use a PDF parsing library like pdf-parse or PDF.js to extract the actual content.`;
        return {
          content,
          metadata: {
            ...baseMetadata,
            ...this.analyzeTextContent(content),
            encoding: 'PDF Binary'
          }
        };
      } else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        // For DOCX files, we'll simulate content extraction
        content = `This is sample text extracted from ${file.name}. In a real application, we would use a library like mammoth.js to extract the actual content from DOCX files.`;
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
