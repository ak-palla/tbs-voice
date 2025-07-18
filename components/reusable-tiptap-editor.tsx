"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import Image from '@tiptap/extension-image';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { createLowlight, common } from 'lowlight';
import Highlight from '@tiptap/extension-highlight';
import Typography from '@tiptap/extension-typography';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import Focus from '@tiptap/extension-focus';
import Gapcursor from '@tiptap/extension-gapcursor';
import Dropcursor from '@tiptap/extension-dropcursor';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import Youtube from '@tiptap/extension-youtube';
import HorizontalRule from '@tiptap/extension-horizontal-rule';

import { Button } from '@/components/ui/button';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  Strikethrough, 
  List, 
  ListOrdered, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Link as LinkIcon,
  Quote,
  Code,
  Undo,
  Redo,
  Table as TableIcon,
  Image as ImageIcon,
  Highlighter,
  Minus,
  Check,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  Youtube as YoutubeIcon,
  Heading1,
  Heading2,
  Heading3,
  Code2,
  Palette,
  Loader2,
  CheckCircle2,
  Plus,
  X,
  Sparkles,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCallback, useState, useEffect, useRef } from 'react';
import AIDropdown from '@/components/ui/ai-dropdown';

const lowlight = createLowlight(common);

export interface ReusableTiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
  className?: string;
  placeholder?: string;
  showToolbar?: boolean;
  showBubbleMenu?: boolean;
  showSlashCommands?: boolean;
  showStatusBar?: boolean;
  editorHeight?: string;
  autoSave?: boolean;
  autoSaveDelay?: number;
  onSave?: (content: string) => Promise<void>;
  isReadOnly?: boolean;
  editorClassName?: string;
}

