
import { useToast } from "@/components/ui/use-toast";

// Interface definitions
export interface NotionPage {
  id: string;
  title: string;
  icon?: string;
  lastEdited: string;
}

export interface NotionWorkspace {
  id: string;
  name: string;
  pages: NotionPage[];
}

// Mock Notion service for frontend demonstration
class NotionService {
  private isConnected: boolean = false;
  private mockPages: NotionPage[] = [
    {
      id: "page1",
      title: "Project Research Notes",
      lastEdited: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString() // 2 days ago
    },
    {
      id: "page2",
      title: "Meeting Minutes",
      lastEdited: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() // 5 hours ago
    },
    {
      id: "page3",
      title: "Product Roadmap",
      lastEdited: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString() // 7 days ago
    },
    {
      id: "page4",
      title: "Weekly Status Update",
      lastEdited: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 minutes ago
    }
  ];
  
  private mockWorkspace: NotionWorkspace = {
    id: "workspace1",
    name: "Personal Workspace",
    pages: this.mockPages
  };

  constructor() {
    // Check if we have stored connection state
    this.isConnected = localStorage.getItem('notion_connected') === 'true';
  }
  
  connect(): Promise<boolean> {
    return new Promise((resolve) => {
      // Simulate API call delay
      setTimeout(() => {
        this.isConnected = true;
        localStorage.setItem('notion_connected', 'true');
        resolve(true);
      }, 1500);
    });
  }
  
  disconnect(): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.isConnected = false;
        localStorage.setItem('notion_connected', 'false');
        resolve(true);
      }, 800);
    });
  }
  
  isAuthenticated(): boolean {
    return this.isConnected;
  }
  
  getWorkspaces(): Promise<NotionWorkspace[]> {
    return new Promise((resolve, reject) => {
      if (!this.isConnected) {
        reject(new Error("Not authenticated with Notion"));
        return;
      }
      
      setTimeout(() => {
        resolve([this.mockWorkspace]);
      }, 1000);
    });
  }
  
  getPages(): Promise<NotionPage[]> {
    return new Promise((resolve, reject) => {
      if (!this.isConnected) {
        reject(new Error("Not authenticated with Notion"));
        return;
      }
      
      setTimeout(() => {
        resolve(this.mockPages);
      }, 1000);
    });
  }
  
  getPageContent(pageId: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.isConnected) {
        reject(new Error("Not authenticated with Notion"));
        return;
      }
      
      // Find the requested page
      const page = this.mockPages.find(p => p.id === pageId);
      if (!page) {
        reject(new Error("Page not found"));
        return;
      }
      
      setTimeout(() => {
        // Generate some mock content based on the page title
        let content = '';
        
        if (page.title.includes("Research")) {
          content = `# ${page.title}\n\n## Introduction\nThis document contains our research findings for the project. The research was conducted over a period of 4 weeks and involved interviews with 20 participants.\n\n## Key Findings\n1. Users prefer simplicity over features\n2. Mobile experience is critical for adoption\n3. Performance is a major concern\n4. Integration with existing tools is highly desired\n\n## Recommendations\nBased on our research, we recommend focusing on improving the mobile experience and performance before adding new features.`;
        } else if (page.title.includes("Meeting")) {
          content = `# ${page.title}\n\n## Attendees\n- Sarah Johnson\n- Michael Lee\n- David Williams\n- Emma Brown\n\n## Agenda\n1. Project status update\n2. Timeline review\n3. Budget discussion\n4. Next steps\n\n## Action Items\n- Sarah to prepare the presentation for stakeholders\n- Michael to coordinate with the development team\n- David to review the budget proposal\n- Emma to update the project documentation`;
        } else if (page.title.includes("Roadmap")) {
          content = `# ${page.title}\n\n## Q1 Goals\n- Launch MVP\n- Acquire first 100 users\n- Collect initial feedback\n\n## Q2 Goals\n- Implement key features based on user feedback\n- Optimize onboarding process\n- Increase user base to 500\n\n## Q3 Goals\n- Add enterprise features\n- Implement analytics dashboard\n- Begin monetization strategy\n\n## Q4 Goals\n- Scale infrastructure\n- Launch mobile app\n- Reach 1000 active users`;
        } else if (page.title.includes("Status")) {
          content = `# ${page.title}\n\n## Accomplishments\n- Completed feature X implementation\n- Fixed 15 high-priority bugs\n- Improved load time by 30%\n\n## Challenges\n- Integration with third-party API is taking longer than expected\n- Performance issues on older devices\n\n## Next Week's Focus\n- Complete the remaining integration work\n- Begin work on the reporting feature\n- Conduct usability testing`;
        } else {
          content = `# ${page.title}\n\nThis is a sample document with some placeholder content. It contains various sections and paragraphs that demonstrate how a typical document might be structured.\n\n## Section 1\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl.\n\n## Section 2\nSed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.`;
        }
        
        resolve(content);
      }, 1500);
    });
  }
}

export const notionService = new NotionService();
