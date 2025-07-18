"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { 
  Loader2, 
  Clock, 
  CheckSquare, 
  Gift, 
  LayoutDashboard,
  Users,
  ArrowRight,
  CalendarClock
} from "lucide-react";
import Link from "next/link";

type TimelineEvent = {
  id: string;
  week_number: number;
  event_name: string;
  scheduled_date: string;
  duration_minutes: number | null;
  description: string | null;
};

type ChecklistItem = {
  id: string;
  checklist_item: string;
  notes: string | null;
};

type Benefit = {
  id: string;
  benefit_name: string;
  notes: string | null;
};

type UserCount = {
  total: number;
  admins: number;
  users: number;
};

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [userStats, setUserStats] = useState<UserCount>({ total: 0, admins: 0, users: 0 });
  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch data from all tables in parallel
      const [timelineRes, checklistRes, benefitsRes, usersRes] = await Promise.all([
        supabase
          .from("chq_timeline")
          .select("*")
          .order("week_number", { ascending: true })
          .limit(5),
        supabase
          .from("chq_checklist")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("chq_benefits")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("auth.users")
          .select("*")
      ]);

      if (timelineRes.error) throw timelineRes.error;
      if (checklistRes.error) throw checklistRes.error;
      if (benefitsRes.error) throw benefitsRes.error;

      setEvents(timelineRes.data || []);
      setChecklist(checklistRes.data || []);
      setBenefits(benefitsRes.data || []);
      
      // Calculate user statistics
      if (usersRes.data) {
        const users = usersRes.data;
        const adminCount = users.filter(u => u.role === 'admin').length;
        setUserStats({
          total: users.length,
          admins: adminCount,
          users: users.length - adminCount
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Timeline Events",
      value: events.length,
      icon: Clock,
      link: "/admin/timeline",
      color: "blue"
    },
    {
      title: "Checklist Items",
      value: checklist.length,
      icon: CheckSquare,
      link: "/admin/checklist",
      color: "blue"
    },
    {
      title: "Benefits",
      value: benefits.length,
      icon: Gift,
      link: "/admin/benefits",
      color: "blue"
    },
    {
      title: "Total Users",
      value: userStats.total,
      icon: Users,
      link: "/admin/users",
      color: "blue"
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
        <p className="text-slate-500 mt-1">Manage your timeline, checklist, benefits, and users</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="p-5 border-blue-100 hover:-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                <stat.icon className="w-5 h-5" />
              </div>
              <Link
                href={stat.link}
                className="text-blue-600 hover:text-blue-700 text-xs font-medium flex items-center gap-1"
              >
                View All
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="mt-3">
              <h2 className="text-2xl font-bold text-slate-800">{stat.value}</h2>
              <p className="text-slate-500 text-sm mt-1">{stat.title}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="overflow-hidden border-blue-100">
          <div className="p-5 bg-blue-50 border-b border-blue-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <h2 className="font-semibold text-blue-800">Recent Timeline Events</h2>
              </div>
              <Link href="/admin/timeline">
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800 hover:bg-blue-100">
                  Manage
                </Button>
              </Link>
            </div>
          </div>
          <div className="divide-y divide-blue-100">
            {events.length > 0 ? events.map((event) => (
              <div key={event.id} className="p-4 hover:bg-blue-50/50 transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                    Week {event.week_number}
                  </span>
                  <span className="text-sm font-medium text-slate-700">{event.event_name}</span>
                </div>
                <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                  <CalendarClock className="w-3.5 h-3.5" />
                  <span>{new Date(event.scheduled_date).toLocaleDateString()}</span>
                  {event.duration_minutes && (
                    <span>({event.duration_minutes} min)</span>
                  )}
                </div>
              </div>
            )) : (
              <p className="p-4 text-sm text-slate-500 text-center">No timeline events found</p>
            )}
          </div>
        </Card>

        <Card className="overflow-hidden border-blue-100">
          <div className="p-5 bg-blue-50 border-b border-blue-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-blue-600" />
                <h2 className="font-semibold text-blue-800">Recent Checklist Items</h2>
              </div>
              <Link href="/admin/checklist">
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800 hover:bg-blue-100">
                  Manage
                </Button>
              </Link>
            </div>
          </div>
          <div className="divide-y divide-blue-100">
            {checklist.length > 0 ? checklist.map((item) => (
              <div key={item.id} className="p-4 hover:bg-blue-50/50 transition-colors">
                <p className="text-sm font-medium text-slate-700">{item.checklist_item}</p>
                {item.notes && (
                  <p className="mt-1 text-xs text-slate-500 line-clamp-2">{item.notes}</p>
                )}
              </div>
            )) : (
              <p className="p-4 text-sm text-slate-500 text-center">No checklist items found</p>
            )}
          </div>
        </Card>

        <Card className="overflow-hidden border-blue-100">
          <div className="p-5 bg-blue-50 border-b border-blue-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-blue-600" />
                <h2 className="font-semibold text-blue-800">Recent Benefits</h2>
              </div>
              <Link href="/admin/benefits">
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800 hover:bg-blue-100">
                  Manage
                </Button>
              </Link>
            </div>
          </div>
          <div className="divide-y divide-blue-100">
            {benefits.length > 0 ? benefits.map((benefit) => (
              <div key={benefit.id} className="p-4 hover:bg-blue-50/50 transition-colors">
                <p className="text-sm font-medium text-slate-700">{benefit.benefit_name}</p>
                {benefit.notes && (
                  <p className="mt-1 text-xs text-slate-500 line-clamp-2">{benefit.notes}</p>
                )}
              </div>
            )) : (
              <p className="p-4 text-sm text-slate-500 text-center">No benefits found</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
} 