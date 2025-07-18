"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Mic, MicOff, Send, Settings, Phone, PhoneOff, Volume2, VolumeX } from "lucide-react";
import { AudioVisualizer } from "./audio-visualizer";
<<<<<<< HEAD
import { useVoiceFeedback } from "./voice-feedback";
import { SubtleVoiceIndicator } from "./voice-feedback/SubtleVoiceIndicator";
=======
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from "./ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Switch } from "./ui/switch";
import { createClient } from "@/utils/supabase/client";
import ReactMarkdown from 'react-markdown';
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import logger from "@/utils/log";
import { debounce } from "lodash";

interface Message {
  role: "user" | "assistant";
  content: string;
  type: "text" | "audio";
  itemId?: string;
  isComplete?: boolean;
}

interface WebSocketMessage {
  type: string;
  event_id?: string;
  response?: {
    output?: Array<{
      id?: string;
      object?: string;
      type?: string;
      status?: string;
      role?: "user" | "assistant";
      content?: Array<{
        type: string;
        text?: string;
        transcript?: string;
      }>;
    }>;
    status?: string;
    id?: string;
    conversation_id?: string;
    modalities?: string[];
    voice?: string;
    output_audio_format?: string;
    temperature?: number;
    max_output_tokens?: string;
    usage?: any;
    metadata?: any;
  };
  item?: {
    id?: string;
    object?: string;
    type?: string;
    status?: string;
    role?: "user" | "assistant";
    content?: Array<{
      type: string;
      text?: string;
      transcript?: string;
    }>;
  };
  delta?: string;
  transcript?: string;
  item_id?: string;
  content_index?: number;
}

interface AudioDevice {
  deviceId: string;
  label: string;
}

interface ChatbotInstruction {
  content: string;
  content_type: string;
  url: string | null;
  updated_at: string;
  created_at: string;
  extraction_metadata: any;
}

// Constants for audio processing
const BUFFER_THRESHOLD_SECONDS = 0.2; // Reduced from 0.3 to minimize latency
const CROSSFADE_DURATION = 0.015; // Increased from 0.005 for smoother transitions
const MIN_BUFFER_SIZE = 10024; // Minimum buffer size for stable playback
const MAX_BUFFER_SIZE = 8192; // Maximum buffer size to prevent delay

// Disable all console messages in production
if (process.env.NODE_ENV === 'production') {
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};
  console.info = () => {};
  console.debug = () => {};
}

const REALTIME_MODEL_ID = "gpt-4o-mini-realtime-preview-2024-12-17";

export function RealtimeChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatbotInstructions, setChatbotInstructions] = useState<ChatbotInstruction[]>([]);
  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Float32Array[]>([]);
  const [audioDevices, setAudioDevices] = useState<AudioDevice[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const currentTranscriptionItemIdRef = useRef<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isClearingChat, setIsClearingChat] = useState(false);

<<<<<<< HEAD
  // Voice feedback state management
  const voiceFeedback = useVoiceFeedback('idle');
  
  // Sync voice feedback state with component state
  useEffect(() => {
    if (error) {
      if (error.includes('microphone') || error.includes('permissions')) {
        voiceFeedback.setError('microphone-permission', error);
      } else if (error.includes('network') || error.includes('connection')) {
        voiceFeedback.setError('network-error', error);
      } else if (error.includes('speech') || error.includes('recognized')) {
        voiceFeedback.setError('speech-not-recognized', error);
      } else {
        voiceFeedback.setError('api-failure', error);
      }
    } else if (isLoading && !isRecording) {
      voiceFeedback.setState('thinking');
      voiceFeedback.setProcessingText('Processing your message...');
    } else if (isRecording) {
      voiceFeedback.setState('recording');
      voiceFeedback.setProcessingText('Recording your voice...');
    } else if (isCallActive && !isRecording) {
      voiceFeedback.setState('listening');
      voiceFeedback.setProcessingText('Listening...');
    } else if (!error && !isLoading && !isRecording && !isCallActive) {
      voiceFeedback.setState('idle');
    }
  }, [error, isLoading, isRecording, isCallActive, voiceFeedback]);
