"use client";

import { useState } from 'react';
import { Button } from './button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu';
import { 
  Sparkles, 
  CheckCircle, 
  ArrowUp, 
  ArrowDown, 
  Loader2,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AIDropdownProps {
  onAction: (action: 'simplify' | 'grammar' | 'shorter' | 'longer' | 'format') => Promise<void>;
  isLoading?: boolean;
  disabled?: boolean;
  variant?: 'toolbar' | 'bubble';
  className?: string;
}

export function AIDropdown({ 
  onAction, 
  isLoading = false, 
  disabled = false, 
  variant = 'toolbar',
  className 
}: AIDropdownProps) {
  const [currentAction, setCurrentAction] = useState<string | null>(null);

  const handleAction = async (action: 'simplify' | 'grammar' | 'shorter' | 'longer' | 'format') => {
    setCurrentAction(action);
    try {
      await onAction(action);
    } finally {
      setCurrentAction(null);
    }
  };

  const aiOptions = [
    {
      action: 'simplify' as const,
      label: 'Simplify',
      icon: Sparkles,
      description: 'Make text easier to understand'
    },
    {
      action: 'grammar' as const,
      label: 'Fix spelling & grammar',
      icon: CheckCircle,
      description: 'Correct spelling and grammar errors'
    },
    {
      action: 'shorter' as const,
      label: 'Make shorter',
      icon: ArrowDown,
      description: 'Reduce length while keeping key points'
    },
    {
      action: 'longer' as const,
      label: 'Make longer',
      icon: ArrowUp,
      description: 'Add more detail and examples'
    },
    {
      action: 'format' as const,
      label: 'Format document',
      icon: FileText,
      description: 'Improve structure and formatting'
    }
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant === 'bubble' ? 'ghost' : 'outline'}
          size={variant === 'bubble' ? 'sm' : 'sm'}
          disabled={disabled || isLoading}
          className={cn(
            'flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-800 text-white hover:bg-blue-600 hover:text-white',
            variant === 'bubble' && 'h-8 w-8 p-0',
            variant === 'toolbar' && 'h-9 px-3',
            className
          )}
          title="AI Enhancement"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {variant === 'toolbar' && !isLoading && (
            <span className="hidden sm:inline">AI</span>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align={variant === 'bubble' ? 'start' : 'end'} 
        className="w-64"
      >
        <div className="px-2 py-1.5 text-sm font-medium text-gray-700 border-b">
          AI Enhancement
        </div>
        
        {aiOptions.map((option) => {
          const IconComponent = option.icon;
          const isCurrentAction = currentAction === option.action;
          
          return (
            <DropdownMenuItem
              key={option.action}
              onClick={() => handleAction(option.action)}
              disabled={isLoading}
              className={cn(
                "flex items-start gap-3 p-3 cursor-pointer",
                isCurrentAction && "bg-blue-50"
              )}
            >
              <div className="flex items-center gap-2 flex-1">
                <div className="flex-shrink-0">
                  {isCurrentAction ? (
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  ) : (
                    <IconComponent className="h-4 w-4 text-gray-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={cn(
                    "text-sm font-medium",
                    isCurrentAction ? "text-blue-700" : "text-gray-900"
                  )}>
                    {option.label}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {option.description}
                  </div>
                </div>
              </div>
            </DropdownMenuItem>
          );
        })}
       
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default AIDropdown; 