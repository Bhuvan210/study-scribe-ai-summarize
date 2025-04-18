
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
      <Sun className={`h-[1.2rem] w-[1.2rem] text-yellow-500 transition-all ${theme === 'light' ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90'} absolute`} />
      <Moon className={`h-[1.2rem] w-[1.2rem] text-blue-400 transition-all ${theme === 'dark' ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'} absolute`} />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
