"use client";

<<<<<<< HEAD
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { createClient } from "@/utils/supabase/client";
import { getTeamId, getTeamMemberIds } from "@/utils/supabase/teams";
import CustomerReviewsSummary from "./components/customer-reviews-summary";
import Link from "next/link";
import {
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Target,
  BarChart3,
  Zap,
  RefreshCw,
  Activity,
  Calendar,
  Users,
  Rocket,
  Shield,
  Settings,
  ChevronRight,
  Star,
  AlertCircle,
  ArrowRight,
  MessageSquare,
  Lightbulb,
  BookOpen,
  Building,
  MapPin,
  ExternalLink,
  Navigation,
  Swords,
  Gauge,
  Flag,
  LayoutDashboard,
  Plus,
  Mail,
  Phone,
  Briefcase,
  Hash,
  Eye,
  Bug,
  Info,
  UserCircle
} from "lucide-react";

// Import skeleton components
import {
  GreetingSkeleton,
  QuickLinksSkeleton,
  BusinessStatsSkeleton,
  CustomerReviewsSkeleton,
  BusinessHealthSkeleton,
  PriorityTasksSkeleton,
  KeyInsightsSkeleton,
  ProgressOverviewSkeleton,
  UpcomingMeetingsSkeleton,
  TeamMembersSkeleton,
  ProjectTimelineSkeleton
} from "./components/skeleton-loaders";

// Types for the dashboard data
interface BusinessHealthItem {
  issue: string;
  quick_fix: string;
}

interface BusinessHealth {
  working_well: string[];
  lagging_areas: BusinessHealthItem[];
  critical_fixes: BusinessHealthItem[];
}

interface Task {
  task: string;
  reason: string;
  deadline: string;
  guidance: string;
}

interface TasksAndPriorities {
  high_priority: Task[];
  medium_priority: Task[];
}

interface ProgressMetrics {
  overall_progress: number;
  completion_rate: number;
  setup_progress: number;
  strategic_progress: number;
  operational_progress: number;
  insights: string[];
}

interface DashboardAnalysis {
  business_health: BusinessHealth;
  tasks_and_priorities: TasksAndPriorities;
  progress_metrics: ProgressMetrics;
}

interface DashboardData {
  type: string;
  analysis?: DashboardAnalysis;
  timestamp?: string;
  error?: string;
}
=======
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import EnvironmentChecker from '@/components/env-checker';
import AccountPropertyModal from '@/components/account-property-modal';
import RealAnalyticsViewer from '@/components/real-analytics-viewer';
import { createClient } from '@/utils/supabase/client';
import { getTeamId } from '@/utils/supabase/teams';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/loading-spinner';
import { AnalyticsDashboardSkeleton, CustomerReviewsSkeleton } from '@/app/(dashboard)/dashboard/components/analytics-skeleton';
import CustomerReviewsSummary from '@/app/(dashboard)/dashboard/components/customer-reviews-summary';
import ZapierMappingsDisplay from '@/app/(dashboard)/dashboard/components/zapier-mappings-display';
import { trackActivity } from '@/utils/points';
import {
  BarChart3,
  LinkIcon,
  ExternalLink,
  CheckCircle,
  Users,
  TrendingUp,
  Settings,
  Unlink,
  RefreshCw,
} from 'lucide-react';
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a

interface BusinessInfo {
  id: string;
  user_id: string;
  business_name: string;
  full_name: string;
  email: string;
  phone_number: string;
  profile_picture_url: string | null;
  google_review_link: string | null;
}

<<<<<<< HEAD
interface TeamMember {
  id: string;
  name: string;
  jobtitle: string;
  department: string;
  manager: string;
  scheduled_date: string;
  is_completed?: boolean;
}

interface MeetingData {
  id: string;
  meeting_title: string;
  meeting_date: string;
  meeting_type: string;
  is_completed?: boolean;
}

interface TimelineEvent {
  id: string;
  week_number: number;
  event_name: string;
  scheduled_date: string;
  is_completed?: boolean;
}

// Helper function to convert markdown links to clickable links
const renderMarkdownLinks = (text: string): React.ReactNode => {
  // Replace [text](url) with clickable links
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(text)) !== null) {
    // Add text before the link
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    
    // Add the clickable link
    parts.push(
      <Link 
        key={match.index} 
        href={match[2]} 
        className="text-blue-600 hover:text-blue-800 underline font-medium"
        onClick={(e) => e.stopPropagation()}
      >
        {match[1]}
      </Link>
    );
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  
  return parts.length > 1 ? <>{parts}</> : text;
};

// Circular Progress Component
const CircularProgress = ({ percentage, size = 120, strokeWidth = 8 }: { percentage: number; size?: number; strokeWidth?: number }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#3b82f6"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-in-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-bold text-gray-900">{percentage}%</span>
        <span className="text-xs text-gray-500">Complete</span>
      </div>
    </div>
  );
};

// Donut Chart Component
const DonutChart = ({ data, size = 200 }: { data: { label: string; value: number; color: string; percentage: number }[]; size?: number }) => {
  const strokeWidth = 20;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  
  let cumulativePercentage = 0;
  
  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#f3f4f6"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Data segments */}
        {data.map((segment, index) => {
          const strokeDasharray = `${(segment.percentage / 100) * circumference} ${circumference}`;
          const strokeDashoffset = -cumulativePercentage * circumference / 100;
          cumulativePercentage += segment.percentage;
          
          return (
            <circle
              key={index}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={segment.color}
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-500 ease-in-out"
            />
          );
        })}
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-bold text-gray-900">100%</span>
        <span className="text-xs text-gray-500">Overview</span>
      </div>
    </div>
  );
};

