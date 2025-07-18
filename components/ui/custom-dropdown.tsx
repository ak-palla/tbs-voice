"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DropdownOption {
  value: string;
  label: string;
  data?: any;
  disabled?: boolean;
}

interface CustomDropdownProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: DropdownOption[];
  renderOption?: (option: DropdownOption) => React.ReactNode;
  renderSelected?: (option: DropdownOption) => React.ReactNode;
  className?: string;
  disabled?: boolean;
  error?: boolean;
  size?: "sm" | "md" | "lg";
  maxHeight?: string;
}

export const CustomDropdown = ({
  value,
  onChange,
  placeholder,
  options,
  renderOption,
  renderSelected,
  className = "",
  disabled = false,
  error = false,
  size = "md",
  maxHeight = "max-h-64"
}: CustomDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const selectedOption = options.find(opt => opt.value === value);

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "h-8 text-xs px-2 py-1";
      case "lg":
        return "h-10 text-base px-4 py-2";
      case "md":
      default:
        return "h-9 text-sm px-3 py-1";
    }
  };

  const getOptionSizeClasses = () => {
    switch (size) {
      case "sm":
        return "px-2 py-1.5 text-xs";
      case "lg":
        return "px-4 py-3 text-base";
      case "md":
      default:
        return "px-3 py-2.5 text-sm";
    }
  };

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        className={cn(
          "flex w-full items-center justify-between rounded-md border bg-white shadow-sm transition-all duration-200 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          getSizeClasses(),
          isOpen 
            ? 'border-blue-500 ring-1 ring-blue-500' 
            : error
              ? 'border-red-300 hover:border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500'
              : 'border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
        )}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="flex items-center gap-2 flex-1 text-left min-w-0">
          {selectedOption ? (
            renderSelected ? renderSelected(selectedOption) : selectedOption.label
          ) : (
            <span className="text-gray-500 truncate">{placeholder}</span>
          )}
        </span>
        <ChevronDown 
          className={cn(
            "flex-shrink-0 text-gray-400 transition-transform duration-200",
            size === "sm" ? "h-3 w-3" : size === "lg" ? "h-5 w-5" : "h-4 w-4",
            isOpen ? 'rotate-180' : ''
          )} 
        />
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
          <div className={cn("overflow-auto py-1", maxHeight)}>
            {options.length > 0 ? (
              options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  disabled={option.disabled}
                  className={cn(
                    "flex w-full items-center gap-2 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                    getOptionSizeClasses()
                  )}
                  onClick={() => {
                    if (!option.disabled) {
                      onChange(option.value);
                      setIsOpen(false);
                    }
                  }}
                  role="option"
                  aria-selected={value === option.value}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {renderOption ? renderOption(option) : (
                      <span className={cn("truncate", option.disabled && "text-gray-400")}>
                        {option.label}
                      </span>
                    )}
                  </div>
                  {value === option.value && (
                    <Check className={cn(
                      "text-blue-600 flex-shrink-0",
                      size === "sm" ? "h-3 w-3" : size === "lg" ? "h-5 w-5" : "h-4 w-4"
                    )} />
                  )}
                </button>
              ))
            ) : (
              <div className={cn(
                "text-gray-500 text-center py-4",
                getOptionSizeClasses()
              )}>
                No options available
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDropdown; 