=======
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
  
  // --- New state refs for audio playback ---
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioQueueRef = useRef<AudioBuffer[]>([]); // Queue for decoded audio buffers
  const nextPlayTimeRef = useRef<number>(0); // Tracks scheduled start time for next chunk
  const isPlayingAssistantAudioRef = useRef<boolean>(false); // Tracks if playback is active
  const [isAudioPlaybackEnabled, setIsAudioPlaybackEnabled] = useState<boolean>(true); // Control playback
  // --- End of new state refs ---

  // Add these state variables at the top with other state declarations
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [gainNode, setGainNode] = useState<GainNode | null>(null);

  const supabase = createClient();

  // Add this to track if history has been loaded already
  const hasLoadedHistory = useRef(false);

  useEffect(() => {
    const initializeSession = async () => {
      try {
        setError(null);
        setIsLoading(true);
        
        const { data: { user } } = await supabase.auth.getUser();
        const userId = user?.id;
        
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: REALTIME_MODEL_ID,
            userId,
            instructions: [], // Send an empty array for instructions
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to create session");
        }

        const data = await response.json();
        setSessionToken(data.client_secret.value);
        
        await loadChatHistory();
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error initializing session:", error);
        setError(error instanceof Error ? error.message : "Failed to create session");
        
        setMessages([{
          role: "assistant",
          content: "Welcome. How can I help you?",
          type: "text",
          isComplete: true
        }]);
      }
    };

    initializeSession();
  }, []);

  useEffect(() => {
    if (!sessionToken) return;

    // For transcription mode, we need to connect with intent=transcription
    const ws = new WebSocket(
      `wss://api.openai.com/v1/realtime?intent=transcription`,
      [
        "realtime",
        `openai-insecure-api-key.${sessionToken}`,
        "openai-beta.realtime-v1"
      ]
    );

    ws.onopen = () => {
      setIsConnected(true);
      setError(null);

      // Basic session configuration based on the OpenAI Realtime Agents approach
      const config = {
        type: "session.update",
        session: {
          input_audio_format: "pcm16",
          turn_detection: {
            type: "server_vad",
            threshold: 0.5,
            prefix_padding_ms: 300,
            silence_duration_ms: 200,
            create_response: true,
          }
        }
      };
      ws.send(JSON.stringify(config));
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setError("WebSocket connection error");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as WebSocketMessage;
        handleWebSocketMessage(data);
      } catch (error) {
        setError("Error processing message");
      }
    };

    wsRef.current = ws;

    return () => {
      ws.close();
    };
  }, [sessionToken]);

  useEffect(() => {
    const getAudioDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = devices
          .filter(device => device.kind === 'audioinput')
          .map(device => ({
            deviceId: device.deviceId,
            label: device.label || `Microphone ${device.deviceId.slice(0, 5)}...`
          }));
        setAudioDevices(audioInputs);
        
        if (audioInputs.length > 0 && !selectedDeviceId) {
          setSelectedDeviceId(audioInputs[0].deviceId);
        }
      } catch (error) {
        console.error('Error getting audio devices:', error);
        setError('Error accessing audio devices');
      }
    };

    getAudioDevices();
  }, []);

  useEffect(() => {
    return () => {
      if (isCallActive) {
        stopRecording();
        setIsCallActive(false);
      }
    };
  }, []);

  // Helper function to clean JSON responses
  const cleanJsonResponse = (content: string): string => {
    if (!content || typeof content !== 'string') return content;
    
    // Check if it looks like JSON (starts with { or [)
    const trimmedContent = content.trim();
    if ((trimmedContent.startsWith('{') && trimmedContent.endsWith('}')) || 
        (trimmedContent.startsWith('[') && trimmedContent.endsWith(']'))) {
      try {
        const jsonData = JSON.parse(trimmedContent);
        
        // Handle different JSON structures
        if (jsonData.action === "acknowledge") {
          return "Message received.";
        } 
        else if (jsonData.message) {
          return jsonData.message;
        }
        else if (jsonData.function) {
          return `I'll help with ${jsonData.function.replace(/[_-]/g, ' ')}.`;
        }
        else if (typeof jsonData === 'object' && jsonData !== null) {
          // For other JSON objects, provide a readable interpretation
          const keys = Object.keys(jsonData);
          if (keys.length === 1) {
            // Handle simple key-value objects more elegantly
            const key = keys[0];
            const value = jsonData[key];
            
            if (typeof value === 'string') {
              return `${key}: ${value}`;
            } else if (typeof value === 'object' && value !== null) {
              return `I have information about ${key}.`;
            }
          }
          
          // Generic fallback for other objects
          return "I have processed your request.";
        }
      } catch (e) {
        console.log("Failed to parse JSON content, keeping as is");
        // Not valid JSON, return original content
      }
    }
    
    // Return original content if no processing was done
    return content;
  };

  const handleWebSocketMessage = useCallback((data: WebSocketMessage) => {
    // No logging at all, just process the message
    
    if (data.type === "session.updated") {
      // No action needed
    } 
    else if (data.type === "input_audio_buffer.speech_started") {
      // Add a placeholder message. We will find and update this later.
      setMessages((prev) => {
        // Avoid adding multiple placeholders if events fire rapidly
        const hasPlaceholder = prev.some(m => m.role === "user" && m.type === "audio" && m.content === "Transcribing..." && !m.isComplete);
        if (!hasPlaceholder) {
          const placeholderMessage: Message = {
            role: "user",
            content: "Transcribing...", 
            type: "audio",
            isComplete: false
          };
          return [...prev, placeholderMessage];
        } else {
          return prev;
        }
      });
    } 
    else if (data.type === "input_audio_buffer.speech_stopped") {
      console.log("Speech stopped");
    }
    else if (data.type === "input_audio_buffer.committed") {
      console.log("Audio buffer committed");
    }
    else if (data.type === "conversation.item.created") {
      console.log("Conversation item created", JSON.stringify(data.item, null, 2));
      if (data.item?.role === "user") {
        // For user messages
        let content = "";
        
        // Extract content from different formats following OpenAI Realtime Agents approach
        if (Array.isArray(data.item.content) && data.item.content.length > 0) {
          const contentItem = data.item.content[0];
          if (contentItem.type === "input_text") {
            content = contentItem.text || "";
          }
          // Note: We don't handle audio content here - it's handled by transcription events
        } else if (typeof data.item.content === "string") {
          content = data.item.content;
        }

        if (content) {
          const newMessage: Message = {
            role: "user",
            content: content,
            type: "text",
            isComplete: true
          };
          
          setMessages((prev) => {
            // Remove any temporary transcribing message
            const filtered = prev.filter(m => !(m.role === "user" && m.type === "audio" && !m.isComplete));
            // Check for duplicates
            const isDuplicate = filtered.some(
              (msg) => msg.role === newMessage.role && msg.content === newMessage.content
            );
            return isDuplicate ? filtered : [...filtered, newMessage];
          });
        }
      } else if (data.item?.role === "assistant") {
        // For assistant messages
        let content = "";
        if (Array.isArray(data.item.content) && data.item.content.length > 0) {
          content = data.item.content[0]?.text || "";
        } else if (typeof data.item.content === "string") {
          content = data.item.content;
        }
        
        if (content) {
          const newMessage: Message = {
            role: "assistant",
            content: content,
            type: "text",
          };
          
          setMessages((prev) => {
            const isDuplicate = prev.some(
              (msg) => msg.role === newMessage.role && msg.content === newMessage.content
            );
            return isDuplicate ? prev : [...prev, newMessage];
          });
        }
      }
    }
    // Key event for transcription - similar to OpenAI Realtime Agents approach
    else if (data.type === "conversation.item.input_audio_transcription.completed") {
      console.log("Received completed transcription event:", JSON.stringify(data, null, 2));
      const finalTranscript = typeof data.transcript === 'string' && data.transcript.trim() 
        ? data.transcript.trim() 
        : "[Transcription empty or failed]";

      setMessages((prev) => {
        // Find the *last* message that looks like our placeholder
        const transcriptionIndex = prev.findLastIndex(msg => 
            msg.role === "user" && 
            msg.type === "audio" && 
            !msg.isComplete
        );
        
        if (transcriptionIndex >= 0) {
          console.log(`Updating placeholder at index ${transcriptionIndex} with final transcript:`, finalTranscript);
          const updatedMessages = [...prev];
          updatedMessages[transcriptionIndex] = {
            ...prev[transcriptionIndex],
            content: finalTranscript,
            isComplete: true,
            itemId: data.item_id || prev[transcriptionIndex].itemId // Assign the final item ID
          };
          return updatedMessages;
        } else {
          // If no placeholder found (maybe missed speech_started?), create a new message.
          console.log("No placeholder found, creating new completed transcription message:", finalTranscript);
          const newMessage: Message = {
            role: "user",
            content: finalTranscript,
            type: "audio",
            itemId: data.item_id,
            isComplete: true
          };
          return [...prev, newMessage];
        }
      });
      
      // Once transcription is complete, create a new session with RAG and then request a response
      if (finalTranscript && finalTranscript !== "[Transcription empty or failed]") {
<<<<<<< HEAD
        const voiceStartTime = performance.now();
        console.time('🎤 Voice Message Pipeline');
        setIsLoading(true); // Use the main loading state
        
        console.time('🤖 Voice RAG Session');
        createSessionWithRAG(finalTranscript)
          .then(newSessionToken => {
            console.timeEnd('🤖 Voice RAG Session');
=======
        setIsLoading(true); // Use the main loading state
        createSessionWithRAG(finalTranscript)
          .then(newSessionToken => {
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
            setSessionToken(newSessionToken);
            
            const waitForConnection = setInterval(() => {
              if (wsRef.current?.readyState === WebSocket.OPEN) {
                clearInterval(waitForConnection);
                
<<<<<<< HEAD
                console.time('🎤 Voice Response Request');
=======
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
                // Request a response with both text and audio
                const responseEvent = {
                  type: "response.create",
                  response: {
                    modalities: ["text", "audio"]
                  }
                };
                wsRef.current.send(JSON.stringify(responseEvent));
<<<<<<< HEAD
                console.timeEnd('🎤 Voice Response Request');
                
                const voiceTotalTime = performance.now() - voiceStartTime;
                console.timeEnd('🎤 Voice Message Pipeline');
                console.log(`⚡ Voice message processing time: ${voiceTotalTime.toFixed(2)}ms`);
=======
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
                // isLoading will be set to false by response.done or error handlers
              }
            }, 100);

            setTimeout(() => {
              clearInterval(waitForConnection);
              if (wsRef.current?.readyState !== WebSocket.OPEN) {
                console.error("WebSocket connection timed out after RAG for voice");
                setError("Connection failed after processing voice. Please try again.");
                setIsLoading(false);
              }
            }, 10000); // 10-second timeout
          })
          .catch(error => {
            console.error("Error creating RAG session for voice input:", error);
            setError("Failed to get an intelligent response for your voice query. Please try again.");
            setIsLoading(false);
          });
      } else {
        // If transcription failed or is empty, don't attempt RAG or response,
        // and ensure loading state is reset if it was somehow set.
        setIsLoading(false); 
      }
    } 
    // Handle incremental transcription updates
    else if (data.type === "conversation.item.input_audio_transcription.delta") {
      console.log("Received transcription delta event:", JSON.stringify(data, null, 2));
      if (data.delta) {
        const deltaText = data.delta || "";
        setMessages((prev) => {
          // Find the *last* message that looks like our placeholder or is being transcribed
          const transcriptionIndex = prev.findLastIndex(msg => 
            msg.role === "user" && 
            msg.type === "audio" && 
            !msg.isComplete
          );
          
          if (transcriptionIndex >= 0) {
            const updatedMessages = [...prev];
            const existingMessage = prev[transcriptionIndex];
            const newContent = existingMessage.content === "Transcribing..." 
              ? deltaText 
              : existingMessage.content + deltaText;
            
            updatedMessages[transcriptionIndex] = {
              ...existingMessage,
              content: newContent,
              itemId: data.item_id || existingMessage.itemId // Assign item ID if available
            };
            
            console.log(`Updated message at index ${transcriptionIndex} with delta. New content:`, newContent);
            return updatedMessages;
          } else {
            // If no placeholder found, create a new message with the delta
            console.log("No placeholder found, creating new message with delta:", deltaText);
            const newMessage: Message = {
              role: "user",
              content: deltaText,
              type: "audio",
              itemId: data.item_id,
              isComplete: false
            };
            return [...prev, newMessage];
          }
        });
      }
    }
    else if (data.type === "response.output_item.added") {
      console.log("Output item added:", JSON.stringify(data.item, null, 2));
      // Handle assistant messages from response output
      if (data.item?.role === "assistant") {
        let content = "";
        let type: "text" | "audio" = "text";
        
        if (Array.isArray(data.item.content) && data.item.content.length > 0) {
          const contentItem = data.item.content[0];
          if (contentItem.type === "text") {
            content = contentItem.text || "";
          } else if (contentItem.type === "audio") {
            content = contentItem.transcript || "Assistant audio";
            type = "audio"; // Mark as audio type, even if we display transcript
          }
        } else if (typeof data.item.content === "string") {
          content = data.item.content;
        }

        // Clean up JSON response
        content = cleanJsonResponse(content);
        
        if (content) {
          const newMessage: Message = {
            role: "assistant",
            content: content,
            type: type, // Use determined type
          };
          
          setMessages((prev) => {
            // Consider updating existing assistant message if partial responses come
            const isDuplicate = prev.some(
              (msg) => msg.role === newMessage.role && msg.content === newMessage.content
            );
            return isDuplicate ? prev : [...prev, newMessage];
          });
        }
      }
    } 
    else if (data.type === "response.done") {
      console.log("Response done:", JSON.stringify(data, null, 2));
      if (data.response?.output && Array.isArray(data.response.output)) {
        const outputItem = data.response.output[0];
        if (outputItem) {
          let content = "";
          let type: "text" | "audio" = "text";
          
          if (outputItem.content && Array.isArray(outputItem.content)) {
            const contentItem = outputItem.content[0];
            if (contentItem?.type === "text") {
              content = contentItem.text || "";
            } else if (contentItem?.type === "audio") {
              content = contentItem.transcript || "Assistant audio";
              type = "audio"; // Mark as audio type
            }
          } else if (typeof outputItem.content === "string") {
            content = outputItem.content;
          }

          // Clean up JSON response
          content = cleanJsonResponse(content);
          
          if (content) {
            const newMessage: Message = {
              role: "assistant",
              content: content,
              type: type, // Use determined type
            };

            setMessages((prev) => {
              const isDuplicate = prev.some(
                (msg) => msg.role === newMessage.role && msg.content === newMessage.content
              );
              // Add the final message if not already added by output_item.added
              return isDuplicate ? prev : [...prev, newMessage];
            });
          }
        }
      }
      setIsLoading(false);
    } 
    else if (data.type === "error") {
      console.error("Server error:", data);
      setError("Server error: " + (data as any).error?.message || "Unknown error");
      setIsLoading(false);
    }
    // Add handler for response.audio.delta with better error handling
    else if (data.type === "response.audio.delta" && data.delta) {
      if (!audioContext) {
        console.error("AudioContext not initialized");
        // Try to initialize audio context on demand
        try {
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({
            sampleRate: 24000,
            latencyHint: 'interactive'
          });
          
          const gain = ctx.createGain();
          gain.connect(ctx.destination);
          gain.gain.value = 0.8;
          
          setAudioContext(ctx);
          setGainNode(gain);
          
          // Attempt to resume the context
          if (ctx.state === 'suspended') {
            ctx.resume().catch(err => {
              console.error("Failed to resume new AudioContext:", err);
            });
          }
        } catch (err) {
          console.error("Error creating AudioContext on demand:", err);
          return;
        }
      } else if (audioContext.state === 'suspended') {
        // Try to resume the context
        audioContext.resume().catch(err => {
          console.error("Failed to resume AudioContext:", err);
        });
      }
      
      if (!isAudioPlaybackEnabled) {
        console.log("Audio playback disabled");
        return;
      }

      // Process the audio data
      processAudioData(data.delta).then((audioBuffer) => {
        if (audioBuffer && audioContext) {
          // Add to queue and try to play
          audioQueueRef.current.push(audioBuffer);
          playQueuedAudio().catch(err => {
            console.error("Error playing queued audio:", err);
          });
        }
      }).catch(err => {
        console.error("Error processing audio data:", err);
      });
    }
    // Add handler for response.audio.done (optional, could be used for cleanup)
    else if (data.type === "response.audio.done") {
        console.log("Audio response completed");
    }
  }, [audioContext, isAudioPlaybackEnabled]);

  // Function to create a new session optimized with RAG for the current query
  const createSessionWithRAG = async (userQuery: string) => {
<<<<<<< HEAD
    const ragStartTime = performance.now();
    console.time('🕰️ RAG Session Creation');
    
    try {
      console.time('🔑 User Auth Check');
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;
      console.timeEnd('🔑 User Auth Check');
      
      // Create a new session with the user's query for RAG context
      console.time('🌐 API Call to /api/chat');
=======
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;
      
      // Create a new session with the user's query for RAG context
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: REALTIME_MODEL_ID,
          userId,
          instructions: [], // Use an empty array, NOT chatbotInstructions
          userQuery // This is the key parameter for RAG search
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create RAG session");
      }

      const data = await response.json();
<<<<<<< HEAD
      console.timeEnd('🌐 API Call to /api/chat');
      
      const ragTotalTime = performance.now() - ragStartTime;
      console.timeEnd('🕰️ RAG Session Creation');
      console.log(`⚡ RAG session creation time: ${ragTotalTime.toFixed(2)}ms`);
=======
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
      
      // Return the token rather than setting it directly
      return data.client_secret.value;
    } catch (error) {
      setError("Failed to optimize response for your query. Please try again.");
      throw error;
    }
  };

  const handleSendMessage = () => {
    if (!wsRef.current || !inputText.trim() || isLoading) return;

<<<<<<< HEAD
    const startTime = performance.now();
    console.time('💬 Text Message Pipeline');
    
=======
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
    // Store the user's message to use for RAG context
    const userQuery = inputText.trim();
    const currentMessage = inputText;
    
    setIsLoading(true);
    const userMessage: Message = {
      role: "user",
      content: currentMessage,
      type: "text",
    };
    setMessages((prev) => [...prev, userMessage]);

    // Clear the input immediately for better UX
    setInputText("");

    // Create a new session with RAG context first to improve relevance
<<<<<<< HEAD
    console.time('🤖 Create RAG Session');
    createSessionWithRAG(userQuery)
      .then(newSessionToken => {
        console.timeEnd('🤖 Create RAG Session');
=======
    createSessionWithRAG(userQuery)
      .then(newSessionToken => {
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
        // Set the new token, which will trigger a new WebSocket connection 
        // in the useEffect hook that depends on sessionToken
        setSessionToken(newSessionToken);
        
        // We need to store the user's message to send once the WebSocket connects
        // Create a one-time event listener for when the WebSocket connection is established
        const waitForConnection = setInterval(() => {
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            clearInterval(waitForConnection);
            
<<<<<<< HEAD
            console.time('🗨️ WebSocket Message Send');
=======
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
            // Send the user's message after ensuring the connection is open
            const message = {
              type: "conversation.item.create",
              item: {
                type: "message",
                role: "user",
                content: [
                  {
                    type: "input_text",
                    text: currentMessage,
                  },
                ],
              },
            };
            wsRef.current.send(JSON.stringify(message));

            // For text chat, only request text responses (no audio)
            const responseEvent = {
              type: "response.create",
              response: {
                modalities: ["text"]  // Text only for typed messages
              }
            };
            wsRef.current.send(JSON.stringify(responseEvent));
<<<<<<< HEAD
            console.timeEnd('🗨️ WebSocket Message Send');
            
            const totalTime = performance.now() - startTime;
            console.timeEnd('💬 Text Message Pipeline');
            console.log(`⚡ Text message setup time: ${totalTime.toFixed(2)}ms`);
=======
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
          }
        }, 100);
        
        // Timeout after 10 seconds to prevent infinite waiting
        setTimeout(() => {
          clearInterval(waitForConnection);
          if (wsRef.current?.readyState !== WebSocket.OPEN) {
            console.error("WebSocket connection timed out");
            setError("Connection failed. Please try again.");
            setIsLoading(false);
          }
        }, 10000);
      })
      .catch(error => {
        console.error("Error creating RAG session:", error);
        setError("Failed to optimize response for your query. Please try again.");
        setIsLoading(false);
      });
  };

  const toggleCall = async () => {
    if (isCallActive) {
      // End call
      try {
        stopRecording();
        setIsCallActive(false);

        // Clear the buffer
        if (wsRef.current) {
          const clearMessage = {
            type: "input_audio_buffer.clear"
          };
          wsRef.current.send(JSON.stringify(clearMessage));
        }

        // Reset loading state to ensure UI is ready for next recording
        setIsLoading(false);
      } catch (error) {
        console.error("Error ending call:", error);
        setError("Error ending call: " + (error instanceof Error ? error.message : "Unknown error"));
        setIsLoading(false);
      }
    } else {
      // Start call
      if (isLoading) return; // Don't start a call while loading
      
      try {
        setIsLoading(true);

        // Make sure audio context is initialized and resumed
        if (!audioContext) {
          try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({
              sampleRate: 24000,
              latencyHint: 'interactive'
            });
            
            const gain = ctx.createGain();
            gain.connect(ctx.destination);
            gain.gain.value = 0.8; // Slightly reduce volume to prevent clipping
            
            setAudioContext(ctx);
            setGainNode(gain);
            
            // Attempt to resume the context immediately
            if (ctx.state === 'suspended') {
              await ctx.resume();
            }
          } catch (err) {
            console.error("Error initializing AudioContext:", err);
            setError("Could not initialize audio playback");
          }
        } else if (audioContext.state === 'suspended') {
          // Resume existing audio context if suspended
          try {
            await audioContext.resume();
          } catch (err) {
            console.error("Failed to resume AudioContext:", err);
          }
        }

        // Clear any existing audio buffer when starting a new call
        if (wsRef.current) {
          const clearMessage = {
            type: "input_audio_buffer.clear"
          };
          wsRef.current.send(JSON.stringify(clearMessage));
        }

        // Make sure audio playback is enabled
        setIsAudioPlaybackEnabled(true);

        // Reset error state
        setError(null);
        
        // Start recording
        await startRecording();
        setIsCallActive(true);
        setIsLoading(false);
      } catch (error) {
        console.error("Error starting call:", error);
        setError("Error starting call. Please check your microphone permissions.");
        setIsLoading(false);
      }
    }
  };

  const startRecording = async () => {
    if (!wsRef.current) {
      console.error("WebSocket connection not established");
      setError("WebSocket connection not established");
      return;
    }
    
    try {
      setError(null);
      
      // Make sure any previous audioStream is fully cleaned up
      if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
        setAudioStream(null);
      }
      
      console.log("Starting recording with device:", selectedDeviceId);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
          channelCount: 1,
          sampleRate: 24000,
          sampleSize: 16,
        }
      });
      console.log("Audio stream obtained successfully:", stream.getAudioTracks()[0].label);
      setAudioStream(stream);
      
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 24000,
      });
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      
      // Make sure chunks are reset
      audioChunksRef.current = [];
      let accumulatedChunks = 0;
      
      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        const chunk = new Float32Array(inputData);
        audioChunksRef.current.push(chunk);
        
        // Calculate the duration of accumulated audio
        // Each chunk is 4096 samples at 24000Hz = 170.6ms
        // We need to accumulate at least 100ms before sending
        accumulatedChunks++;
        const accumulatedDurationMs = (accumulatedChunks * 4096 / 24000) * 1000;
        
        // Immediately send audio data to server for real-time processing
        if (wsRef.current && accumulatedDurationMs >= 200) { // Send in ~200ms chunks
          try {
            // Merge accumulated chunks
            const totalLength = audioChunksRef.current.reduce((acc, chunk) => acc + chunk.length, 0);
            const mergedData = new Float32Array(totalLength);
            let offset = 0;
            audioChunksRef.current.forEach(chunk => {
              mergedData.set(chunk, offset);
              offset += chunk.length;
            });
            
            // Convert to PCM16
            const pcm16Data = new Int16Array(mergedData.length);
            for (let i = 0; i < mergedData.length; i++) {
              const s = Math.max(-1, Math.min(1, mergedData[i]));
              pcm16Data[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
            }

            // Convert to base64
            let binary = '';
            const bytes = new Uint8Array(pcm16Data.buffer);
            const len = bytes.byteLength;
            for (let i = 0; i < len; i++) {
              binary += String.fromCharCode(bytes[i]);
            }
            const base64Audio = btoa(binary);

            // Send to server - no need to commit with server VAD
            const appendMessage = {
              type: "input_audio_buffer.append",
              audio: base64Audio
            };
            wsRef.current.send(JSON.stringify(appendMessage));
            console.log(`Sent audio chunk, length: ${base64Audio.length}, duration: ${accumulatedDurationMs.toFixed(2)}ms`);
            
            // Clear accumulated chunks after sending
            audioChunksRef.current = [];
            accumulatedChunks = 0;
          } catch (error) {
            console.error("Error sending audio chunk:", error);
          }
        }
      };

      source.connect(processor);
      processor.connect(audioContext.destination);

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.onstop = () => {
        if (!audioChunksRef.current.length) {
          console.error("No audio data collected");
          setError("No audio data collected. Please try again.");
          return;
        }
        
        source.disconnect();
        processor.disconnect();
        audioContext.close();
        audioChunksRef.current = [];
        
        // Don't set loading state here, since it gets handled elsewhere
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      setError("Error accessing microphone. Please check your permissions.");
      setIsCallActive(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      try {
        mediaRecorderRef.current.stop();
        if (audioStream) {
          audioStream.getTracks().forEach(track => {
            try {
              track.stop();
            } catch (e) {
              console.error("Error stopping track:", e);
            }
          });
          setAudioStream(null);
        }
        setIsRecording(false);
        // Reset the media recorder reference
        mediaRecorderRef.current = null;
      } catch (error) {
        console.error("Error in stopRecording:", error);
        // Continue with cleanup even if there's an error
        setAudioStream(null);
        setIsRecording(false);
        mediaRecorderRef.current = null;
      }
    }
  };

  // Initialize audio context with proper settings
  useEffect(() => {
    if (!audioContext) {
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({
          sampleRate: 24000,
          latencyHint: 'interactive'
        });
        
        const gain = ctx.createGain();
        gain.connect(ctx.destination);
        gain.gain.value = 0.8; // Slightly reduce volume to prevent clipping
        
        setAudioContext(ctx);
        setGainNode(gain);
        
        // Resume context on user interaction
        const resumeContext = async () => {
          if (ctx.state === 'suspended') {
            await ctx.resume();
            console.log("AudioContext resumed on user interaction");
          }
        };
        document.addEventListener('click', resumeContext);
        document.addEventListener('touchstart', resumeContext);
        
        return () => {
          document.removeEventListener('click', resumeContext);
          document.removeEventListener('touchstart', resumeContext);
          gain.disconnect();
          ctx.close();
        };
      } catch (err) {
        console.error("Error initializing AudioContext:", err);
        setError("Could not initialize audio playback");
      }
    }
  }, []);

  // Improved audio processing function
  const processAudioData = async (base64Data: string): Promise<AudioBuffer | null> => {
    if (!audioContext) {
      console.error("AudioContext not initialized");
      return null;
    }

    try {
      // 1. Decode Base64
      const binaryString = atob(base64Data);
      const len = binaryString.length;
      let audioBytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        audioBytes[i] = binaryString.charCodeAt(i);
      }

      // 2. Handle byte alignment for Int16
      if (audioBytes.byteLength % 2 !== 0) {
        console.warn("Received audio data with odd byte length, padding with zero");
        const paddedBytes = new Uint8Array(len + 1);
        paddedBytes.set(audioBytes);
        paddedBytes[len] = 0;
        audioBytes = paddedBytes;
      }

      // 3. Convert to Int16Array
      const pcm16Data = new Int16Array(audioBytes.buffer, audioBytes.byteOffset, audioBytes.byteLength / 2);

      // 4. Convert to Float32Array with normalization
      const float32Data = new Float32Array(pcm16Data.length);
      for (let i = 0; i < pcm16Data.length; i++) {
        const sample = pcm16Data[i];
        float32Data[i] = sample < 0 ? sample / 32768.0 : sample / 32767.0;
      }

      // 5. Calculate and remove DC offset
      let dcOffset = 0;
      for (let i = 0; i < float32Data.length; i++) {
        dcOffset += float32Data[i];
      }
      dcOffset /= float32Data.length;

      // 6. Create and fill AudioBuffer
      const audioBuffer = audioContext.createBuffer(
        1, // mono
        float32Data.length,
        audioContext.sampleRate
      );
      const channelData = audioBuffer.getChannelData(0);

      // Apply DC offset removal and simple low-pass filter
      let prevSample = 0;
      const alpha = 0.05; // Smoothing factor for low-pass filter
      for (let i = 0; i < float32Data.length; i++) {
        // Remove DC offset and apply low-pass filter
        const sample = float32Data[i] - dcOffset;
        prevSample = sample * alpha + prevSample * (1 - alpha);
        channelData[i] = prevSample;
      }

      return audioBuffer;
    } catch (error) {
      console.error("Error processing audio data:", error);
      return null;
    }
  };

  // Improved playback function with better timing and crossfading
  const playQueuedAudio = async () => {
    if (!audioContext || !gainNode || audioQueueRef.current.length === 0) {
      return;
    }

    if (isPlayingAssistantAudioRef.current) {
      return; // Already playing
    }

    if (!isAudioPlaybackEnabled) {
      console.log("Playback disabled, clearing queue.");
      audioQueueRef.current = [];
      return;
    }

    // Resume audio context if suspended
    if (audioContext.state === 'suspended') {
      try {
        await audioContext.resume();
        console.log("AudioContext resumed successfully");
      } catch (err) {
        console.error("Failed to resume AudioContext:", err);
        setError("Audio playback failed. Please interact with the page to enable audio.");
        return;
      }
    }

    // Calculate total buffered duration
    const totalQueuedDuration = audioQueueRef.current.reduce((sum, buffer) => sum + buffer.duration, 0);

    // Wait for more data if below threshold
    if (totalQueuedDuration < BUFFER_THRESHOLD_SECONDS) {
      console.log(`Buffering... Queued: ${totalQueuedDuration.toFixed(3)}s`);
      return;
    }

    isPlayingAssistantAudioRef.current = true;
    console.log(`Starting playback with ${audioQueueRef.current.length} chunks`);

    // Initialize next play time if needed
    if (nextPlayTimeRef.current <= 0) {
      nextPlayTimeRef.current = audioContext.currentTime + 0.1;
    }

    const playNextChunk = () => {
      if (!audioContext || !gainNode || !isAudioPlaybackEnabled) {
        audioQueueRef.current = [];
        isPlayingAssistantAudioRef.current = false;
        nextPlayTimeRef.current = 0;
        return;
      }

      if (audioQueueRef.current.length === 0) {
        isPlayingAssistantAudioRef.current = false;
        return;
      }

      const audioBuffer = audioQueueRef.current.shift();
      if (!audioBuffer) return;

      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;

      // Create gain node for this chunk
      const chunkGain = audioContext.createGain();
      source.connect(chunkGain);
      chunkGain.connect(gainNode);

      // Calculate precise timing
      const currentTime = audioContext.currentTime;
      const startTime = Math.max(currentTime, nextPlayTimeRef.current);
      
      // Apply crossfading
      const timeDifference = startTime - currentTime;
      if (timeDifference < CROSSFADE_DURATION) {
        // Fade in
        chunkGain.gain.setValueAtTime(0, startTime);
        chunkGain.gain.linearRampToValueAtTime(1, startTime + CROSSFADE_DURATION);
        
        // Fade out at the end
        const endTime = startTime + audioBuffer.duration;
        chunkGain.gain.setValueAtTime(1, endTime - CROSSFADE_DURATION);
        chunkGain.gain.linearRampToValueAtTime(0, endTime);
      }

      try {
        source.start(startTime);
        
        // Schedule next chunk
        const duration = audioBuffer.duration;
        nextPlayTimeRef.current = startTime + duration - CROSSFADE_DURATION;
        
        // Schedule the next chunk slightly before this one ends
        const timeUntilNext = (nextPlayTimeRef.current - currentTime) * 0.95;
        
        const timeoutId = setTimeout(() => {
          if (isPlayingAssistantAudioRef.current) {
            playNextChunk();
          }
        }, Math.max(10, timeUntilNext * 1000));

        source.onended = () => {
          clearTimeout(timeoutId);
          chunkGain.disconnect();

          if (isPlayingAssistantAudioRef.current && 
              audioContext && 
              audioContext.currentTime >= nextPlayTimeRef.current + CROSSFADE_DURATION) {
            playNextChunk();
          }
        };

      } catch (err) {
        console.error("Error starting audio:", err);
        if (audioContext) {
          nextPlayTimeRef.current = audioContext.currentTime + 0.1;
        }
        chunkGain.disconnect();
        setTimeout(playNextChunk, 100);
      }
    };

    playNextChunk();
  };

  // Effect to scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Modify the loadChatHistory function to prevent duplicate calls
  const loadChatHistory = async () => {
    if (hasLoadedHistory.current) {
      logger.log('Chat history already loaded, skipping duplicate fetch');
      return;
    }
    
    try {
      logger.log('Loading chat history...');
      setIsLoadingHistory(true);
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (!session || !session.user) {
        logger.log('No user found in chat session');
        // Add a default welcome message if no user is found
        setMessages([
          {
            role: "assistant",
            content: "Welcome. How can I help you?",
            type: "text",
            isComplete: true
          }
        ]);
        hasLoadedHistory.current = true;
        return;
      }

      const { data, error } = await supabase
        .from('chat_history')
        .select('messages')
        .eq('user_id', session.user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No chat history found for this user, this is normal for new users
          logger.log('No chat history found for user, setting default welcome message');
          setMessages([
            {
              role: "assistant",
              content: "Welcome. How can I help you?",
              type: "text",
              isComplete: true
            }
          ]);
        } else {
          // Some other error occurred
          throw error;
        }
      } else if (data && data.messages && data.messages.length > 0) {
        // We have chat history, use it
        setMessages(data.messages);
      } else {
        // We have a record but no messages, set default welcome message
        setMessages([
          {
            role: "assistant",
            content: "Welcome. How can I help you?",
            type: "text",
            isComplete: true
          }
        ]);
      }
      hasLoadedHistory.current = true;
    } catch (error) {
      logger.error('Error loading chat history:', error);
      toast.error('Failed to load chat history');
      // Add a default welcome message if there's an error
      setMessages([
        {
          role: "assistant",
          content: "Welcome. How can I help you?",
          type: "text",
          isComplete: true
        }
      ]);
    } finally {
      setIsLoadingHistory(false);
    }
  };
  
  // Modify the saveHistory function to use debounce to prevent excessive saves
  // Create a debounced version of saveChatHistory
  const debouncedSaveChatHistory = useCallback(
    debounce(async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          logger.log('No user found, skipping chat history save');
          return;
        }

        // Only save if there are messages
        if (messages.length === 0) {
          return;
        }

        // Use upsert to either insert a new record or update the existing one
        const { error } = await supabase
          .from('chat_history')
          .upsert(
            {
              user_id: session.user.id,
              messages: messages
            },
            {
              onConflict: 'user_id'
            }
          );

        if (error) {
          logger.error('Error saving chat history:', error);
        } else {
          logger.log('Chat history saved successfully');
        }
      } catch (error) {
        logger.error('Error saving chat history:', error);
      }
    }, 2000), // Wait 2 seconds before saving to reduce duplicate saves
    [messages, supabase]
  );
  
  // Update the save useEffect
  useEffect(() => {
    if (messages.length > 0) {
      debouncedSaveChatHistory();
      
      // Clean up the debounce function when the component unmounts
      return () => {
        debouncedSaveChatHistory.cancel();
      };
    }
  }, [messages, debouncedSaveChatHistory]);

  // Modify the clearChatHistory function
  const clearChatHistory = async () => {
    try {
      setIsClearingChat(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        console.log('No user found, skipping chat history clear');
        return;
      }

      // Just update the record with an empty messages array
      const { error } = await supabase
        .from('chat_history')
        .upsert(
          {
            user_id: session.user.id,
            messages: [{
              role: "assistant",
              content: "Welcome. How can I help you?",
              type: "text",
              isComplete: true
            }]
          },
          {
            onConflict: 'user_id'
          }
        );

      if (error) {
        console.error('Error clearing chat history:', error);
        return;
      }

      // Set default welcome message after clearing
      setMessages([
        {
          role: "assistant",
          content: "Welcome. How can I help you?",
          type: "text",
          isComplete: true
        }
      ]);
    } catch (error) {
      console.error('Error clearing chat history:', error);
    } finally {
      setIsClearingChat(false);
    }
  };

