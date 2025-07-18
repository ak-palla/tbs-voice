"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Trash, Plus, Edit, Loader2, Download, ExternalLink, FileText } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import React from "react";

interface Instruction {
  id: string;
  title: string;
  content: string;
  content_type: string;
  url?: string | null;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  extraction_metadata?: {
    extracted_text?: string;
    file_name?: string;
    file_size?: number;
    extraction_date?: string;
  } | null;
}

export default function InstructionsClientContent({
  initialInstructions,
}: {
  initialInstructions: Instruction[];
}) {
  const [instructions, setInstructions] = useState<Instruction[]>(initialInstructions);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessing, setIsProcessing] = useState<Record<string, boolean>>({});
  const [extractedContents, setExtractedContents] = useState<Record<string, {
    extracted_text: string;
    file_name: string;
    file_size?: number;
    extraction_date: string;
  }>>({});
  
  // Form states
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [contentType, setContentType] = useState("text");
  const [url, setUrl] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const supabase = createClient();
  
  const resetForm = () => {
    setTitle("");
    setContent("");
    setContentType("text");
    setUrl("");
    setSelectedFile(null);
    setEditingId(null);
    setIsAdding(false);
  };
  
  const handleStartEdit = (instruction: Instruction) => {
    setEditingId(instruction.id);
    setTitle(instruction.title);
    setContent(instruction.content);
    setContentType(instruction.content_type);
    setUrl(instruction.url || "");
  };
  
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this instruction?")) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      const { error } = await supabase
        .from("chatbot_instructions")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      
      setInstructions(instructions.filter(i => i.id !== id));
      toast.success("Instruction deleted successfully");
    } catch (error) {
      console.error("Error deleting instruction:", error);
      toast.error("Failed to delete instruction");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.endsWith('.docx')) {
      toast.error('Please select a PDF or DOCX file');
      return;
    }

    setSelectedFile(file);
    setContentType(file.name.endsWith('.docx') ? 'document' : 'pdf');
    
    try {
      setIsProcessing(prev => ({ ...prev, 'new': true }));
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`/api/extract/${file.name.endsWith('.docx') ? 'document' : 'pdf'}`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to extract content');
      }
      
      const data = await response.json();
      
      // Store extraction metadata
      setExtractedContents(prev => ({
        ...prev,
        'new': {
          extracted_text: data.content,
          file_name: file.name,
          file_size: file.size,
          extraction_date: new Date().toISOString()
        }
      }));
      
      toast.success('Content extracted successfully');
    } catch (error) {
      console.error('Error extracting content:', error);
      toast.error('Failed to extract content from file');
    } finally {
      setIsProcessing(prev => ({ ...prev, 'new': false }));
    }
  };
  
  const handleExtractContent = async (url: string, type: string, id?: string) => {
    if (!url) return;
    
    try {
      const targetId = id || 'new';
      setIsProcessing(prev => ({ ...prev, [targetId]: true }));
      setIsExtracting(true);
      
      let apiEndpoint = '';
      let requestBody: any = { url };

      switch (type) {
        case 'pdf':
          apiEndpoint = '/api/extract/pdf';
          break;
        case 'document':
        case 'doc':
          apiEndpoint = '/api/extract/document';
          break;
        default:
          console.warn(`Extraction not yet implemented for type: ${type}`);
          toast.warning(`Extraction not yet implemented for type: ${type}`);
          setIsProcessing(prev => ({ ...prev, [targetId]: false }));
          setIsExtracting(false);
          return;
      }
      
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to extract content and parse error response' }));
        throw new Error(errorData.error || 'Failed to extract content');
      }
      
      const data = await response.json();
      
      if (id) {
        setExtractedContents(prev => ({
          ...prev,
          [id]: {
            extracted_text: data.content,
            file_name: url.split('/').pop() || 'unknown',
            extraction_date: new Date().toISOString()
          }
        }));
        toast.success("Content extracted successfully");
      } else {
        setExtractedContents(prev => ({
          ...prev,
          'new': {
            extracted_text: data.content,
            file_name: url.split('/').pop() || 'unknown',
            extraction_date: new Date().toISOString()
          }
        }));
        toast.success("Content extracted successfully");
      }
    } catch (error) {
      console.error("Error extracting content:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to extract content from resource";
      toast.error(errorMessage);
    } finally {
      const targetId = id || 'new';
      setIsProcessing(prev => ({ ...prev, [targetId]: false }));
      setIsExtracting(false);
    }
  };
  
  const handleAddOrUpdate = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required");
      return;
    }
    
    if ((contentType !== "text") && !url.trim() && !selectedFile) {
      toast.error("URL or file is required for non-text content types");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const instructionData = {
        title,
        content,
        content_type: contentType,
        url: url.trim() || null,
        extraction_metadata: extractedContents[editingId || 'new'] || null
      };
      
      if (editingId) {
        const { data, error } = await supabase
          .from("chatbot_instructions")
          .update(instructionData)
          .eq("id", editingId)
          .select()
          .single();
        
        if (error) throw error;
        
        setInstructions(
          instructions.map(i => (i.id === editingId ? data : i))
        );
        toast.success("Instruction updated successfully");
      } else {
        const { data, error } = await supabase
          .from("chatbot_instructions")
          .insert(instructionData)
          .select()
          .single();
        
        if (error) throw error;
        
        setInstructions([data, ...instructions]);
        toast.success("Instruction added successfully");
      }
      
      resetForm();
    } catch (error) {
      console.error("Error saving instruction:", error);
      toast.error("Failed to save instruction");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const needsUrl = contentType !== "text";
  
  return (
    <div className="space-y-4">
      <Button 
        onClick={() => {
          resetForm();
          setIsAdding(true);
        }}
        size="sm"
        className="mb-2"
      >
        <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Instruction
      </Button>
      
      {isAdding && (
        <Card className="mb-4 ">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-base">Add New Instruction</CardTitle>
          </CardHeader>
          <CardContent className="py-3 px-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="title" className="text-xs mb-1 block">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                  placeholder="Enter title"
                  className="h-8 text-sm"
                />
              </div>
              
              <div>
                <Label htmlFor="content-type" className="text-xs mb-1 block">Content Type</Label>
                <Select value={contentType} onValueChange={setContentType}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="doc">Document</SelectItem>
                    <SelectItem value="link">Link</SelectItem>

                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {needsUrl && (
              <div className="space-y-2">
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Label htmlFor="url" className="text-xs mb-1 block">URL</Label>
                    <Input
                      id="url"
                      value={url}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)}
                      placeholder="Enter resource URL"
                      className="h-8 text-sm"
                    />
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleExtractContent(url, contentType)}
                    disabled={!url || isProcessing['new']}
                    className="h-8"
                  >
                    {isProcessing['new'] ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Download className="h-3.5 w-3.5 mr-1" />}
                    Extract
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {contentType === 'document' ? 
                    "Enter Google Docs URL to extract content automatically" :
                    "Enter URL to extract content automatically on save"
                  }
                </p>
              </div>
            )}

            {contentType === 'pdf' && (
              <div className="space-y-2">
                <Label htmlFor="file" className="text-xs mb-1 block">Upload PDF File</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="h-8 text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Upload a PDF file to extract content automatically
                </p>
              </div>
            )}

            {contentType === 'document' && (
              <div className="space-y-2">
                <Label htmlFor="file" className="text-xs mb-1 block">Upload Document</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".docx"
                  onChange={handleFileChange}
                  className="h-8 text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Upload a DOCX file to extract content automatically
                </p>
              </div>
            )}
            
            <div>
              <Label htmlFor="content" className="text-xs mb-1 block">Content</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
                placeholder="Enter instruction content"
                rows={6}
                className="text-sm resize-none"
              />
            </div>

            {extractedContents['new'] && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Extracted Content</Label>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6">
                        <FileText className="h-3.5 w-3.5 mr-1" />
                        View Extracted Content
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                      <DialogHeader>
                        <DialogTitle>Extracted Content</DialogTitle>
                      </DialogHeader>
                      <ScrollArea className="h-[60vh]">
                        <pre className="text-sm whitespace-pre-wrap p-4">
                          {extractedContents['new'].extracted_text}
                        </pre>
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>
                </div>
                <p className="text-xs text-muted-foreground">
                  Content extracted from {selectedFile ? 'local file: ' : 'URL: '}{extractedContents['new'].file_name}
                </p>
              </div>
            )}
            
            <div className="flex justify-end gap-2 mt-2">
              <Button variant="outline" size="sm" onClick={resetForm}>Cancel</Button>
              <Button size="sm" onClick={handleAddOrUpdate} disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {editingId && (
        <Card className="mb-4 ">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-base">Edit Instruction</CardTitle>
          </CardHeader>
          <CardContent className="py-3 px-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="edit-title" className="text-xs mb-1 block">Title</Label>
                <Input
                  id="edit-title"
                  value={title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                  placeholder="Enter title"
                  className="h-8 text-sm"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-content-type" className="text-xs mb-1 block">Content Type</Label>
                <Select value={contentType} onValueChange={setContentType}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="doc">Document</SelectItem>
                    <SelectItem value="link">Link</SelectItem>

                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {needsUrl && (
              <div className="space-y-2">
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Label htmlFor="edit-url" className="text-xs mb-1 block">URL</Label>
                    <Input
                      id="edit-url"
                      value={url}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)}
                      placeholder="Enter resource URL"
                      className="h-8 text-sm"
                    />
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleExtractContent(url, contentType, editingId)}
                    disabled={!url || !editingId || isExtracting || isProcessing[editingId!]}
                    className="h-8"
                  >
                    {isProcessing[editingId!] ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Download className="h-3.5 w-3.5 mr-1" />}
                    Extract
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Click "Extract" to process the content from this resource
                </p>
              </div>
            )}
            
            <div>
              <Label htmlFor="edit-content" className="text-xs mb-1 block">Content</Label>
              <Textarea
                id="edit-content"
                value={content}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
                placeholder="Enter instruction content or extract from URL"
                rows={6}
                className="text-sm resize-none"
              />
            </div>
            
            <div className="flex justify-end gap-2 mt-2">
              <Button variant="outline" size="sm" onClick={resetForm}>Cancel</Button>
              <Button size="sm" onClick={handleAddOrUpdate} disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="grid gap-3">
        {instructions.length === 0 ? (
          <div className="text-center py-4 text-xs text-muted-foreground">
            No instructions found. Add one to get started.
          </div>
        ) : (
          instructions.map((instruction) => (
            <Card key={instruction.id} className={` ${editingId === instruction.id ? "border-primary" : "border-border"}`}>
              <div className="p-3">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-sm">{instruction.title}</h3>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleStartEdit(instruction)}>
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleDelete(instruction.id)}>
                      <Trash className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center text-xs text-muted-foreground mb-2 space-x-2">
                  <span className="bg-secondary px-1.5 py-0.5 rounded-sm">{instruction.content_type}</span>
                  {instruction.url && (
                    <div className="flex items-center gap-2">
                      <a href={instruction.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-xs flex items-center">
                        <ExternalLink className="h-3 w-3 mr-1" />View Source
                      </a>
                    </div>
                  )}
                </div>
                
                <ScrollArea className="h-24 overflow-y-auto border rounded-sm p-2 bg-muted/20">
                  <pre className="text-xs whitespace-pre-wrap">
                    {instruction.content}
                  </pre>
                </ScrollArea>

                {instruction.extraction_metadata && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <p>Extracted from {instruction.url ? 'URL: ' : 'local file: '}{instruction.extraction_metadata.file_name}</p>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-5">
                            <FileText className="h-3 w-3 mr-1" />
                            View Extracted Content
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                          <DialogHeader>
                            <DialogTitle>Extracted Content</DialogTitle>
                          </DialogHeader>
                          <ScrollArea className="h-[60vh]">
                            <pre className="text-sm whitespace-pre-wrap p-4">
                              {instruction.extraction_metadata.extracted_text}
                            </pre>
                          </ScrollArea>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <p>Extraction date: {instruction.extraction_metadata.extraction_date ? new Date(instruction.extraction_metadata.extraction_date).toLocaleString() : 'Unknown'}</p>
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
} 