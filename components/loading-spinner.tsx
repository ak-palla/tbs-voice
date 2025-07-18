import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function LoadingSpinner({ className, size = "sm" }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div className="relative flex flex-col items-center gap-6">
      {/* Main spinner */}
      <div className="relative">
        <div
          className={cn(
            "animate-[spin_3s_linear_infinite] rounded-full border-4 border-blue-100",
            sizeClasses[size],
            className
          )}
        />
       
        <div
          className={cn(
            "absolute top-0 left-0 animate-[spin_0.6s_linear_infinite] rounded-full border-4 border-t-blue-700",
            sizeClasses[size]
          )}
        />
      </div>

     
    </div>
  );
} 