"use client";

import { useState, useEffect } from "react";
import { Loader2, Save, ArrowRight, Pencil, X, Plus, CircleDot, ExternalLink } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { getTeamId } from "@/utils/supabase/teams";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DynamicInputList } from "./components/dynamic-input-list";

type MachineData = {
  id: string;
  user_id: string;
  enginename: string;
  enginetype: string; // "GROWTH", "FULFILLMENT", "INNOVATION"
  description: string;
  triggeringevents: { value: string }[];
  endingevent: { value: string }[];
  actionsactivities: { value: string }[];
  created_at: string;
  updated_at: string;
  figma_link: string | null;
};

export default function GrowthMachinePlannerPage() {
  const [machineData, setMachineData] = useState<MachineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [engineName, setEngineName] = useState("");
  const [engineType, setEngineType] = useState<"GROWTH" | "FULFILLMENT" | "INNOVATION">("GROWTH");
  const [description, setDescription] = useState("");
  const [triggeringEvents, setTriggeringEvents] = useState<{ value: string }[]>([]);
  const [endingEvent, setEndingEvent] = useState<{ value: string }[]>([]);
  const [actionsActivities, setActionsActivities] = useState<{ value: string }[]>([]);
  
  // Edit mode state for each section
  const [editingName, setEditingName] = useState(false);
  const [editingType, setEditingType] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [editingTriggeringEvents, setEditingTriggeringEvents] = useState(false);
  const [editingEndingEvents, setEditingEndingEvents] = useState(false);
  const [editingActivities, setEditingActivities] = useState(false);
  
  const [error, setError] = useState("");
  const supabase = createClient();

  useEffect(() => {
    fetchMachineData();
  }, []);

  useEffect(() => {
    if (machineData) {
      setEngineName(machineData.enginename || "");
      setEngineType(machineData.enginetype as "GROWTH" | "FULFILLMENT" | "INNOVATION" || "GROWTH");
      setDescription(machineData.description || "");
      setTriggeringEvents(machineData.triggeringevents || []);
      setEndingEvent(machineData.endingevent || []);
      setActionsActivities(machineData.actionsactivities || []);
    }
  }, [machineData]);

  const fetchMachineData = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("No authenticated user");

      const teamId = await getTeamId(supabase, user.id);
      
      const { data, error } = await supabase
        .from("machines")
        .select("*")
        .eq("user_id", teamId)
        .eq("enginetype", "GROWTH")
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      if (data) {
        setMachineData(data);
      } else {
        // Create a new entry if none exists
        const newMachine = {
          user_id: teamId,
          enginename: "Growth Machine",
          enginetype: "GROWTH",
          description: "",
          triggeringevents: [],
          endingevent: [],
          actionsactivities: [],
          figma_link: null
        };
        
        const { data: newData, error: insertError } = await supabase
          .from("machines")
          .insert(newMachine)
          .select("*")
          .single();
          
        if (insertError) throw insertError;
        setMachineData(newData);
      }
    } catch (error) {
      console.error("Error fetching growth machine data:", error);
      setError("Failed to load growth machine data");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSection = async (section: string) => {
    if (!machineData?.id) return;
    
    try {
      setSaving(true);
      setError("");
      
      const updateData: any = {};
      
      switch(section) {
        case 'name':
          updateData.enginename = engineName;
          setEditingName(false);
          break;
        case 'type':
          updateData.enginetype = engineType;
          setEditingType(false);
          break;
        case 'description':
          updateData.description = description;
          setEditingDescription(false);
          break;
        case 'triggeringEvents':
          updateData.triggeringevents = triggeringEvents;
          setEditingTriggeringEvents(false);
          break;
        case 'endingEvents':
          updateData.endingevent = endingEvent;
          setEditingEndingEvents(false);
          break;
        case 'activities':
          updateData.actionsactivities = actionsActivities;
          setEditingActivities(false);
          break;
        default:
          return;
      }
      
      const { error } = await supabase
        .from("machines")
        .update(updateData)
        .eq("id", machineData.id);
        
      if (error) throw error;
      
      await fetchMachineData();
    } catch (err: any) {
      console.error(`Error saving ${section}:`, err);
      setError(err.message || `Failed to save ${section}`);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAll = async () => {
    if (!machineData?.id) return;
    
    try {
      setSaving(true);
      setError("");
      
      const { error } = await supabase
        .from("machines")
        .update({
          enginename: engineName,
          enginetype: engineType,
          description: description,
          triggeringevents: triggeringEvents,
          endingevent: endingEvent,
          actionsactivities: actionsActivities
        })
        .eq("id", machineData.id);
        
      if (error) throw error;
      
      // Reset all editing states
      setEditingName(false);
      setEditingType(false);
      setEditingDescription(false);
      setEditingTriggeringEvents(false);
      setEditingEndingEvents(false);
      setEditingActivities(false);
      
      await fetchMachineData();
    } catch (err: any) {
      console.error("Error saving growth machine:", err);
      setError(err.message || "Failed to save growth machine");
    } finally {
      setSaving(false);
    }
  };

  const handleTypeChange = (type: "GROWTH" | "FULFILLMENT" | "INNOVATION") => {
    setEngineType(type);
  };

  return (
    <div className="max-w-[1440px] mx-auto">
      <div className="mb-5">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Growth Machine Planner</h1>
        <p className="text-sm text-gray-500 mt-1">
          Define and manage your business growth machine
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
        </div>
      ) : (
        <div className="space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
              {error}
            </div>
          )}

            <div className="grid grid-cols-12 gap-6">
              {/* Column One */}
              <div className="col-span-12 lg:col-span-8 space-y-6">
                {/* Engine Name */}
                <Card className="overflow-hidden border-gray-200">
                  <CardHeader className="flex flex-row items-center justify-between py-1 px-4 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
                    <CardTitle className="text-sm font-medium text-blue-800 uppercase">Engine Name</CardTitle>
                    {!editingName ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingName(true)}
                        className="h-7 mt-0 px-2 text-xs text-blue-700 hover:bg-blue-100"
                      >
                        <Pencil className="h-3 w-3 mr-1 text-blue-600" />
                        Edit
                      </Button>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 mt-0 px-2 text-xs"
                          onClick={() => setEditingName(false)}
                        >
                          <X className="h-3 w-3 mr-1" />
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          className="h-7 mt-0 px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => handleSaveSection('name')}
                          disabled={saving}
                        >
                          {saving ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Save className="h-3 w-3 mr-1" />}
                          Save
                        </Button>
                      </div>
                    )}
                  </CardHeader>
                  <div className="p-4">
                    {editingName ? (
                      <Input
                        value={engineName}
                        onChange={(e) => setEngineName(e.target.value)}
                        placeholder="Enter name for this engine"
                        className="w-full"
                      />
                    ) : (
                      <div className="text-xl md:text-2xl font-bold text-blue-800">{engineName || "—"}</div>
                    )}
                  </div>
                </Card>

                {/* Description */}
                <Card className="overflow-hidden border-gray-200">
                  <CardHeader className="flex flex-row items-center justify-between py-1 px-4 bg-gradient-to-r from-amber-50 to-amber-100 border-b border-amber-200">
                    <CardTitle className="text-sm font-medium text-amber-800 uppercase">Description</CardTitle>
                    {!editingDescription ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingDescription(true)}
                        className="h-7 mt-0 px-2 text-xs text-amber-700 hover:bg-amber-100"
                      >
                        <Pencil className="h-3 w-3 mr-1 text-amber-600" />
                        Edit
                      </Button>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 mt-0 px-2 text-xs"
                          onClick={() => setEditingDescription(false)}
                        >
                          <X className="h-3 w-3 mr-1" />
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          className="h-7 mt-0 px-3 text-xs bg-amber-600 hover:bg-amber-700 text-white"
                          onClick={() => handleSaveSection('description')}
                          disabled={saving}
                        >
                          {saving ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Save className="h-3 w-3 mr-1" />}
                          Save
                        </Button>
                      </div>
                    )}
                  </CardHeader>
                  <div className="p-4">
                    {editingDescription ? (
                      <Textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe what this engine does and its purpose"
                        className="min-h-[100px] w-full"
                      />
                    ) : (
                      <div className="text-gray-600 whitespace-pre-line">{description || "No description provided"}</div>
                    )}
                  </div>
                </Card>

                {/* Triggering Events and Ending Events - Two column layout */}
                <div className="grid grid-cols-12 gap-4">
                  {/* Triggering Event */}
                  <div className="col-span-5">
                    <Card className="overflow-hidden border-gray-200 h-full">
                      <CardHeader className="flex flex-row items-center justify-between py-1 px-4 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
                        <CardTitle className="text-sm font-medium text-blue-800 uppercase">Triggering Event</CardTitle>
                        {!editingTriggeringEvents ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingTriggeringEvents(true)}
                            className="h-7 px-2 text-xs text-blue-700 hover:bg-blue-100"
                          >
                            <Pencil className="h-3 w-3 mr-1 text-blue-600" />
                            Edit
                          </Button>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 mt-0 px-2 text-xs"
                              onClick={() => setEditingTriggeringEvents(false)}
                            >
                              <X className="h-3 w-3 mr-1" />
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              className="h-7 mt-0 px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                              onClick={() => handleSaveSection('triggeringEvents')}
                              disabled={saving}
                            >
                              {saving ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Save className="h-3 w-3 mr-1" />}
                              Save
                            </Button>
                          </div>
                        )}
                      </CardHeader>
                      <div className="p-4">
                        {editingTriggeringEvents ? (
                          <DynamicInputList
                            items={triggeringEvents}
                            onChange={setTriggeringEvents}
                            placeholder="Add a triggering event"
                          />
                        ) : (
                          <div className="space-y-2">
                            {triggeringEvents.length === 0 ? (
                              <p className="text-center text-gray-400 italic py-2 text-sm">No triggering events defined</p>
                            ) : (
                              triggeringEvents.map((event, index) => (
                                <div key={index} className="bg-blue-50 px-3 py-2 rounded-md flex items-start">
                                  <CircleDot className="h-4 w-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                                  <div className="text-sm">{event.value}</div>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    </Card>
                  </div>

                  {/* Arrow */}
                  <div className="col-span-2 flex items-center justify-center">
                    <div className="w-12 h-12 flex items-center justify-center bg-blue-50 rounded-full border border-blue-200">
                      <ArrowRight className="h-6 w-6 text-blue-700" />
                    </div>
                  </div>

                  {/* Ending Event */}
                  <div className="col-span-5">
                    <Card className="overflow-hidden border-gray-200 h-full">
                      <CardHeader className="flex flex-row items-center justify-between py-1 px-4 bg-gradient-to-r from-red-50 to-red-100 border-b border-red-200">
                        <CardTitle className="text-sm font-medium text-red-800 uppercase">Ending Event</CardTitle>
                        {!editingEndingEvents ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingEndingEvents(true)}
                            className="h-7 mt-0 px-2 text-xs text-red-700 hover:bg-red-100"
                          >
                            <Pencil className="h-3 w-3 mr-1 text-red-600" />
                            Edit
                          </Button>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 mt-0 px-2 text-xs"
                              onClick={() => setEditingEndingEvents(false)}
                            >
                              <X className="h-3 w-3 mr-1" />
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              className="h-7 mt-0 px-3 text-xs bg-red-600 hover:bg-red-700 text-white"
                              onClick={() => handleSaveSection('endingEvents')}
                              disabled={saving}
                            >
                              {saving ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Save className="h-3 w-3 mr-1" />}
                              Save
                            </Button>
                          </div>
                        )}
                      </CardHeader>
                      <div className="p-4">
                        {editingEndingEvents ? (
                          <DynamicInputList
                            items={endingEvent}
                            onChange={setEndingEvent}
                            placeholder="Add an ending event"
                          />
                        ) : (
                          <div className="space-y-2">
                            {endingEvent.length === 0 ? (
                              <p className="text-center text-gray-400 italic py-2 text-sm">No ending events defined</p>
                            ) : (
                              endingEvent.map((event, index) => (
                                <div key={index} className="bg-red-50 px-3 py-2 rounded-md flex items-start">
                                  <CircleDot className="h-4 w-4 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
                                  <div className="text-sm">{event.value}</div>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    </Card>
                  </div>
                </div>
              </div>

              {/* Column Two */}
              <div className="col-span-12 lg:col-span-4 space-y-6">
                {/* Engine Type (no edit option) */}
                <Card className="overflow-hidden border-gray-200">
                  <CardHeader className="flex flex-row items-center justify-between py-1 px-4 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
                    <CardTitle className="text-sm font-medium text-blue-800 uppercase">Engine Type</CardTitle>
                  </CardHeader>
                  <div className="p-4">
                    <div className="flex items-center">
                      <div className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm font-semibold">
                        {engineType}
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Actions/Activities */}
                <Card className="overflow-hidden border-gray-200">
                  <CardHeader className="flex flex-row items-center justify-between py-1 px-4 bg-gradient-to-r from-emerald-50 to-emerald-100 border-b border-emerald-200">
                    <CardTitle className="text-sm font-medium text-emerald-800 uppercase">Actions/Activities</CardTitle>
                    {!editingActivities ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingActivities(true)}
                        className="h-7 mt-0 px-2 text-xs text-emerald-700 hover:bg-emerald-100"
                      >
                        <Pencil className="h-3 w-3 mr-1 text-emerald-600" />
                        Edit
                      </Button>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 mt-0 px-2 text-xs"
                          onClick={() => setEditingActivities(false)}
                        >
                          <X className="h-3 w-3 mr-1" />
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          className="h-7 mt-0 px-3 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                          onClick={() => handleSaveSection('activities')}
                          disabled={saving}
                        >
                          {saving ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Save className="h-3 w-3 mr-1" />}
                          Save
                        </Button>
                      </div>
                    )}
                  </CardHeader>
                  <div className="p-4">
                    {editingActivities ? (
                      <DynamicInputList
                        items={actionsActivities}
                        onChange={setActionsActivities}
                        placeholder="Add an action or activity"
                      />
                    ) : (
                      <div className="space-y-2">
                        {actionsActivities.length === 0 ? (
                          <p className="text-center text-gray-400 italic py-2 text-sm">No actions or activities defined</p>
                        ) : (
                          actionsActivities.map((item, index) => (
                            <div key={index} className="bg-emerald-50 px-3 py-2 rounded-md flex items-start">
                              <CircleDot className="h-4 w-4 text-emerald-600 mt-0.5 mr-2 flex-shrink-0" />
                              <div className="text-sm">{item.value}</div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          </div>
       
      )}
    </div>
  );
} 