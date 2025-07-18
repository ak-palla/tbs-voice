"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TimelineView from "./components/timeline-view";
import BuildChecklist from "./components/build-checklist";
import AdditionalBenefits from "./components/additional-benefits";
import ContactInfo from "./components/contact-info";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

type TimelineEvent = {
  id: string;
  week_number: number;
  event_name: string;
  scheduled_date: string;
  duration_minutes: number | null;
  description: string | null;
  is_completed?: boolean;
  completion_date?: string;
};

export default function ChqTimelinePage() {
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const supabase = createClient();

  useEffect(() => {
    fetchTimelineEvents();
  }, []);

  const fetchTimelineEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("chq_timeline")
        .select("*")
        .order("week_number", { ascending: true });

      if (error) throw error;
      setTimelineEvents(data || []);
    } catch (error) {
      console.error("Error fetching timeline events:", error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="flex-1 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">CHQ Timeline</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track your Command HQ implementation progress and milestones
          </p>
        </div>
      
      </div>

      <Tabs defaultValue="timeline" className="space-y-4">
        <TabsList className=" bg-background border-b border-t rounded-none w-full justify-start h-10 p-0 gap-6">
          <TabsTrigger 
            value="timeline" 
            className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none h-10"
          >
            Timeline
          </TabsTrigger>
          <TabsTrigger 
            value="checklist"
            className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none h-10"
          >
            Build Checklist
          </TabsTrigger>
          <TabsTrigger 
            value="benefits"
            className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none h-10"
          >
            Benefits
          </TabsTrigger>
          <TabsTrigger 
            value="contact"
            className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none h-10"
          >
            Contact Info
          </TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            </div>
          ) : (
            <TimelineView />
          )}
        </TabsContent>

        <TabsContent value="checklist" className="space-y-4">
          <BuildChecklist />
        </TabsContent>

        <TabsContent value="benefits" className="space-y-4">
          <AdditionalBenefits />
        </TabsContent>

        <TabsContent value="contact" className="space-y-4">
          <ContactInfo />
        </TabsContent>
      </Tabs>
    </div>
  );
} 