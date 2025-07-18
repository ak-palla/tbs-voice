'use client';

import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
<<<<<<< HEAD
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
=======
import { ScrollArea } from "@/components/ui/scroll-area"; 
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
import { 
  Lightbulb, 
  Send, 
  Trash2, 
  Edit2, 
  Check, 
  Plus, 
  Menu, 
  Sparkles, 
  Target, 
  Rocket,
  Brain,
  TrendingUp,
  Zap,
  Loader2,
  X,
  Bug,
  Sidebar,
  SidebarOpen,
<<<<<<< HEAD
  MessageSquare
=======
  MessageSquare,
  Paperclip,
  FileText
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { AudioVisualizer } from "./audio-visualizer";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
<<<<<<< HEAD
=======
import { InnovationDocumentManager } from "@/components/innovation-document-manager";
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a

interface Message {
  role: "user" | "assistant";
  content: string;
  type: "text";
  isComplete?: boolean;
  isStreaming?: boolean;
  isVoiceMessage?: boolean;
}

interface ChatInstance {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface InnovationChatInstance {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  is_active?: boolean;
}

const MEDIUM_SCREEN_BREAKPOINT = 768; // Tailwind 'md' breakpoint

<<<<<<< HEAD
=======
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

>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
interface InnovationChatGeminiComponentProps { 
  hideDebugButton?: boolean;
  showHeader?: boolean;
  hideInstanceSidebar?: boolean;
  selectedInstanceId?: string | null;
  onInstanceChange?: ((instanceId: string) => void) | null;
  onReady?: () => void;
<<<<<<< HEAD
=======
  selectedDocuments?: InnovationDocument[];
  chatMode?: 'general' | 'document';
  onDocumentSelect?: (documents: InnovationDocument[]) => void;
  onChatModeChange?: (mode: 'general' | 'document') => void;
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
}

export function InnovationChatGemini({ 
  hideDebugButton = false, 
  showHeader = true, 
  hideInstanceSidebar = false,
  selectedInstanceId = null,
  onInstanceChange = null,
<<<<<<< HEAD
  onReady
=======
  onReady,
  selectedDocuments = [],
  chatMode = 'general',
  onDocumentSelect,
  onChatModeChange
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
}: InnovationChatGeminiComponentProps = {}) {
  const { toast } = useToast();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isLoadingInstances, setIsLoadingInstances] = useState(false);
  const [isClearingChat, setIsClearingChat] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [innovationInstances, setInnovationInstances] = useState<InnovationChatInstance[]>([]);
  const [currentInstanceId, setCurrentInstanceId] = useState<string | null>(selectedInstanceId);
  const [editingInstanceId, setEditingInstanceId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [mobileInstancesPanelOpen, setMobileInstancesPanelOpen] = useState(false);
  const [isMediumScreen, setIsMediumScreen] = useState(false);
  const [showInstanceSidebar, setShowInstanceSidebar] = useState(!hideInstanceSidebar);
  const [debugData, setDebugData] = useState<any>(null);
  const [showDebugPopup, setShowDebugPopup] = useState(false);
  const [showBotTyping, setShowBotTyping] = useState(false);
<<<<<<< HEAD
=======
  const [showDocumentManager, setShowDocumentManager] = useState(false);
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

<<<<<<< HEAD
=======
  // Helper function to generate welcome message based on chat mode
  const getWelcomeMessage = useCallback(() => {
    if (chatMode === 'document' && selectedDocuments.length > 0) {
      if (selectedDocuments.length === 1) {
        return `🚀 Welcome to the Innovation Machine! I'm now ready to analyse and discuss your document "${selectedDocuments[0].title}". Ask me anything about this document or let's explore innovation opportunities based on its content!`;
      } else {
        const titles = selectedDocuments.map(doc => `"${doc.title}"`).join(', ');
        return `🚀 Welcome to the Innovation Machine! I'm now ready to analyse and discuss ${selectedDocuments.length} documents: ${titles}. Ask me anything about these documents or let's explore innovation opportunities based on their content!`;
      }
    }
    return "🚀 Welcome to the Innovation Machine! I'm here to help you brainstorm, evaluate, and develop your next big business idea. What innovation are you considering today?";
  }, [chatMode, selectedDocuments]);

  // Document management functions
  const handleDocumentSelect = (documents: InnovationDocument[]) => {
    if (onDocumentSelect) {
      onDocumentSelect(documents);
    }
    if (onChatModeChange) {
      onChatModeChange(documents.length > 0 ? 'document' : 'general');
    }
    setShowDocumentManager(false);
  };

  const toggleDocumentManager = () => {
    setShowDocumentManager(!showDocumentManager);
  };

>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
  // Screen size detection
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMediumScreen(window.innerWidth < MEDIUM_SCREEN_BREAKPOINT);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Fetch innovation instances
  const fetchInnovationInstances = useCallback(async () => {
    try {
      setIsLoadingInstances(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) return;

      const response = await fetch('/api/innovation-chat', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch innovation instances');
      }

      const data = await response.json();
      if (data.type === 'innovation_instances') {
        setInnovationInstances(data.instances || []);
        
        if (!currentInstanceId && data.instances?.length > 0) {
          const mostRecent = data.instances[0];
          setCurrentInstanceId(mostRecent.id);
          await fetchInstanceHistory(mostRecent.id);
        } else if (data.instances?.length === 0) {
          await createNewInstance("Innovation Ideas");
        }
      }
    } catch (error) {
      console.error('Error fetching innovation instances:', error);
      toast({
        title: "Error",
        description: "Failed to load innovation sessions",
        variant: "destructive",
      });
    } finally {
      setIsLoadingInstances(false);
    }
  }, [supabase, currentInstanceId, toast]);

  // Fetch instance history
  const fetchInstanceHistory = useCallback(async (instanceId: string) => {
    try {
      setIsLoadingHistory(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) return;

      const response = await fetch(`/api/innovation-chat?instanceId=${instanceId}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch instance history');
      }

      const data = await response.json();
      if (data.type === 'innovation_history' && Array.isArray(data.history)) {
        const formattedHistory = data.history.map((msg: any) => ({
          role: msg.role === 'model' || msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content || '',
          type: 'text',
          isComplete: true
        })) as Message[];
        
        setMessages(formattedHistory);
      } else {
        setMessages([{ 
          role: "assistant", 
<<<<<<< HEAD
          content: "🚀 Welcome to the Innovation Machine! I'm here to help you brainstorm, evaluate, and develop your next big business idea. What innovation are you considering today?", 
=======
          content: getWelcomeMessage(), 
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
          type: "text", 
          isComplete: true 
        }]);
      }
    } catch (error) {
      console.error('Error fetching instance history:', error);
      setMessages([{ 
        role: "assistant", 
<<<<<<< HEAD
        content: "🚀 Welcome to the Innovation Machine! I'm here to help you brainstorm, evaluate, and develop your next big business idea. What innovation are you considering today?", 
=======
        content: getWelcomeMessage(), 
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
        type: "text", 
        isComplete: true 
      }]);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [supabase]);

  // Create new instance
<<<<<<< HEAD
  const createNewInstance = useCallback(async (title: string = 'New Innovation') => {
=======
  const createNewInstance = useCallback(async (title: string = 'New Innovation Session') => {
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) return;

      const response = await fetch('/api/innovation-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          action: 'create_instance',
          title
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create innovation instance');
      }

      const data = await response.json();
      if (data.instance) {
        setInnovationInstances(prev => [data.instance, ...prev]);
        setCurrentInstanceId(data.instance.id);
        setMessages([{ 
          role: "assistant", 
<<<<<<< HEAD
          content: "🚀 Welcome to the Innovation Machine! I'm here to help you brainstorm, evaluate, and develop your next big business idea. What innovation are you considering today?", 
=======
          content: getWelcomeMessage(), 
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
          type: "text", 
          isComplete: true 
        }]);
        
        toast({
          title: "Success",
          description: "New innovation session created!",
        });
        return data.instance.id;
      }
    } catch (error) {
      console.error('Error creating innovation instance:', error);
      toast({
        title: "Error",
        description: "Failed to create new innovation session",
        variant: "destructive",
      });
    }
    return null;
  }, [supabase, toast]);

  // Delete instance
  const deleteInstance = async (instanceId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) return;

      const response = await fetch('/api/innovation-chat', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          instanceId
        })
      });

      // Update local state
      setInnovationInstances(prev => prev.filter(instance => instance.id !== instanceId));
      
      if (currentInstanceId === instanceId) {
        const remaining = innovationInstances.filter(instance => instance.id !== instanceId);
        if (remaining.length > 0) {
          setCurrentInstanceId(remaining[0].id);
          await fetchInstanceHistory(remaining[0].id);
        } else {
          await createNewInstance("Innovation Ideas");
        }
      }

      toast({
        title: "Success",
        description: "Innovation session deleted",
      });
    } catch (error) {
      console.error('Error deleting innovation instance:', error);
      toast({
        title: "Error",
        description: "Failed to delete innovation session",
        variant: "destructive",
      });
    }
  };

<<<<<<< HEAD
=======
  // Function to automatically generate and update the chat title
  const generateAndSetTitle = async (messageContent: string, instanceId: string) => {
    try {
      const response = await fetch('/api/innovation-chat/rename', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageContent }),
      });
      if (response.ok) {
        const { title } = await response.json();
        if (title) {
          await updateInstanceTitle(instanceId, title);
        }
      }
    } catch (error) {
      console.error("Failed to generate and set title:", error);
      // We don't want to block user flow if this fails, so we just log the error
    }
  };

>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
  // Update instance title
  const updateInstanceTitle = async (instanceId: string, newTitle: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) return;

      const response = await fetch('/api/innovation-chat', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          instanceId,
          title: newTitle
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update innovation instance title');
      }

      setInnovationInstances(prev =>
        prev.map(instance =>
          instance.id === instanceId
            ? { ...instance, title: newTitle }
            : instance
        )
      );

      setEditingInstanceId(null);
      setEditingTitle("");

      toast({
        title: "Success",
        description: "Innovation session title updated",
      });
    } catch (error) {
      console.error('Error updating innovation instance title:', error);
      toast({
        title: "Error",
        description: "Failed to update innovation session title",
        variant: "destructive",
      });
    }
  };

  // Select instance
  const selectInstance = (instanceId: string) => {
    if (instanceId !== currentInstanceId) {
      setCurrentInstanceId(instanceId);
      fetchInstanceHistory(instanceId);
      if (onInstanceChange) {
        onInstanceChange(instanceId);
      }
    }
    setMobileInstancesPanelOpen(false);
  };

  // Initial load
  useEffect(() => {
    const initializeInnovationChat = async () => {
      setIsLoadingInstances(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user?.id) {
          setIsDataLoaded(true);
          return;
        }

        const response = await fetch('/api/innovation-chat', {
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        });

        if (!response.ok) throw new Error('Failed to fetch innovation instances');
        
        const data = await response.json();

        if (data.type === 'innovation_instances') {
          const instances = data.instances || [];
          setInnovationInstances(instances);
          
          let targetInstanceId = selectedInstanceId || currentInstanceId;

          if (!targetInstanceId && instances.length > 0) {
            targetInstanceId = instances[0].id;
          } else if (instances.length === 0) {
            setIsLoadingHistory(true);
            const newId = await createNewInstance("Innovation Ideas");
            if (newId) {
              targetInstanceId = newId;
            }
            setIsLoadingHistory(false);
          }

          if (targetInstanceId) {
            if (targetInstanceId !== currentInstanceId) {
               setCurrentInstanceId(targetInstanceId);
            }
            await fetchInstanceHistory(targetInstanceId);
          } else {
            setMessages([{ 
                role: "assistant", 
                content: "🚀 Welcome to the Innovation Machine! Please select or create an innovation session to begin.", 
                type: "text", 
                isComplete: true 
              }]);
          }
        }
      } catch (error) {
        console.error('Error initializing innovation chat:', error);
        toast({
          title: "Error",
          description: "Failed to initialize innovation chat",
          variant: "destructive",
        });
      } finally {
        setIsLoadingInstances(false);
        setIsDataLoaded(true);
      }
    };

    if (!isDataLoaded) {
        initializeInnovationChat();
    }
  }, [supabase, toast, isDataLoaded, selectedInstanceId, createNewInstance, fetchInstanceHistory]);

  // Effect to call onReady when isDataLoaded becomes true
  useEffect(() => {
    if (isDataLoaded) {
      onReady?.();
    }
  }, [isDataLoaded, onReady]);

<<<<<<< HEAD
=======
  // Effect to update welcome message when document or chat mode changes
  useEffect(() => {
    if (isDataLoaded && messages.length === 1 && messages[0].role === 'assistant') {
      // Only update if we have just the welcome message
      setMessages([{
        role: "assistant",
        content: getWelcomeMessage(),
        type: "text",
        isComplete: true
      }]);
    }
  }, [chatMode, selectedDocuments, isDataLoaded, getWelcomeMessage, messages.length]);

>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
  // Clear chat history (mark as inactive instead of deleting)
  const clearChatHistory = async () => {
    if (!currentInstanceId) return;
    
    setIsClearingChat(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) return;

      const response = await fetch('/api/innovation-chat', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          action: 'clear_chat',
          instanceId: currentInstanceId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to clear innovation chat');
      }

      setMessages([{ 
        role: "assistant", 
<<<<<<< HEAD
        content: "🚀 Welcome to the Innovation Machine! I'm here to help you brainstorm, evaluate, and develop your next big business idea. What innovation are you considering today?", 
=======
        content: getWelcomeMessage(), 
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
        type: "text", 
        isComplete: true 
      }]);

      toast({
        title: "Success",
        description: "Innovation session cleared",
      });
    } catch (error) {
      console.error('Error clearing innovation chat:', error);
      toast({
        title: "Error",
        description: "Failed to clear innovation session",
        variant: "destructive",
      });
    } finally {
      setIsClearingChat(false);
    }
  };

  // Send message
  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading || !isDataLoaded || !currentInstanceId) return;

    const userMessageText = inputText.trim();
    setInputText("");
    
    // Add user message
    const newUserMessage: Message = {
      role: "user",
      content: userMessageText,
      type: "text",
      isComplete: true
    };
    
    setMessages(prevMessages => [...prevMessages, newUserMessage]);
    
    setShowBotTyping(true); // Show the animated lines indicator
    setIsLoading(true); // Disable input and indicate general loading

<<<<<<< HEAD
=======
    // Check if this is the first message in a new chat to trigger auto-naming
    const isNewChat = innovationInstances.find(inst => inst.id === currentInstanceId)?.title === 'New Innovation Session';
    if (isNewChat && messages.filter(m => m.role === 'user').length === 0 && currentInstanceId) {
      // Don't await this, let it run in the background
      generateAndSetTitle(userMessageText, currentInstanceId);
    }

>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        throw new Error('No authenticated user');
      }

      const response = await fetch('/api/innovation-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          message: userMessageText,
          instanceId: currentInstanceId,
<<<<<<< HEAD
          action: 'send_message'
=======
          action: 'send_message',
          documentIds: chatMode === 'document' && selectedDocuments.length > 0 ? selectedDocuments.map(doc => doc.id) : [],
          chatMode: chatMode
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = "";

      if (reader) {
        setShowBotTyping(false); // Hide animated lines as stream is about to start

        // Add assistant message placeholder that will be filled by the stream
        setMessages(prevMessages => [...prevMessages, {
          role: "assistant",
          content: "", 
          type: "text",
          isStreaming: true, // Still useful for styling if content is temporarily empty
          isComplete: false
        }]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.trim() === '') continue;
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') {
                // Mark message as complete
                setMessages(prevMessages => 
                  prevMessages.map((msg, index) => 
                    index === prevMessages.length - 1 
                      ? { ...msg, isStreaming: false, isComplete: true }
                      : msg
                  )
                );
                continue;
              }

              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  accumulatedContent += parsed.content;
                  setMessages(prevMessages => 
                    prevMessages.map((msg, index) => 
                      index === prevMessages.length - 1 
                        ? { ...msg, content: accumulatedContent }
                        : msg
                    )
                  );
                }
              } catch (e) {
                console.error('Error parsing SSE data:', e);
              }
            }
          }
        }
      } else {
        // If there's no reader, but response was ok, it implies a non-streaming or empty successful response.
        setShowBotTyping(false); // Ensure typing indicator is hidden
        // Add a generic assistant message or handle as appropriate if this case is expected.
        // For now, if no content is added, it will remain an empty assistant message.
        // If an error was intended, it should have been thrown.
        // Let's ensure the last assistant message (if added) is marked complete.
         setMessages(prevMessages => 
            prevMessages.map((msg, index) => 
                index === prevMessages.length - 1 && msg.role === "assistant"
                ? { ...msg, isStreaming: false, isComplete: true, content: msg.content || "Response received." } 
                : msg
            )
        );
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setShowBotTyping(false); // Hide animated lines on error
      
      // Remove any incomplete assistant message and add the error message
      setMessages(prevMessages => 
        prevMessages.filter(msg => !(msg.role === 'assistant' && msg.isStreaming && !msg.isComplete))
        .concat([{
          role: "assistant",
          content: "I apologize, but I'm having trouble processing your innovation idea right now. Please try again.",
          type: "text",
          isComplete: true
        }])
      );
      
      toast({
        title: "Error",
        description: "Failed to process your innovation idea. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setShowBotTyping(false); // Ensure typing indicator is hidden in all cases
    }
  };

  // Fetch debug data
  const fetchDebugData = useCallback(async () => {
    try {
      setIsLoading(true);
      const apiUrl = `/api/innovation-chat?action=debug${currentInstanceId ? `&instanceId=${currentInstanceId}` : ''}`;
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Debug data fetch error:", errorData);
        toast({
          title: "Error",
          description: errorData.error || "Failed to fetch debug data",
          variant: "destructive",
        });
        return;
      }

      const data = await response.json();
      console.log("Innovation debug data received:", data);
      console.log("Formatted context available:", !!data.modelInput?.formatted?.formattedInstructions);
      console.log("Raw data available:", !!data.modelInput?.raw);
      
      setDebugData(data.modelInput);
      setShowDebugPopup(true);
    } catch (error) {
      console.error("Innovation debug data fetch error:", error);
      toast({
        title: "Error",
        description: "Failed to fetch debug data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, currentInstanceId]);

  // Render the debug popup
  const renderDebugPopup = () => {
    if (!showDebugPopup || !debugData) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="w-[90%] h-[90%] bg-white rounded-lg p-4 overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Model Context Debug Data</h2>
            <Button variant="ghost" onClick={() => setShowDebugPopup(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-xl font-bold mb-2">Formatted Context (What the model sees)</h3>
              <div className="p-2 border rounded bg-gray-50 overflow-auto h-[calc(100vh-200px)]">
                <pre className="whitespace-pre-wrap text-sm">{debugData.formatted?.formattedInstructions || JSON.stringify(debugData, null, 2)}</pre>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-2">Raw Data</h3>
              <div className="p-2 border rounded bg-gray-50 overflow-auto h-[calc(100vh-200px)]">
                <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(debugData.raw || debugData, null, 2)}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-[calc(100vh-70px)] overflow-hidden bg-gradient-to-br from-white to-gray-50 mx-auto w-full">
      {/* Mobile Instances Panel - Overlay */}
      {isMediumScreen && !hideInstanceSidebar && (
        <>
          <div 
            className={`fixed top-0 left-0 h-full w-[calc(100%-50px)] max-w-xs bg-white/95 backdrop-blur-sm z-40 shadow-xl flex flex-col transition-transform duration-300 ease-in-out ${
              mobileInstancesPanelOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <div className="p-3 border-b flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-sm z-10">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { createNewInstance(); setMobileInstancesPanelOpen(false); }}
                className="flex items-center gap-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
              >
                <Plus className="h-4 w-4" />
                <span className="text-sm">New Innovation</span>
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setMobileInstancesPanelOpen(false)} className="rounded-lg">
                <X className="h-5 w-5" />
              </Button>
            </div>
            <ScrollArea className="flex-1">
<<<<<<< HEAD
              <div className="p-3 space-y-2">
=======
              <div className="p-3 space-y-2 flex-1">
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
                {isLoadingInstances ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
                  </div>
                ) : innovationInstances.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    <Lightbulb className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No sessions yet. Create one!</p>
                  </div>
                ) : (
                  innovationInstances.map((instance) => (
                    <div
                      key={instance.id}
                      className={`group relative rounded-lg p-3 cursor-pointer transition-colors ${
                        currentInstanceId === instance.id
                          ? 'bg-orange-50 border border-orange-200'
                          : 'hover:bg-gray-50 border border-transparent'
                      }`}
                      onClick={() => selectInstance(instance.id)}
                    >
                      {editingInstanceId === instance.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') updateInstanceTitle(instance.id, editingTitle);
                              else if (e.key === 'Escape') setEditingInstanceId(null);
                            }}
                            className="flex-1 h-7 text-sm"
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => { e.stopPropagation(); updateInstanceTitle(instance.id, editingTitle);}}
                            className="h-7 w-7 shrink-0"
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm text-gray-900 truncate">
                              {instance.title}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(instance.updated_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => { e.stopPropagation(); setEditingInstanceId(instance.id); setEditingTitle(instance.title);}}
                              className="h-7 w-7 shrink-0"
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => { e.stopPropagation(); if (confirm('Delete session?')) deleteInstance(instance.id);}}
                              className="h-7 w-7 shrink-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
<<<<<<< HEAD
=======
              
                              {/* Document Controls - Bottom of Mobile Sidebar */}
              <div className="p-3 border-t bg-white/90 space-y-3">
                {/* Chat Mode Toggle */}
                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                  <Button
                    variant={chatMode === 'general' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => {
                      if (chatMode !== 'general' && onChatModeChange) {
                        onChatModeChange('general');
                      }
                    }}
                    className="h-7 px-2 text-xs flex-1"
                  >
                    <MessageSquare className="h-3 w-3 mr-1" />
                    General
                  </Button>
                  <Button
                    variant={chatMode === 'document' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => {
                      toggleDocumentManager();
                      setMobileInstancesPanelOpen(false);
                    }}
                    className="h-7 px-2 text-xs flex-1"
                  >
                    <FileText className="h-3 w-3 mr-1" />
                    Document
                  </Button>
                </div>
                
                {/* Document Manager Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    toggleDocumentManager();
                    setMobileInstancesPanelOpen(false);
                  }}
                  className="w-full flex items-center gap-2"
                >
                  <Paperclip className="h-4 w-4" />
                  Manage Documents
                </Button>
                
                {/* Selected Document Badge */}
                {selectedDocuments.length > 0 && (
                  <div className="text-xs text-gray-600 bg-orange-50 border border-orange-200 rounded p-2">
                    {selectedDocuments.length === 1 ? (
                      <div className="flex items-center gap-2">
                        <FileText className="h-3 w-3 text-orange-600" />
                        <span className="font-medium truncate">{selectedDocuments[0].title}</span>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <FileText className="h-3 w-3 text-orange-600" />
                          <span className="font-medium">{selectedDocuments.length} documents selected</span>
                        </div>
                        <div className="space-y-1 pl-5">
                          {selectedDocuments.slice(0, 3).map((doc, idx) => (
                            <div key={doc.id} className="text-xs truncate">
                              • {doc.title}
                            </div>
                          ))}
                          {selectedDocuments.length > 3 && (
                            <div className="text-xs text-gray-500">
                              and {selectedDocuments.length - 3} more...
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
            </ScrollArea>
          </div>
          {mobileInstancesPanelOpen && (
            <div 
              className="fixed inset-0 bg-black/20 z-30 backdrop-blur-sm"
              onClick={() => setMobileInstancesPanelOpen(false)}
            />
          )} 
        </>
      )}

      {/* Desktop Innovation Instances Sidebar */}
      {!isMediumScreen && !hideInstanceSidebar && (
        <div className={`relative ${showInstanceSidebar ? 'w-80' : 'w-12'} transition-all duration-300 border-r bg-white/90 backdrop-blur-sm flex flex-col h-full`}>
          <div className="p-3 border-b flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-sm z-10">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowInstanceSidebar(!showInstanceSidebar)}
              className="rounded-lg"
            >
              {showInstanceSidebar ? <SidebarOpen className="h-5 w-5" /> : <Sidebar className="h-5 w-5" />}
            </Button>
            {showInstanceSidebar && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => createNewInstance()}
                className="flex items-center gap-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
              >
                <Plus className="h-4 w-4" />
                <span className="text-sm">New Innovation</span>
              </Button>
            )}
          </div>

<<<<<<< HEAD
          {showInstanceSidebar && (
=======
          {/* Collapsed Sidebar - Document Controls */}
          {!showInstanceSidebar && (
            <div className="flex flex-col items-center gap-2 py-3">
              <Button
                variant={chatMode === 'general' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => {
                  if (chatMode !== 'general' && onChatModeChange) {
                    onChatModeChange('general');
                  }
                }}
                className="w-8 h-8"
                title="General Chat"
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
              <Button
                variant={chatMode === 'document' ? 'default' : 'ghost'}
                size="icon"
                onClick={toggleDocumentManager}
                className="w-8 h-8"
                title="Document Chat"
              >
                <FileText className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={toggleDocumentManager}
                className="w-8 h-8"
                title="Manage Documents"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              {selectedDocuments.length > 0 && (
                <div className="w-8 h-8 bg-orange-50 border border-orange-200 rounded flex items-center justify-center relative" title={selectedDocuments.map(d => d.title).join(', ')}>
                  <FileText className="h-3 w-3 text-orange-600" />
                  {selectedDocuments.length > 1 && (
                    <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      {selectedDocuments.length}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {showInstanceSidebar && (
            <>
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
            <ScrollArea className="flex-1">
              <div className="p-3 space-y-2">
                {isLoadingInstances ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
                  </div>
                ) : innovationInstances.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    <Lightbulb className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No sessions yet</p>
                  </div>
                ) : (
                  innovationInstances.map((instance) => (
                    <div
                      key={instance.id}
                      className={`group relative rounded-lg p-3 cursor-pointer transition-colors ${
                        currentInstanceId === instance.id
                          ? 'bg-orange-50 border border-orange-200'
                          : 'hover:bg-gray-50 border border-transparent'
                      }`}
                      onClick={() => selectInstance(instance.id)}
                    >
                      {editingInstanceId === instance.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') updateInstanceTitle(instance.id, editingTitle);
                              else if (e.key === 'Escape') setEditingInstanceId(null);
                            }}
                            className="flex-1 h-7 text-sm"
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => { e.stopPropagation(); updateInstanceTitle(instance.id, editingTitle);}}
                            className="h-7 w-7 shrink-0"
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm text-gray-900 truncate">
                              {instance.title}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(instance.updated_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => { e.stopPropagation(); setEditingInstanceId(instance.id); setEditingTitle(instance.title);}}
                              className="h-7 w-7 shrink-0"
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => { e.stopPropagation(); if (confirm('Delete session?')) deleteInstance(instance.id);}}
                              className="h-7 w-7 shrink-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
<<<<<<< HEAD
=======
              
              {/* Document Controls - Bottom of Desktop Sidebar */}
              <div className="p-3 border-t bg-white/90 space-y-3">
                {/* Chat Mode Toggle */}
                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                  <Button
                    variant={chatMode === 'general' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => {
                      if (chatMode !== 'general' && onChatModeChange) {
                        onChatModeChange('general');
                      }
                    }}
                    className="h-7 px-2 text-xs flex-1"
                  >
                    <MessageSquare className="h-3 w-3 mr-1" />
                    General
                  </Button>
                  <Button
                    variant={chatMode === 'document' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={toggleDocumentManager}
                    className="h-7 px-2 text-xs flex-1"
                  >
                    <FileText className="h-3 w-3 mr-1" />
                    Document
                  </Button>
                </div>
                
                {/* Document Manager Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleDocumentManager}
                  className="w-full flex items-center gap-2"
                >
                  <Paperclip className="h-4 w-4" />
                  Manage Documents
                </Button>
                
                {/* Selected Document Badge */}
                {selectedDocuments.length > 0 && (
                  <div className="text-xs text-gray-600 bg-orange-50 border border-orange-200 rounded p-2">
                    {selectedDocuments.length === 1 ? (
                      <div className="flex items-center gap-2">
                        <FileText className="h-3 w-3 text-orange-600" />
                        <span className="font-medium truncate">{selectedDocuments[0].title}</span>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <FileText className="h-3 w-3 text-orange-600" />
                          <span className="font-medium">{selectedDocuments.length} documents selected</span>
                        </div>
                        <div className="space-y-1 pl-5">
                          {selectedDocuments.slice(0, 3).map((doc, idx) => (
                            <div key={doc.id} className="text-xs truncate">
                              • {doc.title}
                            </div>
                          ))}
                          {selectedDocuments.length > 3 && (
                            <div className="text-xs text-gray-500">
                              and {selectedDocuments.length - 3} more...
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
          )}
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex flex-col flex-1 min-w-0 h-full">
        {/* Header - Make this sticky */}
        {showHeader && (
          <div className="flex justify-between items-center p-4 border-b bg-white/80 backdrop-blur-sm h-16 sticky top-0 z-20">
            <div className="flex items-center gap-3">
              {/* Mobile Menu Button to open Instance Panel */}
              {isMediumScreen && !hideInstanceSidebar && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileInstancesPanelOpen(true)}
                  className="rounded-lg mr-2"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              )}
<<<<<<< HEAD
=======
              
              {/* Innovation Machine Title and Status */}
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-semibold">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-800">Innovation Machine</h2>
<<<<<<< HEAD
                <p className="text-xs text-gray-500">Trades Business School</p>
              </div>
=======
                <p className="text-xs text-gray-500">
                  {chatMode === 'document' && selectedDocuments.length > 0 
                    ? selectedDocuments.length === 1 
                      ? `Chatting with: ${selectedDocuments[0].title}`
                      : `Chatting with ${selectedDocuments.length} documents`
                    : 'General innovation chat'
                  }
                </p>
              </div>
              
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
              {isLoadingHistory && (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* Debug button - Conditionally render based on screen size */}
              {!hideDebugButton && !isMediumScreen && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchDebugData}
                  disabled={isLoading}
                  title="Show model context debug data"
                  className="mr-2"
                >
                  <Bug className="h-4 w-4 mr-1" />
                  <span className="text-xs">Debug Data</span>
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={clearChatHistory}
                disabled={isClearingChat || isLoading}
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100/80 transition-colors"
              >
                {isClearingChat ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
                    <span>Clearing...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Trash2 className="h-4 w-4" />
<<<<<<< HEAD
                    <span>Clear</span>
=======
                    <span>Clear Session</span>
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
                  </div>
                )}
              </Button>
            </div>
          </div>
        )}

        {!showHeader && (
          <div className="flex justify-between items-center p-4 border-b bg-white/80 backdrop-blur-sm h-16 sticky top-0 z-20 border-t">
            <div />
            <div className="flex items-center gap-2">
              {isMediumScreen && !hideInstanceSidebar && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileInstancesPanelOpen(true)}
                  className="rounded-lg mr-2"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              )}
              {isLoadingHistory && (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearChatHistory}
                disabled={isClearingChat || isLoading}
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100/80 transition-colors"
              >
                {isClearingChat ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
                    <span>Clearing...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Trash2 className="h-4 w-4" />
                    <span>Clear Session</span>
                  </div>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Chat Area - This will be scrollable */}
        <div className="flex-1 overflow-y-auto bg-gray-50"> 
          <ScrollArea className="h-full" ref={scrollAreaRef}>
            <div className="space-y-6 p-6 pt-4 pb-2">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                >
                  <div className={`flex flex-col ${message.role === "user" ? "items-end" : "items-start"} w-full max-w-[75%] sm:max-w-[90%]`}>
                    <div
                      className={`rounded-2xl px-4 py-2 sm:px-5 sm:py-3 flex flex-col w-fit break-words ${
                        message.role === "user"
                          ? message.isVoiceMessage 
                            ? "bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/20"
                            : "bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/20"
                          : "bg-white text-gray-800 border border-gray-200 "
                      }`}
                    >
                      <div className="w-full">
                        <div className={`prose prose-sm max-w-none ${message.role === "user" ? "dark:prose-invert text-white" : "text-gray-800"} !text-[15px] sm:!text-[16px]`}>
                          <ReactMarkdown
                            components={{
                              h1: ({children}) => <h1 className="text-xl font-bold mb-2 border-b pb-1">{children}</h1>,
                              h2: ({children}) => <h2 className="text-lg font-bold mb-2 mt-4">{children}</h2>,
                              h3: ({children}) => <h3 className="text-base font-bold mb-1 mt-3">{children}</h3>,
                              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                              ul: ({children}) => <ul className="list-disc pl-6 mb-3 space-y-1">{children}</ul>,
                              ol: ({children}) => <ol className="list-decimal pl-6 mb-3 space-y-1">{children}</ol>,
                              li: ({children}) => <li className="mb-1">{children}</li>,
                              a: ({ href, children }) => (
                                <a href={href} className={`${message.role === "user" ? "text-orange-100" : "text-orange-500"} hover:underline`} target="_blank" rel="noopener noreferrer">
                                  {children}
                                </a>
                              ),
                              code: ({ children }) => (
                                <code className={`${message.role === "user" ? "bg-orange-400/30" : "bg-gray-100"} rounded px-1 py-0.5 text-sm`}>
                                  {children}
                                </code>
                              ),
                              pre: ({ children }) => (
                                <pre className={`${message.role === "user" ? "bg-orange-400/30" : "bg-gray-100"} rounded p-2 text-sm overflow-x-auto my-2`}>
                                  {children}
                                </pre>
                              ),
                              blockquote: ({ children }) => (
                                <blockquote className={`border-l-2 ${message.role === "user" ? "border-orange-300" : "border-gray-300"} pl-3 italic my-2`}>
                                  {children}
                                </blockquote>
                              ),
                              hr: () => <hr className="my-3 border-t border-gray-200" />
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>
                    {message.isVoiceMessage && (
                      <div className={`flex items-center gap-1 mt-1 text-xs text-gray-400 ${message.role === "user" ? "self-end" : "self-start"}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                          <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                          <line x1="12" x2="12" y1="19" y2="22"></line>
                        </svg>
                        <span>Voice Message</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Bot typing indicator placeholder with glowing lines */}
              {showBotTyping && (
                <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="max-w-[75%] rounded-2xl px-5 py-3 flex flex-col bg-white text-gray-800 border border-gray-200">
                    <div className="flex flex-col gap-1.5 w-36">
                      <div className="h-2 rounded-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse"></div>
                      <div className="h-2 w-2/3 rounded-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse delay-75"></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </div>

        {/* Input Area - Make this sticky */}
        <div className="p-4 border-t bg-white/80 backdrop-blur-sm rounded-b-xl sticky bottom-0 z-20">
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={isLoadingHistory ? "Loading data..." : "Share your innovation idea..."}
                className="w-full px-3 py-2 sm:px-4 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-[15px] sm:text-base"
                disabled={isLoading || !isDataLoaded}
              />
              {isLoading && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isLoading || !isDataLoaded}
              className="rounded-full"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {isLoadingHistory && (
          <div className="text-center text-sm text-gray-500 mt-2">
            Loading conversation and user data... Please wait.
          </div>
        )}
      </div>

      {/* Render debug popup */}
      {renderDebugPopup()}
<<<<<<< HEAD
=======

      {/* Document Manager Modal */}
      <InnovationDocumentManager
        isOpen={showDocumentManager}
        onClose={() => setShowDocumentManager(false)}
        onDocumentSelect={handleDocumentSelect}
        selectedDocumentIds={selectedDocuments.map(doc => doc.id)}
      />
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
    </div>
  );
} 