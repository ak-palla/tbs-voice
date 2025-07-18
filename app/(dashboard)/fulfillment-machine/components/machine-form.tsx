"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DynamicInputList } from "./dynamic-input-list";

type MachineData = {
  id: string;
  user_id: string;
  enginename: string;
  enginetype: string;
  description: string;
  triggeringevents: { value: string }[];
  endingevent: { value: string }[];
  actionsactivities: { value: string }[];
};

interface MachineFormProps {
  mode: "add" | "edit";
  initialData: MachineData | null;
  engineType: "GROWTH" | "FULFILLMENT" | "INNOVATION";
  onSubmitSuccess: () => void;
  onCancel: () => void;
}

export default function MachineForm({
  mode,
  initialData,
  engineType,
  onSubmitSuccess,
  onCancel
}: MachineFormProps) {
  const [engineName, setEngineName] = useState(initialData?.enginename || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [triggeringEvents, setTriggeringEvents] = useState<{ value: string }[]>(initialData?.triggeringevents || []);
  const [endingEvent, setEndingEvent] = useState<{ value: string }[]>(initialData?.endingevent || []);
  const [actionsActivities, setActionsActivities] = useState<{ value: string }[]>(initialData?.actionsactivities || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!engineName.trim()) {
      setError("Engine name is required");
      return;
    }
    
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("No authenticated user");
      
      const machineData = {
        enginename: engineName,
        enginetype: engineType,
        description,
        triggeringevents: triggeringEvents,
        endingevent: endingEvent,
        actionsactivities: actionsActivities,
        user_id: user.id
      };
      
      if (mode === "add") {
        const { error } = await supabase
          .from("machines")
          .insert(machineData);
          
        if (error) throw error;
      } else if (initialData?.id) {
        const { error } = await supabase
          .from("machines")
          .update(machineData)
          .eq("id", initialData.id);
          
        if (error) throw error;
      }
      
      onSubmitSuccess();
    } catch (err: any) {
      console.error("Error saving machine:", err);
      setError(err.message || "Failed to save machine");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
          {error}
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="engineName" className="text-sm font-medium text-gray-700">
            Engine Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="engineName"
            value={engineName}
            onChange={(e) => setEngineName(e.target.value)}
            className="mt-1"
            placeholder="Enter a name for this engine"
          />
        </div>
        
        <div>
          <Label htmlFor="description" className="text-sm font-medium text-gray-700">
            Description
          </Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 min-h-[100px]"
            placeholder="Describe what this engine does and its purpose"
          />
        </div>
        
        <div>
          <Label className="text-sm font-medium text-gray-700">
            Triggering Events
          </Label>
          <p className="text-sm text-gray-500 mb-2">
            What events or conditions trigger this machine to start?
          </p>
          <DynamicInputList
            items={triggeringEvents}
            onChange={setTriggeringEvents}
            placeholder="Add a triggering event"
          />
        </div>
        
        <div>
          <Label className="text-sm font-medium text-gray-700">
            Ending Event
          </Label>
          <p className="text-sm text-gray-500 mb-2">
            What events or conditions indicate this machine has completed its purpose?
          </p>
          <DynamicInputList
            items={endingEvent}
            onChange={setEndingEvent}
            placeholder="Add an ending event"
          />
        </div>
        
        <div>
          <Label className="text-sm font-medium text-gray-700">
            Actions & Activities
          </Label>
          <p className="text-sm text-gray-500 mb-2">
            What actions and activities are performed by this machine?
          </p>
          <DynamicInputList
            items={actionsActivities}
            onChange={setActionsActivities}
            placeholder="Add an action or activity"
          />
        </div>
      </div>
      
      <div className="flex justify-end space-x-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white"
          disabled={loading}
        >
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {mode === "add" ? "Create Machine" : "Update Machine"}
        </Button>
      </div>
    </form>
  );
} 