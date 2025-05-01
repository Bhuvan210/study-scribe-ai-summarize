
import { useState } from "react";
import { Share, Link, Copy, Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SharingOptionsProps {
  summaryText: string;
  title?: string;
}

export function SharingOptions({ summaryText, title = "Text Summary" }: SharingOptionsProps) {
  const [isSharing, setIsSharing] = useState(false);
  const { toast } = useToast();

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(summaryText);
    toast({
      title: "Copied to clipboard",
      description: "Summary has been copied to your clipboard.",
    });
  };

  const handleShareUrl = () => {
    // In a real app, this would create a shareable link
    setIsSharing(true);
    setTimeout(() => {
      const dummyUrl = `https://studyscribe.app/s/${Math.random().toString(36).substring(2, 10)}`;
      navigator.clipboard.writeText(dummyUrl);
      toast({
        title: "Link created",
        description: "Shareable link has been copied to your clipboard.",
      });
      setIsSharing(false);
    }, 1500);
  };

  const handleShareEmail = () => {
    const subject = encodeURIComponent(title);
    const body = encodeURIComponent(summaryText);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(`${title}\n\n${summaryText.substring(0, 200)}...`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Share className="h-4 w-4" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Share Summary</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleCopyToClipboard}>
          <Copy className="h-4 w-4 mr-2" />
          Copy to clipboard
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleShareEmail}>
          <Mail className="h-4 w-4 mr-2" />
          Share via email
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleShareTwitter}>
          <svg 
            className="h-4 w-4 mr-2" 
            viewBox="0 0 24 24" 
            fill="currentColor"
          >
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          Share on Twitter
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleShareUrl} disabled={isSharing}>
          {isSharing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating link...
            </>
          ) : (
            <>
              <Link className="h-4 w-4 mr-2" />
              Create shareable link
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
