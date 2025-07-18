"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Textarea, TextareaProps } from "./textarea";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

// Common props that work for both input and textarea
type CommonProps = {
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  id?: string;
  name?: string;
  value?: string;
  style?: React.CSSProperties;
};

export interface ExpandableInputProps extends CommonProps {
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  type?: string;
  maxLength?: number;
  expandAfter?: number;
  minRows?: number;
  maxRows?: number;
  lined?: boolean;
  // Add any other input props you specifically need here
  autoComplete?: string;
  autoFocus?: boolean;
  onFocus?: React.FocusEventHandler;
  onBlur?: React.FocusEventHandler;
}

const ExpandableInput = React.forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  ExpandableInputProps
>(
  ({ 
    className, 
    value, 
    onChange, 
    expandAfter = 50, 
    minRows = 3,
    maxRows = 10,
    lined = true,
    placeholder,
    disabled,
    readOnly,
    required,
    id,
    name,
    style,
    type,
    onFocus,
    onBlur,
    ...otherProps
  }, ref) => {
    const [inputValue, setInputValue] = React.useState<string>(value as string || "");
    const [expanded, setExpanded] = React.useState(
      (value as string || "").length > expandAfter
    );
    const [isFocused, setIsFocused] = React.useState(false);
    
    // Create internal refs to manage focus
    const inputRef = React.useRef<HTMLInputElement>(null);
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    // Handle value changes
    React.useEffect(() => {
      setInputValue(value as string || "");
      if ((value as string || "").length > expandAfter) {
        setExpanded(true);
      }
    }, [value, expandAfter]);

    // Remember to refocus after transition
    React.useEffect(() => {
      if (expanded && isFocused && textareaRef.current) {
        textareaRef.current.focus();
        
        // Place cursor at the end of text
        const length = textareaRef.current.value.length;
        textareaRef.current.setSelectionRange(length, length);
      }
    }, [expanded, isFocused]);

    const handleChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      const newValue = e.target.value;
      setInputValue(newValue);
      
      // Expand when content gets long enough
      if (!expanded && newValue.length > expandAfter) {
        setExpanded(true);
      }
      // Shrink when content becomes short enough
      else if (expanded && newValue.length <= expandAfter) {
        setExpanded(false);
      }
      
      if (onChange) {
        onChange(e);
      }
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setIsFocused(true);
      if (onFocus) {
        onFocus(e as any);
      }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setIsFocused(false);
      if (onBlur) {
        onBlur(e as any);
      }
    };

    // Common props for both input and textarea
    const commonProps = {
      className,
      value: inputValue,
      placeholder,
      disabled,
      readOnly,
      required, 
      id,
      name,
      onChange: handleChange,
      onFocus: handleFocus,
      onBlur: handleBlur,
    };

    if (expanded) {
      // Props specific to Textarea
      const textareaProps: TextareaProps = {
        ...commonProps,
        autoExpand: true,
        lined,
        rows: minRows,
        style: { 
          ...style,
          maxHeight: `${maxRows * 1.5}rem`, 
          overflowY: 'auto' 
        }
      };

      return (
        <Textarea 
          {...textareaProps} 
          ref={(node) => {
            // Set the internal ref
            textareaRef.current = node;
            
            // Forward the ref if provided
            if (typeof ref === 'function') {
              ref(node);
            } else if (ref) {
              (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
            }
          }}
        />
      );
    }

    // Props specific to Input
    const inputProps: InputProps = {
      ...commonProps,
      type,
      style,
      ...otherProps,
    };

    return (
      <Input 
        {...inputProps} 
        ref={(node) => {
          // Set the internal ref
          inputRef.current = node;
          
          // Forward the ref if provided
          if (typeof ref === 'function') {
            ref(node as any);
          } else if (ref) {
            (ref as React.MutableRefObject<HTMLInputElement | null>).current = node as any;
          }
        }}
      />
    );
  }
);
ExpandableInput.displayName = "ExpandableInput";

export { Input, ExpandableInput };
