import { cn } from "@/lib/utils"

interface LoadingProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Loading({ className, ...props }: LoadingProps) {
  return (
    <div className={cn("flex space-x-2", className)} {...props}>
      <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
      <div className="w-2 h-2 rounded-full bg-primary animate-bounce delay-100" />
      <div className="w-2 h-2 rounded-full bg-primary animate-bounce delay-200" />
    </div>
  )
} 