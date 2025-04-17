
import { ReactNode } from "react";
import { Navbar } from "./Navbar";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />
      <main className="flex-1 py-8">
        <div className="container">{children}</div>
      </main>
      <footer className="bg-white py-6 border-t border-gray-100 relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-600 to-purple-600"></div>
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center">
              <span className="text-indigo-600 font-bold">StudyScribe</span>
              <span className="text-sm text-gray-500 ml-2">
                © {new Date().getFullYear()} All rights reserved
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <a href="#" className="text-sm text-gray-500 hover:text-indigo-600 transition-colors">Terms</a>
              <a href="#" className="text-sm text-gray-500 hover:text-indigo-600 transition-colors">Privacy</a>
              <a href="#" className="text-sm text-gray-500 hover:text-indigo-600 transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
