"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { RealtimeChatGemini } from "./realtime-chat-gemini";
import { MessageSquare, X, Plus, ChevronDown, Trash2, Edit2, Check, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { createClient } from "@/utils/supabase/client";
import { usePathname } from 'next/navigation';

const MIN_SIDEBAR_WIDTH = 450;
const MAX_SIDEBAR_WIDTH = 700;
const SMALL_SCREEN_BREAKPOINT = 640; // Tailwind 'sm' breakpoint

interface ChatInstance {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export function FloatingChat() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [showInstancePopup, setShowInstancePopup] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(MIN_SIDEBAR_WIDTH);
  const [isResizing, setIsResizing] = useState(false);
  const [chatInstances, setChatInstances] = useState<ChatInstance[]>([]);
  const [currentInstanceId, setCurrentInstanceId] = useState<string | null>(null);
  const [isLoadingInstances, setIsLoadingInstances] = useState(true);
  const [editingInstanceId, setEditingInstanceId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  
  const sidebarRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();
  
  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < SMALL_SCREEN_BREAKPOINT);
    };
    checkScreenSize(); // Initial check
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  
  // Load chat instances on component mount
  useEffect(() => {
    fetchChatInstances();
  }, []);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setShowInstancePopup(false);
      }
    };

    if (showInstancePopup) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showInstancePopup]);

  // Function to fetch all chat instances
  const fetchChatInstances = async () => {
    try {
      setIsLoadingInstances(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      
      if (userId) {
        const response = await fetch('/api/gemini?action=instances', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch chat instances');
        }

        const data = await response.json();
        
        if (data.type === 'chat_instances' && Array.isArray(data.instances)) {
          setChatInstances(data.instances);
          
          // If no current instance is selected, select the most recent one
          if (!currentInstanceId && data.instances.length > 0) {
            const mostRecent = data.instances[0]; // Already sorted by updated_at desc
            setCurrentInstanceId(mostRecent.id);
          }
        } else if (data.instances?.length === 0) {
          // No instances exist, create a new one
          await createNewInstance();
        }
      }
    } catch (error) {
      console.error('Error fetching chat instances:', error);
      // Fallback to creating a new instance
      await createNewInstance();
    } finally {
      setIsLoadingInstances(false);
    }
  };

  // Function to create a new chat instance
  const createNewInstance = async (title: string = 'New Chat') => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) return;

      const response = await fetch('/api/gemini', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          action: 'create',
          title: title
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create new chat instance');
      }

      const data = await response.json();
      
      if (data.success && data.instance) {
        // Optimistically update the list and switch to the new instance
        setChatInstances(prev => [data.instance, ...prev]);
        setCurrentInstanceId(data.instance.id);
        setShowInstancePopup(false);
        setIsOpen(true);
      }
    } catch (error) {
      console.error('Error creating new chat instance:', error);
    }
  };

  // Function to automatically generate and update the chat title
  const generateAndSetTitle = async (messageContent: string, instanceId: string) => {
    try {
      const response = await fetch('/api/gemini/rename', {
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

  // Function to delete a chat instance
  const deleteInstance = async (instanceId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) return;

      const response = await fetch('/api/gemini', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          action: 'delete',
          instanceId: instanceId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to delete chat instance');
      }

      // Remove from local state
      const updatedInstances = chatInstances.filter(instance => instance.id !== instanceId);
      setChatInstances(updatedInstances);
      
      // If we deleted the current instance, select another one
      if (currentInstanceId === instanceId) {
        if (updatedInstances.length > 0) {
          const newInstance = updatedInstances[0];
          setCurrentInstanceId(newInstance.id);
        } else {
          // No instances left, create a new one
          await createNewInstance();
        }
      }
    } catch (error) {
      console.error('Error deleting chat instance:', error);
    }
  };

  // Function to update instance title
  const updateInstanceTitle = async (instanceId: string, newTitle: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) return;

      const response = await fetch('/api/gemini', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          action: 'update_title',
          instanceId: instanceId,
          title: newTitle
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update instance title');
      }

      // Update local state
      setChatInstances(prev => 
        prev.map(instance => 
          instance.id === instanceId 
            ? { ...instance, title: newTitle }
            : instance
        )
      );
      
      setEditingInstanceId(null);
      setEditingTitle("");
    } catch (error) {
      console.error('Error updating instance title:', error);
    }
  };

  // Function to select an instance
  const selectInstance = (instanceId: string) => {
    setCurrentInstanceId(instanceId);
    setShowInstancePopup(false);
    setIsOpen(true);
  };

  // Handle opening chat - show instances popup or open chat directly
  const handleChatButtonClick = () => {
    if (isOpen) {
      setIsOpen(false);
      setShowInstancePopup(false);
    } else if (showInstancePopup) {
      setShowInstancePopup(false);
    } else if (chatInstances.length === 0 && !isLoadingInstances) {
      // No instances, create new one and open chat
      createNewInstance();
    } else if (chatInstances.length === 1) {
      // Only one instance, open it directly
      setCurrentInstanceId(chatInstances[0].id);
      setIsOpen(true);
    } else {
      // Multiple instances, show popup
      setShowInstancePopup(true);
    }
  };
  // Add a function to calculate responsive padding
  const getResponsivePadding = useCallback((includeSidebarWidth = false) => {
    if (pathname === '/chat' || 
        pathname === '/innovation-machine' || 
        pathname.startsWith('/playbook-planner/edit/')) { // If on /chat page, force padding to 0
      return { top: 0, right: 0, bottom: 0, left: 0 };
    }

    let padding = 16; // p-4 base
    if (window.innerWidth >= 1024) padding = 32; // lg:p-8
    else if (window.innerWidth >= 640) padding = 24; // sm:p-6
    
    // Add extra space for scrollbar (typically 17px) and some margin
    const scrollbarWidth = 20;
    
    return {
      top: padding,
      right: includeSidebarWidth ? padding + sidebarWidth + scrollbarWidth : padding,
      bottom: padding,
      left: padding
    };
  }, [sidebarWidth, pathname]);

  // Add resize observer for responsive padding
  useEffect(() => {
    const parent = contentRef.current?.parentElement;
    if (!parent) return;

    const observer = new ResizeObserver(() => {
      if (isOpen) {
        const { top, right, bottom, left } = getResponsivePadding(true);
        parent.style.padding = `${top}px ${right}px ${bottom}px ${left}px`;
      } else {
        const { top, right, bottom, left } = getResponsivePadding();
        parent.style.padding = `${top}px ${right}px ${bottom}px ${left}px`;
      }
    });

    observer.observe(parent);
    return () => observer.disconnect();
  }, [isOpen, getResponsivePadding]);

  // Update the padding effect with transitions
  useEffect(() => {
    const parent = contentRef.current?.parentElement;
    if (!parent) return;

    // Set transition
    parent.style.transition = 'all 0ms ease-in-out';

    if (isOpen) {
      const { top, right, bottom, left } = getResponsivePadding(true);
      parent.style.padding = `${top}px ${right}px ${bottom}px ${left}px`;
    } else {
      const { top, right, bottom, left } = getResponsivePadding();
      parent.style.padding = `${top}px ${right}px ${bottom}px ${left}px`;
    }

    return () => {
      const { top, right, bottom, left } = getResponsivePadding();
      parent.style.padding = `${top}px ${right}px ${bottom}px ${left}px`;
      parent.style.transition = '';
    };
  }, [isOpen, sidebarWidth, getResponsivePadding]);

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback((e: MouseEvent) => {
    if (isResizing && sidebarRef.current) {
      const width = window.innerWidth - e.clientX;
      if (width >= MIN_SIDEBAR_WIDTH && width <= MAX_SIDEBAR_WIDTH) {
        setSidebarWidth(width);
      }
    }
  }, [isResizing]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResizing);
    }
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [isResizing, resize, stopResizing]);

  const shouldShowChatUI = pathname !== '/chat' && pathname !== '/innovation-machine';

  return (
    <div ref={contentRef} className="relative">
      {shouldShowChatUI && (
        <>
          {/* The floating button with dropdown indicator */}
          <div className="fixed bottom-4 right-4 z-50">
            <Button
              onClick={handleChatButtonClick}
              disabled={isLoadingInstances}
              className={`rounded-full h-12 w-12 p-0 bg-blue-600 hover:bg-blue-700 text-white shadow-lg ${
                isOpen ? 'hidden' : ''
              }`}
            >
              {isLoadingInstances ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Sparkles className="h-6 w-6" />
              )}
            </Button>

            {/* Small indicator for multiple chats */}
            {chatInstances.length > 1 && !isOpen && (
              <div className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-medium">
                {chatInstances.length}
              </div>
            )}
          </div>

          {/* Chat Instances Popup */}
          {showInstancePopup && (
            <div 
              ref={popupRef}
              className={`fixed z-50 w-80 max-h-[80vh] bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden flex flex-col ${isSmallScreen ? 'top-4 bottom-4 left-4 right-4 w-[calc(100vw-2rem)]' : 'bottom-20 right-4'}`}
            >
              {/* Header */}
              <div className="p-4 border-b bg-gray-50">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800">Your Chats</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => createNewInstance()}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="text-sm">New</span>
                  </Button>
                </div>
              </div>

              {/* Instances List */}
              <ScrollArea className="flex-1 max-h-[calc(50vh-10rem)] overflow-y-auto">
                <div className="p-2">
                  {isLoadingInstances ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
                    </div>
                  ) : chatInstances.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 text-sm">
                      <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No chats yet</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => createNewInstance()}
                        className="mt-2 text-blue-600 hover:text-blue-700"
                      >
                        Create your first chat
                      </Button>
                    </div>
                  ) : (
                    chatInstances.map((instance) => (
                      <div
                        key={instance.id}
                        className={`group relative rounded-lg p-3 cursor-pointer transition-colors ${
                          currentInstanceId === instance.id
                            ? 'bg-blue-50 border border-blue-200'
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
                                if (e.key === 'Enter') {
                                  updateInstanceTitle(instance.id, editingTitle);
                                } else if (e.key === 'Escape') {
                                  setEditingInstanceId(null);
                                  setEditingTitle("");
                                }
                              }}
                              className="flex-1 h-7 text-sm"
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateInstanceTitle(instance.id, editingTitle);
                              }}
                              className="h-7 w-7 shrink-0"
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm text-gray-900 truncate">
                                {instance.title}
                              </h4>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(instance.updated_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingInstanceId(instance.id);
                                  setEditingTitle(instance.title);
                                }}
                                className="h-7 w-7 shrink-0"
                              >
                                <Edit2 className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm('Are you sure you want to delete this chat?')) {
                                    deleteInstance(instance.id);
                                  }
                                }}
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

              {/* Footer */}
              <div className="p-3 border-t bg-gray-50 text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowInstancePopup(false)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  Close
                </Button>
              </div>
            </div>
          )}

          {/* The chat sidebar */}
          <div
            ref={sidebarRef}
            style={{ width: isSmallScreen && isOpen ? '100vw' : `${sidebarWidth}px` }}
            className={`border-l shadow-lg fixed sm:top-16 top-0 bottom-0 right-0 z-50 bg-white transform transition-transform duration-300 ${
              isOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            {/* Resize handle - conditionally render */}
            {!isSmallScreen && (
              <div
                className="absolute top-0 left-[-8px] w-4 h-full group cursor-ew-resize flex items-center justify-center"
                onMouseDown={startResizing}
              >
                <div className={`w-1 h-full bg-blue-500 z-50 opacity-0 group-hover:opacity-100 transition-opacity ${
                  isResizing ? 'opacity-100' : ''
                }`} />
              </div>
            )}
            
            {/* Visual feedback when resizing - conditionally render */}
            {isResizing && !isSmallScreen && (
              <div className="fixed inset-0 z-50 cursor-ew-resize" />
            )}
            
            <div className="h-full flex flex-col">
              {/* Close button */}
              <div className="absolute top-4 left-4 z-30">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Chat component */}
              <div className="flex-1 overflow-y-auto">
                <RealtimeChatGemini 
                  hideDebugButton 
                  showHeader={false} 
                  hideInstanceSidebar={true}
                  selectedInstanceId={currentInstanceId}
                  onInstanceChange={setCurrentInstanceId}
                  onFirstMessage={(message, instanceId) => {
                    // Check if this is a new chat that needs renaming
                    const instance = chatInstances.find(inst => inst.id === instanceId);
                    if (instance?.title === 'New Chat') {
                      generateAndSetTitle(message, instanceId);
                    }
                  }}
                />
              </div>
            </div>
          </div>
          
          {/* Mobile overlay */}
          {(isOpen || showInstancePopup) && (
            <div
              className={`fixed inset-0 bg-black bg-opacity-50 z-40 ${isSmallScreen ? '' : 'sm:hidden'}`}
              onClick={() => {
                setIsOpen(false);
                setShowInstancePopup(false);
              }}
            />
          )}
        </>
      )}
    </div>
  );
}