<<<<<<< HEAD
  // Add this function near other handlers
  const handleHttpTextMessage = async () => {
    if (!inputText.trim() || isLoading) return;
    setIsLoading(true);
    setError(null);
    const userMessage: Message = {
      role: "user",
      content: inputText,
      type: "text",
      isComplete: true
    };
    setMessages((prev) => [...prev, userMessage]);
    const textToSend = inputText;
    setInputText("");
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: textToSend }],
          conversationId: sessionToken || "default-session"
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get response");
      }
      const data = await response.json();
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: data.content,
        type: "text",
        isComplete: true
      }]);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to get response");
    } finally {
      setIsLoading(false);
    }
  };

=======
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-white to-gray-50 rounded-xl border max-w-6xl mx-auto w-full">
      <div className="flex justify-between items-center p-4 border-b bg-white/80 backdrop-blur-sm rounded-t-xl">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold">
            A
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-800">Bot</h2>
            <p className="text-xs text-gray-500">Trades Business School</p>
          </div>
          {isLoadingHistory && (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
              <span className="text-sm text-gray-500">Loading history...</span>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearChatHistory}
          disabled={isClearingChat}
          className="text-gray-500 hover:text-gray-700 hover:bg-gray-100/80 transition-colors"
        >
          {isClearingChat ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
              <span>Clearing...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2">
                <path d="M3 6h18"></path>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                <line x1="10" x2="10" y1="11" y2="17"></line>
                <line x1="14" x2="14" y1="11" y2="17"></line>
              </svg>
              <span>Clear Chat</span>
            </div>
          )}
        </Button>
      </div>

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-[calc(100vh-280px)]" ref={scrollAreaRef}>
          <div className="space-y-4 p-6 pt-12">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                } animate-in fade-in slide-in-from-bottom-2 duration-300`}
              >
                <div className={`flex flex-col ${message.role === "user" ? "items-end" : "items-start"} w-full max-w-[75%] sm:max-w-[90%]`}>
                  <div
                    className={`rounded-2xl px-4 py-2 sm:px-5 sm:py-3 flex flex-col w-fit break-words ${
                      message.role === "user"
                        ? message.type === "audio" 
                          ? "bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                          : "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/20"
                        : "bg-white text-gray-800  border border-gray-100"
                    } ${message.type === "audio" && !message.isComplete ? "opacity-80" : ""}`}
                  >
                    <div className="w-full">
                      {message.type === "audio" && !message.isComplete && (
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            voice message...
                          </span>
                        </div>
                      )}
                      {message.role === "assistant" ? (
                        <div className={`prose prose-sm max-w-none text-gray-800 !text-[15px] sm:!text-[16px]`}>
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
                                <a href={href} className={`${message.role === "user" ? "text-blue-100" : "text-blue-500"} hover:underline`} target="_blank" rel="noopener noreferrer">
                                  {children}
                                </a>
                              ),
                              code: ({ children }) => (
                                <code className={`${message.role === "user" ? "bg-blue-400/30" : "bg-gray-100"} rounded px-1 py-0.5 text-sm`}>
                                  {children}
                                </code>
                              ),
                              pre: ({ children }) => (
                                <pre className={`${message.role === "user" ? "bg-blue-400/30" : "bg-gray-100"} rounded p-2 text-sm overflow-x-auto my-2`}>
                                  {children}
                                </pre>
                              ),
                              blockquote: ({ children }) => (
                                <blockquote className={`border-l-2 ${message.role === "user" ? "border-blue-300" : "border-gray-300"} pl-3 italic my-2`}>
                                  {children}
                                </blockquote>
                              ),
                              hr: () => <hr className="my-3 border-t border-gray-200" />
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap mb-0">
                          {message.type === "audio" && !message.isComplete ? "" : message.content}
                        </p>
                      )}
                    </div>
                  </div>
                  {message.type === "audio" && message.isComplete && (
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
            {isLoading && (
              <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="max-w-[75%] rounded-2xl px-5 py-3 flex flex-col bg-white text-gray-800  border border-gray-100">
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

      <div className="p-4 border-t bg-white/80 backdrop-blur-sm rounded-b-xl">
        <div className="flex flex-col gap-3">
          {isCallActive ? (
            // Call Active UI - Only show stop button and audio visualization
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center px-2">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                  <span className="text-sm font-medium text-gray-700">Recording...</span>
                </div>
                
                <Button
                  variant="destructive"
                  onClick={toggleCall}
                  className="flex items-center gap-1 rounded-full px-4  bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                  disabled={!isConnected || isLoading}
                >
                  {isLoading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  ) : (
                    <MicOff className="h-4 w-4 mr-1" />
                  )}
                  <span>End</span>
                </Button>
              </div>
              
<<<<<<< HEAD
              <SubtleVoiceIndicator
                state={voiceFeedback.state}
                errorType={voiceFeedback.errorType}
                errorMessage={voiceFeedback.errorMessage}
                processingText={voiceFeedback.processingText}
                onRetry={() => {
                  voiceFeedback.clearError();
                  if (voiceFeedback.errorType === 'microphone-permission') {
                    toggleCall(); // Retry microphone access
                  }
                }}
                onDismiss={() => voiceFeedback.clearError()}
                className="w-full"
              />
=======
              <AudioVisualizer isRecording={isRecording} stream={audioStream} />
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
            </div>
          ) : (
            // Normal UI - Show all options
            <div className="flex items-center gap-2">
              <Dialog open={showSettings} onOpenChange={setShowSettings}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100/80 transition-colors">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Audio Settings</DialogTitle>
                  </DialogHeader>
                  <div className="py-4">
                    <label className="text-sm font-medium mb-2 block">
                      Select Microphone
                    </label>
                    <Select
                      value={selectedDeviceId}
                      onValueChange={setSelectedDeviceId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a microphone" />
                      </SelectTrigger>
                      <SelectContent>
                        {audioDevices.map((device) => (
                          <SelectItem key={device.deviceId} value={device.deviceId}>
                            {device.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <div className="mt-4 flex items-center justify-between">
                      <label htmlFor="audio-playback" className="text-sm font-medium">
                        Enable Assistant Audio
                      </label>
                      <Switch 
                        id="audio-playback" 
                        checked={isAudioPlaybackEnabled} 
                        onCheckedChange={setIsAudioPlaybackEnabled}
                      />
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsAudioPlaybackEnabled(!isAudioPlaybackEnabled)} 
                title={isAudioPlaybackEnabled ? "Disable Audio" : "Enable Audio"}
                className="h-9 w-9 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100/80 transition-colors hidden"
              >
                {isAudioPlaybackEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>

              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
<<<<<<< HEAD
                  onKeyPress={(e) => e.key === "Enter" && handleHttpTextMessage()}
=======
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
                  className="w-full px-4 py-2 rounded-full border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none bg-white  transition-all"
                  placeholder="Type a message..."
                  disabled={!isConnected || isLoading}
                />
                {inputText && (
                  <Button 
                    className="absolute right-1 top-1 h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white  transition-all" 
                    size="icon"
<<<<<<< HEAD
                    onClick={handleHttpTextMessage}
=======
                    onClick={handleSendMessage}
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
                    disabled={!isConnected || isLoading || !inputText.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <Button
                variant="outline"
                onClick={toggleCall}
                className="flex items-center gap-1 rounded-full px-3 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all"
                disabled={!isConnected || isLoading}
              >
                {isLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
                ) : (
                  <Mic className="h-4 w-4" />
                )}
                <span className="text-xs">Speak</span>
              </Button>
            </div>
          )}
<<<<<<< HEAD
          
          {/* Voice feedback indicator for processing states */}
          {!isCallActive && (
            <div className="px-2">
              <SubtleVoiceIndicator
                state={voiceFeedback.state}
                errorType={voiceFeedback.errorType}
                errorMessage={voiceFeedback.errorMessage}
                processingText={voiceFeedback.processingText}
                onRetry={() => {
                  voiceFeedback.clearError();
                  setError(null);
                }}
                onDismiss={() => {
                  voiceFeedback.clearError();
                  setError(null);
                }}
                className="w-full"
              />
            </div>
          )}
=======
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
        </div>
      </div>
    </div>
  );
} 