export default function AIDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo | null>(null);
  const [adminProfile, setAdminProfile] = useState<BusinessInfo | null>(null); // To store admin info separately
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [meetings, setMeetings] = useState<MeetingData[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [currentWeek, setCurrentWeek] = useState(0);
  const [user, setUser] = useState<any | null>(null);

  // State for the new personalized greeting
=======
export default function NewDashboard() {
  const [isConnected, setIsConnected] = useState(false);
  const [hasPropertySelected, setHasPropertySelected] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [connectedProperty, setConnectedProperty] = useState<string | undefined>();

  // Greeting state
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
  const [greetingName, setGreetingName] = useState<string>('');
  const [companyName, setCompanyName] = useState<string>('');
  const [isGreetingLoading, setIsGreetingLoading] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState<string>('');

<<<<<<< HEAD
  const supabase = createClient();

  const [loadingStates, setLoadingStates] = useState({
    greeting: true,
    quickLinks: true,
    businessStats: true,
    customerReviews: true,
    businessHealth: true,
    priorityTasks: true,
    keyInsights: true,
    progressOverview: true,
    upcomingMeetings: true,
    teamMembers: true,
    projectTimeline: true,
    profile: true,
  });

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const updateLoadingState = (section: keyof typeof loadingStates, isLoading: boolean) => {
    setLoadingStates(prev => ({ ...prev, [section]: isLoading }));
  };

  const fetchBusinessData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }
      setUser(user);

      const [teamId, teamMemberIds] = await Promise.all([
        getTeamId(supabase, user.id),
        getTeamMemberIds(supabase, user.id)
      ]);

      // Always fetch admin's info for company name
      const { data: adminData, error: adminError } = await supabase
        .from("business_info")
        .select("*")
        .eq("user_id", teamId)
        .single();
      
      if (adminData) {
        setAdminProfile(adminData);
      }
      
      // Fetch the correct profile for the greeting
      if (user.role === 'admin') {
        setBusinessInfo(adminData);
      } else {
        const { data: userData, error: userError } = await supabase
          .from('business_info')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (userError) {
          console.warn("Could not fetch user's profile, falling back to admin's.", userError);
          setBusinessInfo(adminData); // Fallback to admin's info
        } else {
          setBusinessInfo(userData);
        }
      }
      updateLoadingState('greeting', false);
      updateLoadingState('quickLinks', false);

      // Fetch team members for the whole team
      const { data: teamData } = await supabase
        .from("chain_of_command")
        .select("id, name, jobtitle, department, manager")
        .in("user_id", teamMemberIds) // Use teamMemberIds for team-scoped data
        .order("name", { ascending: true })
        .limit(5);

      if (teamData) {
        setTeamMembers(teamData as TeamMember[]);
        updateLoadingState('teamMembers', false);
      }

      // Fetch upcoming meetings for the whole team
      const { data: meetingData } = await supabase
        .from("meeting_rhythm_planner")
        .select("id, meeting_title, meeting_date, meeting_type")
        .in("user_id", teamMemberIds) // Use teamMemberIds for team-scoped data
        .gte("meeting_date", new Date().toISOString().split('T')[0])
        .order("meeting_date", { ascending: true })
        .limit(3);

      if (meetingData) {
        setMeetings(meetingData);
        updateLoadingState('upcomingMeetings', false);
      }

      // Fetch timeline events with proper completion status
      const [timelineResult, timelineClaimsResult] = await Promise.all([
        // Timeline Events
        supabase
          .from("chq_timeline")
          .select(`
            id,
            week_number,
            event_name,
            scheduled_date,
            duration_minutes,
            description
          `)
          .order("week_number", { ascending: true }),
        
        // Timeline Claims
        supabase
          .from("user_timeline_claims")
          .select("*")
          .eq("user_id", user.id)
      ]);

      if (timelineResult.data && timelineClaimsResult.data) {
        const timelineEvents = timelineResult.data || [];
        const userClaims = timelineClaimsResult.data || [];
        const currentWeek = calculateCurrentWeek(timelineEvents);

        // Combine timeline events with user claims (same approach as the dashboard)
        const eventsWithClaims = timelineEvents.map(event => {
          const claim = userClaims.find(claim => claim.timeline_id === event.id);
          return {
            id: event.id,
            week_number: event.week_number,
            event_name: event.event_name,
            scheduled_date: event.scheduled_date,
            is_completed: claim?.is_completed || false
          };
        });

        setTimelineEvents(eventsWithClaims);
        setCurrentWeek(currentWeek);
        updateLoadingState('projectTimeline', false);
      }

    } catch (error) {
      console.error("Error fetching business data:", error);
      // Mark all sections as loaded even on error to avoid infinite loading
      setLoadingStates(prev => Object.keys(prev).reduce((acc, key) => ({ 
        ...acc, 
        [key]: false 
      }), {} as typeof loadingStates));
    }
  };

  const calculateCurrentWeek = (events: any[]): number => {
    // Sort events by week number
    const sortedEvents = [...events].sort((a, b) => a.week_number - b.week_number);
    
    // Get current date
    const now = new Date();
    
    // Find the first future event
    for (let i = 0; i < sortedEvents.length; i++) {
      const eventDate = new Date(sortedEvents[i].scheduled_date);
      if (eventDate > now) {
        // Return the previous week or the current week if it's the first one
        return i > 0 ? sortedEvents[i-1].week_number : sortedEvents[i].week_number;
      }
    }
    
    // If all events are in the past, return the last week
    return sortedEvents.length > 0 ? 
      sortedEvents[sortedEvents.length - 1].week_number : 1;
  };

  const fetchDashboardAnalysis = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setLoadingStates({
          greeting: true,
          quickLinks: true,
          businessStats: true,
          customerReviews: true,
          businessHealth: true,
          priorityTasks: true,
          keyInsights: true,
          progressOverview: true,
          upcomingMeetings: true,
          teamMembers: true,
          projectTimeline: true,
          profile: true,
        });
      }

      // If this is a refresh, immediately force fresh data
      if (isRefresh) {
        console.log('🔄 [Dashboard] Forcing refresh - generating fresh analysis...');
        
        const response = await fetch('/api/ai-dashboard', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'dashboard_analysis',
            force_refresh: true
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: Failed to generate dashboard analysis`);
        }

        const data = await response.json();
        
        if (data.type === 'error') {
          throw new Error(data.error || 'Unknown error occurred');
        }
        
        setDashboardData(data);
        console.log('✅ [Dashboard] Generated and cached fresh data');
        return;
      }

      // For initial load, check if we have cached data first
      const checkResponse = await fetch('/api/ai-dashboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'dashboard_analysis',
          force_refresh: false
        })
      });

      if (!checkResponse.ok) {
        throw new Error(`HTTP ${checkResponse.status}: Failed to check dashboard cache`);
      }

      const checkData = await checkResponse.json();
      
      // If we have cached data, use it
      if (checkData.type === 'dashboard_analysis' && checkData.analysis) {
        console.log('✅ [Dashboard] Using cached data:', checkData.timestamp);
        setDashboardData(checkData);
        console.log('✅ [Dashboard] Using cached data');
        return;
      }

      // No cached data, generate fresh analysis
      console.log('🔄 [Dashboard] No cached data found, generating fresh analysis...');
      const generateResponse = await fetch('/api/ai-dashboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'dashboard_analysis',
          force_refresh: true
        })
      });

      if (!generateResponse.ok) {
        throw new Error(`HTTP ${generateResponse.status}: Failed to generate dashboard analysis`);
      }

      const generateData = await generateResponse.json();
      
      if (generateData.type === 'error') {
        throw new Error(generateData.error || 'Unknown error occurred');
      }
      
      setDashboardData(generateData);
      console.log('✅ [Dashboard] Generated and cached fresh data');

    } catch (error) {
      console.error('❌ [Dashboard] Error:', error);
      setDashboardData({
        type: 'error',
        error: error instanceof Error ? error.message : 'An unexpected error occurred while loading your dashboard. Please try refreshing the page.'
      });
      // Mark AI sections as loaded even on error
      updateLoadingState('businessStats', false);
      updateLoadingState('businessHealth', false);
      updateLoadingState('priorityTasks', false);
      updateLoadingState('keyInsights', false);
      updateLoadingState('progressOverview', false);
      updateLoadingState('customerReviews', false);
    } finally {
      setLoadingStates({
        greeting: false,
        quickLinks: false,
        businessStats: false,
        customerReviews: false,
        businessHealth: false,
        priorityTasks: false,
        keyInsights: false,
        progressOverview: false,
        upcomingMeetings: false,
        teamMembers: false,
        projectTimeline: false,
        profile: false,
      });
    }
  };

  useEffect(() => {
    const setupGreeting = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        setCurrentUserRole(user.role || 'user');

        const teamId = await getTeamId(supabase, user.id);
        
        // Fetch admin info for company name
        const { data: adminData } = await supabase
          .from("business_info")
          .select("business_name, full_name")
          .eq("user_id", teamId)
          .single();
        
        if (adminData) {
          setCompanyName(adminData.business_name || '');
        }

        // Set the correct name for the greeting
        if (user.role === 'admin') {
          setGreetingName(adminData?.full_name || '');
        } else {
          const { data: userData } = await supabase
            .from('business_info')
            .select('full_name')
            .eq('user_id', user.id)
            .single();
          setGreetingName(userData?.full_name || adminData?.full_name || '');
        }
      } catch (error) {
        console.error("Error setting up greeting:", error);
        // Fallback greeting
        setGreetingName('there');
      } finally {
        setIsGreetingLoading(false);
      }
    };
    
    setupGreeting();
  }, [supabase]);

  useEffect(() => {
    fetchBusinessData();
    fetchDashboardAnalysis();
  }, []);

  const handleRefresh = () => {
    fetchDashboardAnalysis(true);
  };
=======
  // Business profile for reviews
  const [adminProfile, setAdminProfile] = useState<BusinessInfo | null>(null);
  const [customerReviewsLoading, setCustomerReviewsLoading] = useState(true);

  // Staggered loading states
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [showAnalytics, setShowAnalytics] = useState(false);

  const supabase = createClient();
  const searchParams = useSearchParams();
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a

  const getGreetingMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

<<<<<<< HEAD
  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const quickLinks = [
    {
      title: "Chat",
      icon: MessageSquare,
      description: "Connect with your team",
      href: "/chat",
      color: "bg-blue-500/10",
      iconColor: "text-blue-600"
    },
    {
      title: "Innovation",
      icon: Lightbulb,
      description: "Explore new ideas",
      href: "/innovation-machine",
      color: "bg-green-500/10",
      iconColor: "text-green-600"
    },
    {
      title: "SOP",
      icon: BookOpen,
      description: "Standard Operating Procedures",
      href: "/sop",
      color: "bg-purple-500/10",
      iconColor: "text-purple-600"
    },
    {
      title: "Team Members",
        icon: Users,
      description: "Manage team",
      href: "/chain-of-command",
      color: "bg-orange-500/10",
      iconColor: "text-orange-600"
    }
  ];

  return (
    <TooltipProvider>
      <div className="min-h-screen">
        <div className="space-y-6">
          {/* Greeting Section */}
          {isGreetingLoading ? <GreetingSkeleton /> : (
            <Card className="bg-transparent border-none">
              <CardContent className="p-0">
                <div className="flex justify-between items-start flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2 mb-2">
                      {getGreetingMessage()}, {greetingName.split(' ')[0]} 👋
                    </h1>
                    <p className="text-gray-600 ">
                      {currentUserRole === 'admin'
                        ? "Here's what we think you should focus on to improve your business performance today. Our AI has analyzed your data and identified key areas for growth and optimization."
                        : `Welcome to ${companyName || "the dashboard"}. Let's get to work!`
                      }
                    </p >
                    <p className="mb-4 text-gray-600" >Here's what we think you should focus on to improve your business performance today. Our AI has analyzed your data and identified key areas for growth and optimization.
</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Business Overview</span>
                    </div>
=======
  const setupGreeting = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      setCurrentUserRole(user.role || 'user');

      const teamId = await getTeamId(supabase, user.id);
      
      // Fetch admin info for company name and profile
      const { data: adminData } = await supabase
        .from("business_info")
        .select("*")
        .eq("user_id", teamId)
        .single();
      
      if (adminData) {
        setCompanyName(adminData.business_name || '');
        setAdminProfile(adminData);
      }

      // Set the correct name for the greeting
      if (user.role === 'admin') {
        setGreetingName(adminData?.full_name || '');
      } else {
        const { data: userData } = await supabase
          .from('business_info')
          .select('full_name')
          .eq('user_id', user.id)
          .single();
        setGreetingName(userData?.full_name || adminData?.full_name || '');
      }
    } catch (error) {
      console.error("Error setting up greeting:", error);
      // Fallback greeting
      setGreetingName('there');
    } finally {
      setIsGreetingLoading(false);
    }
  };

  const checkConnectionStatus = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsConnected(false);
        setHasPropertySelected(false);
        setLoading(false);
        return;
      }

      // First priority: Check if user has their own Google Analytics connection
      const { data: tokenData, error } = await supabase
        .from('google_analytics_tokens')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error checking user connection:', error);
      }

      let connected = !!tokenData;
      let propertySelected = !!(tokenData?.property_id);
      let connectionSource = 'user';
      let assignmentDetails = null;

      // If user doesn't have their own connection, check for assignments
      if (!connected) {
        let assignment = null;
        let connectionSource = 'user';
        
        // First check for direct assignment to this user
        const { data: directAssignment, error: assignmentError } = await supabase
          .from('superadmin_analytics_assignments')
          .select('*')
          .eq('assigned_user_id', user.id)
          .eq('is_active', true)
          .maybeSingle();

        if (assignmentError) {
          console.error('Error checking assignment:', assignmentError);
        }

        if (directAssignment) {
          assignment = directAssignment;
          connectionSource = 'superadmin';
        } else {
          // If no direct assignment, check if user is part of a team with an assigned admin
          const { data: userProfile } = await supabase
            .from('business_info')
            .select('team_id, role')
            .eq('user_id', user.id)
            .maybeSingle();

          if (userProfile?.team_id) {
            // Find the admin of this team
            const { data: teamAdmin } = await supabase
              .from('business_info')
              .select('user_id, full_name')
              .eq('team_id', userProfile.team_id)
              .eq('role', 'admin')
              .maybeSingle();

            if (teamAdmin) {
              // Check if team admin has an assignment
              const { data: teamAssignment } = await supabase
                .from('superadmin_analytics_assignments')
                .select('*')
                .eq('assigned_user_id', teamAdmin.user_id)
                .eq('is_active', true)
                .maybeSingle();

              if (teamAssignment) {
                assignment = teamAssignment;
                connectionSource = 'team_admin';
                
                // Get team admin's company name
                const { data: adminBusinessInfo } = await supabase
                  .from('business_info')
                  .select('business_name')
                  .eq('user_id', teamAdmin.user_id)
                  .single();
                
                (assignment as any).company_name = adminBusinessInfo?.business_name;
              }
            }
          }
        }

        if (assignment) {
          // Check if the superadmin has valid tokens
          const { data: superadminTokens, error: tokensError } = await supabase
            .from('superadmin_google_analytics_tokens')
            .select('*')
            .eq('superadmin_user_id', assignment.superadmin_user_id)
            .maybeSingle();

          if (tokensError) {
            console.error('Error checking superadmin tokens:', tokensError);
          }

          if (superadminTokens && assignment.property_id) {
            connected = true;
            propertySelected = true;
            assignmentDetails = {
              property_name: assignment.property_name,
              account_name: assignment.account_name,
              property_id: assignment.property_id,
              connectionSource,
              company_name: connectionSource === 'team_admin' ? (assignment as any).company_name : undefined
            };
          }
        }
      }

      setIsConnected(connected);
      setHasPropertySelected(propertySelected);
      
      // Set connected property info
      if (connectionSource === 'user' && tokenData?.property_id) {
        setConnectedProperty(`Property ID: ${tokenData.property_id}`);
      } else if (assignmentDetails) {
        const sourceType = assignmentDetails.connectionSource || connectionSource;
        if (sourceType === 'team_admin') {
          const companyName = assignmentDetails.company_name || 'Company';
          setConnectedProperty(`${companyName} Analytics: ${assignmentDetails.property_name || assignmentDetails.property_id}`);
        } else {
          setConnectedProperty(`Company Analytics: ${assignmentDetails.property_name || assignmentDetails.property_id}`);
        }
      } else {
        setConnectedProperty(undefined);
      }

      // Check if user just came back from OAuth (connected but no property)
      const fromOAuth = searchParams.get('connected') === 'true';
      if (connectionSource === 'user' && connected && !propertySelected && fromOAuth) {
        setShowAccountModal(true);
        // Clean up URL
        window.history.replaceState({}, '', window.location.pathname);
      }
    } catch (error) {
      console.error('Error checking connection status:', error);
    } finally {
      setLoading(false);
    }
  };

  // Staggered loading implementation
  const startStaggeredLoading = async () => {
    if (isConnected && hasPropertySelected) {
      // Wait for greeting to load first
      while (isGreetingLoading) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Small delay after greeting loads
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Start analytics loading
      setShowAnalytics(true);
      
      // Wait a bit before starting customer reviews
      setTimeout(() => {
        setCustomerReviewsLoading(false);
      }, 1500);
    }
  };

  const handleConnect = async () => {
    try {
      setConnecting(true);
      
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      
      if (!clientId) {
        alert('Google OAuth is not configured. Please add NEXT_PUBLIC_GOOGLE_CLIENT_ID to your environment variables.');
        setConnecting(false);
        return;
      }
      
      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: `${window.location.origin}/api/auth/google/callback`,
        response_type: 'code',
        scope: [
          'openid',
          'email',
          'profile',
          'https://www.googleapis.com/auth/analytics.readonly',
          'https://www.googleapis.com/auth/analytics.manage.users.readonly'
        ].join(' '),
        access_type: 'offline',
        prompt: 'consent',
        state: `new_dashboard_redirect=${encodeURIComponent(window.location.pathname)}`
      });

      window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    } catch (error) {
      console.error('Error initiating Google connection:', error);
      setConnecting(false);
    }
  };

  const handlePropertySelected = () => {
    setHasPropertySelected(true);
    setShowAccountModal(false);
    checkConnectionStatus(); // Refresh to get latest data
  };

  const handleDisconnect = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Delete the token from database
      const { error } = await supabase
        .from('google_analytics_tokens')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('Error disconnecting:', error);
        return;
      }

      setIsConnected(false);
      setHasPropertySelected(false);
      setConnectedProperty(undefined);
      setShowAccountModal(false);
    } catch (error) {
      console.error('Error disconnecting:', error);
    }
  };

  const handleChangeProperty = () => {
    setShowAccountModal(true);
  };

  const handleRefreshAnalytics = () => {
    setRefreshing(true);
    // Trigger refresh by dispatching a custom event that the analytics viewer can listen to
    window.dispatchEvent(new CustomEvent('refreshAnalytics'));
    // Reset refreshing state after a short delay
    setTimeout(() => setRefreshing(false), 2000);
  };

  useEffect(() => {
    checkConnectionStatus();
    setupGreeting();
    
    // Track daily login for gamification
    trackActivity.dailyLogin().then(pointsAwarded => {
      if (pointsAwarded) {
        console.log('🎉 Daily login points awarded!');
      }
    }).catch(console.error);
  }, []);

  // Start staggered loading when connection status is ready
  useEffect(() => {
    if (!loading) {
      startStaggeredLoading();
    }
  }, [loading, isConnected, hasPropertySelected, isGreetingLoading]);

  return (
    <div className="p-0">
      <div className="mx-auto">

        {/* Account/Property Selection Modal */}
        <AccountPropertyModal
          isOpen={showAccountModal}
          onClose={() => setShowAccountModal(false)}
          onPropertySelected={handlePropertySelected}
        />

        {/* Environment Variables Checker */}
        <EnvironmentChecker />

        {/* Initial Loading State - Show Skeleton */}
        {loading && (
          <div className="space-y-0">
            {/* Greeting Skeleton */}
            <Card className="bg-transparent border-none">
              <CardContent className="p-0">
                <div className="flex justify-between items-start flex-col md:flex-row gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-80"></div>
                    <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-96"></div>
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
                  </div>
                </div>
              </CardContent>
            </Card>
<<<<<<< HEAD
          )}

          {/* Quick Links Grid */}
          {loadingStates.quickLinks ? <QuickLinksSkeleton /> : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {quickLinks.map((link, index) => (
                <Link key={index} href={link.href}>
                  <Card className="bg-white hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-200 hover:border-gray-300">
                    <CardContent className="p-4 md:p-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 md:w-14 md:h-14 ${link.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <link.icon className={`w-7 h-7 md:w-8 md:h-8 ${link.iconColor}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 mb-1 text-sm">{link.title}</h3>
                          <p className="text-xs text-gray-500 truncate">{link.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {/* Business Statistics and Health Overview Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* Business Statistics with Donut Chart */}
            <div className="xl:col-span-3">
              {loadingStates.businessStats ? <BusinessStatsSkeleton /> : (
                <Card className="bg-white border border-gray-200 h-full">
                  <CardHeader className="pb-6">
                    <CardTitle className="text-2xl font-bold text-gray-900">Business Statistics</CardTitle>
                    <CardDescription className="text-gray-600">
                      Key performance metrics and current status overview.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center justify-between gap-8">
                      {/* Donut Chart */}
                      <div className="flex-shrink-0">
                        <DonutChart 
                          data={[
                            { label: "Revenue This Month", value: 45000, color: "#10b981", percentage: 35 },
                            { label: "Jobs Completed", value: 24, color: "#3b82f6", percentage: 25 },
                            { label: "Pending Tasks", value: 12, color: "#f59e0b", percentage: 20 },
                            { label: "New Clients", value: 8, color: "#8b5cf6", percentage: 15 },
                            { label: "Other", value: 5, color: "#6b7280", percentage: 5 }
                          ]}
                          size={200}
                        />
                      </div>
                      
                      {/* Statistics Legend */}
                      <div className="flex-1 space-y-3 min-w-0 w-full">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between ">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                              <span className="text-sm font-medium text-gray-900">Revenue This Month</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-green-600">$45,000</span>
                              <span className="text-xs text-gray-500">35%</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                              <span className="text-sm font-medium text-gray-900">Jobs Completed</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-blue-600">24</span>
                              <span className="text-xs text-gray-500">25%</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                              <span className="text-sm font-medium text-gray-900">Pending Tasks</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-yellow-600">12</span>
                              <span className="text-xs text-gray-500">20%</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                              <span className="text-sm font-medium text-gray-900">New Clients</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-purple-600">8</span>
                              <span className="text-xs text-gray-500">15%</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                              <span className="text-sm font-medium text-gray-900">Other Activities</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-gray-600">5</span>
                              <span className="text-xs text-gray-500">5%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Customer Reviews Summary */}
            <div className="xl:col-span-3">
              {loadingStates.customerReviews ? <CustomerReviewsSkeleton /> : (
                adminProfile && (
                  <CustomerReviewsSummary businessName={adminProfile.business_name} googleReviewLink={adminProfile.google_review_link} />
                )
              )}
            </div>

            {/* Business Health Overview */}
            <div className="xl:col-span-6">
              {loadingStates.businessHealth ? <BusinessHealthSkeleton /> : (
                dashboardData?.analysis && (
                  <Card className="bg-white border border-gray-200 h-full">
                    <CardHeader className="pb-6">
                      <CardTitle className="text-2xl font-bold text-gray-900">Business Health Overview</CardTitle>
                      <CardDescription className="text-gray-600">
                        Track what's working, what needs attention, and critical fixes required.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="working" className="w-full">
                        {/* Tab Navigation with Modern Design */}
                        <TabsList className="grid w-full grid-cols-3 mb-6 h-auto p-1 bg-gray-100 rounded-xl">
                          <TabsTrigger 
                            value="working" 
                            className="flex items-center justify-center gap-5 py-4 px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all duration-200 data-[state=active]:text-green-600"
                          >
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center data-[state=active]:bg-green-500 data-[state=active]:text-white transition-colors">
                              <CheckCircle2 className="w-6 h-6 text-green-600 data-[state=active]:text-white" />
                            </div>
                            <div className="text-left">
                              <div className="text-2xl font-bold text-green-600">
                                {dashboardData.analysis.business_health.working_well.length}
                              </div>
                              <div className="text-xs font-medium text-gray-700">What's Working</div>
                            </div>
                          </TabsTrigger>
                          
                          <TabsTrigger 
                            value="lagging" 
                            className="flex items-center justify-center gap-5 py-4 px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all duration-200 data-[state=active]:text-yellow-600"
                          >
                            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center data-[state=active]:bg-yellow-500 data-[state=active]:text-white transition-colors">
                              <TrendingDown className="w-6 h-6 text-yellow-600 data-[state=active]:text-white" />
                            </div>
                            <div className="text-left">
                              <div className="text-2xl font-bold text-yellow-600">
                                {dashboardData.analysis.business_health.lagging_areas.length}
                              </div>
                              <div className="text-xs font-medium text-gray-700">What's Lagging</div>
                            </div>
                          </TabsTrigger>
                          
                          <TabsTrigger 
                            value="critical" 
                            className="flex items-center justify-center gap-5 py-4 px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all duration-200 data-[state=active]:text-red-600"
                          >
                            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center data-[state=active]:bg-red-500 data-[state=active]:text-white transition-colors">
                              <AlertTriangle className="w-6 h-6 text-red-600 data-[state=active]:text-white" />
                            </div>
                            <div className="text-left">
                              <div className="text-2xl font-bold text-red-600">
                                {dashboardData.analysis.business_health.critical_fixes.length}
                              </div>
                              <div className="text-xs font-medium text-gray-700">Critical Fixes</div>
                            </div>
                          </TabsTrigger>
                        </TabsList>

                        {/* Tab Content */}
                        <TabsContent value="working" className="mt-0 space-y-4">
                          <div className="flex items-center gap-2 mb-4">
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                            <h3 className="text-lg font-semibold text-gray-900">What's Working Well</h3>
                            <Badge variant="secondary" className="bg-green-100 text-green-700">
                              {dashboardData.analysis.business_health.working_well.length} items
                            </Badge>
                          </div>
                          <div className="space-y-3">
                            {dashboardData.analysis.business_health.working_well.length > 0 ? (
                              dashboardData.analysis.business_health.working_well.map((item, index) => (
                                <div key={index} className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                  <p className="text-sm text-gray-700 leading-relaxed">{item}</p>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-8">
                                <CheckCircle2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-500">No successful items identified yet</p>
                              </div>
                            )}
                          </div>
                        </TabsContent>

                        <TabsContent value="lagging" className="mt-0 space-y-4">
                          <div className="flex items-center gap-2 mb-4">
                            <TrendingDown className="w-5 h-5 text-yellow-600" />
                            <h3 className="text-lg font-semibold text-gray-900">What's Lagging Behind</h3>
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                              {dashboardData.analysis.business_health.lagging_areas.length} items
                            </Badge>
                          </div>
                          <div className="space-y-3">
                            {dashboardData.analysis.business_health.lagging_areas.length > 0 ? (
                              dashboardData.analysis.business_health.lagging_areas.map((area, index) => (
                                <div key={index} className="flex items-start justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                  <div className="flex items-start gap-3 flex-1">
                                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                                    <p className="text-sm text-gray-700 leading-relaxed">{area.issue}</p>
                                  </div>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <button className="ml-3 flex-shrink-0">
                                        <Lightbulb className="w-5 h-5 text-amber-500 hover:text-amber-600 cursor-pointer" />
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-xs bg-white border border-gray-200 shadow-xl">
                                      <div className="text-sm p-3">
                                        <div className="flex items-center gap-2 mb-2">
                                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                            <TrendingUp className="w-3 h-3 text-blue-600" />
                                          </div>
                                          <p className="font-semibold text-gray-900">Improvement Tip</p>
                                        </div>
                                        <p className="text-gray-700 leading-relaxed">{renderMarkdownLinks(area.quick_fix)}</p>
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-8">
                                <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-500">All tasks are on track</p>
                              </div>
                            )}
                          </div>
                        </TabsContent>

                        <TabsContent value="critical" className="mt-0 space-y-4">
                          <div className="flex items-center gap-2 mb-4">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                            <h3 className="text-lg font-semibold text-gray-900">Critical Fixes Required</h3>
                            <Badge variant="secondary" className="bg-red-100 text-red-700">
                              {dashboardData.analysis.business_health.critical_fixes.length} items
                            </Badge>
                          </div>
                          <div className="space-y-3">
                            {dashboardData.analysis.business_health.critical_fixes.length > 0 ? (
                              dashboardData.analysis.business_health.critical_fixes.map((fix, index) => (
                                <div key={index} className="flex items-start justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                                  <div className="flex items-start gap-3 flex-1">
                                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                                    <p className="text-sm text-gray-700 leading-relaxed">{fix.issue}</p>
                                  </div>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <button className="ml-3 flex-shrink-0">
                                        <Lightbulb className="w-5 h-5 text-amber-500 hover:text-amber-600 cursor-pointer" />
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-xs bg-white border border-gray-200 shadow-xl">
                                      <div className="text-sm p-3">
                                        <div className="flex items-center gap-2 mb-2">
                                          <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center">
                                            <Lightbulb className="w-3 h-3 text-amber-600" />
                                          </div>
                                          <p className="font-semibold text-gray-900">Quick Fix</p>
                                        </div>
                                        <p className="text-gray-700 leading-relaxed">{renderMarkdownLinks(fix.quick_fix)}</p>
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-8">
                                <Shield className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-500">No critical fixes identified</p>
                              </div>
                            )}
                          </div>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                )
              )}
            </div>
          </div>

          {/* Priority Tasks and Key Insights Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Priority Tasks */}
            {loadingStates.priorityTasks ? <PriorityTasksSkeleton /> : (
              dashboardData?.analysis && (
                <Card className="bg-white border border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-900">Priority Tasks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="high" className="w-full">
                      <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="high" className="text-sm data-[state=active]:bg-red-100 data-[state=active]:text-red-700">
                          <Flag className="w-4 h-4 mr-2 text-red-500" />
                          High Priority
                        </TabsTrigger>
                        <TabsTrigger value="medium" className="text-sm data-[state=active]:bg-amber-100 data-[state=active]:text-amber-700">
                          <Clock className="w-4 h-4 mr-2 text-amber-500" />
                          Medium Priority
                        </TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="high" className="mt-0">
                        <div className="space-y-3">
                          {dashboardData.analysis.tasks_and_priorities.high_priority.length > 0 ? (
                            dashboardData.analysis.tasks_and_priorities.high_priority.map((task, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900 text-sm">{task.task}</h4>
                                  <p className="text-xs text-gray-500 mt-1">Due: {task.deadline}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <button>
                                        <Lightbulb className="w-4 h-4 text-amber-500 hover:text-amber-600 cursor-pointer" />
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-xs bg-white border border-gray-200 shadow-xl">
                                      <div className="text-sm p-3">
                                        <div className="flex items-center gap-2 mb-2">
                                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                                            <Navigation className="w-3 h-3 text-green-600" />
                                          </div>
                                          <p className="font-semibold text-gray-900">Where to go</p>
                                        </div>
                                        <p className="text-gray-700 leading-relaxed">{renderMarkdownLinks(task.guidance)}</p>
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                  <ChevronRight className="w-4 h-4 text-gray-400" />
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded-lg">
                              No high priority tasks
                            </div>
                          )}
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="medium" className="mt-0">
                        <div className="space-y-3">
                          {dashboardData.analysis.tasks_and_priorities.medium_priority.length > 0 ? (
                            dashboardData.analysis.tasks_and_priorities.medium_priority.map((task, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900 text-sm">{task.task}</h4>
                                  <p className="text-xs text-gray-500 mt-1">Due: {task.deadline}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <button>
                                        <Lightbulb className="w-4 h-4 text-amber-500 hover:text-amber-600 cursor-pointer" />
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-xs bg-white border border-gray-200 shadow-xl">
                                      <div className="text-sm p-3">
                                        <div className="flex items-center gap-2 mb-2">
                                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                                            <Navigation className="w-3 h-3 text-green-600" />
                                          </div>
                                          <p className="font-semibold text-gray-900">Where to go</p>
                                        </div>
                                        <p className="text-gray-700 leading-relaxed">{renderMarkdownLinks(task.guidance)}</p>
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                  <ChevronRight className="w-4 h-4 text-gray-400" />
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded-lg">
                              No medium priority tasks
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              )
            )}

            {/* Key Insights */}
            {loadingStates.keyInsights ? <KeyInsightsSkeleton /> : (
              dashboardData?.analysis && (
                <Card className="bg-white border border-gray-200 flex flex-col md:flex-row">
                  <img src="/insight.svg" alt="Key Insights" 
                    className="w-full h-full object-contain rounded-lg mb-4 max-h-48 md:max-h-full md:w-1/3" />
                  <CardContent className="space-y-4 md:w-2/3 flex flex-col justify-center">
                    <CardTitle className="text-lg font-semibold text-gray-900">Key Insights</CardTitle>
                    <div className="space-y-2">
                      {dashboardData.analysis.progress_metrics.insights.length > 0 ? (
                        dashboardData.analysis.progress_metrics.insights.map((insight, index) => {
                          // Array of icons to cycle through for insights
                          const insightIcons = [
                            { icon: TrendingUp, color: "text-green-600", bg: "bg-green-100" },
                            { icon: Target, color: "text-blue-600", bg: "bg-blue-100" },
                            { icon: Lightbulb, color: "text-amber-600", bg: "bg-amber-100" },
                            { icon: Zap, color: "text-purple-600", bg: "bg-purple-100" },
                            { icon: Activity, color: "text-red-600", bg: "bg-red-100" },
                            { icon: BarChart3, color: "text-indigo-600", bg: "bg-indigo-100" }
                          ];
                          const iconData = insightIcons[index % insightIcons.length];
                          const IconComponent = iconData.icon;
                          
                          return (
                            <div key={index} className="p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-start gap-3">
                                <div className={`w-8 h-8 ${iconData.bg} rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5`}>
                                  <IconComponent className={`w-4 h-4 ${iconData.color}`} />
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-medium text-sm text-gray-900 mb-1">
                                    Insight {index + 1}
                                  </h4>
                                  <p className="text-xs text-gray-600">{insight}</p>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-4">
                          <BarChart3 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">No insights available yet</p>
                          <p className="text-xs text-gray-400">Refresh to generate AI insights</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            )}
          </div>

          {/* Progress Overview */}
          {loadingStates.progressOverview ? <ProgressOverviewSkeleton /> : (
            dashboardData?.analysis && (
              <Card className="bg-white border border-gray-200 pt-4">
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-lg text-gray-700">Overall Progress</span>
                      <span className="text-lg font-semibold text-gray-900">
                        {dashboardData.analysis.progress_metrics.overall_progress}%
                      </span>
                    </div>
                    <Progress 
                      value={dashboardData.analysis.progress_metrics.overall_progress} 
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>
            )
          )}

          {/* Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upcoming Meetings */}
            {loadingStates.upcomingMeetings ? <UpcomingMeetingsSkeleton /> : (
              <Card className="bg-white border border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Upcoming Meetings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {meetings.length > 0 ? (
                      meetings.map((meeting, index) => (
                        <div key={meeting.id} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                            <Calendar className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-sm text-gray-900">{meeting.meeting_title}</h4>
                            <p className="text-xs text-gray-500">
                              {new Date(meeting.meeting_date).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </p>
                            <Badge variant="outline" className="text-xs mt-1">
                              {meeting.meeting_type}
                            </Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4">
                        <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No upcoming meetings scheduled</p>
                        <Link href="/meeting-rhythm-planner">
                          <Button variant="outline" size="sm" className="mt-2">
                            Schedule Meeting
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Team Members */}
            {loadingStates.teamMembers ? <TeamMembersSkeleton /> : (
              <Card className="bg-white border border-gray-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Team Members
                    </CardTitle>
                    <Link href="/chain-of-command">
                      <Button variant="ghost" size="sm">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-4">
                    {teamMembers.length > 0 ? (
                      teamMembers.slice(0, 5).map((member, index) => (
                        <Tooltip key={member.id}>
                          <TooltipTrigger asChild>
                            <Avatar className="h-10 w-10 border-2 border-white shadow-sm hover:border-blue-200 transition-colors cursor-pointer">
                              <AvatarFallback className="text-xs bg-gray-100 text-gray-600 hover:bg-blue-50">
                                {getUserInitials(member.name)}
                              </AvatarFallback>
                            </Avatar>
                          </TooltipTrigger>
                          <TooltipContent className="bg-white border border-gray-200 shadow-lg">
                            <div className="text-sm p-2">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                  <span className="text-blue-600 font-medium text-xs">{getUserInitials(member.name)}</span>
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900">{member.name}</p>
                                  <p className="text-xs text-gray-500">{member.jobtitle}</p>
                                </div>
                              </div>
                              <div className="space-y-1 border-t border-gray-100 pt-2">
                                <div className="flex items-center gap-2">
                                  <Building className="w-3 h-3 text-gray-400" />
                                  <span className="text-xs text-gray-600">{member.department}</span>
                                </div>
                                {member.manager && (
                                  <div className="flex items-center gap-2">
                                    <UserCircle className="w-3 h-3 text-gray-400" />
                                    <span className="text-xs text-gray-600">Reports to: {member.manager}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      ))
                    ) : (
                      <div className="text-center py-4 w-full">
                        <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No team members added yet</p>
                        <Link href="/chain-of-command">
                          <Button variant="outline" size="sm" className="mt-2">
                            Add Team Members
                          </Button>
                        </Link>
                      </div>
                    )}
                    {teamMembers.length > 0 && (
                      <Link href="/chain-of-command">
                        <Button variant="ghost" size="sm" className="w-10 h-10 rounded-full border-2 border-dashed border-gray-300">
                          <Plus className="w-4 h-4 text-gray-400" />
                        </Button>
                      </Link>
                    )}
                  </div>

                  <div>
                    <h4 className="font-medium text-sm text-gray-900">Project Timeline</h4>
                    {timelineEvents.length > 0 ? (
                      <>
                        <p className="text-xs text-gray-500 mb-2">
                          {Math.round((timelineEvents.filter(event => event.is_completed).length / timelineEvents.length) * 100)}% Complete
                        </p>
                        <Progress 
                          value={Math.round((timelineEvents.filter(event => event.is_completed).length / timelineEvents.length) * 100)} 
                          className="h-2" 
                        />
                      </>
                    ) : (
                      <>
                        <p className="text-xs text-gray-500 mb-2">No timeline data available</p>
                        <Progress value={0} className="h-2" />
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Project Timeline with Circular Progress */}
            {loadingStates.projectTimeline ? <ProjectTimelineSkeleton /> : (
              <Card className="bg-white border border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">Project Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  {timelineEvents.length > 0 ? (
                    <div className="flex flex-col items-center space-y-4">
                      {/* Circular Progress Bar */}
                      <CircularProgress 
                        percentage={Math.round((timelineEvents.filter(event => event.is_completed).length / timelineEvents.length) * 100)} 
                      />
                      
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-900">Currently in Week {currentWeek}</p>
                        <p className="text-xs text-gray-500">
                          {timelineEvents.filter(event => event.is_completed).length} of {timelineEvents.length} events completed
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-sm font-medium text-gray-900 mb-2">No Timeline Data</h3>
                      <p className="text-xs text-gray-500 mb-4">
                        Your project timeline will appear here once events are scheduled
                      </p>
                      <Button variant="outline" size="sm">
                        View Timeline
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Error State */}
          {dashboardData?.type === 'error' && (
            <Card className="border-red-200 bg-red-50/50">
              <CardContent className="p-6 text-center">
                <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <p className="text-red-700">{dashboardData.error}</p>
                <Button onClick={handleRefresh} className="mt-4" variant="outline">
                  Try Again
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </TooltipProvider>
=======

            {/* Analytics Dashboard Skeleton */}
            <AnalyticsDashboardSkeleton />
          </div>
        )}

        {/* Not Connected State - Show Connect Button */}
        {!loading && !isConnected && (
          <div className="max-w-2xl mx-auto">
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <LinkIcon className="h-5 w-5" />
                  Connect Google Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="">
                {/* Benefits */}
                <div className="space-y-3">
                  <h4 className="font-medium text-blue-900">What you'll get:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-blue-800">Real-time analytics data</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-blue-800">User behavior insights</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-blue-800">Traffic source analysis</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-blue-800">Custom date filtering</span>
                    </div>
                  </div>
                </div>

                {/* Connect Button */}
                <Button
                  onClick={handleConnect}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size="lg"
                  disabled={connecting}
                >
                  {connecting ? (
                    <>
                      <LoadingSpinner />
                      <span className="ml-2">Connecting to Google...</span>
                    </>
                  ) : (
                    <>
                      <LinkIcon className="h-4 w-4 mr-2" />
                      Connect Google Analytics
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>

                <p className="text-xs text-blue-600 text-center">
                  You'll be redirected to Google to authorize access. We only request read-only permissions.
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Connected but No Property Selected */}
        {!loading && isConnected && !hasPropertySelected && (
          <div className="max-w-2xl mx-auto">
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-6 text-center">
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-orange-900">Google Account Connected!</span>
                  </div>
                  <p className="text-orange-700">
                    Please select your Google Analytics account and property to continue.
                  </p>
                  <Button
                    onClick={() => setShowAccountModal(true)}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    Select Analytics Property
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Connected and Property Selected - Show Analytics Dashboard */}
        {isConnected && hasPropertySelected && (
          <div className="">
            {/* Greeting Section */}
            {isGreetingLoading ? (
              <Card className="bg-transparent border-none">
                <CardContent className="p-0">
                  <div className="flex justify-between items-start flex-col md:flex-row gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-80"></div>
                      <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-96"></div>
                      <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-32"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-transparent border-none shadow-none">
                <CardContent className="p-0">
                  <div className="flex justify-between items-start flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2 mb-2">
                        {getGreetingMessage()}, {greetingName.split(' ')[0]} 👋
                      </h1>
                      <p className="text-gray-600 mb-4">
                        {currentUserRole === 'admin'
                          ? "Here's your Google Analytics overview to help you understand your website performance and make data-driven decisions for your business growth."
                          : `Welcome to ${companyName || "the analytics dashboard"}. View real-time insights and track your website's performance.`
                        }
                      </p>
                      {/* <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Analytics Overview</span>
                      </div> */}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Analytics Dashboard with Staggered Loading */}
            {!showAnalytics ? (
              <AnalyticsDashboardSkeleton />
            ) : (
              <RealAnalyticsViewer 
                isConnected={isConnected}
                connectedProperty={connectedProperty}
                onConnect={handleConnect}
                onDisconnect={handleDisconnect}
                onChangeProperty={handleChangeProperty}
                onRefresh={handleRefreshAnalytics}
                refreshing={refreshing}
                adminProfile={adminProfile}
                customerReviewsLoading={customerReviewsLoading}
              />
            )}

         
          </div>
        )}
      </div>
    </div>
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
  );
} 