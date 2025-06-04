
import { SummaryParams, Summary } from "@/types";

// URL Service for fetching article content from URLs
class UrlService {
  // Check if a string is a valid URL
  isValidUrl(urlString: string): boolean {
    try {
      const url = new URL(urlString);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch (e) {
      return false;
    }
  }

  // Fetch content from a URL (enhanced simulation for frontend demo)
  async fetchContentFromUrl(url: string, extractMode: "full" | "main" | "title" = "main"): Promise<{
    content: string,
    metadata: {
      title?: string;
      author?: string;
      publishDate?: string;
      source?: string;
      wordCount?: number;
    }
  }> {
    try {
      console.log(`Fetching content from: ${url} with mode: ${extractMode}`);
      
      // Enhanced simulation that better mimics real content extraction
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          try {
            const { content, metadata } = this.generateEnhancedMockContent(url, extractMode);
            
            // Validate content was generated
            if (!content || content.trim().length === 0) {
              throw new Error("No content could be extracted from the URL");
            }
            
            resolve({ content, metadata });
          } catch (error) {
            reject(new Error(`Failed to extract content: ${error instanceof Error ? error.message : 'Unknown error'}`));
          }
        }, 1500); // Reduced timeout for better UX
      });
    } catch (error) {
      console.error("Error fetching URL content:", error);
      throw new Error("Failed to fetch content from the URL. Please check the URL and try again.");
    }
  }
  
  // Generate enhanced mock content based on the URL and extraction mode
  private generateEnhancedMockContent(url: string, extractMode: string): {
    content: string,
    metadata: {
      title: string;
      author?: string;
      publishDate?: string;
      source: string;
      wordCount: number;
    }
  } {
    let domain = "";
    let urlPath = "";
    
    try {
      const urlObj = new URL(url);
      domain = urlObj.hostname;
      urlPath = urlObj.pathname;
    } catch (e) {
      domain = "example.com";
      urlPath = "/article";
    }

    // Enhanced topic detection
    const topicPatterns: Record<string, string> = {
      "medium.com": "technology and innovation",
      "dev.to": "software development",
      "news.ycombinator.com": "technology news",
      "nytimes.com": "current events",
      "wikipedia.org": "educational content",
      "github.com": "software projects",
      "stackoverflow.com": "programming solutions",
      "techcrunch.com": "startup and tech news",
      "wired.com": "technology and culture",
      "arstechnica.com": "technology analysis"
    };
    
    // Determine topic from domain or URL path
    let topic = "general information";
    for (const [domainKey, topicValue] of Object.entries(topicPatterns)) {
      if (domain.includes(domainKey)) {
        topic = topicValue;
        break;
      }
    }
    
    // If no domain match, try to infer from URL path
    if (topic === "general information") {
      if (urlPath.includes("tech") || urlPath.includes("technology")) topic = "technology";
      else if (urlPath.includes("business")) topic = "business";
      else if (urlPath.includes("science")) topic = "science";
      else if (urlPath.includes("health")) topic = "health";
      else if (urlPath.includes("education")) topic = "education";
    }
    
    // Create more realistic article title
    const pathSegments = urlPath.split("/").filter(segment => segment.length > 0);
    const lastSegment = pathSegments[pathSegments.length - 1] || "article";
    const cleanTitle = lastSegment
      .replace(/-/g, " ")
      .replace(/[_\.]/g, " ")
      .replace(/\.(html|php|aspx|jsp)$/, "")
      .split("?")[0]
      .split("#")[0]
      .replace(/\b\w/g, l => l.toUpperCase())
      .trim();

    const title = cleanTitle || `Article About ${topic.charAt(0).toUpperCase() + topic.slice(1)}`;

    // Generate realistic metadata
    const authors = ["Dr. Sarah Chen", "Michael Rodriguez", "Emma Thompson", "David Kim", "Prof. Lisa Johnson", "Alex Parker"];
    const author = authors[Math.floor(Math.random() * authors.length)];
    
    const today = new Date();
    const randomDaysAgo = Math.floor(Math.random() * 180); // Last 6 months
    const publishDate = new Date(today);
    publishDate.setDate(today.getDate() - randomDaysAgo);
    const formattedDate = publishDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // Generate content based on extraction mode with more realistic word counts
    const baseWordCounts = {
      title: 150 + Math.floor(Math.random() * 100),
      main: 600 + Math.floor(Math.random() * 800),
      full: 1200 + Math.floor(Math.random() * 2000)
    };
    
    const wordCount = baseWordCounts[extractMode as keyof typeof baseWordCounts] || baseWordCounts.main;
    
    let content = "";
    
    switch(extractMode) {
      case "title":
        content = `# ${title}

## Executive Summary
This article provides essential insights into ${topic}, covering the most important aspects and key takeaways. The content has been extracted and condensed to focus on the core concepts and practical implications for readers interested in ${topic}.

**Key Points:**
- Overview of current trends in ${topic}
- Critical analysis of recent developments
- Practical applications and recommendations
- Future outlook and implications

The article emphasizes the growing importance of understanding ${topic} in today's rapidly evolving landscape.`;
        break;
        
      case "full":
        content = `# ${title}

## Introduction
This comprehensive article explores ${topic} in depth, providing a thorough analysis of current trends, challenges, and opportunities. The content has been extracted from ${domain} and represents the complete perspective on this important subject.

## Background and Context
Understanding ${topic} requires examining its historical development and current relevance. Recent studies have shown significant growth and evolution in this field, making it increasingly important for both professionals and general audiences.

## Current State of ${topic.charAt(0).toUpperCase() + topic.slice(1)}
The landscape of ${topic} has transformed dramatically in recent years. Key developments include:

### Technological Advancements
Modern approaches to ${topic} leverage cutting-edge technologies and methodologies. Industry leaders are implementing innovative solutions that address traditional challenges while opening new possibilities.

### Market Dynamics
The economic implications of ${topic} continue to influence various sectors. Market analysis reveals growing investment and interest from both established companies and emerging startups.

### Research and Development
Academic institutions and research organizations are actively contributing to our understanding of ${topic}. Recent publications highlight breakthrough discoveries and theoretical advances.

## Key Challenges and Solutions
Despite significant progress, several challenges remain in the field of ${topic}:

1. **Implementation Complexity**: Organizations often struggle with practical implementation of ${topic} strategies.
2. **Resource Allocation**: Proper investment in ${topic} initiatives requires careful planning and budgeting.
3. **Skill Development**: The need for specialized expertise in ${topic} continues to grow.

## Best Practices and Recommendations
Experts recommend the following approaches for success in ${topic}:

- Develop a comprehensive understanding of fundamental principles
- Stay updated with latest developments and trends
- Invest in proper training and education
- Collaborate with experienced professionals
- Implement gradual, measured approaches to adoption

## Case Studies and Examples
Several organizations have successfully implemented ${topic} strategies:

**Case Study 1**: A leading technology company increased efficiency by 40% through strategic application of ${topic} principles.

**Case Study 2**: Educational institutions have reported improved outcomes when incorporating ${topic} methodologies into their programs.

## Future Outlook
The future of ${topic} looks promising, with several emerging trends:

- Integration with artificial intelligence and machine learning
- Increased focus on sustainability and ethical considerations
- Growing emphasis on user experience and accessibility
- Expansion into new markets and applications

## Conclusion
As ${topic} continues to evolve, staying informed and adaptable remains crucial. The insights presented in this article provide a foundation for understanding current developments and preparing for future opportunities.

Organizations and individuals who invest in understanding ${topic} will be better positioned to succeed in an increasingly complex and competitive environment.

---
*Source: ${url}*
*Published: ${formattedDate}*
*Author: ${author}*`;
        break;
        
      default: // "main" content
        content = `# ${title}

## Overview
This article examines ${topic}, providing valuable insights into current developments and practical applications. The content focuses on key concepts and actionable information relevant to this important subject area.

## Key Insights
Understanding ${topic} is crucial in today's rapidly evolving environment. Recent developments have highlighted several important trends:

**Primary Considerations:**
- Current market dynamics and their implications
- Technological advances driving change in the field
- Best practices for implementation and adoption
- Common challenges and proven solutions

## Analysis and Findings
Research indicates that ${topic} continues to gain importance across various sectors. The integration of modern approaches with traditional methods has yielded significant improvements in outcomes and efficiency.

### Important Developments
- Increased adoption rates among leading organizations
- Enhanced tools and methodologies becoming available
- Growing community of practitioners and experts
- Improved understanding of long-term implications

### Practical Applications
Organizations implementing ${topic} strategies have reported measurable benefits including improved performance, reduced costs, and enhanced user satisfaction.

## Recommendations
For those looking to engage with ${topic}, experts suggest:

1. Begin with a thorough understanding of foundational concepts
2. Seek out educational resources and training opportunities
3. Connect with experienced practitioners in the field
4. Start with small-scale implementations before expanding
5. Continuously monitor and evaluate results

## Looking Forward
The field of ${topic} shows strong potential for continued growth and innovation. Emerging technologies and evolving best practices suggest exciting developments ahead.

---
*Extracted from: ${url}*
*Publication Date: ${formattedDate}*
*Content Source: ${domain}*`;
    }
    
    return {
      content,
      metadata: {
        title,
        author,
        publishDate: formattedDate,
        source: domain,
        wordCount
      }
    };
  }
  
  // Enhanced text analysis for readability metrics
  analyzeText(text: string): {
    readability: {
      score: number; 
      level: string;
      readingTime: number;
    };
    keywords: string[];
    sentiment: {
      score: number;
      label: "positive" | "neutral" | "negative";
    };
  } {
    const words = text.split(/\s+/).filter(word => word.length > 0);
    const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
    
    // Calculate reading time (average 200 words per minute)
    const readingTime = Math.max(1, Math.ceil(words.length / 200));
    
    // Improved Flesch-Kincaid readability calculation
    const avgWordsPerSentence = words.length / Math.max(sentences.length, 1);
    const avgSyllablesPerWord = this.estimateAvgSyllables(words);
    
    const readabilityScore = Math.min(100, Math.max(0, 
      206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord)
    ));
    
    // Determine readability level
    let readabilityLevel = "College";
    if (readabilityScore >= 90) readabilityLevel = "Very Easy";
    else if (readabilityScore >= 80) readabilityLevel = "Easy";
    else if (readabilityScore >= 70) readabilityLevel = "Fairly Easy";
    else if (readabilityScore >= 60) readabilityLevel = "Standard";
    else if (readabilityScore >= 50) readabilityLevel = "Fairly Difficult";
    else if (readabilityScore >= 30) readabilityLevel = "Difficult";
    
    // Enhanced keyword extraction
    const keywords = this.extractKeywords(words);
    
    // Enhanced sentiment analysis
    const sentiment = this.analyzeSentiment(words);
    
    return {
      readability: {
        score: Math.round(readabilityScore * 10) / 10,
        level: readabilityLevel,
        readingTime: readingTime
      },
      keywords,
      sentiment
    };
  }
  
  private estimateAvgSyllables(words: string[]): number {
    if (words.length === 0) return 1;
    
    const totalSyllables = words.reduce((sum, word) => {
      return sum + this.countSyllables(word.toLowerCase().replace(/[^a-z]/g, ''));
    }, 0);
    
    return totalSyllables / words.length;
  }
  
  private countSyllables(word: string): number {
    if (word.length === 0) return 0;
    
    // Simple syllable counting algorithm
    const vowels = 'aeiouy';
    let syllables = 0;
    let prevWasVowel = false;
    
    for (let i = 0; i < word.length; i++) {
      const isVowel = vowels.includes(word[i]);
      if (isVowel && !prevWasVowel) {
        syllables++;
      }
      prevWasVowel = isVowel;
    }
    
    // Adjust for silent 'e'
    if (word.endsWith('e') && syllables > 1) {
      syllables--;
    }
    
    return Math.max(1, syllables);
  }
  
  private extractKeywords(words: string[]): string[] {
    const commonWords = new Set([
      "the", "and", "a", "an", "in", "on", "at", "to", "for", "of", "with", "is", "are", "was", "were",
      "this", "that", "these", "those", "have", "has", "had", "will", "would", "could", "should",
      "but", "or", "if", "when", "where", "how", "what", "who", "why", "which", "can", "may", "must"
    ]);
    
    const wordFrequency: Record<string, number> = {};
    
    words.forEach(word => {
      const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
      if (cleanWord.length > 3 && !commonWords.has(cleanWord)) {
        wordFrequency[cleanWord] = (wordFrequency[cleanWord] || 0) + 1;
      }
    });
    
    return Object.entries(wordFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(entry => entry[0]);
  }
  
  private analyzeSentiment(words: string[]): {
    score: number;
    label: "positive" | "neutral" | "negative";
  } {
    const positiveWords = new Set([
      "good", "great", "excellent", "best", "positive", "wonderful", "fantastic", "helpful", 
      "beneficial", "amazing", "outstanding", "superior", "effective", "successful", "innovative"
    ]);
    
    const negativeWords = new Set([
      "bad", "worst", "terrible", "negative", "poor", "awful", "horrible", "harmful", 
      "useless", "failed", "disappointing", "inadequate", "ineffective", "problematic"
    ]);
    
    let positiveCount = 0;
    let negativeCount = 0;
    
    words.forEach(word => {
      const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
      if (positiveWords.has(cleanWord)) positiveCount++;
      if (negativeWords.has(cleanWord)) negativeCount++;
    });
    
    const totalSentimentWords = positiveCount + negativeCount;
    const sentimentScore = totalSentimentWords > 0 
      ? (positiveCount - negativeCount) / totalSentimentWords
      : 0;
    
    let sentimentLabel: "positive" | "neutral" | "negative" = "neutral";
    if (sentimentScore > 0.1) sentimentLabel = "positive";
    else if (sentimentScore < -0.1) sentimentLabel = "negative";
    
    return {
      score: Math.round(sentimentScore * 100) / 100,
      label: sentimentLabel
    };
  }
  
  // Generate PDF content
  generatePdfContent(summary: Summary): string {
    const title = summary.source 
      ? `Summary of content from ${summary.source}`
      : 'Text Summary';
    
    const date = new Date(summary.createdAt).toLocaleDateString();
    const lengthInfo = summary.lengthType === "percentage"
      ? `${summary.lengthValue}% of original`
      : `${summary.lengthType} summary`;
    
    return `
Title: ${title}
Date: ${date}
Summary Type: ${lengthInfo}
Model: ${summary.model || 'Default'}

${summary.summaryText}

---
Generated by Study Scribe
    `.trim();
  }
}

export const urlService = new UrlService();
