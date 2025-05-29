
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
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          File Metadata
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{metadata.type}</Badge>
              <span className="text-sm text-muted-foreground">
                {formatFileSize(metadata.size)}
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4" />
              <span className="text-muted-foreground">Modified:</span>
              <span>{formatDate(metadata.lastModified)}</span>
            </div>

            {metadata.encoding && (
              <div className="flex items-center gap-2 text-sm">
                <Hash className="h-4 w-4" />
                <span className="text-muted-foreground">Encoding:</span>
                <span>{metadata.encoding}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            {metadata.wordCount && (
              <div className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4" />
                <span className="text-muted-foreground">Words:</span>
                <span>{metadata.wordCount.toLocaleString()}</span>
              </div>
            )}

            {metadata.characterCount && (
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4" />
                <span className="text-muted-foreground">Characters:</span>
                <span>{metadata.characterCount.toLocaleString()}</span>
              </div>
            )}

            {metadata.lineCount && (
              <div className="flex items-center gap-2 text-sm">
                <Hash className="h-4 w-4" />
                <span className="text-muted-foreground">Lines:</span>
                <span>{metadata.lineCount.toLocaleString()}</span>
              </div>
            )}

            {metadata.readingTime && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4" />
                <span className="text-muted-foreground">Reading time:</span>
                <span>{metadata.readingTime} min</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
