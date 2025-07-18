import { LoadingSpinner } from "@/components/loading-spinner";
import { Brain } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="mb-4 flex justify-center">
          <div className="relative">
            <Brain className="h-12 w-12 text-blue-600 animate-pulse" />
            <LoadingSpinner className="absolute inset-0" />
          </div>
        </div>
        <h2 className="text-lg font-semibold mb-2">Initializing AI Dashboard</h2>
        <p className="text-muted-foreground">Analyzing your business data...</p>
      </div>
    </div>
  );
} 