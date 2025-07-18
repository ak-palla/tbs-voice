"use client";

import { useState, useEffect } from "react";
import { Pencil, Save, X, Plus, Trash2, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type NorthStarMetric = {
  metric: string;
  actual: string;
  target: string;
  gap: string;
};

type KeyInitiative = {
  initiative: string;
  dueDate: string;
  status: string;
  owner: string;
  stakeholders: string;
  team: string;
  pillar: string;
};

type BottomSectionProps = {
  northStarMetrics: NorthStarMetric[];
  keyInitiatives: KeyInitiative[];
  onUpdate: () => void;
  canvasId?: string;
};

export default function BottomSection({
  northStarMetrics,
  keyInitiatives,
  onUpdate,
  canvasId,
}: BottomSectionProps) {
  const [editingMetrics, setEditingMetrics] = useState(false);
  const [editingInitiatives, setEditingInitiatives] = useState(false);
  const [savingMetrics, setSavingMetrics] = useState(false);
  const [savingInitiatives, setSavingInitiatives] = useState(false);
  const [localNorthStarMetrics, setLocalNorthStarMetrics] = useState<NorthStarMetric[]>(northStarMetrics);
  const [localKeyInitiatives, setLocalKeyInitiatives] = useState<KeyInitiative[]>(keyInitiatives);
  
  const supabase = createClient();

  // Initialize with empty field when entering edit mode
  useEffect(() => {
    if (editingMetrics && localNorthStarMetrics.length === 0) {
      handleAddMetric();
    }
  }, [editingMetrics, localNorthStarMetrics.length]);

  useEffect(() => {
    if (editingInitiatives && localKeyInitiatives.length === 0) {
      handleAddInitiative();
    }
  }, [editingInitiatives, localKeyInitiatives.length]);

  // ===== North Star Metrics Functions =====
  // Handle adding new metric
  const handleAddMetric = () => {
    setLocalNorthStarMetrics([...localNorthStarMetrics, { metric: "", actual: "", target: "", gap: "" }]);
  };

  // Handle removing metric
  const handleRemoveMetric = (index: number) => {
    const newMetrics = [...localNorthStarMetrics];
    newMetrics.splice(index, 1);
    setLocalNorthStarMetrics(newMetrics);
  };

  // Calculate gap automatically
  const calculateGap = (actual: string, target: string) => {
    const actualNum = parseFloat(actual);
    const targetNum = parseFloat(target);
    
    if (isNaN(actualNum) || isNaN(targetNum)) return "";
    
    return (targetNum - actualNum).toString();
  };

  const handleEditMetrics = () => {
    setLocalNorthStarMetrics(northStarMetrics);
    setEditingMetrics(true);
  };

  const handleCancelMetrics = () => {
    setEditingMetrics(false);
  };

  const handleSaveMetrics = async () => {
    if (!canvasId) return;
    
    try {
      setSavingMetrics(true);
      
      const { error } = await supabase
        .from("quarterly_sprint_canvas")
        .update({
          northstarmetrics: localNorthStarMetrics
        })
        .eq("id", canvasId);
        
      if (error) throw error;
      
      onUpdate();
      setEditingMetrics(false);
    } catch (error) {
      console.error("Error saving metrics:", error);
    } finally {
      setSavingMetrics(false);
    }
  };

  // ===== Key Initiatives Functions =====
  // Handle adding new initiative
  const handleAddInitiative = () => {
    setLocalKeyInitiatives([...localKeyInitiatives, { 
      initiative: "", 
      dueDate: "", 
      status: "", 
      owner: "", 
      stakeholders: "", 
      team: "", 
      pillar: "" 
    }]);
  };

  // Handle removing initiative
  const handleRemoveInitiative = (index: number) => {
    const newInitiatives = [...localKeyInitiatives];
    newInitiatives.splice(index, 1);
    setLocalKeyInitiatives(newInitiatives);
  };

  const handleEditInitiatives = () => {
    setLocalKeyInitiatives(keyInitiatives);
    setEditingInitiatives(true);
  };

  const handleCancelInitiatives = () => {
    setEditingInitiatives(false);
  };

  const handleSaveInitiatives = async () => {
    if (!canvasId) return;
    
    try {
      setSavingInitiatives(true);
      
      const { error } = await supabase
        .from("quarterly_sprint_canvas")
        .update({
          keyinitiatives: localKeyInitiatives
        })
        .eq("id", canvasId);
        
      if (error) throw error;
      
      onUpdate();
      setEditingInitiatives(false);
    } catch (error) {
      console.error("Error saving initiatives:", error);
    } finally {
      setSavingInitiatives(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* North Star Metrics */}
      <Card className="overflow-hidden border-gray-200">
        <div className="px-4 py-2 bg-gray-100 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-sm font-semibold text-gray-900">NORTH STAR METRICS</h3>
          {!editingMetrics ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEditMetrics}
              className="text-gray-600 hover:text-gray-800"
            >
              <Pencil className="h-4 w-4 mr-1" /> Edit
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={handleCancelMetrics}>
                <X className="h-4 w-4 mr-1" /> Cancel
              </Button>
              <Button 
                size="sm" 
                onClick={handleSaveMetrics}
                disabled={savingMetrics}
                className="bg-gray-600 hover:bg-gray-700 text-white"
              >
                {savingMetrics ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
                Save
              </Button>
            </div>
          )}
        </div>
        <div className="p-4">
          {(editingMetrics ? localNorthStarMetrics : northStarMetrics).length > 0 ? (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle px-4 sm:px-0">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="text-xs font-medium text-gray-700 border-b border-gray-200">
                      <th className="text-left py-2 px-3">Metric</th>
                      <th className="text-left py-2 px-3">Actual</th>
                      <th className="text-left py-2 px-3">Target</th>
                      <th className="text-left py-2 px-3">Gap</th>
                      {editingMetrics && <th className="py-2 px-3 w-10"></th>}
                    </tr>
                  </thead>
                  <tbody>
                    {(editingMetrics ? localNorthStarMetrics : northStarMetrics).map((metric, index) => (
                      <tr key={index} className="border-b border-gray-100 text-sm text-gray-900">
                        {editingMetrics ? (
                          <>
                            <td className="py-2 px-3">
                              <Input
                                value={localNorthStarMetrics[index].metric}
                                onChange={(e) => {
                                  const newMetrics = [...localNorthStarMetrics];
                                  newMetrics[index].metric = e.target.value;
                                  setLocalNorthStarMetrics(newMetrics);
                                }}
                                placeholder="Metric name"
                                className="h-8 text-sm w-full"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <Input
                                value={localNorthStarMetrics[index].actual}
                                onChange={(e) => {
                                  const newMetrics = [...localNorthStarMetrics];
                                  newMetrics[index].actual = e.target.value;
                                  newMetrics[index].gap = calculateGap(e.target.value, newMetrics[index].target);
                                  setLocalNorthStarMetrics(newMetrics);
                                }}
                                placeholder="Current value"
                                className="h-8 text-sm w-full"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <Input
                                value={localNorthStarMetrics[index].target}
                                onChange={(e) => {
                                  const newMetrics = [...localNorthStarMetrics];
                                  newMetrics[index].target = e.target.value;
                                  newMetrics[index].gap = calculateGap(newMetrics[index].actual, e.target.value);
                                  setLocalNorthStarMetrics(newMetrics);
                                }}
                                placeholder="Target value"
                                className="h-8 text-sm w-full"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <Input
                                value={localNorthStarMetrics[index].gap}
                                readOnly
                                placeholder="Calculated gap"
                                className="h-8 text-sm w-full bg-gray-50"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveMetric(index)}
                                className="h-8 w-8 p-0 text-red-500"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="py-2 px-3 bg-gray-50 border border-gray-100 rounded-l-md">{metric.metric || "—"}</td>
                            <td className="py-2 px-3 bg-gray-50 border-y border-gray-100">{metric.actual || "0"}</td>
                            <td className="py-2 px-3 bg-gray-50 border-y border-gray-100">{metric.target || "0"}</td>
                            <td className="py-2 px-3 bg-gray-50 border border-gray-100 rounded-r-md">{metric.gap || "0"}</td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {editingMetrics && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddMetric}
                    className="w-full mt-4 h-7 text-xs"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Metric
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="text-sm text-gray-500 italic border rounded-md border-gray-200 p-3 bg-gray-50 mb-2">
                No metrics added yet
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Key Initiatives */}
      <Card className="overflow-hidden border-gray-200">
        <div className="px-4 py-2 bg-gray-100 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-sm font-semibold text-gray-900">KEY INITIATIVES</h3>
          {!editingInitiatives ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEditInitiatives}
              className="text-gray-600 hover:text-gray-800"
            >
              <Pencil className="h-4 w-4 mr-1" /> Edit
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={handleCancelInitiatives}>
                <X className="h-4 w-4 mr-1" /> Cancel
              </Button>
              <Button 
                size="sm" 
                onClick={handleSaveInitiatives}
                disabled={savingInitiatives}
                className="bg-gray-600 hover:bg-gray-700 text-white"
              >
                {savingInitiatives ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
                Save
              </Button>
            </div>
          )}
        </div>
        <div className="p-4">
          {(editingInitiatives ? localKeyInitiatives : keyInitiatives).length > 0 ? (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle px-4 sm:px-0">
                <table className="min-w-full divide-y divide-gray-200 table-fixed md:table-auto">
                  <thead>
                    <tr className="text-xs font-medium text-gray-700 border-b border-gray-200">
                      <th className="text-left py-2 px-3">Initiative</th>
                      <th className="text-left py-2 px-3">Due Date</th>
                      <th className="text-left py-2 px-3">Status</th>
                      <th className="text-left py-2 px-3">Owner</th>
                      <th className="text-left py-2 px-3">Stakeholders</th>
                      <th className="text-left py-2 px-3">Team</th>
                      <th className="text-left py-2 px-3">Pillar</th>
                      {editingInitiatives && <th className="py-2 px-3 w-10"></th>}
                    </tr>
                  </thead>
                  <tbody>
                    {(editingInitiatives ? localKeyInitiatives : keyInitiatives).map((initiative, index) => (
                      <tr key={index} className="border-b border-gray-100 text-sm text-gray-900">
                        {editingInitiatives ? (
                          <>
                            <td className="py-2 px-3">
                              <Input
                                value={localKeyInitiatives[index].initiative}
                                onChange={(e) => {
                                  const newInitiatives = [...localKeyInitiatives];
                                  newInitiatives[index].initiative = e.target.value;
                                  setLocalKeyInitiatives(newInitiatives);
                                }}
                                placeholder="Initiative name"
                                className="h-8 text-sm w-full"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <Input
                                type="date"
                                value={localKeyInitiatives[index].dueDate}
                                onChange={(e) => {
                                  const newInitiatives = [...localKeyInitiatives];
                                  newInitiatives[index].dueDate = e.target.value;
                                  setLocalKeyInitiatives(newInitiatives);
                                }}
                                className="h-8 text-sm w-full"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <Select
                                value={localKeyInitiatives[index].status || ""}
                                onValueChange={(value) => {
                                  const newInitiatives = [...localKeyInitiatives];
                                  newInitiatives[index].status = value;
                                  setLocalKeyInitiatives(newInitiatives);
                                }}
                              >
                                <SelectTrigger className="h-8 text-sm w-full">
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Not Started">
                                    <div className="flex items-center">
                                      <div className="w-2 h-2 rounded-full bg-gray-400 mr-2"></div>
                                      Not Started
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="On-Track">
                                    <div className="flex items-center">
                                      <div className="w-2 h-2 rounded-full bg-lime-500 mr-2"></div>
                                      On-Track
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="Behind">
                                    <div className="flex items-center">
                                      <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></div>
                                      Behind
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="At Risk">
                                    <div className="flex items-center">
                                      <div className="w-2 h-2 rounded-full bg-orange-500 mr-2"></div>
                                      At Risk
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="Reprioritized">
                                    <div className="flex items-center">
                                      <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                                      Reprioritized
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="Accomplished">
                                    <div className="flex items-center">
                                      <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                                      Accomplished
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="Failed">
                                    <div className="flex items-center">
                                      <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
                                      Failed
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="py-2 px-3">
                              <Input
                                value={localKeyInitiatives[index].owner}
                                onChange={(e) => {
                                  const newInitiatives = [...localKeyInitiatives];
                                  newInitiatives[index].owner = e.target.value;
                                  setLocalKeyInitiatives(newInitiatives);
                                }}
                                placeholder="Owner name"
                                className="h-8 text-sm w-full"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <Input
                                value={localKeyInitiatives[index].stakeholders}
                                onChange={(e) => {
                                  const newInitiatives = [...localKeyInitiatives];
                                  newInitiatives[index].stakeholders = e.target.value;
                                  setLocalKeyInitiatives(newInitiatives);
                                }}
                                placeholder="Stakeholders"
                                className="h-8 text-sm w-full"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <Input
                                value={localKeyInitiatives[index].team}
                                onChange={(e) => {
                                  const newInitiatives = [...localKeyInitiatives];
                                  newInitiatives[index].team = e.target.value;
                                  setLocalKeyInitiatives(newInitiatives);
                                }}
                                placeholder="Team name"
                                className="h-8 text-sm w-full"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <Input
                                value={localKeyInitiatives[index].pillar}
                                onChange={(e) => {
                                  const newInitiatives = [...localKeyInitiatives];
                                  newInitiatives[index].pillar = e.target.value;
                                  setLocalKeyInitiatives(newInitiatives);
                                }}
                                placeholder="Strategic pillar"
                                className="h-8 text-sm w-full"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveInitiative(index)}
                                className="h-8 w-8 p-0 text-red-500"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="py-2 px-3 bg-gray-50 border border-gray-100 rounded-l-md">{initiative.initiative || "—"}</td>
                            <td className="py-2 px-3 bg-gray-50 border-y border-gray-100">{initiative.dueDate || "—"}</td>
                            <td className="py-2 px-3 bg-gray-50 border-y border-gray-100">
                              {initiative.status ? (
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  initiative.status === "Accomplished" ? "bg-green-100 text-green-800" :
                                  initiative.status === "On-Track" ? "bg-lime-100 text-lime-800" :
                                  initiative.status === "Behind" ? "bg-yellow-100 text-yellow-800" :
                                  initiative.status === "At Risk" ? "bg-orange-100 text-orange-800" :
                                  initiative.status === "Reprioritized" ? "bg-blue-100 text-blue-800" :
                                  initiative.status === "Failed" ? "bg-red-100 text-red-800" :
                                  "bg-gray-100 text-gray-800"
                                }`}>
                                  {initiative.status}
                                </span>
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </td>
                            <td className="py-2 px-3 bg-gray-50 border-y border-gray-100">{initiative.owner || "—"}</td>
                            <td className="py-2 px-3 bg-gray-50 border-y border-gray-100">{initiative.stakeholders || "—"}</td>
                            <td className="py-2 px-3 bg-gray-50 border-y border-gray-100">{initiative.team || "—"}</td>
                            <td className="py-2 px-3 bg-gray-50 border border-gray-100 rounded-r-md">{initiative.pillar || "—"}</td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {editingInitiatives && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddInitiative}
                    className="w-full mt-4 h-7 text-xs"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Initiative
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="text-sm text-gray-500 italic border rounded-md border-gray-200 p-3 bg-gray-50 mb-2">
                No initiatives added yet
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
} 