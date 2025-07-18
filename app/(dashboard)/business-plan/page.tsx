"use client";

import { useState, useEffect } from "react";
import { Loader2, Sparkles, Save } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { getTeamId } from "@/utils/supabase/teams";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BattlePlanDetails from "./components/battle-plan-details";
import StrategicElements from "./components/strategic-elements";
import ReusableTiptapEditor from "@/components/reusable-tiptap-editor";
import { toast } from "sonner";

type BattlePlanData = {
  id: string;
  user_id: string;
  businessplanlink: string;
  business_plan_content: string;
  missionstatement: string;
  visionstatement: string;
  purposewhy: any[];
  strategicanchors: any[];
  corevalues: any[];
  threeyeartarget: any[];
  created_at: string;
  updated_at: string;
};

export default function BattlePlanPage() {
  const [battlePlanData, setBattlePlanData] = useState<BattlePlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingContent, setSavingContent] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedData, setGeneratedData] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchBattlePlanData();
  }, []);

  const fetchBattlePlanData = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("No authenticated user");

      const teamId = await getTeamId(supabase, user.id);
      
      const { data, error } = await supabase
        .from("battle_plan")
        .select("*")
        .eq("user_id", teamId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      if (data) {
        setBattlePlanData(data);
      } else {
        // Create a new entry if none exists for the admin
        const newBattlePlan = {
          user_id: teamId,
          businessplanlink: "",
          business_plan_content: "",
          missionstatement: "",
          visionstatement: "",
          purposewhy: [],
          strategicanchors: [],
          corevalues: [],
          threeyeartarget: []
        };
        
        const { data: newData, error: insertError } = await supabase
          .from("battle_plan")
          .insert(newBattlePlan)
          .select("*")
          .single();
          
        if (insertError) throw insertError;
        setBattlePlanData(newData);
      }
    } catch (error) {
      console.error("Error fetching battle plan data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBusinessPlanContent = async (content: string) => {
    if (!battlePlanData?.id) return;
    
    try {
      setSavingContent(true);
      
      const { error } = await supabase
        .from("battle_plan")
        .update({
          business_plan_content: content
        })
        .eq("id", battlePlanData.id);
        
      if (error) throw error;
      
      // Update local state
      setBattlePlanData(prev => prev ? { ...prev, business_plan_content: content } : null);
    } catch (error) {
      console.error("Error saving business plan content:", error);
    } finally {
      setSavingContent(false);
    }
  };

  const handleGenerateWithAI = async () => {
    try {
      setGenerating(true);
      
      const response = await fetch('/api/gemini/business-plan', {
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
      toast.success("AI has generated your Business Plan content!");
      
    } catch (err: any) {
      console.error('Error generating content:', err);
      const errorMessage = err.message || 'Failed to generate business plan content';
      toast.error(errorMessage);
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveGeneratedContent = async () => {
    if (!generatedData) return;
    
    try {
      const response = await fetch('/api/gemini/business-plan', {
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
      await fetchBattlePlanData();
      setGeneratedData(null);
      
      toast.success("Generated content saved successfully!");
      
    } catch (err: any) {
      console.error('Error saving generated content:', err);
      toast.error("Failed to save generated content");
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto">
      <div className="mb-5">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Business Plan</h1>
        <p className="text-sm text-gray-500 mt-1">
          Define and manage your business strategy and vision
        </p>
      </div>

      {/* Compact AI Generation Section */}
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-indigo-50 to-indigo-100 border border-indigo-200 rounded-lg mb-5">
        <div className="flex items-center space-x-3">
          <div>
            <h3 className="text-sm font-medium text-indigo-800">AI Business Plan Generator</h3>
            <p className="text-xs text-indigo-600 mt-1">
              Analyse company data and generate your strategic business plan
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {generatedData && (
            <Button
              size="sm"
              className="h-8 px-3 text-xs bg-green-600 hover:bg-green-700 text-white"
              onClick={handleSaveGeneratedContent}
            >
              <Save className="h-3 w-3 mr-1" />
              Save
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
        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Column - Mission & Vision */}
            <div className="lg:col-span-4">
              <Card className="overflow-hidden border-gray-200 h-full">
                <BattlePlanDetails 
                  missionStatement={battlePlanData?.missionstatement || ""}
                  visionStatement={battlePlanData?.visionstatement || ""}
                  onUpdate={fetchBattlePlanData} 
                  planId={battlePlanData?.id}
                  generatedData={generatedData}
                  onGeneratedDataChange={setGeneratedData}
                />
              </Card>
            </div>

            {/* Right Column - Strategic Elements */}
            <div className="lg:col-span-8">
              <StrategicElements 
                coreValues={battlePlanData?.corevalues || []}
                strategicAnchors={battlePlanData?.strategicanchors || []}
                purposeWhy={battlePlanData?.purposewhy || []}
                threeYearTarget={battlePlanData?.threeyeartarget || []}
                onUpdate={fetchBattlePlanData} 
                planId={battlePlanData?.id}
                generatedData={generatedData}
                onGeneratedDataChange={setGeneratedData}
              />
            </div>
          </div>

          {/* Business Plan Document Editor */}
          <Card className="overflow-hidden border-gray-200">
            <div className="px-6 py-4 bg-white border-b border-gray-200">
              <div className="mb-2">
                <h2 className="text-lg font-semibold text-gray-900">Business Plan Document</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Create and edit your comprehensive business plan with rich text formatting, AI assistance, and real-time collaboration
                </p>
              </div>
              {savingContent && (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </div>
              )}
            </div>
            <div className="bg-white">
              <ReusableTiptapEditor
                content={battlePlanData?.business_plan_content || ""}
                onChange={() => {}} // We handle changes through onSave
                onSave={handleSaveBusinessPlanContent}
                placeholder="Start writing your business plan... Type '/' for commands"
                showToolbar={true}
                showBubbleMenu={true}
                showSlashCommands={true}
                showStatusBar={true}
                editorHeight="600px"
                autoSave={true}
                autoSaveDelay={2000}
                className="border-0"
                editorClassName="prose prose-lg prose-slate max-w-none focus:outline-none min-h-[600px] px-6 py-8"
              />
            </div>
          </Card>
        </div>
      )}
    </div>
  );
} 