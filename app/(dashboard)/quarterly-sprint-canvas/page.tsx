"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { getTeamId } from "@/utils/supabase/teams";
import { Card } from "@/components/ui/card";
import TopSection from "./components/top-section";
import MiddleSection from "./components/middle-section";
import BottomSection from "./components/bottom-section";

type QuarterlySprintCanvas = {
  id: string;
  user_id: string;
  revenuegoals: {
    good: string;
    better: string;
    best: string;
  };
  unitgoals: Array<{ name: string; units: string }>;
  revenuebymonth: Array<{ month: string; amount: string }>;
  theme: string;
  strategicpillars: string[];
  northstarmetrics: Array<{ metric: string; actual: string; target: string; gap: string }>;
  keyinitiatives: Array<{ 
    initiative: string; 
    dueDate: string; 
    status: string; 
    owner: string; 
    stakeholders: string; 
    team: string; 
    pillar: string;
  }>;
  created_at: string;
  updated_at: string;
};

export default function QuarterlySprintCanvasPage() {
  const [canvasData, setCanvasData] = useState<QuarterlySprintCanvas | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchCanvasData();
  }, []);

  const fetchCanvasData = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("No authenticated user");

      const teamId = await getTeamId(supabase, user.id);
      
      const { data, error } = await supabase
        .from("quarterly_sprint_canvas")
        .select("*")
        .eq("user_id", teamId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      if (data) {
        setCanvasData(data);
      } else {
        // Create a new entry if none exists
        const newCanvas = {
          user_id: teamId,
          revenuegoals: {
            good: "",
            better: "",
            best: ""
          },
          unitgoals: [],
          revenuebymonth: [],
          theme: "",
          strategicpillars: ["", "", ""],
          northstarmetrics: [],
          keyinitiatives: []
        };
        
        const { data: newData, error: insertError } = await supabase
          .from("quarterly_sprint_canvas")
          .insert(newCanvas)
          .select("*")
          .single();
          
        if (insertError) throw insertError;
        setCanvasData(newData);
      }
    } catch (error) {
      console.error("Error fetching quarterly sprint canvas data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto">
      <div className="mb-5">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Quarterly Sprint Canvas</h1>
        <p className="text-sm text-gray-500 mt-1">
          Plan and track your quarterly business objectives and initiatives
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Top Row - Revenue Goals, Unit Goals, Revenue By Month */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <TopSection 
              revenueGoals={canvasData?.revenuegoals || { good: "", better: "", best: "" }}
              unitGoals={canvasData?.unitgoals || []}
              revenueByMonth={canvasData?.revenuebymonth || []}
              onUpdate={fetchCanvasData}
              canvasId={canvasData?.id}
            />
          </div>

          {/* Middle Row - Theme and Strategic Pillars */}
          <MiddleSection
            theme={canvasData?.theme || ""}
            strategicPillars={canvasData?.strategicpillars || ["", "", ""]}
            onUpdate={fetchCanvasData}
            canvasId={canvasData?.id}
          />

          {/* Bottom Row - North Star Metrics and Key Initiatives */}
          <BottomSection
            northStarMetrics={canvasData?.northstarmetrics || []}
            keyInitiatives={canvasData?.keyinitiatives || []}
            onUpdate={fetchCanvasData}
            canvasId={canvasData?.id}
          />
        </div>
      )}
    </div>
  );
} 