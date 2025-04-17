
import { Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  return (
    <Button 
      variant="outline" 
      size="icon" 
      className="relative overflow-hidden border-2 border-gray-200 hover:border-indigo-300 transition-all"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-purple-50 opacity-0 hover:opacity-100 transition-opacity"></div>
      <Sun className="h-[1.2rem] w-[1.2rem] text-indigo-600" />
      <span className="sr-only">Light mode</span>
    </Button>
  );
}
