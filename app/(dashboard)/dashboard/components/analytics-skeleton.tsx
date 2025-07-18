import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card";

// Base skeleton component with gradient animation
const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded ${className}`} />
);

// Analytics Dashboard Skeleton
export const AnalyticsDashboardSkeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    
    {/* Main Analytics Section - 2 columns */}
    <div className='col-span-2'>
      <div className='bg-white p-6 rounded-lg mb-6 border'>
        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="bg-white border border-gray-200">
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                  <Skeleton className="h-12 w-12 rounded-lg" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Chart */}
        <Card className="w-full bg-transparent border-none shadow-none">
          <CardContent className="p-0 pt-4">
            <Skeleton className="w-full h-64 rounded-lg" />
          </CardContent>
        </Card>
      </div>

      {/* Side Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bounce Rate Chart */}
        <Card className="w-full">
          <CardContent className="p-4">
            <div className="mb-6">
              <div className="p-3 border rounded-lg flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-8 w-12" />
              </div>
            </div>
            <Skeleton className="w-full h-80 rounded-lg" />
          </CardContent>
        </Card>

        {/* Device Breakdown */}
        <Card className="flex flex-col w-full">
          <CardHeader className="items-center pb-0">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <div className="mx-auto aspect-square max-h-[300px] flex items-center justify-center">
              <Skeleton className="w-48 h-48 rounded-full" />
            </div>
            <div className="flex flex-col gap-2 text-sm mt-4">
              <div className="flex items-center gap-2 justify-center">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </div>
              <Skeleton className="h-4 w-48 mx-auto" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    {/* Quick Links Sidebar - 1 column */}
    <div className='col-span-1 space-y-6'>
      {/* Quick Links */}
      <div className='bg-white p-6 rounded-lg border'>
        <Skeleton className="h-6 w-24 mb-6" />
        
        <div className='space-y-4'>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className='p-4 border border-gray-200 rounded-lg'>
              <div className='flex items-start gap-3'>
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className='flex-1 space-y-2'>
                  <div className='flex items-center justify-between'>
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-4" />
                  </div>
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Customer Reviews Skeleton */}
      <CustomerReviewsSkeleton />
    </div>
  </div>
);

// Date Filter Skeleton
export const DateFilterSkeleton = () => (
  <div className="flex items-center gap-2">
    <Skeleton className="h-10 w-32" />
    <Skeleton className="h-10 w-24" />
  </div>
);

// Raw Data Section Skeleton
export const RawDataSkeleton = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-4 w-64" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-6 w-48" />
    </CardContent>
  </Card>
);

// Customer Reviews Skeleton
export const CustomerReviewsSkeleton = () => (
  <Card className="bg-white border border-gray-200">
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-5 w-32" />
          </div>
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="h-8 w-12" />
      </div>
    </CardHeader>
    <CardContent className="pt-0 space-y-4">
      {/* Overall Rating Skeleton */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-6 w-6" />
        <Skeleton className="h-8 w-12" />
      </div>

      {/* AI Summary Skeleton */}
      <div className="p-4 border rounded-lg">
        <div className="flex items-center gap-2 mb-3">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start gap-2">
              <Skeleton className="w-3 h-3 rounded-full mt-0.5" />
              <Skeleton className="h-3 w-full" />
            </div>
          ))}
        </div>
      </div>
    </CardContent>
  </Card>
); 