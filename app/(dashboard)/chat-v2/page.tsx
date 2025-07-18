"use client";

<<<<<<< HEAD
import { RealtimeChatGemini } from "@/components/realtime-chat-gemini";
=======
import { RealtimeChat } from "@/components/realtime-chat";
// Remove DebugSession import
// import { DebugSession } from "@/components/debug-session";
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
 
export default function ChatPage() {
  return (
    <div className="flex flex-col gap-4">
<<<<<<< HEAD
      {/* Using optimized Groq Whisper + Deepgram TTS component */}
      <RealtimeChatGemini />
=======
      {/* Remove DebugSession component */}
      <RealtimeChat />
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
    </div>
  );
}  