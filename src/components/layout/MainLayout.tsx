
import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { useTheme } from "@/contexts/ThemeContext";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { theme } = useTheme();
  
  return (
    <div className="min-h-screen cyber-grid">
      <div className="fixed inset-0 bg-gradient-to-br from-primary/20 via-background to-secondary/20 pointer-events-none" />
      <Navbar />
      <main className="relative flex-1 py-8">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
      <footer className="relative mt-auto">
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent pointer-events-none" />
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="glass rounded-lg p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <span className="text-primary font-bold">StudyScribe</span>
              <span className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} All rights reserved
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Terms
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Privacy
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
