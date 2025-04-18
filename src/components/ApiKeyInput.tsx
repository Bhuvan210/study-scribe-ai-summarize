
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { geminiService } from '@/services/gemini';
import { Key, Sparkles } from 'lucide-react';
import { Label } from '@/components/ui/label';

export function ApiKeyInput() {
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem('gemini_api_key') || '';
  });
  const [isVisible, setIsVisible] = useState(false);
  const { toast } = useToast();

  const handleSaveApiKey = () => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter a valid Gemini API key",
        variant: "destructive",
      });
      return;
    }

    geminiService.setApiKey(apiKey);
    
    toast({
      title: "API Key Saved",
      description: "Your Gemini API key has been saved successfully",
    });
  };

  return (
    <div className="space-y-4 glass p-6 rounded-lg relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
      
      <div className="relative">
        <div className="flex items-center gap-2 text-primary">
          <Key className="h-5 w-5" />
          <h3 className="text-lg font-medium flex items-center gap-2">
            Gemini Flash 2.0 API Key
            <Sparkles className="h-4 w-4 text-yellow-500" />
          </h3>
        </div>
        
        <p className="text-sm text-muted-foreground mt-2">
          Enter your Gemini Flash 2.0 API key to use the full capabilities of the summarizer.
        </p>
        
        <div className="space-y-2 mt-4">
          <Label htmlFor="api-key" className="text-foreground">API Key</Label>
          <div className="relative">
            <Input
              id="api-key"
              type={isVisible ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Gemini Flash 2.0 API key"
              className="pr-20 bg-background/50 border-primary/20 focus:border-primary"
            />
            <button
              type="button"
              onClick={() => setIsVisible(!isVisible)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              {isVisible ? "Hide" : "Show"}
            </button>
          </div>
        </div>
        
        <Button 
          onClick={handleSaveApiKey} 
          className="w-full mt-4 bg-primary/90 hover:bg-primary neon-glow"
        >
          <Key className="w-4 h-4 mr-2" />
          Save API Key
        </Button>
        
        <p className="text-xs text-muted-foreground mt-4">
          Your API key is stored locally and never sent to our servers.
        </p>
      </div>
    </div>
  );
}
