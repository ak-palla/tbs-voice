import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Base skeleton component with gradient animation
const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded ${className}`} />
);

// Greeting Section Skeleton
export const GreetingSkeleton = () => (
  <Card className="bg-transparent border-none p-3">
    <CardContent className="p-0">
      <div className="flex justify-between items-start flex-col md:flex-row gap-4">
        <div className="flex-1 space-y-4">
          <Skeleton className="h-9 w-80" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full max-w-2xl" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-1" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-1" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
        <Skeleton className="h-9 w-24" />
      </div>
    </CardContent>
  </Card>
);

// Quick Links Skeleton
export const QuickLinksSkeleton = () => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
    {[1, 2, 3, 4].map((i) => (
      <Card key={i} className="bg-white border border-gray-200">
        <CardContent className="p-4 md:p-6">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 md:w-14 md:h-14 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

// Business Statistics Skeleton
export const BusinessStatsSkeleton = () => (
  <Card className="bg-white border border-gray-200 h-full">
    <CardHeader className="pb-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-64" />
    </CardHeader>
    <CardContent>
      <div className="flex flex-col items-center justify-between gap-8">
        {/* Donut Chart Skeleton */}
        <div className="w-[200px] h-[200px] rounded-full border-8 border-gray-200 relative">
          <div className="absolute inset-4 rounded-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer" />
        </div>
        
        {/* Statistics Legend Skeleton */}
        <div className="w-full space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="w-3 h-3 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-3 w-8" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </CardContent>
  </Card>
);

// Customer Reviews Skeleton
export const CustomerReviewsSkeleton = () => (
  <Card className="bg-white border border-gray-200 h-full">
    <CardHeader className="pb-6">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-4 w-56" />
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="flex items-center gap-2">
        <Skeleton className="h-6 w-6" />
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-3 border rounded-lg">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Skeleton key={star} className="w-4 h-4" />
                ))}
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

// Business Health Overview Skeleton
export const BusinessHealthSkeleton = () => (
  <Card className="bg-white border border-gray-200 h-full">
    <CardHeader className="pb-6">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-4 w-72" />
    </CardHeader>
    <CardContent>
      <Tabs defaultValue="working" className="w-full">
        {/* Tab Navigation Skeleton */}
        <div className="grid w-full grid-cols-3 mb-6 h-auto p-1 bg-gray-100 rounded-xl gap-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-center gap-3 py-4 px-6 bg-white rounded-lg">
              <Skeleton className="w-12 h-12 rounded-lg" />
              <div className="space-y-1">
                <Skeleton className="h-6 w-8" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </div>

        {/* Tab Content Skeleton */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Skeleton className="w-5 h-5" />
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-12 rounded-full" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 border rounded-lg">
                <Skeleton className="w-2 h-2 rounded-full mt-2" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        </div>
      </Tabs>
    </CardContent>
  </Card>
);

// Priority Tasks Skeleton
export const PriorityTasksSkeleton = () => (
  <Card className="bg-white border border-gray-200">
    <CardHeader>
      <Skeleton className="h-6 w-32" />
    </CardHeader>
    <CardContent>
      <Tabs defaultValue="high" className="w-full">
        <div className="grid w-full grid-cols-2 mb-4 bg-gray-100 rounded-lg p-1">
          <Skeleton className="h-10 rounded" />
          <Skeleton className="h-10 rounded" />
        </div>
        
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-24" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="w-4 h-4" />
                <Skeleton className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      </Tabs>
    </CardContent>
  </Card>
);

// Key Insights Skeleton
export const KeyInsightsSkeleton = () => (
  <Card className="bg-white border border-gray-200 flex flex-col md:flex-row">
    <Skeleton className="w-full h-48 md:max-h-full md:w-1/3 rounded-lg mb-4 md:mb-0" />
    <CardContent className="space-y-4 md:w-2/3 flex flex-col justify-center">
      <Skeleton className="h-6 w-32" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-start gap-3">
              <Skeleton className="w-8 h-8 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

// Progress Overview Skeleton
export const ProgressOverviewSkeleton = () => (
  <Card className="bg-white border border-gray-200 pt-4">
    <CardContent>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-12" />
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
      </div>
    </CardContent>
  </Card>
);

// Upcoming Meetings Skeleton
export const UpcomingMeetingsSkeleton = () => (
  <Card className="bg-white border border-gray-200">
    <CardHeader>
      <div className="flex items-center gap-2">
        <Skeleton className="w-5 h-5" />
        <Skeleton className="h-6 w-40" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-4 w-16 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

// Team Members Skeleton
export const TeamMembersSkeleton = () => (
  <Card className="bg-white border border-gray-200">
    <CardHeader>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="w-5 h-5" />
          <Skeleton className="h-6 w-32" />
        </div>
        <Skeleton className="w-8 h-8" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="flex items-center gap-2 mb-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-10 w-10 rounded-full" />
        ))}
        <Skeleton className="w-10 h-10 rounded-full border-2 border-dashed" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-2 w-full rounded-full" />
      </div>
    </CardContent>
  </Card>
);

// Project Timeline Skeleton
export const ProjectTimelineSkeleton = () => (
  <Card className="bg-white border border-gray-200">
    <CardHeader>
      <Skeleton className="h-6 w-36" />
    </CardHeader>
    <CardContent>
      <div className="flex flex-col items-center space-y-4">
        {/* Circular Progress Skeleton */}
        <div className="w-[120px] h-[120px] rounded-full border-8 border-gray-200 relative">
          <div className="absolute inset-2 rounded-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer" />
        </div>
        
        <div className="text-center space-y-2">
          <Skeleton className="h-4 w-32 mx-auto" />
          <Skeleton className="h-3 w-40 mx-auto" />
        </div>
      </div>
    </CardContent>
  </Card>
);

// Combined skeleton for the entire dashboard
export const DashboardSkeleton = () => (
  <div className="min-h-screen">
    <div className="space-y-6">
      <GreetingSkeleton />
      <QuickLinksSkeleton />
      
      {/* Business Statistics and Health Overview Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-3">
          <BusinessStatsSkeleton />
        </div>
        <div className="xl:col-span-3">
          <CustomerReviewsSkeleton />
        </div>
        <div className="xl:col-span-6">
          <BusinessHealthSkeleton />
        </div>
      </div>

      {/* Priority Tasks and Key Insights Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PriorityTasksSkeleton />
        <KeyInsightsSkeleton />
      </div>

      <ProgressOverviewSkeleton />

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <UpcomingMeetingsSkeleton />
        <TeamMembersSkeleton />
        <ProjectTimelineSkeleton />
      </div>
    </div>
  </div>
); 