'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Upload, 
  File, 
  FileText, 
  Trash2, 
  Eye, 
  Download, 
  X, 
  Search,
  Filter,
  Calendar,
  Paperclip,
  CheckCircle,
  AlertCircle,
  Loader2,
  Check
} from 'lucide-react';

interface InnovationDocument {
  id: string;
  title: string;
  file_name: string;
  file_type: string;
  file_size: number;
  upload_status: 'uploading' | 'processing' | 'completed' | 'error';
  created_at: string;
  updated_at: string;
  extracted_content?: string;
  file_url?: string;
  extraction_metadata?: any;
}

interface InnovationDocumentManagerProps {
  onDocumentSelect: (documents: InnovationDocument[]) => void;
  selectedDocumentIds?: string[];
  isOpen: boolean;
  onClose: () => void;
}

export function InnovationDocumentManager({ 
  onDocumentSelect, 
  selectedDocumentIds = [], 
  isOpen, 
  onClose 
}: InnovationDocumentManagerProps) {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<InnovationDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<InnovationDocument | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [localSelectedIds, setLocalSelectedIds] = useState<string[]>(selectedDocumentIds);
  const supabase = createClient();

  // Update local selected IDs when props change
  useEffect(() => {
    setLocalSelectedIds(selectedDocumentIds);
  }, [selectedDocumentIds]);

  // Fetch documents
  const fetchDocuments = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) return;

      const response = await fetch('/api/innovation-documents', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }

      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: "Error",
        description: "Failed to load documents",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [supabase, toast]);

  // Initial load
  useEffect(() => {
    if (isOpen) {
      fetchDocuments();
    }
  }, [isOpen, fetchDocuments]);

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/markdown'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload PDF, Word, or text documents only",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload files smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) return;

      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', file.name.replace(/\.[^/.]+$/, "")); // Remove extension

      const response = await fetch('/api/innovation-documents', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload document');
      }

      const data = await response.json();
      
      // Add the new document to the list
      setDocuments(prev => [data.document, ...prev]);
      
      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });

      // Reset file input
      event.target.value = '';
      
      // Refresh documents to get updated status
      setTimeout(() => {
        fetchDocuments();
      }, 1000);
      
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: "Error",
        description: "Failed to upload document",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Delete document
  const deleteDocument = async (documentId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) return;

      const response = await fetch('/api/innovation-documents', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ documentId })
      });

      if (!response.ok) {
        throw new Error('Failed to delete document');
      }

      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      
      // If this was the selected document, clear selection
      if (selectedDocumentIds.includes(documentId)) {
        onDocumentSelect([]);
      }

      toast({
        title: "Success",
        description: "Document deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive",
      });
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get file icon based on type
  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return <FileText className="h-5 w-5 text-red-500" />;
    if (fileType.includes('word') || fileType.includes('document')) return <File className="h-5 w-5 text-blue-500" />;
    return <File className="h-5 w-5 text-gray-500" />;
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Ready</Badge>;
      case 'processing':
        return <Badge className="bg-yellow-100 text-yellow-800"><Loader2 className="h-3 w-3 mr-1 animate-spin" />Processing</Badge>;
      case 'uploading':
        return <Badge className="bg-blue-100 text-blue-800"><Upload className="h-3 w-3 mr-1" />Uploading</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800"><AlertCircle className="h-3 w-3 mr-1" />Error</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  // Filter documents based on search
  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.file_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle document selection
  const handleDocumentSelect = (document: InnovationDocument) => {
    if (document.upload_status !== 'completed') {
      toast({
        title: "Document not ready",
        description: "Please wait for the document to finish processing",
        variant: "destructive",
      });
      return;
    }
    
    // Toggle selection
    const newSelectedIds = localSelectedIds.includes(document.id)
      ? localSelectedIds.filter(id => id !== document.id)
      : [...localSelectedIds, document.id];
    
    setLocalSelectedIds(newSelectedIds);
  };

  // Apply selection
  const applySelection = () => {
    const selectedDocs = documents.filter(doc => localSelectedIds.includes(doc.id));
    onDocumentSelect(selectedDocs);
    
    if (selectedDocs.length === 0) {
      toast({
        title: "No documents selected",
        description: "Switched back to general innovation chat",
      });
    } else if (selectedDocs.length === 1) {
      toast({
        title: "Document selected",
        description: `Now chatting with "${selectedDocs[0].title}"`,
      });
    } else {
      toast({
        title: "Documents selected",
        description: `Now chatting with ${selectedDocs.length} documents`,
      });
    }
    
    onClose();
  };

  // Show document preview
  const showDocumentPreview = (document: InnovationDocument) => {
    setSelectedDocument(document);
    setShowPreview(true);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Paperclip className="h-5 w-5" />
              Innovation Document Manager
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 overflow-auto flex-1 flex flex-col">
            {/* Upload Section */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex-shrink-0">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      Upload a document to chat with
                    </span>
                    <span className="mt-1 block text-xs text-gray-500">
                      PDF, Word, or Text files up to 10MB
                    </span>
                  </label>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    accept=".pdf,.doc,.docx,.txt,.md"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                  />
                  <Button
                    onClick={() => document.getElementById('file-upload')?.click()}
                    disabled={isUploading}
                    className="mt-3"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Choose File
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>

            {/* Documents List */}
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    Loading documents...
                  </div>
                ) : filteredDocuments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <File className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">No documents found</p>
                    <p className="text-sm">Upload your first document to get started</p>
                  </div>
                ) : (
                  <div className="space-y-2 pb-4">
                    {filteredDocuments.map((document) => (
                      <div
                        key={document.id}
                        className={`group relative rounded-lg border p-4 transition-all hover:shadow-md ${
                          localSelectedIds.includes(document.id)
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={localSelectedIds.includes(document.id)}
                              onCheckedChange={() => handleDocumentSelect(document)}
                              disabled={document.upload_status !== 'completed'}
                              className="mt-1"
                            />
                            <div className="flex items-start gap-3 flex-1 min-w-0 cursor-pointer" onClick={() => handleDocumentSelect(document)}>
                              {getFileIcon(document.file_type)}
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-gray-900 truncate">
                                  {document.title}
                                </h3>
                                <p className="text-sm text-gray-500 truncate">
                                  {document.file_name}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                  {getStatusBadge(document.upload_status)}
                                  <span className="text-xs text-gray-400">
                                    {formatFileSize(document.file_size)}
                                  </span>
                                  <span className="text-xs text-gray-400">
                                    {new Date(document.created_at).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                showDocumentPreview(document);
                              }}
                              className="h-8 w-8"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm('Delete this document?')) {
                                  deleteDocument(document.id);
                                }
                              }}
                              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-4 border-t flex-shrink-0">
              <div className="text-sm text-gray-500">
                {localSelectedIds.length > 0 
                  ? `${localSelectedIds.length} document${localSelectedIds.length > 1 ? 's' : ''} selected for chat`
                  : 'Select documents to chat with them'
                }
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                {localSelectedIds.length > 0 && (
                  <Button 
                    onClick={() => {
                      setLocalSelectedIds([]);
                    }}
                    variant="outline"
                  >
                    Clear Selection
                  </Button>
                )}
                <Button 
                  onClick={applySelection}
                  disabled={localSelectedIds.length === 0}
                >
                  Apply Selection
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Document Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Document Preview: {selectedDocument?.title}
            </DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="h-[60vh]">
            <div className="p-4">
              {selectedDocument?.extracted_content ? (
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap text-sm">
                    {selectedDocument.extracted_content}
                  </pre>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No preview available</p>
                  <p className="text-sm">Content is being processed or couldn't be extracted</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
} 