"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { getTeamId } from "@/utils/supabase/teams";
import { Card } from "@/components/ui/card";
import PlanTable from "./components/plan-table";

type HwgtPlanData = {
  id: string;
  user_id: string;
  howwegetthereplan: {
    customerAcquisition: {
      Q0: string;
      Q4: string;
      Q8: string;
      Q12: string;
    };
    fulfillmentProduction: {
      Q0: string;
      Q4: string;
      Q8: string;
      Q12: string;
    };
    productsServices: {
      Q0: string;
      Q4: string;
      Q8: string;
      Q12: string;
    };
    teamOrganisation: {
      Q0: string;
      Q4: string;
      Q8: string;
      Q12: string;
    };
    customerAvatars: {
      Q0: string;
      Q4: string;
      Q8: string;
      Q12: string;
    };
    modelBrand: {
      Q0: string;
      Q4: string;
      Q8: string;
      Q12: string;
    };
  };
  created_at: string;
  updated_at: string;
};

export default function HwgtPlanPage() {
  const [planData, setPlanData] = useState<HwgtPlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchPlanData();
  }, []);

  const fetchPlanData = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("No authenticated user");

      const teamId = await getTeamId(supabase, user.id);
      
      const { data, error } = await supabase
        .from("hwgt_plan")
        .select("*")
        .eq("user_id", teamId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      if (data) {
        setPlanData(data);
      } else {
        // Create a new entry if none exists
        const emptySection = {
          Q0: "",
          Q4: "",
          Q8: "",
          Q12: ""
        };
        
        const newPlan = {
          user_id: teamId,
          howwegetthereplan: {
            customerAcquisition: {...emptySection},
            fulfillmentProduction: {...emptySection},
            productsServices: {...emptySection},
            teamOrganisation: {...emptySection},
            customerAvatars: {...emptySection},
            modelBrand: {...emptySection}
          }
        };
        
        const { data: newData, error: insertError } = await supabase
          .from("hwgt_plan")
          .insert(newPlan)
          .select("*")
          .single();
          
        if (insertError) throw insertError;
        setPlanData(newData);
      }
    } catch (error) {
      console.error("Error fetching HWGT plan data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto">
      <div className="mb-4">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">How We Get There Plan</h1>
        <p className="text-sm text-gray-500 mt-1">
          Define your quarter by quarter plan to achieve your business goals
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
        </div>
      ) : (
        <div className="space-y-5">
          <Card className="overflow-hidden border-gray-200">
            <PlanTable 
              data={planData?.howwegetthereplan || {}} 
              onUpdate={fetchPlanData} 
              planId={planData?.id || ""}
            />
          </Card>
        </div>
      )}
    </div>
  );
} 