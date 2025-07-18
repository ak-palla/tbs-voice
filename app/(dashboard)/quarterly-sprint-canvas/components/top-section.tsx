"use client";

import { useState, useEffect } from "react";
import { Pencil, Save, X, Plus, Trash2, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { ExpandableInput } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";

type RevenueGoals = {
  good: string;
  better: string;
  best: string;
};

type UnitGoal = {
  name: string;
  units: string;
};

type RevenueByMonth = {
  month: string;
  amount: string;
};

type TopSectionProps = {
  revenueGoals: RevenueGoals;
  unitGoals: UnitGoal[];
  revenueByMonth: RevenueByMonth[];
  onUpdate: () => void;
  canvasId?: string;
};

export default function TopSection({
  revenueGoals,
  unitGoals,
  revenueByMonth,
  onUpdate,
  canvasId,
}: TopSectionProps) {
  const [editingRevenue, setEditingRevenue] = useState(false);
  const [editingUnits, setEditingUnits] = useState(false);
  const [editingMonthly, setEditingMonthly] = useState(false);
  const [savingRevenue, setSavingRevenue] = useState(false);
  const [savingUnits, setSavingUnits] = useState(false);
  const [savingMonthly, setSavingMonthly] = useState(false);
  
  const [localRevenueGoals, setLocalRevenueGoals] = useState<RevenueGoals>(revenueGoals);
  const [localUnitGoals, setLocalUnitGoals] = useState<UnitGoal[]>(unitGoals);
  const [localRevenueByMonth, setLocalRevenueByMonth] = useState<RevenueByMonth[]>(revenueByMonth);
  
  const supabase = createClient();

  // Initialize with empty field when entering edit mode
  useEffect(() => {
    if (editingUnits && localUnitGoals.length === 0) {
      handleAddUnitGoal();
    }
  }, [editingUnits, localUnitGoals.length]);

  useEffect(() => {
    if (editingMonthly && localRevenueByMonth.length === 0) {
      handleAddRevenueByMonth();
    }
  }, [editingMonthly, localRevenueByMonth.length]);

  // === Revenue Goals Functions ===
  const handleEditRevenue = () => {
    setLocalRevenueGoals(revenueGoals);
    setEditingRevenue(true);
  };

  const handleCancelRevenue = () => {
    setEditingRevenue(false);
  };

  const handleSaveRevenue = async () => {
    if (!canvasId) return;
    
    try {
      setSavingRevenue(true);
      
      const { error } = await supabase
        .from("quarterly_sprint_canvas")
        .update({
          revenuegoals: localRevenueGoals
        })
        .eq("id", canvasId);
        
      if (error) throw error;
      
      onUpdate();
      setEditingRevenue(false);
    } catch (error) {
      console.error("Error saving revenue goals:", error);
    } finally {
      setSavingRevenue(false);
    }
  };

  // === Unit Goals Functions ===
  const handleAddUnitGoal = () => {
    setLocalUnitGoals([...localUnitGoals, { name: "", units: "" }]);
  };

  const handleRemoveUnitGoal = (index: number) => {
    const newUnitGoals = [...localUnitGoals];
    newUnitGoals.splice(index, 1);
    setLocalUnitGoals(newUnitGoals);
  };

  const handleEditUnits = () => {
    setLocalUnitGoals(unitGoals);
    setEditingUnits(true);
  };

  const handleCancelUnits = () => {
    setEditingUnits(false);
  };

  const handleSaveUnits = async () => {
    if (!canvasId) return;
    
    try {
      setSavingUnits(true);
      
      const { error } = await supabase
        .from("quarterly_sprint_canvas")
        .update({
          unitgoals: localUnitGoals
        })
        .eq("id", canvasId);
        
      if (error) throw error;
      
      onUpdate();
      setEditingUnits(false);
    } catch (error) {
      console.error("Error saving unit goals:", error);
    } finally {
      setSavingUnits(false);
    }
  };

  // === Revenue By Month Functions ===
  const handleAddRevenueByMonth = () => {
    setLocalRevenueByMonth([...localRevenueByMonth, { month: "", amount: "" }]);
  };

  const handleRemoveRevenueByMonth = (index: number) => {
    const newRevenueByMonth = [...localRevenueByMonth];
    newRevenueByMonth.splice(index, 1);
    setLocalRevenueByMonth(newRevenueByMonth);
  };

  const handleEditMonthly = () => {
    setLocalRevenueByMonth(revenueByMonth);
    setEditingMonthly(true);
  };

  const handleCancelMonthly = () => {
    setEditingMonthly(false);
  };

  const handleSaveMonthly = async () => {
    if (!canvasId) return;
    
    try {
      setSavingMonthly(true);
      
      const { error } = await supabase
        .from("quarterly_sprint_canvas")
        .update({
          revenuebymonth: localRevenueByMonth
        })
        .eq("id", canvasId);
        
      if (error) throw error;
      
      onUpdate();
      setEditingMonthly(false);
    } catch (error) {
      console.error("Error saving monthly revenue:", error);
    } finally {
      setSavingMonthly(false);
    }
  };

  return (
    <>
      {/* QX Revenue Goals */}
      <Card className="overflow-hidden border-gray-200">
        <div className="px-4 py-2 bg-blue-100 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-sm font-semibold text-blue-900">QX REVENUE GOALS</h3>
          {!editingRevenue ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEditRevenue}
              className="text-blue-600 hover:text-blue-800"
            >
              <Pencil className="h-4 w-4 mr-1" /> Edit
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={handleCancelRevenue}>
                <X className="h-4 w-4 mr-1" /> Cancel
              </Button>
              <Button 
                size="sm" 
                onClick={handleSaveRevenue}
                disabled={savingRevenue}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {savingRevenue ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
                Save
              </Button>
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="space-y-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Good</label>
              {editingRevenue ? (
                <ExpandableInput
                  value={localRevenueGoals.good}
                  onChange={(e) => setLocalRevenueGoals({ ...localRevenueGoals, good: e.target.value })}
                  placeholder="£0"
                  className="h-8 text-sm"
                  expandAfter={40}
                  lined={true}
                />
              ) : (
                <div className="text-sm text-gray-900 p-2 border rounded-md border-gray-200 bg-gray-50">
                  {revenueGoals.good || "£0"}
                </div>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Better</label>
              {editingRevenue ? (
                <ExpandableInput
                  value={localRevenueGoals.better}
                  onChange={(e) => setLocalRevenueGoals({ ...localRevenueGoals, better: e.target.value })}
                  placeholder="£0"
                  className="h-8 text-sm"
                  expandAfter={40}
                  lined={true}
                />
              ) : (
                <div className="text-sm text-gray-900 p-2 border rounded-md border-gray-200 bg-gray-50">
                  {revenueGoals.better || "£0"}
                </div>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Best</label>
              {editingRevenue ? (
                <ExpandableInput
                  value={localRevenueGoals.best}
                  onChange={(e) => setLocalRevenueGoals({ ...localRevenueGoals, best: e.target.value })}
                  placeholder="£0"
                  className="h-8 text-sm"
                  expandAfter={40}
                  lined={true}
                />
              ) : (
                <div className="text-sm text-gray-900 p-2 border rounded-md border-gray-200 bg-gray-50">
                  {revenueGoals.best || "£0"}
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Unit Goals */}
      <Card className="overflow-hidden border-gray-200">
        <div className="px-4 py-2 bg-blue-100 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-sm font-semibold text-blue-900">UNIT GOALS</h3>
          {!editingUnits ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEditUnits}
              className="text-blue-600 hover:text-blue-800"
            >
              <Pencil className="h-4 w-4 mr-1" /> Edit
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={handleCancelUnits}>
                <X className="h-4 w-4 mr-1" /> Cancel
              </Button>
              <Button 
                size="sm" 
                onClick={handleSaveUnits}
                disabled={savingUnits}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {savingUnits ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
                Save
              </Button>
            </div>
          )}
        </div>
        <div className="p-4">
          {(editingUnits ? localUnitGoals : unitGoals).length > 0 ? (
            <div className="space-y-2">
              <div className="grid grid-cols-8 gap-2 mb-1">
                <div className="text-xs font-medium text-gray-700 col-span-3">Product/Service</div>
                <div className="text-xs font-medium text-gray-700 col-span-4">Units</div>
                {editingUnits && <div className="col-span-1"></div>}
              </div>
              {(editingUnits ? localUnitGoals : unitGoals).map((goal, index) => (
                <div key={index} className="grid grid-cols-8 gap-2 items-center">
                  {editingUnits ? (
                    <>
                      <ExpandableInput
                        value={localUnitGoals[index].name}
                        onChange={(e) => {
                          const newGoals = [...localUnitGoals];
                          newGoals[index].name = e.target.value;
                          setLocalUnitGoals(newGoals);
                        }}
                        placeholder="Product/Service"
                        className="h-8 text-sm col-span-3"
                        expandAfter={40}
                        lined={true}
                      />
                      <ExpandableInput
                        value={localUnitGoals[index].units}
                        onChange={(e) => {
                          const newGoals = [...localUnitGoals];
                          newGoals[index].units = e.target.value;
                          setLocalUnitGoals(newGoals);
                        }}
                        placeholder="0"
                        className="h-8 text-sm col-span-4"
                        expandAfter={40}
                        lined={true}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveUnitGoal(index)}
                        className="h-8 w-8 p-0 text-red-500 col-span-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="text-sm text-gray-900 p-2 border rounded-md border-gray-200 bg-gray-50 col-span-4">
                        {goal.name || "—"}
                      </div>
                      <div className="text-sm text-gray-900 p-2 border rounded-md border-gray-200 bg-gray-50 col-span-4">
                        {goal.units || "0"}
                      </div>
                    </>
                  )}
                </div>
              ))}
              {editingUnits && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddUnitGoal}
                  className="w-full mt-2 h-7 text-xs"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Unit Goal
                </Button>
              )}
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="text-sm text-gray-500 italic border rounded-md border-gray-200 p-3 bg-gray-50 mb-2">
                No unit goals added yet
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Revenue By Month */}
      <Card className="overflow-hidden border-gray-200">
        <div className="px-4 py-2 bg-blue-100 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-sm font-semibold text-blue-900">REVENUE BY MONTH</h3>
          {!editingMonthly ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEditMonthly}
              className="text-blue-600 hover:text-blue-800"
            >
              <Pencil className="h-4 w-4 mr-1" /> Edit
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={handleCancelMonthly}>
                <X className="h-4 w-4 mr-1" /> Cancel
              </Button>
              <Button 
                size="sm" 
                onClick={handleSaveMonthly}
                disabled={savingMonthly}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {savingMonthly ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
                Save
              </Button>
            </div>
          )}
        </div>
        <div className="p-4">
          {(editingMonthly ? localRevenueByMonth : revenueByMonth).length > 0 ? (
            <div className="space-y-2">
              <div className="grid grid-cols-8 gap-2 mb-1">
                <div className="text-xs font-medium text-gray-700 col-span-3">Month</div>
                <div className="text-xs font-medium text-gray-700 col-span-4">Amount</div>
                {editingMonthly && <div className="col-span-1"></div>}
              </div>
              {(editingMonthly ? localRevenueByMonth : revenueByMonth).map((revenue, index) => (
                <div key={index} className="grid grid-cols-8 gap-2 items-center">
                  {editingMonthly ? (
                    <>
                      <ExpandableInput
                        value={localRevenueByMonth[index].month}
                        onChange={(e) => {
                          const newRevenue = [...localRevenueByMonth];
                          newRevenue[index].month = e.target.value;
                          setLocalRevenueByMonth(newRevenue);
                        }}
                        placeholder="Month"
                        className="h-8 text-sm col-span-3"
                        expandAfter={40}
                        lined={true}
                      />
                      <ExpandableInput
                        value={localRevenueByMonth[index].amount}
                        onChange={(e) => {
                          const newRevenue = [...localRevenueByMonth];
                          newRevenue[index].amount = e.target.value;
                          setLocalRevenueByMonth(newRevenue);
                        }}
                        placeholder="£0"
                        className="h-8 text-sm col-span-4"
                        expandAfter={40}
                        lined={true}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveRevenueByMonth(index)}
                        className="h-8 w-8 p-0 text-red-500 col-span-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="text-sm text-gray-900 p-2 border rounded-md border-gray-200 bg-gray-50 col-span-4">
                        {revenue.month || "—"}
                      </div>
                      <div className="text-sm text-gray-900 p-2 border rounded-md border-gray-200 bg-gray-50 col-span-4">
                        {revenue.amount || "£0"}
                      </div>
                    </>
                  )}
                </div>
              ))}
              {editingMonthly && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddRevenueByMonth}
                  className="w-full mt-2 h-7 text-xs"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Month
                </Button>
              )}
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="text-sm text-gray-500 italic border rounded-md border-gray-200 p-3 bg-gray-50 mb-2">
                No monthly revenue targets added yet
              </div>
            </div>
          )}
        </div>
      </Card>
    </>
  );
} 