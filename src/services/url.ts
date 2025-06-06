// Keep any existing code in url.ts and add these functions if they don't exist already

// Enhance the analyzeText function if it exists, or create it if it doesn't
class UrlService {
  // Keep other existing methods

  analyzeText(text: string) {
    // Simulate text analysis that would normally be done by an API
    const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
    const charCount = text.length;
    
    // Calculate a readability score (Flesch-Kincaid-like algorithm)
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const words = wordCount;
    const syllables = this.estimateSyllables(text);
    
    // Simplified readability calculation
    let readabilityScore = 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);
    readabilityScore = Math.min(100, Math.max(0, Math.round(readabilityScore)));
    
    // Determine reading level
    let level = "College";
    if (readabilityScore >= 90) level = "Elementary";
    else if (readabilityScore >= 80) level = "Middle School";
    else if (readabilityScore >= 70) level = "High School";
    else if (readabilityScore >= 60) level = "College";
    else if (readabilityScore >= 50) level = "College Graduate";
    else level = "Professional";
    
    // Calculate reading time (avg 200 words per minute)
    const readingTime = Math.ceil(words / 200);
    
    // Extract keywords
    const keywords = this.extractKeywords(text);
    
    // Sentiment analysis (very basic)
    const sentiment = this.analyzeSentiment(text);
    
    return {
      readability: {
        score: readabilityScore,
        level,
        readingTime,
      },
      keywords,
      sentiment,
    };
  }
  
  // Helper methods to support analysis
  private estimateSyllables(text: string): number {
    // Very basic syllable estimation
    const words = text.toLowerCase().split(/\s+/);
    let syllableCount = 0;
    
    words.forEach(word => {
      if (word.length <= 3) {
        syllableCount += 1;
      } else {
        // Count vowel groups as syllables
        const vowelGroups = word.match(/[aeiouy]+/g);
        if (vowelGroups) {
          syllableCount += vowelGroups.length;
        } else {
          syllableCount += 1;
        }
        
        // Subtract silent e at end
        if (word.endsWith('e') && word.length > 3) {
          syllableCount -= 1;
        }
      }
    });
    
    return Math.max(1, syllableCount);
  }
  
  private extractKeywords(text: string): string[] {
    // Basic keyword extraction
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 3);
      
    // Count occurrences
    const wordCounts: Record<string, number> = {};
    words.forEach(word => {
      if (!this.isStopWord(word)) {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
      }
    });
    
    // Sort by frequency
    return Object.entries(wordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);
  }
  
  private analyzeSentiment(text: string) {
    // Simple dictionary-based sentiment analysis
    const positiveWords = ['good', 'great', 'excellent', 'best', 'love', 'amazing', 'wonderful', 'happy', 'positive', 'success', 'successful', 'benefit', 'benefits', 'helpful'];
    const negativeWords = ['bad', 'worst', 'terrible', 'awful', 'hate', 'dislike', 'poor', 'negative', 'failure', 'failed', 'problem', 'difficult', 'unfortunately', 'issue', 'error'];
    
    const lowerText = text.toLowerCase();
    let positiveScore = 0;
    let negativeScore = 0;
    
    positiveWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'g');
      const matches = lowerText.match(regex);
      if (matches) {
        positiveScore += matches.length;
      }
    });
    
    negativeWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'g');
      const matches = lowerText.match(regex);
      if (matches) {
        negativeScore += matches.length;
      }
    });
    
    let label: "positive" | "neutral" | "negative" = "neutral";
    let score = 0;
    
    if (positiveScore > negativeScore) {
      label = "positive";
      score = Math.min(10, Math.round((positiveScore - negativeScore) / (positiveScore + negativeScore + 1) * 10));
    } else if (negativeScore > positiveScore) {
      label = "negative";
      score = Math.min(10, Math.round((negativeScore - positiveScore) / (positiveScore + negativeScore + 1) * 10));
    }
    
    return {
      label,
      score
    };
  }
  
  private isStopWord(word: string): boolean {
    const stopWords = ['the', 'and', 'is', 'in', 'to', 'of', 'that', 'it', 'with', 'for', 'as', 'be', 'on', 'not', 'this', 'by', 'are'];
    return stopWords.includes(word);
  }
  
  isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  async fetchContentFromUrl(url: string, mode: "full" | "main" | "title" = "main"): Promise<{
    content: string;
    metadata: {
      title?: string;
      author?: string;
      publishDate?: string;
      source?: string;
      wordCount?: number;
    };
  }> {
    // Simulate content fetching for demonstration
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockContent = `This is simulated content from ${url}. In a real implementation, this would fetch and parse the actual web page content using appropriate web scraping techniques.`;
    
    return {
      content: mockContent,
      metadata: {
        title: "Sample Article Title",
        author: "Sample Author",
        publishDate: new Date().toDateString(),
        source: new URL(url).hostname,
        wordCount: mockContent.split(' ').length
      }
    };
  }

  generatePdfContent(summary: any): string {
    const content = `
SUMMARY REPORT
==============

Generated: ${new Date().toLocaleString()}

Summary Text:
${summary.summaryText}

Summary Type: ${summary.lengthType}
Created: ${new Date(summary.createdAt).toLocaleString()}

---
Generated by AI Text Summarizer
    `.trim();
    
    return content;
  }
}

export const urlService = new UrlService();
