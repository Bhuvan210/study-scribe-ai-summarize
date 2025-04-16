
import { ReactNode } from "react";
import { Navbar } from "./Navbar";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 py-8">
        <div className="container">{children}</div>
      </main>
      <footer className="border-t bg-white py-6">
        <div className="container">
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} StudyScribe. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
