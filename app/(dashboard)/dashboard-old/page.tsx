"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Calendar,
  AlertTriangle,
  Swords,
  Users,
  Rocket,
  LineChart,
  BookOpen,
  Package,
  Gauge,
  Wrench,
  BookText,
  Clock,
  Flag,
  Compass,
  Link as LinkIcon,
  ArrowRight,
  Settings,
  UserCircle,
  Star,
  CheckCircle2,
  CircleX,
  Info,
  ChevronRight,
  Plus,
  CircleDot,
  MessageSquare,
  Cog,
  Lightbulb,
  X,
} from "lucide-react";

// Types
type BusinessInfo = {
  id: string;
  user_id: string;
  business_name: string;
  full_name: string;
  email: string;
  phone_number: string;
  profile_picture_url: string | null;
};

type PlaybookData = {
  id: string;
  playbookname: string;
  description: string;
  enginetype: "GROWTH" | "FULFILLMENT" | "INNOVATION";
  owner: string;
  status: "Backlog" | "In Progress" | "Behind" | "Completed";
  link: string | null;
};

type TeamMember = {
  id: string;
  name: string;
  jobtitle: string;
  department: string;
  manager: string;
};

type TimelineEvent = {
  id: string;
  week_number: number;
  event_name: string;
  scheduled_date: string;
  is_completed?: boolean;
};

type PendingTask = {
  id: string;
  checklist_item: string;
  is_completed: boolean;
};

type MachineData = {
  id: string;
  enginename: string;
  enginetype: string;
  description: string;
};

type ScoreCardMetric = {
  id: string;
  name: string;
  status: string;
};

type BenefitData = {
  id: string;
  benefit_name: string;
  is_claimed: boolean;
};

type MeetingData = {
  id: string;
  meeting_title: string;
  meeting_date: string;
  meeting_type: string;
};

