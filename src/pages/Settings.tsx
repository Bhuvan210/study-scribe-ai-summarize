
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Type, Palette } from "lucide-react";

const FONT_OPTIONS = [
  { value: "system", label: "System Default", class: "font-sans" },
  { value: "inter", label: "Inter", class: "font-sans" },
  { value: "roboto", label: "Roboto", class: "font-roboto" },
  { value: "open-sans", label: "Open Sans", class: "font-open-sans" },
  { value: "lato", label: "Lato", class: "font-lato" },
  { value: "playfair", label: "Playfair Display", class: "font-playfair" },
  { value: "merriweather", label: "Merriweather", class: "font-merriweather" },
];

export default function Settings() {
  const { toast } = useToast();
  const [selectedFont, setSelectedFont] = useState(() => 
    localStorage.getItem("app-font") || "system"
  );
  const [fontSize, setFontSize] = useState(() => 
    parseInt(localStorage.getItem("app-font-size") || "16")
  );

  const applyFontSettings = () => {
    // Apply font family
    const fontOption = FONT_OPTIONS.find(f => f.value === selectedFont);
    if (fontOption) {
      // Remove existing font classes
      FONT_OPTIONS.forEach(f => {
        document.documentElement.classList.remove(f.class);
      });
      // Add selected font class
      if (selectedFont !== "system") {
        document.documentElement.classList.add(fontOption.class);
      }
    }

    // Apply font size
    document.documentElement.style.fontSize = `${fontSize}px`;
    
    // Save to localStorage
    localStorage.setItem("app-font", selectedFont);
    localStorage.setItem("app-font-size", fontSize.toString());
  };

  const handleSaveSettings = () => {
    applyFontSettings();
    toast({
      title: "Settings saved",
      description: "Your typography preferences have been updated",
    });
  };

  const handleResetSettings = () => {
    setSelectedFont("system");
    setFontSize(16);
    
    // Remove all font classes
    FONT_OPTIONS.forEach(f => {
      document.documentElement.classList.remove(f.class);
    });
    
    // Reset font size
    document.documentElement.style.fontSize = "16px";
    
    // Clear localStorage
    localStorage.removeItem("app-font");
    localStorage.removeItem("app-font-size");
    
    toast({
      title: "Settings reset",
      description: "Typography settings have been reset to defaults",
    });
  };

  const previewText = "The quick brown fox jumps over the lazy dog. This is a preview of how your text will look with the selected typography settings.";

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground dark:text-gray-400">
            Customize your application preferences
          </p>
        </div>

        <div className="grid gap-6">
          {/* Typography Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="h-5 w-5" />
                Typography
              </CardTitle>
              <CardDescription>
                Customize font family and size for better readability
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Font Family Selection */}
              <div className="space-y-2">
                <Label htmlFor="font-family">Font Family</Label>
                <Select value={selectedFont} onValueChange={setSelectedFont}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a font" />
                  </SelectTrigger>
                  <SelectContent>
                    {FONT_OPTIONS.map((font) => (
                      <SelectItem key={font.value} value={font.value}>
                        <span className={font.class}>{font.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Font Size Slider */}
              <div className="space-y-3">
                <Label htmlFor="font-size">
                  Font Size: {fontSize}px
                </Label>
                <Slider
                  value={[fontSize]}
                  onValueChange={(value) => setFontSize(value[0])}
                  max={24}
                  min={12}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>12px</span>
                  <span>18px</span>
                  <span>24px</span>
                </div>
              </div>

              {/* Preview */}
              <div className="space-y-2">
                <Label>Preview</Label>
                <div 
                  className={`p-4 border rounded-lg bg-muted/50 ${
                    FONT_OPTIONS.find(f => f.value === selectedFont)?.class || ""
                  }`}
                  style={{ fontSize: `${fontSize}px` }}
                >
                  {previewText}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button onClick={handleSaveSettings}>
                  Save Changes
                </Button>
                <Button variant="outline" onClick={handleResetSettings}>
                  Reset to Default
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Theme Settings Card (placeholder) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Appearance
              </CardTitle>
              <CardDescription>
                Theme and color preferences are managed in the top navigation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Use the theme toggle in the navigation bar to switch between light and dark modes.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
