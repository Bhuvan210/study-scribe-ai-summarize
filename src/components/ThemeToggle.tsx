
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
      className="relative overflow-hidden glass glass-hover"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
      {theme === "light" ? (
        <Sun className="h-[1.2rem] w-[1.2rem] text-yellow-500 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      ) : (
        <Moon className="absolute h-[1.2rem] w-[1.2rem] text-primary rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
