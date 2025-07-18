"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { FileText, Loader2, Trash, Edit2, Save, X, ExternalLink } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";

interface Instruction {
  id: string;
  title: string;
  content: string;
  content_type: string;
  url?: string | null;
  is_active: boolean;
  priority: number;
  category?: string | null;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  extraction_metadata?: {
    extracted_text?: string;
    file_name?: string;
    file_size?: number;
    extraction_date?: string;
    loom_metadata?: {
      thumbnailUrl?: string;
      views?: number;
      createdAt?: string;
      owner?: string;
      duration_formatted?: string;
    };
  } | null;
}

interface InstructionFormProps {
  instruction?: Instruction;
}

export function InstructionForm({ instruction }: InstructionFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(instruction?.title || "");
  const [content, setContent] = useState(instruction?.content || "");
  const [contentType, setContentType] = useState(instruction?.content_type || "text");
  const [category, setCategory] = useState(instruction?.category || "uncategorized");
  const [url, setUrl] = useState(instruction?.url || "");
  const [isActive, setIsActive] = useState(instruction?.is_active ?? true);
  const [priority, setPriority] = useState(instruction?.priority || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedContent, setExtractedContent] = useState<{
    extracted_text: string;
    file_name: string;
    file_size?: number;
    extraction_date: string;
    loom_metadata?: {
      thumbnailUrl?: string;
      views?: number;
      createdAt?: string;
      owner?: string;
      duration_formatted?: string;
    };
  } | null>(instruction?.extraction_metadata ? {
    extracted_text: instruction.extraction_metadata.extracted_text || '',
    file_name: instruction.extraction_metadata.file_name || '',
    file_size: instruction.extraction_metadata.file_size,
    extraction_date: instruction.extraction_metadata.extraction_date || new Date().toISOString(),
    loom_metadata: (instruction.extraction_metadata as any).loom_metadata
  } : null);
  const [isEditingExtractedContent, setIsEditingExtractedContent] = useState(false);
  const [editedExtractedContent, setEditedExtractedContent] = useState("");
  
  const supabase = createClient();
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (contentType === 'pdf' && file.type !== 'application/pdf') {
      toast.error('Please select a PDF file');
      return;
    }

    if (contentType === 'doc' && !file.type.includes('document')) {
      toast.error('Please select a document file');
      return;
    }

    setSelectedFile(file);
    
    try {
      setIsProcessing(true);
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`/api/extract/${contentType}`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to extract content');
      }
      
      const data = await response.json();
      
      setExtractedContent({
        extracted_text: data.content,
        file_name: file.name,
        file_size: file.size,
        extraction_date: new Date().toISOString()
      });
      
      toast.success('Content extracted successfully');
    } catch (error) {
      console.error('Error extracting content:', error);
      toast.error('Failed to extract content from file');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExtractContent = async (url: string) => {
    if (!url) return;
    
    try {
      setIsProcessing(true);
      
      const response = await fetch(`/api/extract/${contentType}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to extract content and parse error response' }));
        throw new Error(errorData.error || 'Failed to extract content');
      }
      
      const data = await response.json();
      
      setExtractedContent({
        extracted_text: data.content,
        file_name: data.fileName || url.split('/').pop() || 'unknown',
        extraction_date: data.extractionDate || new Date().toISOString()
      });
      
      toast.success("Content extracted successfully");
    } catch (error) {
      console.error("Error extracting content:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to extract content from resource";
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleSubmit = async () => {
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
      
      let finalExtractedContent = extractedContent;
      
      // If it's a PDF URL and we don't have extracted content yet, extract it first
      if (contentType === 'pdf' && url && !extractedContent) {
        try {
          setIsProcessing(true);
          const response = await fetch('/api/extract/pdf', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url }),
          });
          
          if (!response.ok) {
            throw new Error('Failed to extract content');
          }
          
          const data = await response.json();
          finalExtractedContent = {
            extracted_text: data.content,
            file_name: url.split('/').pop() || 'unknown',
            extraction_date: new Date().toISOString()
          };
          setExtractedContent(finalExtractedContent);
        } catch (error) {
          console.error('Error extracting content:', error);
          toast.error('Failed to extract content from URL');
          setIsSubmitting(false);
          setIsProcessing(false);
          return;
        } finally {
          setIsProcessing(false);
        }
      }
      
      // If it's a Loom video URL and we don't have extracted content yet, extract it first
      if (contentType === 'loom' && url && !extractedContent) {
        try {
          setIsProcessing(true);
          const response = await fetch('/api/extract/loom', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url }),
          });
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Failed to extract content' }));
            console.error('Loom extraction error:', errorData);
            throw new Error(errorData.error || errorData.details || 'Failed to extract content');
          }
          
          const data = await response.json();
          
          // Log the data structure for debugging
          console.log('Loom extraction response:', data);
          
          // Check if we got meaningful content
          if (!data.content || data.content === 'No transcript available') {
            toast.warning('No transcript was found in the Loom video. You may need to add content manually.');
          }
          
          finalExtractedContent = {
            extracted_text: data.content || 'No transcript available',
            file_name: data.title || url.split('/').pop() || 'unknown',
            file_size: data.duration ? Math.floor(data.duration) : undefined,
            extraction_date: new Date().toISOString(),
            ...(data.thumbnailUrl || data.views || data.createdAt || data.owner ? {
              loom_metadata: {
                thumbnailUrl: data.thumbnailUrl,
                views: data.views,
                createdAt: data.createdAt,
                owner: data.owner,
                duration_formatted: data.duration ? `${Math.floor(data.duration / 60)}:${(Math.floor(data.duration) % 60).toString().padStart(2, '0')} minutes` : undefined
              }
            } : {})
          } as any; // Type assertion to avoid TypeScript errors
          
          // If there's a title from the API, use it for the instruction title if empty
          if (data.title && !title.trim()) {
            setTitle(data.title);
          }
          
          setExtractedContent(finalExtractedContent);
          toast.success('Loom video processed successfully');
        } catch (error) {
          console.error('Error extracting content:', error);
          toast.error(error instanceof Error ? error.message : 'Failed to extract content from Loom video');
          setIsSubmitting(false);
          setIsProcessing(false);
          return;
        } finally {
          setIsProcessing(false);
        }
      }
      
      const instructionData = {
        title: title.trim(),
        content: content.trim(),
        content_type: contentType,
        url: url.trim() || null,
        is_active: isActive,
        priority: priority,
        category: category,
        extraction_metadata: finalExtractedContent || null,
        embedding: null,
        embedding_updated_at: null
      };
      
      console.log('Saving instruction data:', instructionData);
      
      let savedInstruction;
      
      if (instruction) {
        const { data, error } = await supabase
          .from("chatbot_instructions")
          .update(instructionData)
          .eq("id", instruction.id)
          .select()
          .single();
        
        if (error) {
          console.error('Update error:', error);
          throw error;
        }
        savedInstruction = data;
        console.log('Update successful:', data);
        toast.success("Instruction updated successfully");
      } else {
        const { data, error } = await supabase
          .from("chatbot_instructions")
          .insert(instructionData)
          .select()
          .single();
        
        if (error) {
          console.error('Insert error:', error);
          throw error;
        }
        savedInstruction = data;
        console.log('Insert successful:', data);
        toast.success("Instruction added successfully");
      }

      if (savedInstruction) {
        try {
          setIsProcessing(true);
          // Call the Edge Function endpoint to trigger embedding
          const response = await fetch(
            'https://npeajhtemjbcpnhsqknf.supabase.co/functions/v1/process-embeddings',
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ manual: true }),
            }
          );
          if (!response.ok) {
            const error = await response.json();
            console.error('Error triggering embedding function:', error);
            toast.warning('Instruction saved but embedding generation may be delayed');
          } else {
            toast.success('Embedding generation triggered successfully');
          }
        } catch (error) {
          console.error('Error triggering embedding function:', error);
          toast.warning('Instruction saved but embedding generation may be delayed');
        } finally {
          setIsProcessing(false);
        }
      }
      
      router.push('/admin/instructions');
      router.refresh();
    } catch (error) {
      console.error("Error saving instruction:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save instruction");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = async () => {
    if (!instruction) return;
    
    try {
      setIsSubmitting(true);
      const { error } = await supabase
        .from("chatbot_instructions")
        .delete()
        .eq("id", instruction.id);
      
      if (error) throw error;
      
      toast.success("Instruction deleted successfully");
      router.push('/admin/instructions');
      router.refresh();
    } catch (error) {
      console.error("Error deleting instruction:", error);
      toast.error("Failed to delete instruction");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const needsUrl = contentType !== "text";
  
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Card className="shadow-sm border-neutral-200">
        <CardHeader className="pb-1">
          {/* <CardTitle className="text-2xl font-semibold">
            {instruction ? 'Edit Instruction' : 'Create New Instruction'}
          </CardTitle> */}
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Basic Information */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter title"
                  className="h-10"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="content-type" className="text-sm font-medium">Content Type</Label>
                <Select value={contentType} onValueChange={setContentType}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="doc">Document</SelectItem>
                    <SelectItem value="link">Link</SelectItem>
                    <SelectItem value="loom">Loom Video</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="uncategorized">Uncategorized</SelectItem>
                  <SelectItem value="innovation_instruction">Innovation Instructions</SelectItem>
                  <SelectItem value="course_videos">Course Videos</SelectItem>
                  <SelectItem value="main_chat_instructions">Main Chat Instructions</SelectItem>
                  <SelectItem value="global_instructions">Global Instructions</SelectItem>
                  <SelectItem value="product_features">Product Features</SelectItem>
                  <SelectItem value="faq_content">FAQ Content</SelectItem>
                  <SelectItem value="internal_knowledge_base">Internal Knowledge Base</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Priority Level</Label>
              <div className="pt-2">
                <RadioGroup
                  value={priority.toString()}
                  onValueChange={(value) => setPriority(parseInt(value))}
                  className="flex space-x-2"
                >
                  <div className="flex-1">
                    <RadioGroupItem value="0" id="priority-0" className="peer sr-only" />
                    <Label
                      htmlFor="priority-0"
                      className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-background p-3 hover:bg-gray-50 peer-data-[state=checked]:border-gray-400 peer-data-[state=checked]:bg-gray-50 cursor-pointer transition-all h-full"
                    >
                      <span className="font-medium">Normal</span>
                      <span className="text-xs text-muted-foreground">Priority 0</span>
                    </Label>
                  </div>
                  <div className="flex-1">
                    <RadioGroupItem value="1" id="priority-1" className="peer sr-only" />
                    <Label
                      htmlFor="priority-1"
                      className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-background p-3 hover:bg-blue-50 peer-data-[state=checked]:border-blue-400 peer-data-[state=checked]:bg-blue-50 cursor-pointer transition-all h-full"
                    >
                      <span className="font-medium">High</span>
                      <span className="text-xs text-muted-foreground">Priority 1</span>
                    </Label>
                  </div>
                  <div className="flex-1">
                    <RadioGroupItem value="2" id="priority-2" className="peer sr-only" />
                    <Label
                      htmlFor="priority-2"
                      className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-background p-3 hover:bg-orange-50 peer-data-[state=checked]:border-orange-400 peer-data-[state=checked]:bg-orange-50 cursor-pointer transition-all h-full"
                    >
                      <span className="font-medium">Very High</span>
                      <span className="text-xs text-muted-foreground">Priority 2</span>
                    </Label>
                  </div>
                  <div className="flex-1">
                    <RadioGroupItem value="3" id="priority-3" className="peer sr-only" />
                    <Label
                      htmlFor="priority-3"
                      className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-background p-3 hover:bg-red-50 peer-data-[state=checked]:border-red-400 peer-data-[state=checked]:bg-red-50 cursor-pointer transition-all h-full"
                    >
                      <span className="font-medium">Critical</span>
                      <span className="text-xs text-muted-foreground">Priority 3</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is-active"
                checked={isActive}
                onCheckedChange={setIsActive}
                className="bg-blue-600"
              />
              <Label htmlFor="is-active" className="font-medium">Active</Label>
            </div>
          </div>

          {/* Source Section */}
          {contentType !== "text" && (
            <div className="space-y-4 rounded-lg border p-4 bg-gray-50">
              <h3 className="text-sm font-medium">Source Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="url" className="text-sm">URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Enter resource URL"
                    className="h-10"
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => handleExtractContent(url)}
                    disabled={!url || isProcessing}
                    className="whitespace-nowrap"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Extracting
                      </>
                    ) : (
                      <>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Extract
                      </>
                    )}
                  </Button>
                </div>
                {contentType === 'pdf' && !extractedContent && (
                  <p className="text-xs text-muted-foreground">
                    Content will be automatically extracted when saving
                  </p>
                )}
              </div>

              {(contentType === 'pdf' || contentType === 'doc') && (
                <div className="space-y-2">
                  <Label htmlFor="file" className="text-sm">Upload File</Label>
                  <Input
                    id="file"
                    type="file"
                    accept={contentType === 'pdf' ? '.pdf' : '.doc,.docx,.odt'}
                    onChange={handleFileChange}
                    className="h-10"
                  />
                  <p className="text-xs text-muted-foreground">
                    Upload a file to extract content automatically
                  </p>
                </div>
              )}

              {contentType === 'loom' && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">
                    Enter a Loom video URL and click Extract to retrieve the video transcription
                  </p>
                  <p className="text-xs font-medium text-blue-600">
                    Example: https://www.loom.com/share/12345abcde
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Content Section */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="content" className="text-sm font-medium">Content</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter instruction content"
                rows={4}
                className="font-mono text-sm"
              />
            </div>
          </div>

          {/* Extracted Content Section */}
          {extractedContent && (
            <div className="space-y-2 rounded-lg border p-4 bg-gray-50">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Extracted Content</h3>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8">
                      <FileText className="h-4 w-4 mr-2" />
                      View Full Content
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl">
                    <DialogHeader>
                      <div className="flex items-center justify-between">
                        <DialogTitle>Extracted Content</DialogTitle>
                        {!isEditingExtractedContent ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditedExtractedContent(extractedContent.extracted_text);
                              setIsEditingExtractedContent(true);
                            }}
                          >
                            <Edit2 className="h-4 w-4 mr-2" />
                            Edit Content
                          </Button>
                        ) : (
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditedExtractedContent(extractedContent.extracted_text);
                                setIsEditingExtractedContent(false);
                              }}
                            >
                              <X className="h-4 w-4 mr-2" />
                              Cancel
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={async () => {
                                try {
                                  setIsSubmitting(true);
                                  const updatedExtractedContent = {
                                    ...extractedContent,
                                    extracted_text: editedExtractedContent
                                  };

                                  const { error } = await supabase
                                    .from("chatbot_instructions")
                                    .update({
                                      extraction_metadata: updatedExtractedContent
                                    })
                                    .eq("id", instruction?.id);

                                  if (error) throw error;

                                  setExtractedContent(updatedExtractedContent);
                                  setIsEditingExtractedContent(false);
                                  toast.success("Extracted content updated successfully");
                                  router.refresh();
                                } catch (error) {
                                  console.error("Error updating extracted content:", error);
                                  toast.error("Failed to update extracted content");
                                } finally {
                                  setIsSubmitting(false);
                                }
                              }}
                              disabled={isSubmitting}
                            >
                              {isSubmitting ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <Save className="h-4 w-4 mr-2 bg-blue-600 text-white hover:bg-blue-700" />
                              )}
                              Save Changes
                            </Button>
                          </div>
                        )}
                      </div>
                    </DialogHeader>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Extracted from: {extractedContent.file_name}
                      </p>
                      <ScrollArea className="h-[60vh]">
                        {isEditingExtractedContent ? (
                          <Textarea
                            value={editedExtractedContent}
                            onChange={(e) => setEditedExtractedContent(e.target.value)}
                            className="min-h-[60vh] font-mono text-sm"
                          />
                        ) : (
                          <pre className="text-sm whitespace-pre-wrap p-4">
                            {extractedContent.extracted_text}
                          </pre>
                        )}
                      </ScrollArea>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <p className="text-sm text-muted-foreground truncate">
                Source: {extractedContent.file_name}
              </p>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {extractedContent.extracted_text.substring(0, 150)}...
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between pt-4 border-t">
            {instruction && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="h-9">
                    <Trash className="h-4 w-4 mr-2" />
                    Delete Instruction
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the instruction.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <div className="flex gap-3 ml-auto">
              <Button 
                variant="outline" 
                onClick={() => router.push('/admin/instructions')} 
                className="h-10"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting || isProcessing} 
                className="h-10 px-5 bg-blue-600 text-white hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {isProcessing ? "Processing..." : "Saving..."}
                  </>
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 