"use client";

import { useState } from "react";
import { Pencil, Save, X, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { ExpandableInput } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

type MiddleSectionProps = {
  theme: string;
  strategicPillars: string[];
  onUpdate: () => void;
  canvasId?: string;
};

export default function MiddleSection({
  theme,
  strategicPillars,
  onUpdate,
  canvasId,
}: MiddleSectionProps) {
  const [editingTheme, setEditingTheme] = useState(false);
  const [editingPillars, setEditingPillars] = useState(false);
  const [savingTheme, setSavingTheme] = useState(false);
  const [savingPillars, setSavingPillars] = useState(false);
  const [localTheme, setLocalTheme] = useState(theme);
  const [localStrategicPillars, setLocalStrategicPillars] = useState<string[]>(strategicPillars);
  
  const supabase = createClient();

  // Theme Functions
  const handleEditTheme = () => {
    setLocalTheme(theme);
    setEditingTheme(true);
  };

  const handleCancelTheme = () => {
    setEditingTheme(false);
  };

  const handleSaveTheme = async () => {
    if (!canvasId) return;
    
    try {
      setSavingTheme(true);
      
      const { error } = await supabase
        .from("quarterly_sprint_canvas")
        .update({
          theme: localTheme
        })
        .eq("id", canvasId);
        
      if (error) throw error;
      
      onUpdate();
      setEditingTheme(false);
    } catch (error) {
      console.error("Error saving theme:", error);
    } finally {
      setSavingTheme(false);
    }
  };

  // Strategic Pillars Functions
  const handleEditPillars = () => {
    setLocalStrategicPillars(strategicPillars);
    setEditingPillars(true);
  };

  const handleCancelPillars = () => {
    setEditingPillars(false);
  };

  const handleSavePillars = async () => {
    if (!canvasId) return;
    
    try {
      setSavingPillars(true);
      
      const { error } = await supabase
        .from("quarterly_sprint_canvas")
        .update({
          strategicpillars: localStrategicPillars
        })
        .eq("id", canvasId);
        
      if (error) throw error;
      
      onUpdate();
      setEditingPillars(false);
    } catch (error) {
      console.error("Error saving strategic pillars:", error);
    } finally {
      setSavingPillars(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Theme/Rallying Cry */}
      <Card className="overflow-hidden border-gray-200">
        <div className="px-4 py-2 bg-purple-100 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-sm font-semibold text-purple-900">THEME/RALLYING CRY</h3>
          {!editingTheme ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEditTheme}
              className="text-purple-600 hover:text-purple-800"
            >
              <Pencil className="h-4 w-4 mr-1" /> Edit
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={handleCancelTheme}>
                <X className="h-4 w-4 mr-1" /> Cancel
              </Button>
              <Button 
                size="sm" 
                onClick={handleSaveTheme}
                disabled={savingTheme}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {savingTheme ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
                Save
              </Button>
            </div>
          )}
        </div>
        <div className="p-4">
          {editingTheme ? (
            <Textarea
              value={localTheme}
              onChange={(e) => setLocalTheme(e.target.value)}
              placeholder="Enter your quarterly theme or rallying cry"
              className="resize-none min-h-[100px] text-sm"
            />
          ) : (
            <div className="text-sm text-gray-900 p-3 border rounded-md border-gray-200 bg-gray-50 min-h-[100px]">
              {theme || "No theme defined yet"}
            </div>
          )}
        </div>
      </Card>

      {/* Strategic Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {localStrategicPillars.map((pillar, index) => (
          <Card 
            key={index} 
            className="overflow-hidden border-gray-200"
          >
            <div className="px-4 py-2 bg-amber-100 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-sm font-semibold text-amber-900">STRATEGIC PILLAR #{index + 1}</h3>
              {!editingPillars ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEditPillars}
                  className="text-amber-600 hover:text-amber-800"
                >
                  <Pencil className="h-4 w-4 mr-1" /> Edit
                </Button>
              ) : (
                index === 0 && (
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={handleCancelPillars}>
                      <X className="h-4 w-4 mr-1" /> Cancel
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={handleSavePillars}
                      disabled={savingPillars}
                      className="bg-amber-600 hover:bg-amber-700 text-white"
                    >
                      {savingPillars ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
                      Save
                    </Button>
                  </div>
                )
              )}
            </div>
            <div className="p-4">
              {editingPillars ? (
                <ExpandableInput
                  value={localStrategicPillars[index]}
                  onChange={(e) => {
                    const newPillars = [...localStrategicPillars];
                    newPillars[index] = e.target.value;
                    setLocalStrategicPillars(newPillars);
                  }}
                  placeholder="Enter strategic pillar"
                  className="h-8 text-sm"
                />
              ) : (
                <div className="text-sm text-gray-900 p-3 border rounded-md border-gray-200 bg-gray-50 min-h-[60px]">
                  {strategicPillars[index] || "—"}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
} 