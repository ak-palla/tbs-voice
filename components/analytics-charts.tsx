"use client";

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Pie,
  PieChart,
  Label,
} from 'recharts';
import {
  Users,
  Eye,
  MousePointer,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  Monitor,
  Smartphone,
  Tablet,
  MessageCircle,
  Lightbulb,
  Target,
  UsersRound,
  ExternalLink,
  Swords,
  Rocket,
  LineChart as TrendingIcon,
  AlertTriangle,
  Calendar,
  Gauge,
} from 'lucide-react';
import Link from 'next/link';
import CustomerReviewsSummary from '@/app/(dashboard)/dashboard/components/customer-reviews-summary';
import { CustomerReviewsSkeleton } from '@/app/(dashboard)/dashboard/components/analytics-skeleton';
import Leaderboard from '@/components/leaderboard';
import ZapierMappingsDisplay from '@/app/(dashboard)/dashboard/components/zapier-mappings-display';
import AIInsights from '@/app/(dashboard)/dashboard/components/ai-insights';

interface AnalyticsChartsProps {
  data: any;
  adminProfile?: any;
  customerReviewsLoading?: boolean;
}

interface MetricConfig {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  metricIndex: number;
  format: 'number' | 'percentage' | 'duration';
  description: string;
}

export default function AnalyticsCharts({ data, adminProfile, customerReviewsLoading = false }: AnalyticsChartsProps) {
  const [activeTab, setActiveTab] = useState('activeUsers');
  
  // Staggered loading states
  const [showMetricCards, setShowMetricCards] = useState(false);
  const [showMainChart, setShowMainChart] = useState(false);
  const [showSideCharts, setShowSideCharts] = useState(false);
  const [showQuickLinks, setShowQuickLinks] = useState(false);
  const [showAIInsights, setShowAIInsights] = useState(false);

  // Start staggered loading when component mounts
  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = [];
    
    // Show metric cards first
    timeouts.push(setTimeout(() => setShowMetricCards(true), 100));
    
    // Show main chart
    timeouts.push(setTimeout(() => setShowMainChart(true), 400));
    
    // Show side charts
    timeouts.push(setTimeout(() => setShowSideCharts(true), 700));
    
    // Show quick links and reviews section
    timeouts.push(setTimeout(() => setShowQuickLinks(true), 1000));
    
    // Show AI insights after quick links
    timeouts.push(setTimeout(() => setShowAIInsights(true), 1200));
    
    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [data]);

  const metricConfigs: MetricConfig[] = [
    {
      id: 'activeUsers',
      label: 'Active Users',
      icon: <Users className="h-6 w-6 text-blue-600" />,
      color: '#3b82f6',
      bgColor: 'bg-blue-100',
      metricIndex: 2,
      format: 'number',
      description: 'Number of active users who visited your site'
    },
    {
      id: 'newUsers',
      label: 'New Users',
      icon: <TrendingUp className="h-6 w-6 text-green-600" />,
      color: '#10b981',
      bgColor: 'bg-green-100',
      metricIndex: 1,
      format: 'number',
      description: 'First-time visitors to your site'
    },
    {
      id: 'sessions',
      label: 'Sessions',
      icon: <MousePointer className="h-6 w-6 text-purple-600" />,
      color: '#8b5cf6',
      bgColor: 'bg-purple-100',
      metricIndex: 3,
      format: 'number',
      description: 'Number of sessions initiated by users'
    },
    {
      id: 'pageViews',
      label: 'Page Views',
      icon: <Eye className="h-6 w-6 text-orange-600" />,
      color: '#f59e0b',
      bgColor: 'bg-orange-100',
      metricIndex: 4,
      format: 'number',
      description: 'Total number of pages viewed'
    }
  ];

  // Add secondary metrics for the second row
  const secondaryMetrics = [
  ];

  // Process the daily data for charts
  const chartData = useMemo(() => {
    if (!data?.mainReport?.rows) return [];

    // Get today's date in YYYYMMDD format to exclude current day data
    const today = new Date();
    const todayString = today.getFullYear().toString() + 
                       (today.getMonth() + 1).toString().padStart(2, '0') + 
                       today.getDate().toString().padStart(2, '0');

    return data.mainReport.rows
      .filter((row: any) => {
        const date = row.dimensionValues?.[0]?.value || '';
        // Filter out today's data as it may be incomplete
        return date !== todayString;
      })
      .map((row: any, index: number) => {
        const date = row.dimensionValues?.[0]?.value || '';
        const formattedDate = date ? `${date.slice(4,6)}/${date.slice(6,8)}` : `Day ${index + 1}`;
        
        return {
          date: formattedDate,
          fullDate: date,
          totalUsers: parseInt(row.metricValues?.[0]?.value || '0'),
          newUsers: parseInt(row.metricValues?.[1]?.value || '0'),
          activeUsers: parseInt(row.metricValues?.[2]?.value || '0'),
          sessions: parseInt(row.metricValues?.[3]?.value || '0'),
          pageViews: parseInt(row.metricValues?.[4]?.value || '0'),
          bounceRate: parseFloat(row.metricValues?.[5]?.value || '0') * 100,
          avgSessionDuration: parseFloat(row.metricValues?.[6]?.value || '0'),
          sessionsPerUser: parseFloat(row.metricValues?.[7]?.value || '0')
        };
      });
  }, [data]);

  // Helper functions
  function calculateTotalForMetric(metricIndex: number) {
    if (!data?.mainReport?.rows) return 0;
    return data.mainReport.rows.reduce((total: number, row: any) => {
      return total + parseInt(row.metricValues?.[metricIndex]?.value || '0');
    }, 0);
  }

  function calculateAverageForMetric(metricIndex: number) {
    if (!data?.mainReport?.rows || data.mainReport.rows.length === 0) return 0;
    const total = data.mainReport.rows.reduce((sum: number, row: any) => {
      return sum + parseFloat(row.metricValues?.[metricIndex]?.value || '0');
    }, 0);
    return total / data.mainReport.rows.length;
  }

  // Calculate totals and growth
  const calculateMetricSummary = (metricId: string) => {
    if (chartData.length === 0) return { total: 0, growth: 0, trend: 'neutral' };

    const values = chartData.map((d: any) => d[metricId as keyof typeof d] as number);
    const total = values.reduce((sum: number, val: number) => sum + val, 0);
    
    // Calculate growth compared to first half vs second half
    const midPoint = Math.floor(values.length / 2);
    const firstHalf = values.slice(0, midPoint);
    const secondHalf = values.slice(midPoint);
    
    const firstHalfAvg = firstHalf.reduce((sum: number, val: number) => sum + val, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum: number, val: number) => sum + val, 0) / secondHalf.length;
    
    const growth = firstHalfAvg > 0 ? ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100 : 0;
    const trend = growth > 5 ? 'up' : growth < -5 ? 'down' : 'neutral';
    
    return { total, growth, trend };
  };

  const formatValue = (value: number, format: string) => {
    switch (format) {
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'duration':
        const minutes = Math.floor(value / 60);
        const seconds = Math.floor(value % 60);
        return `${minutes}m ${seconds}s`;
      case 'decimal':
        return value.toFixed(2);
      default:
        return new Intl.NumberFormat().format(Math.round(value));
    }
  };

  const formatNumber = (num: string | number) => {
    return new Intl.NumberFormat().format(Number(num));
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-3 w-3 text-red-600" />;
      default:
        return <Minus className="h-3 w-3 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (!data || chartData.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-500">No chart data available</p>
        </CardContent>
      </Card>
    );
  }

  const activeMetric = metricConfigs.find(m => m.id === activeTab);
  const chartConfig = {
    [activeTab]: {
      label: activeMetric?.label,
      color: activeMetric?.color,
    },
  } satisfies ChartConfig;

  const summary = calculateMetricSummary(activeTab);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">


      <div className='col-span-2'>
      <div className='bg-white p-6 rounded-lg mb-6 border' >
      {/* Clickable Metric Cards */}
      {!showMetricCards ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="bg-white border border-gray-200">
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-20"></div>
                    <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-16"></div>
                  </div>
                  <div className="h-12 w-12 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-lg"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 animate-in fade-in duration-300">
          {metricConfigs.map((metric) => {
            const metricSummary = calculateMetricSummary(metric.id);
            const isActive = activeTab === metric.id;
            
            return (
              <Card 
                key={metric.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  isActive ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab(metric.id)}
              >
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-center justify-between">
                    <div >
                      <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatValue(
                          metric.format === 'percentage' 
                            ? metricSummary.total / chartData.length 
                            : metricSummary.total, 
                          metric.format
                        )}
                      </p>
                    </div>
                    <div className={`h-12 w-12 ${metric.bgColor} rounded-lg flex items-center justify-center`}>
                      {metric.icon}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
     
             {/* Chart Section */}
       {!showMainChart ? (
         <Card className="w-full bg-transparent border-none shadow-none">
           <CardContent className="p-0 pt-4">
             <div className="w-full h-64 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-lg"></div>
           </CardContent>
         </Card>
       ) : (
         <Card className="w-full bg-transparent border-none shadow-none animate-in fade-in duration-500">
           <CardContent className="p-0 pt-4">
          {/* Compact Metric Summary */}
          <div className="flex items-center justify-between mb-4 p-2 bg-gray-50 rounded-lg hidden">
            <div className="flex items-center gap-2">
              {activeMetric?.icon}
              <div>
                <span className="text-sm font-medium">{activeMetric?.label}</span>
                <div className="text-lg font-bold">
                  {formatValue(
                    activeMetric?.format === 'percentage' 
                      ? summary.total / chartData.length 
                      : summary.total, 
                    activeMetric?.format || 'number'
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {getTrendIcon(summary.trend)}
              <div>
                <span className="text-xs text-gray-600">Trend</span>
                <div className={`text-sm font-bold ${getTrendColor(summary.trend)}`}>
                  {summary.growth > 0 ? '+' : ''}{summary.growth.toFixed(1)}%
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Eye className="h-3 w-3 text-gray-600" />
              <div>
                <span className="text-xs text-gray-600">Period</span>
                <div className="text-sm font-bold">
                  {chartData.length} days
                </div>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="w-full h-48 sm:h-56 lg:h-64 overflow-hidden">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <LineChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  tick={false}
                  tickLine={false}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis 
                  tick={{ fontSize: 11 }}
                  tickLine={{ stroke: '#9ca3af' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickFormatter={(value) => {
                    if (activeMetric?.format === 'number' && value >= 1000) {
                      return `${(value / 1000).toFixed(1)}k`;
                    }
                    return formatValue(value, activeMetric?.format || 'number');
                  }}
                  width={20}
                />
                <ChartTooltip 
                  content={
                    <ChartTooltipContent 
                      formatter={(value, name) => [
                        formatValue(value as number, activeMetric?.format || 'number'), 
                        activeMetric?.label
                      ]}
                    />
                  }
                />
                <Line
                  type="monotone"
                  dataKey={activeTab}
                  stroke={activeMetric?.color}
                  strokeWidth={2.5}
                  dot={{ r: 3, strokeWidth: 2, fill: activeMetric?.color }}
                  activeDot={{ r: 5, strokeWidth: 2 }}
                />
              </LineChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card> 
       )}
      </div>

      {/* Side by Side: Bounce Rate Chart and Device Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bounce Rate Chart */}
        <Card className="w-full">
          <CardContent className="p-4">
            {/* Bounce Rate Summary */}
            <div className="mb-6">
              <div className="p-3 border rounded-lg text-center flex justify-between items-center">
                <div className="flex items-center justify-center gap-2">
                  <TrendingDown className="h-10 w-10 text-red-600 bg-red-100 rounded-lg p-1" />
                  <div className='flex flex-col items-start justify-start'>
                  <span className="text-sm font-medium">Average Bounce Rate</span>
                  <p className="text-xs text-gray-600 mt-1">Lower is better</p>

                </div></div>
                <div className="text-xl lg:text-2xl font-bold text-red-600">
                  {formatValue(
                    chartData.reduce((sum: number, d: any) => sum + d.bounceRate, 0) / chartData.length || 0,
                    'percentage'
                  )}
                </div>
              </div>
           
            </div>

            {/* Bounce Rate Bar Chart */}
            <div className="w-full h-64 sm:h-72 lg:h-80 overflow-hidden">
              <ChartContainer 
                config={{
                  bounceRate: {
                    label: 'Bounce Rate',
                    color: '#ef4444',
                  },
                }} 
                className="h-full w-full"
              >
                <BarChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="date" 
                    tick={false}
                    tickLine={false}
                    axisLine={{ stroke: '#e5e7eb' }}
                  />
                  <YAxis 
                    tick={{ fontSize: 11 }}
                    tickLine={{ stroke: '#9ca3af' }}
                    axisLine={{ stroke: '#e5e7eb' }}
                    tickFormatter={(value) => `${value.toFixed(1)}%`}
                    width={50}
                  />
                  <ChartTooltip 
                    content={
                      <ChartTooltipContent 
                        formatter={(value, name) => [
                          formatValue(value as number, 'percentage'), 
                          'Bounce Rate'
                        ]}
                      />
                    }
                  />
                  <Bar
                    dataKey="bounceRate"
                    fill="#ef4444"
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        {/* Device Breakdown */}
        {data.deviceData?.rows && (
          <Card className="flex flex-col w-full">
            <CardHeader className="items-center pb-0">
              <CardTitle>Device Breakdown</CardTitle>
              <CardDescription>Users by device type in the selected period</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
              <ChartContainer
                config={{
                  users: {
                    label: "Users",
                  },
                  desktop: {
                    label: "Desktop",
                    color: "#1e40af",
                  },
                  mobile: {
                    label: "Mobile",
                    color: "#3b82f6",
                  },
                  tablet: {
                    label: "Tablet",
                    color: "#60a5fa",
                  },
                } satisfies ChartConfig}
                className="mx-auto aspect-square max-h-[300px]"
              >
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Pie
                    data={data.deviceData.rows.map((row: any) => {
                      const deviceType = row.dimensionValues?.[0]?.value?.toLowerCase() || 'unknown';
                      let fillColor = '#93c5fd'; // Default light blue for unknown devices
                      
                      switch (deviceType) {
                        case 'desktop':
                          fillColor = '#1e40af'; // Dark blue
                          break;
                        case 'mobile':
                          fillColor = '#3b82f6'; // Medium blue
                          break;
                        case 'tablet':
                          fillColor = '#60a5fa'; // Light blue
                          break;
                      }
                      
                      return {
                        device: row.dimensionValues?.[0]?.value || 'Unknown',
                        users: parseInt(row.metricValues?.[0]?.value || '0'),
                        fill: fillColor,
                      };
                    })}
                    dataKey="users"
                    nameKey="device"
                    innerRadius={60}
                    strokeWidth={5}
                  >
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                          const totalUsers = data.deviceData.rows.reduce(
                            (acc: number, row: any) => acc + parseInt(row.metricValues?.[0]?.value || '0'),
                            0
                          );
                          return (
                            <text
                              x={viewBox.cx}
                              y={viewBox.cy}
                              textAnchor="middle"
                              dominantBaseline="middle"
                            >
                              <tspan
                                x={viewBox.cx}
                                y={viewBox.cy}
                                className="fill-foreground text-3xl font-bold"
                              >
                                {formatNumber(totalUsers)}
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 24}
                                className="fill-muted-foreground"
                              >
                                Users
                              </tspan>
                            </text>
                          );
                        }
                      }}
                    />
                  </Pie>
                </PieChart>
              </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm">
              <div className="flex items-center gap-2 leading-none font-medium">
                {(() => {
                  const mobileUsers = parseInt(data.deviceData.rows.find((row: any) => 
                    row.dimensionValues?.[0]?.value === 'mobile'
                  )?.metricValues?.[0]?.value || '0');
                  const totalDeviceUsers = data.deviceData.rows.reduce((sum: number, row: any) => 
                    sum + parseInt(row.metricValues?.[0]?.value || '0'), 0
                  );
                  const mobilePercentage = ((mobileUsers / totalDeviceUsers) * 100).toFixed(1);
                  return (
                    <>
                      {mobilePercentage}% mobile users <Smartphone className="h-4 w-4" />
                    </>
                  );
                })()}
              </div>
              <div className="text-muted-foreground leading-none">
                Showing device distribution for the selected period
              </div>
            </CardFooter>
          </Card>
        )}
      </div>

      {/* New Section for Zapier Mappings */}
      {/* <div className="mt-8">
              <ZapierMappingsDisplay />
            </div> */}
    </div>


    <div className='col-span-2 md:col-span-1 space-y-6'>
      {/* Quick Links Grid */}
      {showQuickLinks && (
        <div className='grid grid-cols-2 gap-4 animate-in fade-in duration-500'>
        {/* Chat */}
        <Link href="/chat" className='block'>
          <div className='p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-all cursor-pointer group'>
            <div className='flex items-center gap-3'>
              <div className='p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors'>
                <MessageCircle className='h-5 w-5 text-blue-600' />
              </div>
              <h3 className='font-semibold text-gray-900'>Chat</h3>
            </div>
          </div>
        </Link>

        {/* Innovation */}
        <Link href="/innovation-machine" className='block'>
          <div className='p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-yellow-300 transition-all cursor-pointer group'>
            <div className='flex items-center gap-3'>
              <div className='p-2 bg-yellow-100 rounded-lg group-hover:bg-yellow-200 transition-colors'>
                <Lightbulb className='h-5 w-5 text-yellow-600' />
              </div>
              <h3 className='font-semibold text-gray-900'>Innovation</h3>
            </div>
          </div>
        </Link>

        {/* Business Battle Plan */}
        <Link href="/business-battle-plan" className='block'>
          <div className='p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-red-300 transition-all cursor-pointer group'>
            <div className='flex items-center gap-3'>
              <div className='p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors'>
                <Swords className='h-5 w-5 text-red-600' />
              </div>
              <h3 className='font-semibold text-gray-900'>Battle Plan</h3>
            </div>
          </div>
        </Link>

        {/* User Management */}
        <Link href="/users" className='block'>
          <div className='p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-purple-300 transition-all cursor-pointer group'>
            <div className='flex items-center gap-3'>
              <div className='p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors'>
                <UsersRound className='h-5 w-5 text-purple-600' />
              </div>
              <h3 className='font-semibold text-gray-900'>Team</h3>
            </div>
          </div>
        </Link>
        </div>
      )}

      {/* AI Insights Section */}
      {showAIInsights && (
        <div className="mb-6 animate-in fade-in duration-500">
          <AIInsights />
        </div>
      )}

         {/* Leaderboard Section */}
         {/* <div className="mb-6">
              <Leaderboard />
            </div> */}


      {/* Customer Reviews */}
      {showQuickLinks && (
        <div className="animate-in fade-in duration-500">
          {customerReviewsLoading ? (
            <CustomerReviewsSkeleton />
          ) : (
            adminProfile && (
              <CustomerReviewsSummary 
                businessName={adminProfile.business_name} 
                googleReviewLink={adminProfile.google_review_link} 
              />
            )
          )}
        </div>
      )}
    </div>


    </div>
    
  );
} 