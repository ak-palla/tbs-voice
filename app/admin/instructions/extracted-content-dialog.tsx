"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Calendar, FileIcon } from "lucide-react";
import { format } from "date-fns";

interface ExtractedContentDialogProps {
  instruction: {
    id: string;
    extraction_metadata: {
      extracted_text: string;
      file_name: string;
      file_size?: number;
      extraction_date: string;
    };
  };
}

export function ExtractedContentDialog({ instruction }: ExtractedContentDialogProps) {
  const { extraction_metadata } = instruction;
  
  // Format the date if available
  const formattedDate = extraction_metadata.extraction_date ? 
    format(new Date(extraction_metadata.extraction_date), 'MMM d, yyyy') : 
    'Unknown date';
    
  // Format file size if available 
  const formattedSize = extraction_metadata.file_size ? 
    formatFileSize(extraction_metadata.file_size) : 
    'Unknown size';
    
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
          <FileText className="h-3.5 w-3.5 mr-1.5" />
          Content
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Extracted Content</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6 bg-muted/20 p-3 rounded-md text-sm">
            <div className="flex items-center gap-2">
              <FileIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">File:</span>
              <span className="font-medium">{extraction_metadata.file_name}</span>
            </div>
            {extraction_metadata.extraction_date && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Extracted:</span>
                <span>{formattedDate}</span>
              </div>
            )}
            {extraction_metadata.file_size && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Size:</span>
                <span>{formattedSize}</span>
              </div>
            )}
          </div>
          <ScrollArea className="h-[60vh] border rounded-md">
            <pre className="text-sm whitespace-pre-wrap p-4 font-mono">
              {extraction_metadata.extracted_text}
            </pre>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
} 