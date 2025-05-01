
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

  // Fetch content from a URL (simulated for frontend demo)
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
      
      // Here we would normally make a fetch request to a backend service
      // that would handle CORS and extract the main content from the webpage
      // For demo purposes, we'll simulate the content extraction
      
      return new Promise((resolve) => {
        setTimeout(() => {
          // Generate mock content based on the URL
          let domain = "";
          try {
            domain = new URL(url).hostname;
          } catch (e) {
            domain = "example.com";
          }
          
          const { content, metadata } = this.generateMockContent(domain, url, extractMode);
          resolve({ content, metadata });
        }, 2000);
      });
    } catch (error) {
      console.error("Error fetching URL content:", error);
      throw new Error("Failed to fetch content from the URL");
    }
  }
  
  // Generate mock content based on the domain, URL and extraction mode
  private generateMockContent(domain: string, url: string, extractMode: string): {
    content: string,
    metadata: {
      title: string;
      author?: string;
      publishDate?: string;
      source: string;
      wordCount: number;
    }
  } {
    const topics: Record<string, string> = {
      "medium.com": "technology",
      "dev.to": "programming",
      "news.ycombinator.com": "tech news",
      "nytimes.com": "news",
      "wikipedia.org": "knowledge",
      "github.com": "code",
      "stackoverflow.com": "programming questions"
    };
    
    // Determine the topic based on domain or default to "general"
    let topic = "general";
    for (const [domainKey, topicValue] of Object.entries(topics)) {
      if (domain.includes(domainKey)) {
        topic = topicValue;
        break;
      }
    }
    
    // Create article title from the URL
    const urlParts = url.split("/").filter(part => part.length > 0);
    const lastPart = urlParts[urlParts.length - 1] || "article";
    const title = lastPart
      .replace(/-/g, " ")
      .replace(/\.(html|php|aspx|jsp)$/, "")
      .split("?")[0]
      .split("#")[0]
      .trim();
    
    const capitalizedTitle = title
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    // Generate random author
    const authors = ["Jane Smith", "John Doe", "Alex Johnson", "Sam Chen", "Maria Garcia"];
    const author = authors[Math.floor(Math.random() * authors.length)];
    
    // Generate random publish date within last year
    const today = new Date();
    const randomDaysAgo = Math.floor(Math.random() * 365);
    const publishDate = new Date(today);
    publishDate.setDate(today.getDate() - randomDaysAgo);
    const formattedDate = publishDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // Generate word count based on extraction mode
    const wordCounts = {
      full: 1500 + Math.floor(Math.random() * 3000),
      main: 800 + Math.floor(Math.random() * 1200),
      title: 200 + Math.floor(Math.random() * 300)
    };
    
    const wordCount = wordCounts[extractMode as keyof typeof wordCounts] || wordCounts.main;
    
    // Generate mock article content based on topic and extraction mode
    let content = "";
    
    switch(extractMode) {
      case "title":
        content = `# ${capitalizedTitle}

## Quick Summary
This is a brief summary about ${topic} from ${domain}. The article provides a concise overview of key points related to ${topic} without going into extensive details.`;
        break;
        
      case "full":
        content = `# ${capitalizedTitle}

## Introduction
This is a simulated full article about ${topic} extracted from ${domain}. In a real application, we would use a backend service to handle CORS issues and extract the complete content from the webpage.

## Background
The article begins with some background information on ${topic} and its relevance in today's world. It discusses historical context and why understanding ${topic} matters to various stakeholders.

## Main Content
The article discusses various aspects of ${topic} and provides insights into recent developments. It explores the challenges and opportunities in the field and presents different perspectives on the subject.

### Key Section 1
${topic.charAt(0).toUpperCase() + topic.slice(1)} continues to evolve rapidly in the digital landscape. This section explores the fundamental principles and recent innovations.

### Key Section 2
Experts suggest that understanding ${topic} is crucial for future growth. This section examines case studies and expert opinions.

### Key Section 3
Several case studies demonstrate successful implementation of ${topic} strategies. The article analyzes these examples in detail.

## Analysis
Research indicates a growing interest in ${topic} across various sectors. This section provides statistical data and analysis of trends related to ${topic}.

## Practical Applications
The article outlines how readers can apply insights about ${topic} in practical situations. It provides actionable advice and step-by-step guidance.

## Conclusion
As ${topic} continues to evolve, it remains an important area of focus for professionals and enthusiasts alike. The article underscores the significance of staying updated with the latest trends and best practices in ${topic}.

---
Source: ${url}`;
        break;
        
      default: // "main" content
        content = `# ${capitalizedTitle}

## Introduction
This is a simulated article about ${topic} extracted from ${domain}. In a real application, we would use a backend service to handle CORS issues and extract the main content from the webpage.

## Main Content
The article discusses various aspects of ${topic} and provides insights into recent developments. It explores the challenges and opportunities in the field and presents different perspectives on the subject.

## Key Points
- ${topic.charAt(0).toUpperCase() + topic.slice(1)} is evolving rapidly in today's digital landscape
- Experts suggest that understanding ${topic} is crucial for future growth
- Several case studies demonstrate successful implementation of ${topic} strategies
- Research indicates a growing interest in ${topic} across various sectors

## Conclusion
As ${topic} continues to evolve, it remains an important area of focus for professionals and enthusiasts alike. The article underscores the significance of staying updated with the latest trends and best practices in ${topic}.

---
Source: ${url}`;
    }
    
    return {
      content,
      metadata: {
        title: capitalizedTitle,
        author,
        publishDate: formattedDate,
        source: domain,
        wordCount
      }
    };
  }
  
  // NEW: Analyze text content for readability metrics
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
    // Count words, sentences, and syllables (simplified)
    const words = text.split(/\s+/).filter(word => word.length > 0);
    const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
    
    // Calculate reading time (average 200 words per minute)
    const readingTime = Math.max(1, Math.ceil(words.length / 200));
    
    // Simple Flesch-Kincaid readability calculation (simplified)
    const avgWordsPerSentence = words.length / (sentences.length || 1);
    const readabilityScore = Math.min(100, Math.max(0, 
      206.835 - (1.015 * avgWordsPerSentence) - (60 * (avgWordsPerSentence / 10))
    ));
    
    // Determine readability level
    let readabilityLevel = "College";
    if (readabilityScore >= 90) readabilityLevel = "Very Easy";
    else if (readabilityScore >= 80) readabilityLevel = "Easy";
    else if (readabilityScore >= 70) readabilityLevel = "Fairly Easy";
    else if (readabilityScore >= 60) readabilityLevel = "Standard";
    else if (readabilityScore >= 50) readabilityLevel = "Fairly Difficult";
    else if (readabilityScore >= 30) readabilityLevel = "Difficult";
    
    // Extract simple keywords (most frequent words excluding common ones)
    const commonWords = new Set(["the", "and", "a", "an", "in", "on", "at", "to", "for", "of", "with", "is", "are", "was", "were"]);
    const wordFrequency: Record<string, number> = {};
    
    words.forEach(word => {
      const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
      if (cleanWord.length > 3 && !commonWords.has(cleanWord)) {
        wordFrequency[cleanWord] = (wordFrequency[cleanWord] || 0) + 1;
      }
    });
    
    const keywords = Object.entries(wordFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(entry => entry[0]);
    
    // Very simple sentiment analysis (just counting positive/negative words)
    const positiveWords = ["good", "great", "excellent", "best", "positive", "wonderful", "fantastic", "helpful", "beneficial"];
    const negativeWords = ["bad", "worst", "terrible", "negative", "poor", "awful", "horrible", "harmful", "useless"];
    
    let positiveCount = 0;
    let negativeCount = 0;
    
    words.forEach(word => {
      const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
      if (positiveWords.includes(cleanWord)) positiveCount++;
      if (negativeWords.includes(cleanWord)) negativeCount++;
    });
    
    // Calculate sentiment score between -1 and 1
    const totalWords = words.length;
    const sentimentScore = totalWords > 0 
      ? ((positiveCount - negativeCount) / Math.max(1, positiveCount + negativeCount)) 
      : 0;
    
    // Determine sentiment label
    let sentimentLabel: "positive" | "neutral" | "negative" = "neutral";
    if (sentimentScore > 0.05) sentimentLabel = "positive";
    else if (sentimentScore < -0.05) sentimentLabel = "negative";
    
    return {
      readability: {
        score: Math.round(readabilityScore * 10) / 10,
        level: readabilityLevel,
        readingTime: readingTime
      },
      keywords,
      sentiment: {
        score: Math.round(sentimentScore * 100) / 100,
        label: sentimentLabel
      }
    };
  }
  
  // NEW: Generate PDF content
  generatePdfContent(summary: Summary): string {
    // In a real app, this would generate actual PDF data
    // Here we're just returning a template that could be used with a PDF library
    
    const title = summary.source 
      ? `Summary of content from ${summary.source}`
      : 'Text Summary';
    
    const date = new Date(summary.createdAt).toLocaleDateString();
    const lengthInfo = summary.lengthType === "percentage"
      ? `${summary.lengthValue}% of original`
      : `${summary.lengthType} summary`;
    
    // This is a template that could be used with a PDF generation library
    return `
Title: ${title}
Date: ${date}
Summary Type: ${lengthInfo}

${summary.summaryText}

Generated by Study Scribe
    `;
  }
}

export const urlService = new UrlService();
