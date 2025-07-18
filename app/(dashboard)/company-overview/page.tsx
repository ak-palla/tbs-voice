"use client";

import { useState, useEffect } from "react";
import { Loader2, Sparkles, Save } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { getTeamId } from "@/utils/supabase/teams";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CompanyInfo from "./components/company-info";
import InternalTasks from "./components/internal-tasks";
import HelpfulLists from "./components/helpful-lists";
import TextSections from "./components/text-sections";
import { toast } from "sonner";

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
  const [generating, setGenerating] = useState(false);
  const [generatedData, setGeneratedData] = useState<any>(null);
  const [savingGenerated, setSavingGenerated] = useState(false);
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
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) {
        throw error;
      }
      
      if (data && data.length > 0) {
        setPlannerData(data[0]);
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
      console.error("Error fetching company overview data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateWithAI = async () => {
    try {
      setGenerating(true);
      
      const response = await fetch('/api/gemini/company-overview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'generate' }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        console.error('API Error Response:', result);
        throw new Error(result.error || result.details || 'Failed to generate content');
      }

      setGeneratedData(result.data);
      toast.success("AI has generated your Company Overview content!");
      
    } catch (err: any) {
      console.error('Error generating content:', err);
      const errorMessage = err.message || 'Failed to generate company overview content';
      toast.error(errorMessage);
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveGeneratedContent = async () => {
    if (!generatedData) return;
    
    try {
      setSavingGenerated(true);
      const response = await fetch('/api/gemini/company-overview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'save',
          generatedData: generatedData 
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to save generated content');
      }

      // Refresh the data
      await fetchPlannerData();
      setGeneratedData(null);
      
      toast.success("Generated content saved successfully!");
      
    } catch (err: any) {
      console.error('Error saving generated content:', err);
      toast.error("Failed to save generated content");
    } finally {
      setSavingGenerated(false);
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto">
      <div className="mb-4">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Company Overview</h1>
        <p className="text-sm text-gray-500 mt-1">
          Plan and organise your business company overview
        </p>
      </div>

      {/* Compact AI Generation Section */}
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-indigo-50 to-indigo-100 border border-indigo-200 rounded-lg mb-5">
        <div className="flex items-center space-x-3">
          <div>
            <h3 className="text-sm font-medium text-indigo-800">AI Company Overview Generator</h3>
            <p className="text-xs text-indigo-600 mt-1">
              Analyse company data and generate your comprehensive company overview
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {generatedData && (
            <Button
              size="sm"
              className="h-8 px-3 text-xs bg-green-600 hover:bg-green-700 text-white"
              onClick={handleSaveGeneratedContent}
              disabled={savingGenerated}
            >
              {savingGenerated ? (
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <Save className="h-3 w-3 mr-1" />
              )}
              {savingGenerated ? 'Saving...' : 'Save'}
            </Button>
          )}
          <Button
            size="sm"
            className="h-8 px-3 text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
            onClick={handleGenerateWithAI}
            disabled={generating}
          >
            {generating ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Sparkles className="h-3 w-3 mr-1" />}
            {generatedData ? 'Regenerate' : 'Generate'}
          </Button>
        </div>
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
                generatedData={generatedData}
                onGeneratedDataChange={setGeneratedData}
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
                generatedData={generatedData}
                onGeneratedDataChange={setGeneratedData}
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
                generatedData={generatedData}
                onGeneratedDataChange={setGeneratedData}
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
                generatedData={generatedData}
                onGeneratedDataChange={setGeneratedData}
              />
            </Card>
          </div>
        </div>
      )}
    </div>
  );
} 