type DashboardData = {
  businessInfo: BusinessInfo | null;
  playbooks: PlaybookData[];
  teamMembers: TeamMember[];
  metrics: ScoreCardMetric[];
  machines: MachineData[];
  timelineEvents: TimelineEvent[];
  pendingTasks: PendingTask[];
  benefits: BenefitData[];
  meetings: MeetingData[];
  currentWeek: number;
};

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData>({
    businessInfo: null,
    playbooks: [],
    teamMembers: [],
    metrics: [],
    machines: [],
    timelineEvents: [],
    pendingTasks: [],
    benefits: [],
    meetings: [],
    currentWeek: 0
  });
  const supabase = createClient();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("No authenticated user");

      // Fetch data in parallel
      const [
        businessInfoResult,
        playbooksResult,
        teamMembersResult,
        metricsResult,
        machinesResult,
        timelineResult,
        timelineClaimsResult,
        pendingTasksResult,
        benefitsResult,
        meetingsResult
      ] = await Promise.all([
        // Business Info
        supabase
          .from("business_info")
          .select("*")
          .eq("user_id", user.id)
          .single(),
        
        // Playbooks
        supabase
          .from("playbooks")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5),
        
        // Team Members
        supabase
          .from("chain_of_command")
          .select("id, name, jobtitle, department, manager")
          .eq("user_id", user.id)
          .order("name", { ascending: true })
          .limit(5),
        
        // Metrics
        supabase
          .from("company_scorecards")
          .select("id, name, status")
          .eq("user_id", user.id)
          .limit(5),
        
        // Machines
        supabase
          .from("machines")
          .select("id, enginename, enginetype, description")
          .eq("user_id", user.id),
        
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
          .eq("user_id", user.id),
        
        // Pending Tasks
        supabase
          .from("chq_checklist")
          .select(`
            id, 
            checklist_item,
            user_checklist_claims!inner(
              is_completed
            )
          `)
          .eq("user_checklist_claims.user_id", user.id)
          .eq("user_checklist_claims.is_completed", false)
          .limit(5),
        
        // Benefits
        supabase
          .from("chq_benefits")
          .select(`
            id, 
            benefit_name,
            user_benefit_claims(
              is_claimed
            )
          `)
          .limit(6),
        
        // Upcoming Meetings
        supabase
          .from("meeting_rhythm_planner")
          .select("id, meeting_title, meeting_date, meeting_type")
          .eq("user_id", user.id)
          .gte("meeting_date", new Date().toISOString().split('T')[0])
          .order("meeting_date", { ascending: true })
          .limit(3)
      ]);

      // Process timeline data to find current week
      const timelineEvents = timelineResult.data || [];
      const userClaims = timelineClaimsResult.data || [];
      const currentWeek = calculateCurrentWeek(timelineEvents);

      // Combine timeline events with user claims (same approach as the timeline page)
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

      // Transform data into the format we need
      const processedData: DashboardData = {
        businessInfo: businessInfoResult.data,
        playbooks: playbooksResult.data || [],
        teamMembers: teamMembersResult.data || [],
        metrics: metricsResult.data || [],
        machines: machinesResult.data || [],
        timelineEvents: eventsWithClaims,
        pendingTasks: (pendingTasksResult.data || []).map(task => ({
          id: task.id,
          checklist_item: task.checklist_item,
          is_completed: false
        })),
        benefits: (benefitsResult.data || []).map(benefit => ({
          id: benefit.id,
          benefit_name: benefit.benefit_name,
          is_claimed: benefit.user_benefit_claims?.length > 0 ? 
            benefit.user_benefit_claims[0].is_claimed : false
        })),
        meetings: meetingsResult.data || [],
        currentWeek: currentWeek
      };

      setData(processedData);
      } catch (error) {
      console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
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

  // Helper for status colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Green":
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Light Green":
      case "In Progress":
        return "bg-blue-100 text-blue-800";
      case "Yellow":
      case "Backlog":
        return "bg-amber-100 text-amber-800";
      case "Light Red":
      case "Behind":
        return "bg-red-100 text-red-800";
      case "Red":
        return "bg-rose-100 text-rose-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Display loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-6">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex justify-between mb-4 items-center">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500">Welcome to your Command HQ</p>
          </div>
          
          {data.businessInfo && (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium">{data.businessInfo.full_name}</p>
                <p className="text-xs text-gray-500">{data.businessInfo.business_name}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-medium">
                {data.businessInfo.profile_picture_url ? (
                  <Image 
                    src={data.businessInfo.profile_picture_url} 
                    alt={data.businessInfo.full_name}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                ) : (
                  data.businessInfo.full_name.charAt(0).toUpperCase()
                )}
              </div>
            </div>
          )}
        </div>

        {/* Top Metrics Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <Link href="/chat" className="block">
            <Card className="border border-gray-200 hover:border-blue-300 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <MessageSquare className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Chat</h3>
                    <p className="text-xs text-gray-500">Command HQ Assistant</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
          
          <Link href="/playbook-planner" className="block">
            <Card className="border border-gray-200 hover:border-blue-300 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <BookOpen className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{data.playbooks.length}</h3>
                    <p className="text-xs text-gray-500">Playbooks</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
          
          <Link href="/chain-of-command" className="block">
            <Card className="border border-gray-200 hover:border-blue-300 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{data.teamMembers.length}</h3>
                    <p className="text-xs text-gray-500">Team Members</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
          
          <Link href="/growth-machine" className="block">
            <Card className="border border-gray-200 hover:border-blue-300 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Rocket className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{data.machines.length}</h3>
                    <p className="text-xs text-gray-500">Machines</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
        
        {/* Timeline Summary */}
        <Card className="border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium text-gray-900">Timeline Summary</h2>
              <Link href="/chq-timeline" className="text-xs text-blue-600 hover:underline flex items-center">
                View Timeline <ChevronRight className="h-3 w-3 ml-1" />
              </Link>
            </div>
            
            <div className="flex items-center gap-6 mb-3">
              <div className="p-2 rounded-full bg-blue-100">
                <Calendar className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium mb-1 flex justify-between">
                  <span>Currently in Week {data.currentWeek}</span>
                  <span className="text-blue-600">
                    {data.timelineEvents.length > 0
                      ? Math.round((data.timelineEvents.filter(event => event.is_completed).length / data.timelineEvents.length) * 100)
                      : 0}% Complete
                  </span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500" 
                    style={{ width: `${data.timelineEvents.length > 0
                      ? (data.timelineEvents.filter(event => event.is_completed).length / data.timelineEvents.length) * 100
                      : 0}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1 text-xs text-gray-500">
                  <span>{data.timelineEvents.filter(event => event.is_completed).length} of {data.timelineEvents.length} events completed</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
              {data.timelineEvents.slice(0, 3).map(event => (
                <div key={event.id} className="flex items-start p-3 rounded-md border border-gray-200">
                  <div className="mt-0.5 mr-2">
                    {event.is_completed ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <Clock className="h-4 w-4 text-amber-500" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">Week {event.week_number}: {event.event_name}</p>
                    <p className="text-xs text-gray-500">{format(new Date(event.scheduled_date), 'MMM d, yyyy')}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Main Grid - Now with 3 columns and no Machines or Playbooks sections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="border border-gray-200">
            <CardHeader className="pb-3 pt-6 px-6">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base">Profile</CardTitle>
                <Link href="/profile" className="text-xs text-blue-600 hover:underline">
                  Edit Profile
                </Link>
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              {data.businessInfo ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xl font-medium">
                      {data.businessInfo.profile_picture_url ? (
                        <Image 
                          src={data.businessInfo.profile_picture_url} 
                          alt={data.businessInfo.full_name}
                          width={48}
                          height={48}
                          className="rounded-full"
                        />
                      ) : (
                        data.businessInfo.full_name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium">{data.businessInfo.full_name}</h3>
                      <p className="text-sm text-gray-500">{data.businessInfo.business_name}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm mt-1">
                    <div className="flex flex-col">
                      <span className="text-gray-500 text-xs">Email</span>
                      <span className="truncate">{data.businessInfo.email}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-500 text-xs">Phone</span>
                      <span>{data.businessInfo.phone_number}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">Complete your profile</p>
                  <Link href="/profile">
                    <Button variant="outline" size="sm" className="mt-2">
                      Set Up Profile
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Team Members */}
          <Card className="border border-gray-200">
            <CardHeader className="pb-3 pt-6 px-6">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base">Team Members</CardTitle>
                <Link href="/chain-of-command" className="text-xs text-blue-600 hover:underline">
                  View All
                </Link>
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              {data.teamMembers.length > 0 ? (
                <div className="space-y-3">
                  {data.teamMembers.map(member => (
                    <div key={member.id} className="flex items-center gap-3 p-2.5 border border-gray-200 rounded-md">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-medium text-xs">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">{member.name}</p>
                        <p className="text-xs text-gray-500 truncate">{member.jobtitle}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Users className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500 mb-2">No team members yet</p>
                  <Link href="/chain-of-command">
                    <Button size="sm">
                      Add Team Members
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Metrics */}
          <Card className="border border-gray-200">
            <CardHeader className="pb-3 pt-6 px-6">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base">Metrics</CardTitle>
                <Link href="/company-scorecard" className="text-xs text-blue-600 hover:underline">
                  View All
                </Link>
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              {data.metrics.length > 0 ? (
                <div className="space-y-3">
                  {data.metrics.map(metric => (
                    <div key={metric.id} className="flex items-center justify-between gap-3 p-2.5 border border-gray-200 rounded-md">
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${
                          metric.status === 'Green' ? 'bg-green-500' :
                          metric.status === 'Light Green' ? 'bg-emerald-400' :
                          metric.status === 'Yellow' ? 'bg-amber-500' :
                          metric.status === 'Light Red' ? 'bg-orange-500' :
                          'bg-red-500'
                        }`} />
                        <p className="text-sm">{metric.name}</p>
                      </div>
                      <Badge 
                        variant="secondary" 
                        className={`${getStatusColor(metric.status)} border-0`}
                      >
                        {metric.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <LineChart className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500 mb-2">No metrics yet</p>
                  <Link href="/company-scorecard">
                    <Button size="sm">
                      Set Up Metrics
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Pending Tasks */}
          <Card className="border border-gray-200">
            <CardHeader className="pb-3 pt-6 px-6">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base">Pending Tasks</CardTitle>
                <Link href="/chq-timeline" className="text-xs text-blue-600 hover:underline">
                  View All
                </Link>
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              {data.pendingTasks.length > 0 ? (
                <div className="space-y-3">
                  {data.pendingTasks.map(task => (
                    <div key={task.id} className="flex items-start gap-3 p-2.5 border border-gray-200 rounded-md">
                      <div className="mt-0.5">
                        <CircleDot className="h-4 w-4 text-gray-400" />
                      </div>
                      <p className="text-sm">{task.checklist_item}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <CheckCircle2 className="h-8 w-8 mx-auto text-green-500 mb-2" />
                  <p className="text-sm text-gray-600">All tasks completed!</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Upcoming Meetings */}
          <Card className="border border-gray-200">
            <CardHeader className="pb-3 pt-6 px-6">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base">Upcoming Meetings</CardTitle>
                <Link href="/meeting-rhythm-planner" className="text-xs text-blue-600 hover:underline">
                  View All
                </Link>
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              {data.meetings.length > 0 ? (
                <div className="space-y-3">
                  {data.meetings.map(meeting => (
                    <div key={meeting.id} className="flex items-start gap-3 p-3 border border-gray-200 rounded-md">
                      <div className="mt-0.5">
                        <Calendar className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm mb-1">{meeting.meeting_title}</h3>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {format(new Date(meeting.meeting_date), 'MMM d, yyyy')}
                          </span>
                          <Badge variant="outline" className="font-normal">
                            {meeting.meeting_type}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Calendar className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500 mb-2">No upcoming meetings</p>
                  <Link href="/meeting-rhythm-planner">
                    <Button size="sm">
                      Schedule Meetings
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Benefits */}
          <Card className="border border-gray-200">
            <CardHeader className="pb-3 pt-6 px-6">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base">CHQ Benefits</CardTitle>
                <Link href="/chq-timeline" className="text-xs text-blue-600 hover:underline">
                  View All
                </Link>
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="space-y-3">
                {data.benefits.slice(0, 2).map(benefit => (
                  <div key={benefit.id} className="flex items-start gap-3 p-2.5 border border-gray-200 rounded-md">
                    <div className="mt-0.5">
                      {benefit.is_claimed ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <Star className="h-5 w-5 text-amber-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">{benefit.benefit_name}</h3>
                      <Badge 
                        variant="secondary" 
                        className={`mt-1 ${benefit.is_claimed ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'} border-0`}
                      >
                        {benefit.is_claimed ? 'Claimed' : 'Available'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Resources */}
        <Card className="border border-gray-200">
          <CardHeader className="pb-3 pt-6 px-6">
            <CardTitle className="text-base">Resources</CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Link href="/battle-plan" className="block">
                <div className="p-3 rounded-md border border-gray-200 hover:border-blue-300 transition-all h-full flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    <Swords className="h-4 w-4 text-blue-600" />
                    <h3 className="font-medium text-sm">Battle Plan</h3>
                  </div>
                  <p className="text-xs text-gray-500 mt-auto">Strategic vision & values</p>
                </div>
              </Link>
              
              <Link href="/playbook-planner" className="block">
                <div className="p-3 rounded-md border border-gray-200 hover:border-blue-300 transition-all h-full flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    <BookOpen className="h-4 w-4 text-blue-600" />
                    <h3 className="font-medium text-sm">Playbook Library</h3>
                  </div>
                  <p className="text-xs text-gray-500 mt-auto">Company processes</p>
                </div>
              </Link>
              
              <Link href="/growth-machine" className="block">
                <div className="p-3 rounded-md border border-gray-200 hover:border-blue-300 transition-all h-full flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    <Rocket className="h-4 w-4 text-blue-600" />
                    <h3 className="font-medium text-sm">Growth Machine</h3>
                  </div>
                  <p className="text-xs text-gray-500 mt-auto">Lead generation</p>
                </div>
              </Link>

              <Link href="/innovation-machine" className="block">
                <div className="p-3 rounded-md border border-gray-200 hover:border-orange-300 transition-all h-full flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    <Lightbulb className="h-4 w-4 text-orange-600" />
                    <h3 className="font-medium text-sm">Innovation Machine</h3>
                  </div>
                  <p className="text-xs text-gray-500 mt-auto">Business innovation ideas</p>
                </div>
              </Link>

              <Link href="/fulfillment-machine" className="block">
                <div className="p-3 rounded-md border border-gray-200 hover:border-blue-300 transition-all h-full flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    <Package className="h-4 w-4 text-blue-600" />
                    <h3 className="font-medium text-sm">Fulfillment Machine</h3>
                  </div>
                  <p className="text-xs text-gray-500 mt-auto">Workflow metrics</p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 