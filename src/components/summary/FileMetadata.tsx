
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Calendar, User, Hash, Clock } from "lucide-react";

interface FileMetadataProps {
  metadata: {
    name: string;
    size: number;
    type: string;
    lastModified: number;
    wordCount?: number;
    characterCount?: number;
    lineCount?: number;
    readingTime?: number;
    language?: string;
    encoding?: string;
  };
}

export function FileMetadata({ metadata }: FileMetadataProps) {
  // Don't render the metadata component - return null to hide it
  return null;
}
