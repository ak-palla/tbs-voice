"use client";

import { useState } from "react";
import { Loader2, Edit3, CheckCircle2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SectionData = {
  Q0: string;
  Q4: string;
  Q8: string;
  Q12: string;
};

type HwgtData = {
  customerAcquisition?: SectionData;
  fulfillmentProduction?: SectionData;
  productsServices?: SectionData;
  teamOrganisation?: SectionData;
  customerAvatars?: SectionData;
  modelBrand?: SectionData;
};

interface PlanTableProps {
  data: HwgtData;
  planId: string;
  onUpdate: () => Promise<void>;
}

export default function PlanTable({ data, planId, onUpdate }: PlanTableProps) {
  const [editing, setEditing] = useState<{ section: string; quarter: string } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedCell, setSavedCell] = useState<{ section: string; quarter: string } | null>(null);
  const supabase = createClient();

  const sections = [
    { key: "customerAcquisition", label: "Customer Acquisition", color: "text-blue-600", bgColor: "bg-blue-50" },
<<<<<<< HEAD
    { key: "fulfillmentProduction", label: "Fulfillment/Production", color: "text-purple-600", bgColor: "bg-purple-50" },
=======
    { key: "fulfillmentProduction", label: "Fulfilment/Production", color: "text-purple-600", bgColor: "bg-purple-50" },
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
    { key: "productsServices", label: "Products/Services", color: "text-emerald-600", bgColor: "bg-emerald-50" },
    { key: "teamOrganisation", label: "Team/Organisation", color: "text-amber-600", bgColor: "bg-amber-50" },
    { key: "customerAvatars", label: "Customer Avatar(s)", color: "text-rose-600", bgColor: "bg-rose-50" },
    { key: "modelBrand", label: "Model/Brand", color: "text-indigo-600", bgColor: "bg-indigo-50" }
  ];

  const quarters = [
    { key: "Q0", label: "Current", description: "Today", color: "bg-blue-50" },
    { key: "Q4", label: "Q4", description: "5 months", color: "bg-indigo-50" },
    { key: "Q8", label: "Q8", description: "17 months", color: "bg-violet-50" },
    { key: "Q12", label: "Q12", description: "29 months", color: "bg-purple-50" }
  ];

  const handleEdit = (section: string, quarter: string) => {
    const currentValue = data[section as keyof HwgtData]?.[quarter as keyof SectionData] || "";
    setEditValue(currentValue);
    setEditing({ section, quarter });
  };

  const handleCancel = () => {
    setEditing(null);
  };

  const handleSave = async () => {
    if (!editing || !planId) return;
    
    try {
      setSaving(true);
      
      // Create a deep copy of the data
      const updatedData = JSON.parse(JSON.stringify(data));
      
      // Update the specific value
      const { section, quarter } = editing;
      if (!updatedData[section]) {
        updatedData[section] = { Q0: "", Q4: "", Q8: "", Q12: "" };
      }
      updatedData[section][quarter] = editValue;
      
      const { error } = await supabase
        .from("hwgt_plan")
        .update({
          howwegetthereplan: updatedData
        })
        .eq("id", planId);
        
      if (error) throw error;
      
      // Refresh data
      await onUpdate();
      const savedCellData = { section, quarter };
      setSavedCell(savedCellData);
      
      // Clear saved cell indicator after 2 seconds
      setTimeout(() => {
        setSavedCell(null);
      }, 2000);
      
      setEditing(null);
    } catch (error) {
      console.error("Error updating plan data:", error);
    } finally {
      setSaving(false);
    }
  };

  const getCompletionStatus = () => {
    if (!data) return 0;
    
    let totalCells = 0;
    let filledCells = 0;
    
    sections.forEach(section => {
      quarters.forEach(quarter => {
        totalCells++;
        if (data[section.key as keyof HwgtData]?.[quarter.key as keyof SectionData]) {
          filledCells++;
        }
      });
    });
    
    return Math.round((filledCells / totalCells) * 100);
  };
  
  const completionPercentage = getCompletionStatus();
  
  return (
    <>
      <CardHeader className="bg-gradient-to-r from-gray-50 via-white to-gray-50 border-b border-gray-200 pb-6 pt-6">
        <div className="flex flex-col items-center  mx-auto text-center">
          <p className="text-lg text-gray-600  italic">
            "What isn't true about our company today that would need to be true to achieve our future growth targets?"
          </p>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border-r border-gray-200 bg-gray-50 p-4 text-left text-xs font-semibold uppercase tracking-wider rounded-tl-md">
                  <span className="text-gray-600">Business Areas</span>
                </th>
                {quarters.map((quarter, idx) => (
                  <th 
                    key={quarter.key} 
                    className={cn(
                      "border-r border-gray-200 p-3 text-center w-1/4",
                      quarter.color,
                      idx === quarters.length - 1 ? "rounded-tr-md" : ""
                    )}
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-sm font-semibold text-gray-800">{quarter.label}</span>
                      {/* <span className="text-xs text-gray-500">{quarter.description}</span> */}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sections.map((section, sectionIdx) => (
                <tr key={section.key} className="group hover:bg-gray-100 transition-colors">
                  <td className={cn(
                    "border-r border-gray-200 p-4 align-top",
                    sectionIdx === sections.length - 1 ? "rounded-bl-md" : ""
                  )}>
                    <div className={cn("font-medium text-sm flex items-center", section.color)}>
                      <div className={cn("w-2 h-2 rounded-full mr-2", section.bgColor)}></div>
                      {section.label}
                    </div>
                  </td>
                  {quarters.map((quarter, quarterIdx) => {
                    const isLastColumn = quarterIdx === quarters.length - 1;
                    const isLastRow = sectionIdx === sections.length - 1;
                    const hasContent = !!data[section.key as keyof HwgtData]?.[quarter.key as keyof SectionData];
                    const isSaved = savedCell?.section === section.key && savedCell?.quarter === quarter.key;
                    
                    return (
                      <td 
                        key={`${section.key}-${quarter.key}`} 
                        className={cn(
                          "border-r border-gray-200 p-0 relative",
                          isLastColumn && isLastRow ? "rounded-br-md" : "",
                          isLastColumn ? "border-r-0" : ""
                        )}
                      >
                        {editing && editing.section === section.key && editing.quarter === quarter.key ? (
                          <div className={cn(
                            "p-3 shadow-inner", 
                            quarter.color
                          )}>
                            <Textarea
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="min-h-[120px] text-sm w-full resize-none border-gray-200 focus:border-blue-300 bg-white"
                              placeholder="Enter your plan for this quarter..."
                            />
                            <div className="flex justify-end space-x-2 mt-3">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 text-xs"
                                onClick={handleCancel}
                              >
                                Cancel
                              </Button>
                              <Button 
                                size="sm" 
                                className="h-8 text-xs bg-blue-600 hover:bg-blue-700"
                                onClick={handleSave}
                                disabled={saving}
                              >
                                {saving && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                                Save
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div 
                            className={cn(
                              "p-4 h-full min-h-[130px] cursor-pointer text-sm relative transition-all group",
                              hasContent ? "text-gray-700" : "text-gray-400 italic",
                              hasContent && "hover:bg-gray-50/80"
                            )}
                            onClick={() => handleEdit(section.key, quarter.key)}
                          >
                            {isSaved && (
                              <div className="absolute inset-0 bg-green-50 bg-opacity-50 flex items-center justify-center z-10 animate-fadeOut">
                                <div className="bg-white rounded-full p-2 shadow-md">
                                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                                </div>
                              </div>
                            )}
                            
                            {data[section.key as keyof HwgtData]?.[quarter.key as keyof SectionData] || (
                              <div className="flex flex-col items-center justify-center h-full">
                                <div className={cn(
                                  "rounded-full p-1.5 mb-1",
                                  section.bgColor
                                )}>
                                  <Edit3 className={cn("h-3.5 w-3.5", section.color)} />
                                </div>
                                <span>Click to add</span>
                              </div>
                            )}
                            {hasContent && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-sm border border-gray-200 hover:bg-blue-50"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(section.key, quarter.key);
                                }}
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between items-center border-t border-gray-200 py-3 px-4 bg-gray-50">
        <div className="text-sm text-gray-500">
          <span className="font-medium">{completionPercentage}%</span> complete
        </div>
        <div className="flex space-x-1">
          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 rounded-full" 
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
        </div>
      </CardFooter>
      
      {saving && !editing && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-md shadow-md flex items-center">
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Saving changes...
        </div>
      )}
    </>
  );
} 