export default function ReusableTiptapEditor({ 
  content, 
  onChange, 
  className,
  placeholder = "Start writing... Type '/' for commands",
  showToolbar = true,
  showBubbleMenu = true,
  showSlashCommands = true,
  showStatusBar = true,
  editorHeight = "calc(100vh-140px)",
  autoSave = true,
  autoSaveDelay = 1000,
  onSave,
  isReadOnly = false,
  editorClassName
}: ReusableTiptapEditorProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showFloatingMenu, setShowFloatingMenu] = useState(false);
  const [floatingMenuPosition, setFloatingMenuPosition] = useState({ x: 0, y: 0 });
  const floatingMenuRef = useRef<HTMLDivElement>(null);
  const [selectedMenuIndex, setSelectedMenuIndex] = useState(0);
  const [savingStatus, setSavingStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const [linkUrl, setLinkUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [bubbleMenuMode, setBubbleMenuMode] = useState<'main' | 'link' | 'image' | 'ai'>('main');
  const [floatingInputPosition, setFloatingInputPosition] = useState({ x: 0, y: 0 });
  const [showFloatingInput, setShowFloatingInput] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  // Menu commands for keyboard navigation
  const menuCommands = [
    {
      icon: Heading1,
      title: "Heading 1",
      action: () => {
        editor?.chain().focus().deleteRange({
          from: editor.state.selection.$anchor.pos - editor.state.selection.$anchor.parentOffset,
          to: editor.state.selection.to
        }).toggleHeading({ level: 1 }).run();
      }
    },
    {
      icon: Heading2,
      title: "Heading 2", 
      action: () => {
        editor?.chain().focus().deleteRange({
          from: editor.state.selection.$anchor.pos - editor.state.selection.$anchor.parentOffset,
          to: editor.state.selection.to
        }).toggleHeading({ level: 2 }).run();
      }
    },
    {
      icon: List,
      title: "Bullet List",
      action: () => {
        editor?.chain().focus().deleteRange({
          from: editor.state.selection.$anchor.pos - editor.state.selection.$anchor.parentOffset,
          to: editor.state.selection.to
        }).toggleBulletList().run();
      }
    },
    {
      icon: ListOrdered,
      title: "Numbered List",
      action: () => {
        editor?.chain().focus().deleteRange({
          from: editor.state.selection.$anchor.pos - editor.state.selection.$anchor.parentOffset,
          to: editor.state.selection.to
        }).toggleOrderedList().run();
      }
    },
    {
      icon: Check,
      title: "Task List", 
      action: () => {
        editor?.chain().focus().deleteRange({
          from: editor.state.selection.$anchor.pos - editor.state.selection.$anchor.parentOffset,
          to: editor.state.selection.to
        }).toggleTaskList().run();
      }
    },
    {
      icon: Code2,
      title: "Code Block",
      action: () => {
        editor?.chain().focus().deleteRange({
          from: editor.state.selection.$anchor.pos - editor.state.selection.$anchor.parentOffset,
          to: editor.state.selection.to
        }).toggleCodeBlock().run();
      }
    },
    {
      icon: Quote,
      title: "Blockquote",
      action: () => {
        editor?.chain().focus().deleteRange({
          from: editor.state.selection.$anchor.pos - editor.state.selection.$anchor.parentOffset,
          to: editor.state.selection.to
        }).toggleBlockquote().run();
      }
    },
    {
      icon: TableIcon,
      title: "Table",
      action: () => {
        editor?.chain().focus().deleteRange({
          from: editor.state.selection.$anchor.pos - editor.state.selection.$anchor.parentOffset,
          to: editor.state.selection.to
        }).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
      }
    },
    {
      icon: ImageIcon,
      title: "Image",
      action: () => {
        editor?.chain().focus().deleteRange({
          from: editor.state.selection.$anchor.pos - editor.state.selection.$anchor.parentOffset,
          to: editor.state.selection.to
        }).run();
        setBubbleMenuMode('image');
        setImageUrl('');
      }
    }
  ];

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      Color,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline cursor-pointer hover:text-blue-800',
        },
      }),
      Underline,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto',
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'not-prose bg-gray-900 text-gray-100 p-4 rounded-lg my-4 overflow-x-auto',
        },
      }),
      Highlight.configure({
        multicolor: true,
      }),
      Typography,
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === 'heading') {
            return "What's the title?";
          }
          return placeholder;
        },
      }),
      CharacterCount,
      Focus.configure({
        className: 'has-focus',
        mode: 'all',
      }),
      Gapcursor,
      Dropcursor,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Subscript,
      Superscript,
      Youtube.configure({
        controls: false,
        nocookie: true,
        width: 640,
        height: 480,
      }),
      HorizontalRule,
    ],
    content,
    editable: !isReadOnly,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      
      if (autoSave && onSave) {
        // Auto-save logic
        setSavingStatus('saving');
        
        // Clear existing timeout
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
        
        // Debounce save
        saveTimeoutRef.current = setTimeout(async () => {
          try {
            await onSave(html);
            setSavingStatus('saved');
            
            // Reset to idle after 2 seconds
            setTimeout(() => {
              setSavingStatus('idle');
            }, 2000);
          } catch (error) {
            console.error('Auto-save failed:', error);
            setSavingStatus('idle');
          }
        }, autoSaveDelay);
      }
      
      // Always call onChange for immediate updates
      onChange(html);
    },
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-lg prose-slate max-w-none focus:outline-none min-h-[400px] px-8 py-12',
          editorClassName
        ),
      },
    },
  });

  const addImage = useCallback(() => {
    if (editor) {
      const { from, to } = editor.state.selection;
      if (from !== to) {
        setBubbleMenuMode('image');
      } else {
        const coords = editor.view.coordsAtPos(from);
        const editorRect = editor.view.dom.getBoundingClientRect();
        const containerRect = editor.view.dom.closest('.max-w-5xl')?.getBoundingClientRect() || editorRect;
        
        setFloatingInputPosition({
          x: coords.left - containerRect.left + 20,
          y: coords.top - containerRect.top + 25
        });
        setBubbleMenuMode('image');
        setShowFloatingInput(true);
      }
      setImageUrl('');
    }
  }, [editor]);

  const handleImageSubmit = useCallback(() => {
    if (imageUrl && editor) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setBubbleMenuMode('main');
      setShowFloatingInput(false);
      setImageUrl('');
    }
  }, [imageUrl, editor]);

  const handleCancelImage = useCallback(() => {
    setBubbleMenuMode('main');
    setShowFloatingInput(false);
    setImageUrl('');
  }, []);

  const addYoutube = useCallback(() => {
    const url = window.prompt('Enter YouTube URL:');
    if (url && editor) {
      editor.commands.setYoutubeVideo({
        src: url,
        width: 640,
        height: 480,
      });
    }
  }, [editor]);

  const addLink = useCallback(() => {
    if (editor) {
      const { from, to } = editor.state.selection;
      if (from !== to) {
        setBubbleMenuMode('link');
      } else {
        const coords = editor.view.coordsAtPos(from);
        const editorRect = editor.view.dom.getBoundingClientRect();
        const containerRect = editor.view.dom.closest('.max-w-5xl')?.getBoundingClientRect() || editorRect;
        
        setFloatingInputPosition({
          x: coords.left - containerRect.left + 20,
          y: coords.top - containerRect.top + 25
        });
        setBubbleMenuMode('link');
        setShowFloatingInput(true);
      }
      setLinkUrl('');
    }
  }, [editor]);

  const handleLinkSubmit = useCallback(() => {
    if (linkUrl && editor) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
      setBubbleMenuMode('main');
      setShowFloatingInput(false);
      setLinkUrl('');
    }
  }, [linkUrl, editor]);

  const handleCancelLink = useCallback(() => {
    setBubbleMenuMode('main');
    setShowFloatingInput(false);
    setLinkUrl('');
  }, []);

  const addTable = useCallback(() => {
    if (editor) {
      editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    }
  }, [editor]);

  const setColor = useCallback((color: string) => {
    if (editor) {
      editor.chain().focus().setColor(color).run();
      setShowColorPicker(false);
    }
  }, [editor]);

  // AI Enhancement Functions
  const handleAIAction = useCallback(async (action: 'simplify' | 'grammar' | 'shorter' | 'longer' | 'format', selectedOnly = false) => {
    if (!editor || aiLoading) return;

    setAiLoading(true);
    
    // Disable editing while AI is processing
    editor.setEditable(false);
    
    try {
      let contentToEnhance = '';
      let selectedText = '';
      let fullContext = '';

      if (selectedOnly) {
        // Get selected text
        const { from, to } = editor.state.selection;
        if (from === to) {
          // No text selected
          return;
        }
        
        // Get selected text content
        selectedText = editor.state.doc.textBetween(from, to);
        contentToEnhance = selectedText;
        fullContext = editor.getHTML();
      } else {
        // Enhance full document
        contentToEnhance = editor.getHTML();
      }

      const response = await fetch('/api/editor/ai-enhance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: contentToEnhance,
          action: action,
          selectedText: selectedOnly ? selectedText : null,
          context: selectedOnly ? fullContext : null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to enhance content');
      }

      const data = await response.json();
      
      console.log('AI Enhancement Response:', data);
      console.log('Enhanced content:', data.enhancedContent);
      
      if (selectedOnly) {
        // Replace selected text
        const { from, to } = editor.state.selection;
        console.log('Replacing selected text from', from, 'to', to);
        editor.chain()
          .focus()
          .deleteRange({ from, to })
          .insertContent(data.enhancedContent)
          .run();
        
        // Trigger onChange to update the parent component with the new full content
        setTimeout(() => {
          if (onChange) {
            onChange(editor.getHTML());
          }
        }, 100);
      } else {
        // Replace entire content
        console.log('Replacing entire content');
        editor.commands.setContent(data.enhancedContent);
        
        // Trigger onChange to update the parent component
        if (onChange) {
          onChange(data.enhancedContent);
        }
      }

    } catch (error) {
      console.error('AI enhancement failed:', error);
      
      // Try to show a user-friendly error message
      if (error instanceof Error) {
        console.error('Error details:', error.message);
      }
      
      // You can add toast notification here later
      alert(`AI enhancement failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setAiLoading(false);
      
      // Re-enable editing after AI processing
      if (editor && !isReadOnly) {
        editor.setEditable(true);
      }
    }
  }, [editor, aiLoading]);

  const handleToolbarAI = useCallback(async (action: 'simplify' | 'grammar' | 'shorter' | 'longer' | 'format') => {
    await handleAIAction(action, false);
  }, [handleAIAction]);

  const handleBubbleAI = useCallback(async (action: 'simplify' | 'grammar' | 'shorter' | 'longer' | 'format') => {
    await handleAIAction(action, true);
    setBubbleMenuMode('main'); // Return to main menu after AI action
  }, [handleAIAction]);

  const handleBubbleAIClick = useCallback(() => {
    setBubbleMenuMode('ai');
  }, []);

  const handleBubbleAICancel = useCallback(() => {
    setBubbleMenuMode('main');
  }, []);

  // Handle slash commands (floating menu when typing "/")
  useEffect(() => {
    if (!editor || !showSlashCommands) return;

    const updateFloatingMenu = () => {
      const { state, view } = editor;
      const { selection } = state;
      const { $anchor } = selection;

      if (selection.from !== selection.to) {
        setShowFloatingMenu(false);
        return;
      }

      const currentNode = $anchor.parent;
      const nodeText = currentNode.textContent;
      
      const isValidSlashCommand = currentNode.type.name === 'paragraph' && 
          nodeText === '/' &&
          selection.from === selection.to &&
          $anchor.parentOffset === nodeText.length;
      
      if (isValidSlashCommand) {
        const coords = view.coordsAtPos(selection.from);
        const editorRect = view.dom.getBoundingClientRect();
        const containerRect = view.dom.closest('.max-w-5xl')?.getBoundingClientRect() || editorRect;
        
        setFloatingMenuPosition({ 
          x: coords.left - containerRect.left + 20, 
          y: coords.top - containerRect.top + 25 
        });
        setShowFloatingMenu(true);
        setSelectedMenuIndex(0);
      } else {
        setShowFloatingMenu(false);
      }
    };

    editor.on('selectionUpdate', updateFloatingMenu);
    editor.on('transaction', updateFloatingMenu);

    return () => {
      editor.off('selectionUpdate', updateFloatingMenu);
      editor.off('transaction', updateFloatingMenu);
    };
  }, [editor, showSlashCommands]);

  // Handle keyboard navigation for slash commands
  useEffect(() => {
    if (!showFloatingMenu || !editor || !showSlashCommands) return;

    const editorElement = editor.view.dom;
    
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!showFloatingMenu) return;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
          setSelectedMenuIndex(prev => 
            prev < menuCommands.length - 1 ? prev + 1 : 0
          );
          return false;
        case 'ArrowUp':
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
          setSelectedMenuIndex(prev => 
            prev > 0 ? prev - 1 : menuCommands.length - 1
          );
          return false;
        case 'Enter':
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
          
          setTimeout(() => {
            menuCommands[selectedMenuIndex].action();
            setShowFloatingMenu(false);
          }, 0);
          return false;
        case 'Escape':
          event.preventDefault();
          event.stopPropagation();
          setShowFloatingMenu(false);
          return false;
      }
    };

    editorElement.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('keydown', handleKeyDown, true);
    
    return () => {
      editorElement.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [showFloatingMenu, selectedMenuIndex, editor, menuCommands, showSlashCommands]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (floatingMenuRef.current && !floatingMenuRef.current.contains(event.target as Node)) {
        setShowFloatingMenu(false);
      }
      if (showFloatingInput && !(event.target as Element).closest('.absolute.z-50')) {
        setShowFloatingInput(false);
        setBubbleMenuMode('main');
      }
      
      // Reset bubble menu mode when clicking outside bubble menu
      if (bubbleMenuMode !== 'main' && !(event.target as Element).closest('[data-bubble-menu]')) {
        setBubbleMenuMode('main');
      }
    };

    if (showFloatingMenu || showFloatingInput || bubbleMenuMode !== 'main') {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFloatingMenu, showFloatingInput, bubbleMenuMode]);

  // Cleanup save timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  if (!editor) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="text-gray-500">Loading editor...</div>
      </div>
    );
  }

  return (
    <div className={cn("w-full flex flex-col bg-white", className)} style={{ height: editorHeight }}>
      {/* Fixed Toolbar */}
      {showToolbar && (
        <div className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <div className="px-3 py-2">
            <div className="flex justify-between items-center absolute bottom-2 right-2">
              <div className="flex items-center gap-2">
                {autoSave && savingStatus === 'saving' && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saving...</span>
                  </div>
                )}
                {autoSave && savingStatus === 'saved' && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Saved</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              {/* Document Actions */}
              <div className="flex items-center gap-1 mr-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor?.chain().focus().undo().run()}
                  disabled={!editor?.can().undo() || aiLoading}
                  className="h-9 px-3"
                  title="Undo (Ctrl+Z)"
                >
                  <Undo className="h-4 w-4 mr-1" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor?.chain().focus().redo().run()}
                  disabled={!editor?.can().redo() || aiLoading}
                  className="h-9 px-3"
                  title="Redo (Ctrl+Y)"
                >
                  <Redo className="h-4 w-4 mr-1" />
                </Button>
              </div>

              <div className="w-px h-6 bg-gray-300" />

              {/* Headings */}
              <div className="flex items-center gap-1">
                <select
                  onChange={(e) => {
                    const level = parseInt(e.target.value);
                    if (level === 0) {
                      editor?.chain().focus().setParagraph().run();
                    } else {
                      editor?.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 | 4 | 5 | 6 }).run();
                    }
                  }}
                  value={
                    editor?.isActive('heading', { level: 1 }) ? 1 :
                    editor?.isActive('heading', { level: 2 }) ? 2 :
                    editor?.isActive('heading', { level: 3 }) ? 3 :
                    editor?.isActive('heading', { level: 4 }) ? 4 :
                    editor?.isActive('heading', { level: 5 }) ? 5 :
                    editor?.isActive('heading', { level: 6 }) ? 6 : 0
                  }
                  disabled={aiLoading}
                  className={cn(
                    "h-9 px-3 pr-8 text-sm border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                    aiLoading && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <option value={0}>Paragraph</option>
                  <option value={1}>Heading 1</option>
                  <option value={2}>Heading 2</option>
                  <option value={3}>Heading 3</option>
                  <option value={4}>Heading 4</option>
                  <option value={5}>Heading 5</option>
                  <option value={6}>Heading 6</option>
                </select>
              </div>

              <div className="w-px h-6 bg-gray-300" />

              {/* Text Formatting */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor?.chain().focus().toggleBold().run()}
                  className={cn("h-9 w-9 p-0", editor?.isActive('bold') && "bg-blue-100 text-blue-700")}
                  title="Bold (Ctrl+B)"
                >
                  <Bold className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor?.chain().focus().toggleItalic().run()}
                  className={cn("h-9 w-9 p-0", editor?.isActive('italic') && "bg-blue-100 text-blue-700")}
                  title="Italic (Ctrl+I)"
                >
                  <Italic className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor?.chain().focus().toggleUnderline().run()}
                  className={cn("h-9 w-9 p-0", editor?.isActive('underline') && "bg-blue-100 text-blue-700")}
                  title="Underline (Ctrl+U)"
                >
                  <UnderlineIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor?.chain().focus().toggleStrike().run()}
                  className={cn("h-9 w-9 p-0", editor?.isActive('strike') && "bg-blue-100 text-blue-700")}
                  title="Strikethrough"
                >
                  <Strikethrough className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor?.chain().focus().toggleHighlight().run()}
                  className={cn("h-9 w-9 p-0", editor?.isActive('highlight') && "bg-yellow-100 text-yellow-700")}
                  title="Highlight"
                >
                  <Highlighter className="h-4 w-4" />
                </Button>
              </div>

              <div className="w-px h-6 bg-gray-300" />

              {/* Text Alignment */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor?.chain().focus().setTextAlign('left').run()}
                  className={cn("h-9 w-9 p-0", editor?.isActive({ textAlign: 'left' }) && "bg-blue-100 text-blue-700")}
                  title="Align Left"
                >
                  <AlignLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor?.chain().focus().setTextAlign('center').run()}
                  className={cn("h-9 w-9 p-0", editor?.isActive({ textAlign: 'center' }) && "bg-blue-100 text-blue-700")}
                  title="Align Center"
                >
                  <AlignCenter className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor?.chain().focus().setTextAlign('right').run()}
                  className={cn("h-9 w-9 p-0", editor?.isActive({ textAlign: 'right' }) && "bg-blue-100 text-blue-700")}
                  title="Align Right"
                >
                  <AlignRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="w-px h-6 bg-gray-300" />

              {/* Lists */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor?.chain().focus().toggleBulletList().run()}
                  className={cn("h-9 w-9 p-0", editor?.isActive('bulletList') && "bg-blue-100 text-blue-700")}
                  title="Bullet List"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                  className={cn("h-9 w-9 p-0", editor?.isActive('orderedList') && "bg-blue-100 text-blue-700")}
                  title="Numbered List"
                >
                  <ListOrdered className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor?.chain().focus().toggleTaskList().run()}
                  className={cn("h-9 w-9 p-0", editor?.isActive('taskList') && "bg-blue-100 text-blue-700")}
                  title="Task List"
                >
                  <Check className="h-4 w-4" />
                </Button>
              </div>

              <div className="w-px h-6 bg-gray-300" />

              {/* Block Elements */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                  className={cn("h-9 w-9 p-0", editor?.isActive('blockquote') && "bg-blue-100 text-blue-700")}
                  title="Quote"
                >
                  <Quote className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
                  className={cn("h-9 w-9 p-0", editor?.isActive('codeBlock') && "bg-blue-100 text-blue-700")}
                  title="Code Block"
                >
                  <Code2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor?.chain().focus().setHorizontalRule().run()}
                  className="h-9 w-9 p-0"
                  title="Horizontal Rule"
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </div>

              <div className="w-px h-6 bg-gray-300" />

              {/* Media & Links */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={addLink}
                  className={cn("h-9 w-9 p-0", editor.isActive('link') && "bg-blue-100 text-blue-700")}
                  title="Add Link"
                >
                  <LinkIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={addImage}
                  className="h-9 w-9 p-0"
                  title="Insert Image"
                >
                  <ImageIcon className="h-4 w-4" />
                </Button>
                
                {/* Table Controls */}
                <div className="relative group">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={addTable}
                    className="h-9 w-9 p-0"
                    title="Insert Table"
                  >
                    <TableIcon className="h-4 w-4" />
                  </Button>
                  
                  <div className="absolute top-10 left-0 hidden group-hover:block bg-white border border-gray-200 rounded-lg shadow-xl p-2 z-50 min-w-[200px]">
                    <div className="text-xs font-medium text-gray-700 mb-2">Table Actions</div>
                    <div className="space-y-1">
                      <button
                        onClick={() => editor?.chain().focus().addRowBefore().run()}
                        className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded flex items-center gap-2"
                      >
                        <Plus className="h-3 w-3" />
                        Add Row Above
                      </button>
                      <button
                        onClick={() => editor?.chain().focus().addRowAfter().run()}
                        className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded flex items-center gap-2"
                      >
                        <Plus className="h-3 w-3" />
                        Add Row Below
                      </button>
                      <button
                        onClick={() => editor?.chain().focus().addColumnBefore().run()}
                        className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded flex items-center gap-2"
                      >
                        <Plus className="h-3 w-3" />
                        Add Column Before
                      </button>
                      <button
                        onClick={() => editor?.chain().focus().addColumnAfter().run()}
                        className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded flex items-center gap-2"
                      >
                        <Plus className="h-3 w-3" />
                        Add Column After
                      </button>
                      <hr className="my-1" />
                      <button
                        onClick={() => editor?.chain().focus().deleteRow().run()}
                        className="w-full text-left px-2 py-1 text-sm hover:bg-red-100 text-red-700 rounded flex items-center gap-2"
                      >
                        <Minus className="h-3 w-3" />
                        Delete Row
                      </button>
                      <button
                        onClick={() => editor?.chain().focus().deleteColumn().run()}
                        className="w-full text-left px-2 py-1 text-sm hover:bg-red-100 text-red-700 rounded flex items-center gap-2"
                      >
                        <Minus className="h-3 w-3" />
                        Delete Column
                      </button>
                      <button
                        onClick={() => editor?.chain().focus().deleteTable().run()}
                        className="w-full text-left px-2 py-1 text-sm hover:bg-red-100 text-red-700 rounded flex items-center gap-2"
                      >
                        <Minus className="h-3 w-3" />
                        Delete Table
                      </button>
                    </div>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={addYoutube}
                  className="h-9 w-9 p-0"
                  title="Insert YouTube Video"
                >
                  <YoutubeIcon className="h-4 w-4" />
                </Button>
              </div>

              <div className="w-px h-6 bg-gray-300" />

              {/* Subscript/Superscript */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().toggleSubscript().run()}
                  className={cn("h-9 w-9 p-0", editor.isActive('subscript') && "bg-blue-100 text-blue-700")}
                  title="Subscript"
                >
                  <SubscriptIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().toggleSuperscript().run()}
                  className={cn("h-9 w-9 p-0", editor.isActive('superscript') && "bg-blue-100 text-blue-700")}
                  title="Superscript"
                >
                  <SuperscriptIcon className="h-4 w-4" />
                </Button>
              </div>

              {/* Text Colors */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="h-9 w-9 p-0"
                  title="Text Color"
                >
                  <Palette className="h-4 w-4" />
                </Button>
                {showColorPicker && (
                  <div className="absolute top-10 left-0 bg-white border border-gray-200 rounded-xl shadow-xl p-4 z-50 min-w-[280px]">
                    <div className="mb-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Text Colors</h4>
                      <div className="grid grid-cols-8 gap-2">
                        {[
                          '#000000', '#374151', '#6B7280', '#9CA3AF', '#D1D5DB', '#F3F4F6', '#FFFFFF', '#EF4444',
                          '#F97316', '#EAB308', '#84CC16', '#22C55E', '#06B6D4', '#3B82F6', '#6366F1', '#8B5CF6',
                          '#A855F7', '#EC4899', '#F43F5E', '#DC2626', '#EA580C', '#CA8A04', '#65A30D', '#16A34A',
                          '#0891B2', '#2563EB', '#4F46E5', '#7C3AED', '#9333EA', '#DB2777', '#E11D48', '#B91C1C'
                        ].map((color) => (
                          <button
                            key={color}
                            className="w-8 h-8 rounded-lg border-2 border-gray-200 hover:border-gray-400 hover:scale-110 transition-all duration-200 shadow-sm"
                            style={{ backgroundColor: color }}
                            onClick={() => setColor(color)}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        editor?.chain().focus().unsetColor().run();
                        setShowColorPicker(false);
                      }}
                      className="w-full px-3 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      Remove Color
                    </button>
                  </div>
                )}
              </div>

              <div className="w-px h-6 bg-gray-300" />

              {/* AI Enhancement */}
              <div className="flex items-center gap-1">
                <AIDropdown
                  onAction={handleToolbarAI}
                  isLoading={aiLoading}
                  variant="toolbar"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Editor Container */}
      <div className="flex-1 overflow-y-auto bg-white relative">
        <div className="max-w-5xl mx-auto relative">
          <EditorContent 
            editor={editor} 
            className={cn(
              "focus-within:outline-none transition-opacity duration-200",
              aiLoading && "opacity-60 pointer-events-none"
            )}
            style={{ minHeight: editorHeight }}
          />
          
          {/* AI Processing Overlay */}
          {aiLoading && (
            <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="px-6 py-4 flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                <span className="text-sm font-medium text-gray-700">AI is enhancing your content...</span>
              </div>
            </div>
          )}
          
          {/* Slash Commands Menu */}
          {showFloatingMenu && editor && showSlashCommands && !aiLoading && (
            <div
              ref={floatingMenuRef}
              className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-xl p-1 min-w-[180px]"
              style={{
                left: `${floatingMenuPosition.x}px`,
                top: `${floatingMenuPosition.y}px`,
              }}
            >
              <div className="space-y-0.5">
                <div className="flex items-center text-xs text-gray-500 px-2 py-1 border-b border-gray-100">
                  <span>Commands</span>
                  <span className="ml-auto text-xs">↑↓ • Enter • Esc</span>
                </div>
                
                {menuCommands.map((command, index) => {
                  const IconComponent = command.icon;
                  const isSelected = index === selectedMenuIndex;
                  
                  return (
                    <button
                      key={index}
                      onClick={() => {
                        command.action();
                        setShowFloatingMenu(false);
                      }}
                      className={cn(
                        "w-full text-left px-2 py-1.5 rounded text-sm flex items-center gap-2 transition-colors",
                        isSelected 
                          ? "bg-blue-100 text-blue-900" 
                          : "hover:bg-gray-100"
                      )}
                    >
                      <IconComponent className={cn(
                        "h-4 w-4",
                        isSelected ? "text-blue-600" : "text-gray-600"
                      )} />
                      <span className="font-medium">{command.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Bubble Menu for Text Selection */}
        {editor && showBubbleMenu && !aiLoading && (
          <BubbleMenu 
            editor={editor}
            shouldShow={({ state, from, to }) => {
              return from !== to;
            }}
          >
            <div className="bg-white border border-gray-200 rounded-lg shadow-xl p-2" data-bubble-menu>
              {bubbleMenuMode === 'main' && (
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant={editor?.isActive('bold') ? 'default' : 'ghost'}
                    onClick={() => editor?.chain().focus().toggleBold().run()}
                    className="h-8 w-8 p-0"
                    title="Bold"
                  >
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={editor?.isActive('italic') ? 'default' : 'ghost'}
                    onClick={() => editor?.chain().focus().toggleItalic().run()}
                    className="h-8 w-8 p-0"
                    title="Italic"
                  >
                    <Italic className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={editor?.isActive('underline') ? 'default' : 'ghost'}
                    onClick={() => editor?.chain().focus().toggleUnderline().run()}
                    className="h-8 w-8 p-0"
                    title="Underline"
                  >
                    <UnderlineIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={editor?.isActive('strike') ? 'default' : 'ghost'}
                    onClick={() => editor?.chain().focus().toggleStrike().run()}
                    className="h-8 w-8 p-0"
                    title="Strikethrough"
                  >
                    <Strikethrough className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={editor?.isActive('highlight') ? 'default' : 'ghost'}
                    onClick={() => editor?.chain().focus().toggleHighlight().run()}
                    className="h-8 w-8 p-0"
                    title="Highlight"
                  >
                    <Highlighter className="h-4 w-4" />
                  </Button>
                  
                  <div className="w-px h-6 bg-gray-300 mx-1" />
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={addLink}
                    className="h-8 w-8 p-0"
                    title="Add Link"
                  >
                    <LinkIcon className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={addImage}
                    className="h-8 w-8 p-0"
                    title="Add Image"
                  >
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => editor?.chain().focus().toggleCode().run()}
                    className={cn("h-8 w-8 p-0", editor?.isActive('code') && "bg-blue-100")}
                    title="Inline Code"
                  >
                    <Code className="h-4 w-4" />
                  </Button>

                  <div className="w-px h-6 bg-gray-300 mx-1" />
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleBubbleAIClick}
                    disabled={aiLoading}
                    className="h-8 w-8 p-0 bg-gradient-to-r from-blue-500 to-blue-800 text-white hover:bg-blue-600 hover:text-white"
                    title="AI Enhancement"
                  >
                    {aiLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              )}

              {bubbleMenuMode === 'link' && (
                <div className="flex items-center gap-2 min-w-[300px]">
                  <LinkIcon className="h-4 w-4 text-gray-500" />
                  <input
                    type="url"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="Enter URL..."
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleLinkSubmit();
                      } else if (e.key === 'Escape') {
                        e.preventDefault();
                        handleCancelLink();
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    onClick={handleLinkSubmit}
                    disabled={!linkUrl.trim()}
                    className="h-7 px-2"
                  >
                    Add
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCancelLink}
                    className="h-7 px-2"
                  >
                    Cancel
                  </Button>
                </div>
              )}

              {bubbleMenuMode === 'image' && (
                <div className="flex items-center gap-2 min-w-[300px]">
                  <ImageIcon className="h-4 w-4 text-gray-500" />
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Enter image URL..."
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleImageSubmit();
                      } else if (e.key === 'Escape') {
                        e.preventDefault();
                        handleCancelImage();
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    onClick={handleImageSubmit}
                    disabled={!imageUrl.trim()}
                    className="h-7 px-2"
                  >
                    Add
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCancelImage}
                    className="h-7 px-2"
                  >
                    Cancel
                  </Button>
                </div>
              )}

              {bubbleMenuMode === 'ai' && (
                <div className="flex items-center gap-1 min-w-[320px]">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleBubbleAI('simplify')}
                    disabled={aiLoading}
                    className="h-8 px-2 flex items-center gap-1"
                    title="Simplify text"
                  >
                    <Sparkles className="h-3 w-3" />
                    <span className="text-xs">Simplify</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleBubbleAI('grammar')}
                    disabled={aiLoading}
                    className="h-8 px-2 flex items-center gap-1"
                    title="Fix spelling & grammar"
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    <span className="text-xs">Grammar</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleBubbleAI('shorter')}
                    disabled={aiLoading}
                    className="h-8 px-2 flex items-center gap-1"
                    title="Make shorter"
                  >
                    <Minus className="h-3 w-3" />
                    <span className="text-xs">Shorter</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleBubbleAI('longer')}
                    disabled={aiLoading}
                    className="h-8 px-2 flex items-center gap-1"
                    title="Make longer"
                  >
                    <Plus className="h-3 w-3" />
                    <span className="text-xs">Longer</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleBubbleAI('format')}
                    disabled={aiLoading}
                    className="h-8 px-2 flex items-center gap-1"
                    title="Format document"
                  >
                    <FileText className="h-3 w-3" />
                    <span className="text-xs">Format</span>
                  </Button>
                  
                  <div className="w-px h-6 bg-gray-300 mx-1" />
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleBubbleAICancel}
                    className="h-8 px-2"
                    title="Back to main menu"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </BubbleMenu>
        )}

        {/* Floating Input for Link/Image without text selection */}
        {showFloatingInput && bubbleMenuMode !== 'main' && bubbleMenuMode !== 'ai' && (
          <div
            className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-xl p-2"
            style={{
              left: `${floatingInputPosition.x}px`,
              top: `${floatingInputPosition.y}px`,
            }}
          >
            {bubbleMenuMode === 'link' && (
              <div className="flex items-center gap-2 min-w-[300px]">
                <LinkIcon className="h-4 w-4 text-gray-500" />
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="Enter URL..."
                  className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleLinkSubmit();
                    } else if (e.key === 'Escape') {
                      e.preventDefault();
                      handleCancelLink();
                    }
                  }}
                />
                <Button
                  size="sm"
                  onClick={handleLinkSubmit}
                  disabled={!linkUrl.trim()}
                  className="h-7 px-2"
                >
                  Add
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCancelLink}
                  className="h-7 px-2"
                >
                  Cancel
                </Button>
              </div>
            )}

            {bubbleMenuMode === 'image' && (
              <div className="flex items-center gap-2 min-w-[300px]">
                <ImageIcon className="h-4 w-4 text-gray-500" />
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Enter image URL..."
                  className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleImageSubmit();
                    } else if (e.key === 'Escape') {
                      e.preventDefault();
                      handleCancelImage();
                    }
                  }}
                />
                <Button
                  size="sm"
                  onClick={handleImageSubmit}
                  disabled={!imageUrl.trim()}
                  className="h-7 px-2"
                >
                  Add
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCancelImage}
                  className="h-7 px-2"
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      {editor && showStatusBar && (
        <div className="sticky bottom-0 border-t border-gray-200 px-6 py-3 text-sm text-gray-500 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <div className="max-w-5xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-4">
              <span>{editor.storage.characterCount.characters()} characters</span>
              <span>{editor.storage.characterCount.words()} words</span>
            </div>
            <div className="text-gray-400 text-xs">
              Use keyboard shortcuts: <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono">Ctrl+B</kbd> Bold, <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono">Ctrl+I</kbd> Italic
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 