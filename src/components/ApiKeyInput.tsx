
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { geminiService } from '@/services/gemini';
import { Key } from 'lucide-react';
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
    <div className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-md">
      <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
        <Key size={20} />
        <h3 className="text-lg font-medium">Gemini Flash 2.0 API Key</h3>
      </div>
      
      <p className="text-sm text-gray-600 dark:text-gray-300">
        Enter your Gemini Flash 2.0 API key to use the full capabilities of the summarizer.
      </p>
      
      <div className="space-y-2">
        <Label htmlFor="api-key">API Key</Label>
        <div className="relative">
          <Input
            id="api-key"
            type={isVisible ? "text" : "password"}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your Gemini Flash 2.0 API key"
            className="pr-20"
          />
          <button
            type="button"
            onClick={() => setIsVisible(!isVisible)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
          >
            {isVisible ? "Hide" : "Show"}
          </button>
        </div>
      </div>
      
      <Button onClick={handleSaveApiKey} className="w-full">
        Save API Key
      </Button>
      
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Your API key is stored locally and never sent to our servers.
      </p>
    </div>
  );
}
