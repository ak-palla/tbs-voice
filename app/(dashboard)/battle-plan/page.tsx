<<<<<<< HEAD
"use client";

import { useState, useEffect } from "react";
import { Loader2, Link as LinkIcon, ExternalLink } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { getTeamId } from "@/utils/supabase/teams";
import { Card } from "@/components/ui/card";
import { ExpandableInput } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import BattlePlanDetails from "./components/battle-plan-details";
import StrategicElements from "./components/strategic-elements";

type BattlePlanData = {
  id: string;
  user_id: string;
  businessplanlink: string;
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
  const [businessLink, setBusinessLink] = useState("");
  const [editingLink, setEditingLink] = useState(false);
  const [savingLink, setSavingLink] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    fetchBattlePlanData();
  }, []);

  useEffect(() => {
    if (battlePlanData) {
      setBusinessLink(battlePlanData.businessplanlink || "");
    }
  }, [battlePlanData]);

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

  const handleSaveLink = async () => {
    if (!battlePlanData?.id) return;
    
    try {
      setSavingLink(true);
      
      const { error } = await supabase
        .from("battle_plan")
        .update({
          businessplanlink: businessLink
        })
        .eq("id", battlePlanData.id);
        
      if (error) throw error;
      
      fetchBattlePlanData();
      setEditingLink(false);
    } catch (error) {
      console.error("Error saving business plan link:", error);
    } finally {
      setSavingLink(false);
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto">
      <div className="mb-5">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Battle Plan</h1>
        <p className="text-sm text-gray-500 mt-1">
          Define and manage your business strategy and vision
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
        </div>
      ) : (
        <div className="space-y-5">
          {/* Business Plan Link */}
          <Card className="overflow-hidden border-gray-200">
            <div className="px-4 py-2 bg-white border-b border-gray-200">
              <div className="flex flex-wrap md:flex-nowrap items-center gap-3">
                <div className="flex items-center text-gray-700">
                  <LinkIcon className="h-4 w-4 text-gray-600 mr-2" />
                  <span className="text-sm font-medium">Business Plan Link:</span>
                </div>
                
                {editingLink ? (
                  <div className="flex flex-1 items-center gap-2">
                    <ExpandableInput
                      value={businessLink}
                      onChange={(e) => setBusinessLink(e.target.value)}
                      placeholder="https://example.com/my-business-plan"
                      className="flex-1 text-sm"
                      expandAfter={40}
                      lined={true}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs whitespace-nowrap"
                      onClick={() => setEditingLink(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap"
                      onClick={handleSaveLink}
                      disabled={savingLink}
                    >
                      {savingLink ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                      Save
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 min-w-0">
                      {businessLink ? (
                        <a 
                          href={businessLink} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 hover:underline truncate max-w-full"
                        >
                          <span className="truncate">{businessLink}</span>
                          <ExternalLink className="h-3 w-3 ml-1 flex-shrink-0" />
                        </a>
                      ) : (
                        <span className="text-sm text-gray-400 italic">No business plan link provided</span>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 text-xs ml-auto"
                      onClick={() => setEditingLink(true)}
                    >
                      Edit Link
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Column - Mission & Vision */}
            <div className="lg:col-span-4">
              <Card className="overflow-hidden border-gray-200 h-full">
                <BattlePlanDetails 
                  missionStatement={battlePlanData?.missionstatement || ""}
                  visionStatement={battlePlanData?.visionstatement || ""}
                  onUpdate={fetchBattlePlanData} 
                  planId={battlePlanData?.id}
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
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
=======
import { Metadata } from 'next';
import SopClient from './sop.client';

export const metadata: Metadata = {
  title: 'Battle Plan | TBS Dashboard',
  description: 'View and manage your company\'s Battle Plan',
};

export default function SopPage() {
  return <SopClient />;
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
} 