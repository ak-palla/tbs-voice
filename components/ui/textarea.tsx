"use client";
import * as React from "react"
import { useEffect, useRef } from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  autoExpand?: boolean;
  lined?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, autoExpand = false, lined = false, onChange, ...props }, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    
    const resizeTextarea = (textarea: HTMLTextAreaElement) => {
      if (!autoExpand) return;
      
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto';
      // Set the height to match the content
      textarea.style.height = `${textarea.scrollHeight}px`;
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (onChange) onChange(e);
      if (autoExpand && textareaRef.current) {
        resizeTextarea(textareaRef.current);
      }
    };

    // Set up the resize observer to handle when the content changes
    useEffect(() => {
      const textarea = textareaRef.current;
      if (!textarea || !autoExpand) return;

      // Initial sizing
      resizeTextarea(textarea);

      // Set up resize observer for when the window changes size
      const resizeObserver = new ResizeObserver(() => {
        resizeTextarea(textarea);
      });
      resizeObserver.observe(textarea);

      return () => {
        resizeObserver.disconnect();
      };
    }, [autoExpand]);

    return (
      <div className={lined ? "relative w-full" : ""}>
        {lined && (
          <div className="absolute inset-0 pointer-events-none" style={{ 
            backgroundImage: 'linear-gradient(#e5e7eb33 1px, transparent 1px)', 
            backgroundSize: '100% 1.25rem',
            backgroundPosition: '0 1.25rem',
            marginTop: '2px'
          }} />
        )}
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            lined && "line-height-relaxed bg-transparent pt-3",
          className
        )}
          onChange={handleChange}
          ref={(node) => {
            // Set both refs
            if (typeof ref === 'function') {
              ref(node);
            } else if (ref) {
              ref.current = node;
            }
            textareaRef.current = node;
          }}
          style={lined ? { lineHeight: '1.25rem' } : undefined}
        {...props}
      />
      </div>
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea } 