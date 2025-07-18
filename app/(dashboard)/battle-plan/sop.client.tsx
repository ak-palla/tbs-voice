'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, 
  Edit3, 
  Download, 
  History, 
  Save, 
  X, 
  RefreshCw, 
  Loader2,
  BookOpen,
  Settings2,
  ArrowLeft,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ReactMarkdown from 'react-markdown';
import ReusableTiptapEditor from '@/components/reusable-tiptap-editor';

interface SOP {
  id: string;
  title: string;
  content: string;
  version: number;
  is_current: boolean;
  created_at: string;
  updated_at: string;
  metadata?: any;
}

interface HistoryItem {
  id: string;
  title: string;
  version: number;
  created_at: string;
  is_current: boolean;
  metadata?: any;
}

// Helper function to convert HTML to Markdown
function htmlToMarkdown(html: string): string {
  let markdown = html;
  
  // Convert headings
  markdown = markdown.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n');
  markdown = markdown.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n');
  markdown = markdown.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n');
  markdown = markdown.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n');
  markdown = markdown.replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n\n');
  markdown = markdown.replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n\n');
  
  // Convert bold and italic
  markdown = markdown.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
  markdown = markdown.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');
  markdown = markdown.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
  markdown = markdown.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*');
  
  // Convert links
  markdown = markdown.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');
  
  // Convert lists - using split and join instead of dotAll flag
  const ulMatches = markdown.match(/<ul[^>]*>[\s\S]*?<\/ul>/gi);
  if (ulMatches) {
    ulMatches.forEach((match) => {
      const content = match.replace(/<\/?ul[^>]*>/gi, '');
      const items = content.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n');
      markdown = markdown.replace(match, items + '\n');
    });
  }
  
  const olMatches = markdown.match(/<ol[^>]*>[\s\S]*?<\/ol>/gi);
  if (olMatches) {
    olMatches.forEach((match) => {
      let counter = 1;
      const content = match.replace(/<\/?ol[^>]*>/gi, '');
      const items = content.replace(/<li[^>]*>(.*?)<\/li>/gi, () => `${counter++}. $1\n`);
      markdown = markdown.replace(match, items + '\n');
    });
  }
  
  // Convert paragraphs
  markdown = markdown.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');
  
  // Convert line breaks
  markdown = markdown.replace(/<br[^>]*\/?>/gi, '\n');
  
  // Convert code
  markdown = markdown.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`');
  
  // Convert pre blocks - using split and join instead of dotAll flag
  const preMatches = markdown.match(/<pre[^>]*>[\s\S]*?<\/pre>/gi);
  if (preMatches) {
    preMatches.forEach((match) => {
      const content = match.replace(/<\/?pre[^>]*>/gi, '');
      markdown = markdown.replace(match, '```\n' + content + '\n```\n\n');
    });
  }
  
  // Convert blockquotes - using split and join instead of dotAll flag
  const blockquoteMatches = markdown.match(/<blockquote[^>]*>[\s\S]*?<\/blockquote>/gi);
  if (blockquoteMatches) {
    blockquoteMatches.forEach((match) => {
      const content = match.replace(/<\/?blockquote[^>]*>/gi, '');
      const lines = content.split('\n');
      const quotedLines = lines.map((line: string) => line.trim() ? `> ${line}` : '>').join('\n') + '\n\n';
      markdown = markdown.replace(match, quotedLines);
    });
  }
  
  // Remove remaining HTML tags
  markdown = markdown.replace(/<[^>]*>/g, '');
  
  // Clean up extra whitespace
  markdown = markdown.replace(/\n{3,}/g, '\n\n');
  markdown = markdown.trim();
  
  return markdown;
}

export default function SopClient() {
  const [currentSop, setCurrentSop] = useState<SOP | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editPrompt, setEditPrompt] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isSavingManually, setIsSavingManually] = useState(false);
  const [showEmptyWarning, setShowEmptyWarning] = useState(false);
  
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    fetchCurrentSop();
    fetchHistory();
  }, []);

  const fetchCurrentSop = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/sop?action=current');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch SOP');
      }
      const data = await response.json();
      setCurrentSop(data.sop);
    } catch (error: any) {
      console.error('Error fetching SOP:', error);
      toast({
        title: "Error Loading SOP",
        description: error.message || "Could not load your SOP. Please try again or generate a new one if this persists.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/sop?action=history');
      if (!response.ok) {
        throw new Error('Failed to fetch history');
      }
      const data = await response.json();
      setHistory(data.history || []);
    } catch (error) {
      console.error('Error fetching history:', error);
      toast({
        title: "Error",
        description: "Failed to load SOP history.",
        variant: "destructive",
      });
    }
  };

  const generateInitialSop = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/sop/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate SOP');
      }

      const data = await response.json();
      setCurrentSop(data.sop);
      fetchHistory(); 
      
      toast({
        title: "SOP Generated!",
        description: "Your new Standard Operating Procedure is ready.",
        variant: "default",
      });
    } catch (error: any) {
      console.error('Error generating SOP:', error);
      toast({
        title: "SOP Generation Failed",
        description: error.message || "Could not generate SOP. Please ensure your onboarding is complete and try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEditSop = async () => {
    if (!editPrompt.trim() || !currentSop) return;

    setIsUpdating(true);
    try {
      const response = await fetch('/api/sop/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sopId: currentSop.id,
          editPrompt,
          currentContent: currentSop.content,
        }),
      });

      if (!response.ok) {
         const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update SOP');
      }

      const data = await response.json();
      setCurrentSop(data.sop);
      setEditPrompt('');
      setIsEditing(false);
      fetchHistory(); 
      
      toast({
        title: "SOP Updated",
        description: "Your SOP has been successfully updated.",
        variant: "default",
      });
    } catch (error: any) {
      console.error('Error updating SOP:', error);
      toast({
        title: "Update Failed",
        description: error.message || "Could not update SOP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRestoreSop = async (sopIdToRestore: string) => {
    const originalSop = currentSop;
    const originalHistory = [...history];

    setHistory(prevHistory => prevHistory.map(h => ({...h, is_current: h.id === sopIdToRestore})));
    const sopToDisplay = history.find(h => h.id === sopIdToRestore);

    try {
      const response = await fetch('/api/sop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'restore',
          sopId: sopIdToRestore,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to restore SOP');
      }

      const data = await response.json();
      setCurrentSop(data.sop); 
      fetchHistory(); 
      setShowHistory(false);
      
      toast({
        title: "SOP Restored",
        description: `Version ${sopToDisplay?.version || '?'} is now the current SOP.`,
        variant: "default",
      });
    } catch (error: any) {
      console.error('Error restoring SOP:', error);
      setCurrentSop(originalSop);
      setHistory(originalHistory);
      toast({
        title: "Restore Failed",
        description: error.message || "Could not restore SOP. Please try again.",
        variant: "destructive",
      });
    }
  };

  const downloadPdf = async () => {
    if (!currentSop) return;

    setIsDownloadingPdf(true);

    toast({
      title: "Preparing Download",
      description: "Your SOP PDF is being generated...",
    });

    try {
      const response = await fetch('/api/sop/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sopId: currentSop.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate PDF');
      }

      const pdfBlob = await response.blob();
      const filename = `${currentSop.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_v${currentSop.version}.pdf`;
      
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);

      toast({
        title: "Download Complete",
        description: "Your SOP PDF has been downloaded successfully.",
        variant: "default",
      });
      
    } catch (error: any) {
      console.error('Download error:', error);
      toast({
        title: "Download Error",
        description: error.message || "Failed to download SOP PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloadingPdf(false);
    }
  };



  // Check if content is empty or just whitespace
  const isContentEmpty = (content: string): boolean => {
    const cleanContent = content.replace(/<[^>]*>/g, '').trim();
    return cleanContent.length === 0;
  };



  // Extract save logic to reuse
  const saveContent = async (markdownContent: string) => {
    if (!currentSop) return;

    setIsSavingManually(true);
    try {
      const response = await fetch('/api/sop/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sopId: currentSop.id,
          editPrompt: 'manual inline edit (no history)',
          currentContent: markdownContent,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update SOP');
      }

      const data = await response.json();
      setCurrentSop(data.sop);
      toast({
        title: 'SOP Updated',
        description: 'Your SOP has been updated.',
        variant: 'default',
      });
    } catch (error: any) {
      toast({
        title: 'Update Failed',
        description: error.message || 'Could not update SOP.',
        variant: 'destructive',
      });
    } finally {
      setIsSavingManually(false);
    }
  };

  // Convert markdown to HTML for editing
  const convertMarkdownToHTML = (markdown: string): string => {
    // Simple markdown to HTML conversion for editing
    let html = markdown;
    
    // Convert headings
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
    html = html.replace(/^##### (.*$)/gim, '<h5>$1</h5>');
    html = html.replace(/^###### (.*$)/gim, '<h6>$1</h6>');
    
    // Convert bold and italic
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Convert code
    html = html.replace(/`(.*?)`/g, '<code>$1</code>');
    
    // Convert line breaks
    html = html.replace(/\n/g, '<br>');
    
    return html;
  };

  // Handle empty content warning actions
  const handleEmptyWarningRegenerate = async () => {
    try {
      await generateInitialSop();
      setShowEmptyWarning(false);
    } catch (error) {
      console.error('Regeneration failed:', error);
      toast({
        title: "Regeneration Failed",
        description: "Could not regenerate your Battle Plan. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEmptyWarningCancel = () => {
    setShowEmptyWarning(false);
  };

  if (isLoading) {
    return (
      <div className="">
        <div className="flex flex-col items-center justify-center p-6">
          <div className="relative">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            </div>
          </div>
          <h2 className="text-xl font-medium text-slate-700 mb-2">Loading your Battle Plan</h2>
          <p className="text-slate-500">Please wait while we fetch your document...</p>
        </div>
      </div>
    );
  }

  if (!currentSop) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
        <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center max-w-lg mx-auto">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-blue-100 rounded flex items-center justify-center mb-8">
            <BookOpen className="h-10 w-10 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-4">No Battle Plan Found</h1>
          <p className="text-slate-600 mb-8 leading-relaxed">
            Create your first Battle Plan based on your company's onboarding information to get started.
          </p>
          <div className="space-y-4 w-full">
            <Button 
              onClick={generateInitialSop} 
              disabled={isGenerating}
              size="lg"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded py-6 text-base font-medium lg hover:xl transition-all duration-200"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                  Generating Battle Plan...
                </>
              ) : (
                <>
                  <Settings2 className="mr-3 h-5 w-5" />
                  Generate My Battle Plan
                </>
              )}
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => router.push('/dashboard')} 
              className="w-full text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded py-3"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    ); 
  }

  return (
    <div className="">
      <div className="w-full">
        {/* Header Section */}
        <div className="mb-8">
          <div className="">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex-1">
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3">{currentSop.title}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1 rounded-full font-medium">
                      v{currentSop.version}
                    </Badge>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-slate-600">Current</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <Clock className="h-4 w-4" />
                    <span>Updated {new Date(currentSop.updated_at).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}</span>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <Dialog open={showHistory} onOpenChange={setShowHistory}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="bg-white/50 border-slate-200 text-slate-700 hover:bg-white hover:border-slate-300 rounded px-4 py-2 font-medium transition-all duration-200"
                    >
                      <History className="h-4 w-4 mr-2" />
                      History
                      <Badge variant="secondary" className="ml-2 bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full">
                        {history.length}
                      </Badge>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col rounded">
                    <DialogHeader className="pb-4">
                      <DialogTitle className="text-2xl font-bold text-slate-800">Version History</DialogTitle>
                      <DialogDescription className="text-slate-600">
                        Browse and restore previous versions of your Battle Plan
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex-grow overflow-y-auto space-y-3 pr-2">
                      {history.length > 0 ? history.map((item) => (
                        <div 
                          key={item.id} 
                          className={`p-4 rounded border transition-all duration-200 ${
                            item.is_current 
                              ? 'bg-blue-50 border-blue-200 sm' 
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className={`font-semibold ${item.is_current ? 'text-blue-700' : 'text-slate-700'}`}>
                                  Version {item.version}
                                </h4>
                                {item.is_current && (
                                  <Badge className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                                    Current
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-slate-500 mb-1">
                                {new Date(item.created_at).toLocaleString()}
                              </p>
                              {item.metadata?.edit_prompt && (
                                <p className="text-xs text-blue-600 bg-blue-50 rounded-lg px-2 py-1 mt-2" title={item.metadata.edit_prompt}>
                                  "{item.metadata.edit_prompt}"
                                </p>
                              )}
                              {item.metadata?.restored_from && (
                                <p className="text-xs text-green-600 bg-green-50 rounded-lg px-2 py-1 mt-2">
                                  Restored from Version {item.metadata.original_version}
                                </p>
                              )}
                            </div>
                            {!item.is_current && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleRestoreSop(item.id)}
                                className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 rounded-lg font-medium"
                              >
                                <RefreshCw className="h-3 w-3 mr-2" />
                                Restore
                              </Button>
                            )}
                          </div>
                        </div>
                      )) : (
                        <div className="text-center py-8 text-slate-500">
                          <History className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                          <p>No version history available</p>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(!isEditing)}
                  className={`rounded px-4 py-2 font-medium transition-all duration-200 ${
                    isEditing 
                      ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100' 
                      : 'bg-white/50 border-slate-200 text-slate-700 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  {isEditing ? (
                    <>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={downloadPdf}
                  disabled={isDownloadingPdf}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2 font-medium lg hover:xl transition-all duration-200"
                >
                  {isDownloadingPdf ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating PDF...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Section */}
        {isEditing && (
          <div className="mb-8">
            <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50 rounded sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold text-slate-800">Edit Your Battle Plan</CardTitle>
                <CardDescription className="text-slate-600">
                  Describe the changes you'd like to make and AI will update your Battle Plan accordingly.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder='Example: "Add more detail to the customer service section", "Include a new onboarding checklist", "Rewrite the introduction to be more professional"'
                  value={editPrompt}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditPrompt(e.target.value)}
                  rows={4}
                  className=""
                />
              </CardContent>
              <CardFooter className="flex justify-end gap-3 pt-4">
                <Button 
                  variant="ghost"
                  onClick={() => {
                    setIsEditing(false);
                    setEditPrompt('');
                  }}
                  className="text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleEditSop}
                  disabled={!editPrompt.trim() || isUpdating}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded px-6 font-medium lg hover:xl transition-all duration-200"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Update Battle Plan
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50 rounded sm">
          
          <CardContent className="p-0">
            {isUpdating ? (
              // AI-based editing loading state
              <div className="space-y-4">
                <div className="text-center mb-8">
                  <Loader2 className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-4" />
                  <p className="text-slate-600 font-medium">Updating your Battle Plan...</p>
                  <p className="text-slate-500 text-sm mt-1">This may take a few moments</p>
                </div>
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="h-4 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 rounded animate-pulse"
                      style={{
                        width: `${85 + Math.random() * 15}%`,
                        animationDelay: `${i * 0.2}s`,
                        animationDuration: '2s'
                      }}
                    />
                  ))}
                </div>
                <div className="space-y-3 mt-8">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i + 5}
                      className="h-4 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 rounded animate-pulse"
                      style={{
                        width: `${75 + Math.random() * 20}%`,
                        animationDelay: `${(i + 5) * 0.2}s`,
                        animationDuration: '2s'
                      }}
                    />
                  ))}
                </div>
                <div className="space-y-3 mt-8">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i + 9}
                      className="h-4 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 rounded animate-pulse"
                      style={{
                        width: `${80 + Math.random() * 15}%`,
                        animationDelay: `${(i + 9) * 0.2}s`,
                        animationDuration: '2s'
                      }}
                    />
                  ))}
                </div>
              </div>
            ) : (
              // TipTap Editor
              <ReusableTiptapEditor
                content={currentSop ? convertMarkdownToHTML(currentSop.content) : ''}
                onChange={(html) => {
                  // Convert HTML back to markdown and save
                  const markdown = htmlToMarkdown(html);
                  saveContent(markdown);
                }}
                onSave={async (html) => {
                  // Convert HTML back to markdown and save
                  const markdown = htmlToMarkdown(html);
                  await saveContent(markdown);
                }}
                placeholder="Start writing your Battle Plan... Type '/' for commands"
                className="min-h-[700px]"
                editorHeight="700px"
                autoSave={true}
                autoSaveDelay={1000}
                showToolbar={true}
                showBubbleMenu={true}
                showSlashCommands={true}
                showStatusBar={true}
                editorClassName="prose prose-slate max-w-none min-h-[500px]"
              />
            )}
          </CardContent>
        </Card>
        
        {/* Empty Content Warning Dialog */}
        <Dialog open={showEmptyWarning} onOpenChange={setShowEmptyWarning}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-slate-800 flex items-center">
                <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
                Content Deleted
              </DialogTitle>
              <DialogDescription className="text-slate-600">
                {isGenerating 
                  ? "Generating your new Battle Plan..."
                  : "You've removed all content from your Battle Plan. What would you like to do?"
                }
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-3 mt-4">
              <Button 
                onClick={handleEmptyWarningRegenerate}
                disabled={isGenerating}
                className="bg-blue-600 hover:bg-blue-700 text-white w-full disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Regenerating Battle Plan...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Regenerate Battle Plan
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleEmptyWarningCancel}
                disabled={isGenerating}
                className="w-full disabled:opacity-50"
              >
                <X className="mr-2 h-4 w-4" />
                Cancel & Restore Content
              </Button>
            </div>
          </DialogContent>
        </Dialog>

      
      </div>
    </div>
  );
} 