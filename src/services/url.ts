
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
  async fetchContentFromUrl(url: string): Promise<string> {
    try {
      console.log(`Fetching content from: ${url}`);
      
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
          
          const mockContent = this.generateMockContent(domain, url);
          resolve(mockContent);
        }, 2000);
      });
    } catch (error) {
      console.error("Error fetching URL content:", error);
      throw new Error("Failed to fetch content from the URL");
    }
  }
  
  // Generate mock content based on the domain and URL
  private generateMockContent(domain: string, url: string): string {
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
    
    // Generate mock article content based on topic
    return `# ${capitalizedTitle}

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
}

export const urlService = new UrlService();
