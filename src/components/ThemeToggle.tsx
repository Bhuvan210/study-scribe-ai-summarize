
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <Button 
      variant="outline" 
      size="icon" 
      onClick={toggleTheme}
      className="relative overflow-hidden border-2 border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-500 transition-all"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 opacity-0 hover:opacity-100 transition-opacity"></div>
      {theme === "light" ? (
        <Sun className="h-[1.2rem] w-[1.2rem] text-indigo-600 dark:text-indigo-400" />
      ) : (
        <Moon className="h-[1.2rem] w-[1.2rem] text-indigo-400" />
      )}
      <span className="sr-only">{theme === "light" ? "Dark mode" : "Light mode"}</span>
    </Button>
  );
}
