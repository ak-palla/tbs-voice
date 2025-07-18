'use client';

import { useState } from 'react';
import { RealtimeChatGemini } from '@/components/realtime-chat-gemini';
import { Loader2 } from 'lucide-react';

export default function ChatPage() {
  const [isChatModuleLoaded, setIsChatModuleLoaded] = useState(false);

  return (
    <div className="relative flex items-center justify-center w-full h-full">
      {!isChatModuleLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 z-10">
          <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
          <p className="text-lg font-medium text-gray-700">Loading Chat...</p>
          <p className="text-sm text-gray-500">Connecting to your conversations.</p>
        </div>
      )}
      <div className={`w-full h-full ${isChatModuleLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}>
        <RealtimeChatGemini onReady={() => setIsChatModuleLoaded(true)} />
      </div>
    </div>
  );
} 