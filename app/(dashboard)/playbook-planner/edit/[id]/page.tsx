"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, ArrowLeft } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import ReusableTiptapEditor from '@/components/reusable-tiptap-editor';

interface PlaybookData {
  id: string;
  playbookname: string;
  description: string;
  content: string;
}

export default function PlaybookEditPage() {
  const params = useParams();
  const router = useRouter();
  const [playbook, setPlaybook] = useState<PlaybookData | null>(null);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);

  
  const supabase = createClient();
  const playbookId = params.id as string;

  useEffect(() => {
    fetchPlaybook();
  }, [playbookId]);

  const fetchPlaybook = async () => {
    try {
      const { data, error } = await supabase
        .from('playbooks')
        .select('id, playbookname, description, content')
        .eq('id', playbookId)
        .single();

      if (error) throw error;

      setPlaybook(data);
      setTitle(data.playbookname);
      setDescription(data.description || '');
      setContent(data.content || '<p>Start writing your playbook...</p>');
    } catch (error) {
      console.error('Error fetching playbook:', error);
      toast({
        title: "Error",
        description: "Failed to load playbook. Please try again.",
        variant: "destructive",
      });
      router.push('/playbook-planner');
    } finally {
      setLoading(false);
    }
  };



  const handleAutoSave = async (newContent: string) => {
    try {
      setContent(newContent);
      
      // Auto-save to database
      const { error } = await supabase
        .from('playbooks')
        .update({
          content: newContent,
        })
        .eq('id', playbookId);

      if (error) throw error;
      
      console.log('Auto-saved successfully');
    } catch (error) {
      console.error('Auto-save failed:', error);
      throw error; // Re-throw so the editor can handle the error
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!playbook) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-medium text-gray-900 mb-2">Playbook not found</h2>
        <p className="text-gray-500 mb-4">The playbook you're looking for doesn't exist.</p>
        <Button onClick={() => router.push('/playbook-planner')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Playbooks
        </Button>
      </div>
    );
  }

  return (
    
    <div className="h-screen w-full flex flex-col bg-gray-50">
      

  {/* Form Fields */}
  <div className="p-6 bg-white border-b border-gray-200 hidden" >
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Playbook Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter playbook title"
              className="text-lg font-medium"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter a brief description (optional)"
            />
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white border-b border-gray-200">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/playbook-planner')}
            className="flex items-center gap-2 hidden"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Edit - {title}</h1>
            <p className="text-sm text-gray-500">Make changes to your playbook content</p>
          </div>
        </div>

      </div>

    

      {/* Content Editor - Full Screen */}
      <div className="flex-1 relative">
        <ReusableTiptapEditor
          content={content}
          onChange={setContent}
          onSave={handleAutoSave}
          placeholder="Start writing your playbook..."
          className="h-full"
          editorHeight="100%"
          autoSave={true}
          autoSaveDelay={1000}
        />
      </div>
    </div>
  );
} 