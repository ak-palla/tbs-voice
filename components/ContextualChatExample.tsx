import { useState, useEffect } from 'react';
import { useContextualMemory } from '@/hooks/useContextualMemory';
import { v4 as uuidv4 } from 'uuid';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export default function ContextualChatExample() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { storeMessage, getRelevantContext, isLoading, error } = useContextualMemory();

  // Initialize a conversation ID when the component mounts
  useEffect(() => {
    setConversationId(uuidv4());
  }, []);

  // Function to send a message
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // Create user message
    const userMessage: Message = {
      role: 'user',
      content: input,
    };
    
    // Add user message to the chat
    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);
    
    try {
      // Store the user message in Qdrant
      await storeMessage(userMessage, conversationId);
      
      // Get relevant context for the current query
      const relevantMessages = await getRelevantContext(input, conversationId);
      
      // For this example, we'll make a simple API call to get a response
      // In a real app, you'd use the getResponseWithContext function
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          conversationId,
          relevantMessages,
        }),
      });
      
      const data = await response.json();
      
      // Create assistant message
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.content || 'Sorry, I could not generate a response.',
      };
      
      // Add assistant message to the chat
      setMessages(prev => [...prev, assistantMessage]);
      
      // Store the assistant message in Qdrant
      await storeMessage(assistantMessage, conversationId);
      
    } catch (err) {
      console.error('Error processing message:', err);
    } finally {
      setInput('');
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 my-8">
            <p>Start a conversation to see contextual memory in action</p>
          </div>
        )}
        
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-black'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        
        {isProcessing && (
          <div className="flex justify-start">
            <div className="max-w-[70%] rounded-lg p-3 bg-gray-200 text-black">
              <div className="flex space-x-2">
                <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce delay-300"></div>
              </div>
            </div>
          </div>
        )}
        
        {error && (
          <div className="text-red-500 text-center">
            {error.message || 'An error occurred'}
          </div>
        )}
      </div>

      <form onSubmit={sendMessage} className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isProcessing || isLoading}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            disabled={isProcessing || isLoading || !input.trim()}
          >
            Send
          </button>
        </div>
      </form>
      
      <div className="p-2 text-xs text-gray-500 text-center">
        <p>Conversation ID: {conversationId}</p>
      </div>
    </div>
  );
} 