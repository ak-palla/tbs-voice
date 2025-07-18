"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { getTeamId } from "@/utils/supabase/teams";
import { Card } from "@/components/ui/card";
import CompanyInfo from "./components/company-info";
import InternalTasks from "./components/internal-tasks";
import HelpfulLists from "./components/helpful-lists";
import TextSections from "./components/text-sections";

type TriagePlanner = {
  id: string;
  user_id: string;
  company_info: {
    annualRevenue: { current: string; target: string };
    profitMargin: { current: string; target: string };
    teamSize: { current: string; target: string };
  };
  internal_tasks: Array<{ name: string; description: string }>;
  what_you_do: string;
  who_you_serve: string;
  what_is_right: string[];
  what_is_wrong: string[];
  what_is_missing: string[];
  what_is_confusing: string[];
  notes: string;
  created_at: string;
  updated_at: string;
};

export default function TriagePlannerPage() {
  const [plannerData, setPlannerData] = useState<TriagePlanner | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchPlannerData();
  }, []);

  const fetchPlannerData = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("No authenticated user");

      const teamId = await getTeamId(supabase, user.id);
      
      const { data, error } = await supabase
        .from("triage_planner")
        .select("*")
        .eq("user_id", teamId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      if (data) {
        setPlannerData(data);
      } else {
        // Create a new entry if none exists
        const newPlanner = {
          user_id: teamId,
          company_info: {
            annualRevenue: { current: "", target: "" },
            profitMargin: { current: "", target: "" },
            teamSize: { current: "", target: "" }
          },
          internal_tasks: [],
          what_you_do: "",
          who_you_serve: "",
          what_is_right: [],
          what_is_wrong: [],
          what_is_missing: [],
          what_is_confusing: [],
          notes: ""
        };
        
        const { data: newData, error: insertError } = await supabase
          .from("triage_planner")
          .insert(newPlanner)
          .select("*")
          .single();
          
        if (insertError) throw insertError;
        setPlannerData(newData);
      }
    } catch (error) {
      console.error("Error fetching triage planner data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto">
      <div className="mb-4">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Triage Planner</h1>
        <p className="text-sm text-gray-500 mt-1">
          Plan and organize your business triage strategy
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Column */}
          <div className="lg:col-span-8 space-y-4">
            {/* Company Info */}
            <Card className="overflow-hidden border-gray-200">
              <CompanyInfo 
                data={plannerData?.company_info} 
                onUpdate={fetchPlannerData} 
                plannerId={plannerData?.id}
              />
            </Card>

            {/* Helpful Lists */}
            <Card className="overflow-hidden border-gray-200">
              <HelpfulLists 
                rightData={plannerData?.what_is_right || []} 
                wrongData={plannerData?.what_is_wrong || []} 
                missingData={plannerData?.what_is_missing || []} 
                confusingData={plannerData?.what_is_confusing || []} 
                onUpdate={fetchPlannerData} 
                plannerId={plannerData?.id} 
              />
            </Card>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-4 space-y-4">
            {/* Internal Tasks */}
            <Card className="overflow-hidden border-gray-200">
              <InternalTasks 
                data={plannerData?.internal_tasks || []} 
                onUpdate={fetchPlannerData} 
                plannerId={plannerData?.id}
              />
            </Card>

            {/* Text Sections */}
            <Card className="overflow-hidden border-gray-200">
              <TextSections 
                whatYouDo={plannerData?.what_you_do || ""}
                whoYouServe={plannerData?.who_you_serve || ""}
                notes={plannerData?.notes || ""}
                onUpdate={fetchPlannerData}
                plannerId={plannerData?.id}
              />
            </Card>
          </div>
        </div>
      )}
    </div>
  );
} 