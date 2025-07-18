"use client";

import { LoadingSpinner } from "@/components/loading-spinner";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-sm text-gray-500">Loading your dashboard...</p>
      </div>
    </div>
  );
} 