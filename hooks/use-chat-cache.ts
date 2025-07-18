import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/utils/supabase/client';
import { Message } from '@/types/chat';

const supabase = createClient();

// Cache keys
const CHAT_KEYS = {
  history: (userId: string) => ['chat-history', userId],
  messages: (userId: string) => ['chat-messages', userId],
  context: (userId: string) => ['chat-context', userId],
};

export function useChatCache() {
  const queryClient = useQueryClient();

  // Fetch chat history from cache first, then network
  const { data: chatHistory, isLoading: isLoadingHistory } = useQuery({
    queryKey: CHAT_KEYS.history(userId),
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      
      if (!userId) return [];

      const { data, error } = await supabase
        .from('chat_history')
        .select('messages')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data?.messages || [];
    },
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    cacheTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
  });

  // Mutation to update chat history
  const { mutate: updateChatHistory } = useMutation({
    mutationFn: async (messages: Message[]) => {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      
      if (!userId) throw new Error('No user ID');

      await supabase
        .from('chat_history')
        .upsert({
          user_id: userId,
          messages: messages,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
    },
    onSuccess: (_, messages) => {
      // Update cache immediately
      queryClient.setQueryData(CHAT_KEYS.messages(userId), messages);
    },
  });

  // Optimistic updates for messages
  const addMessage = (message: Message) => {
    const previousMessages = queryClient.getQueryData(CHAT_KEYS.messages(userId)) || [];
    const newMessages = [...previousMessages, message];
    
    // Update cache immediately
    queryClient.setQueryData(CHAT_KEYS.messages(userId), newMessages);
    
    // Then update database
    updateChatHistory(newMessages);
  };

  return {
    chatHistory,
    isLoadingHistory,
    addMessage,
    updateChatHistory,
  };
} 