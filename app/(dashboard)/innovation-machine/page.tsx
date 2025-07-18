'use client';

<<<<<<< HEAD
import { useState, useEffect } from 'react';
import { InnovationChatGemini } from '@/components/innovation-chat-gemini';
import { Loader2 } from 'lucide-react';

export default function InnovationMachinePage() {
  const [isChatModuleLoaded, setIsChatModuleLoaded] = useState(false);

  return (
    <div className="relative flex items-center justify-center w-full h-full">
      {!isChatModuleLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 z-10">
          <Loader2 className="h-12 w-12 text-orange-500 animate-spin mb-4" />
          <p className="text-lg font-medium text-gray-700">Loading Innovation Machine...</p>
          <p className="text-sm text-gray-500">Preparing your creative workspace.</p>
        </div>
      )}
      <div className={`w-full h-full ${isChatModuleLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}>
        <InnovationChatGemini onReady={() => setIsChatModuleLoaded(true)} />
      </div>
=======
import { InnovationChatGemini } from "@/components/innovation-chat-gemini";
import { InnovationDocumentManager } from "@/components/innovation-document-manager";
import { useState } from "react";

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

export default function InnovationMachinePage() {
  const [selectedDocuments, setSelectedDocuments] = useState<InnovationDocument[]>([]);
  const [chatMode, setChatMode] = useState<'general' | 'document'>('general');

  const handleDocumentSelect = (documents: InnovationDocument[]) => {
    setSelectedDocuments(documents);
    setChatMode(documents.length > 0 ? 'document' : 'general');
  };

  const handleChatModeChange = (mode: 'general' | 'document') => {
    setChatMode(mode);
    if (mode === 'general') {
      setSelectedDocuments([]);
    }
  };

  return (
    <div className="h-full relative">
      <InnovationChatGemini 
        showHeader={true} 
        hideDebugButton={false}
        selectedDocuments={selectedDocuments}
        chatMode={chatMode}
        onDocumentSelect={handleDocumentSelect}
        onChatModeChange={handleChatModeChange}
      />
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
    </div>
  );
} 