"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { ExpandableInput } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Trash2, User, Users, Briefcase, ClipboardList, BookOpen, Building } from "lucide-react";

type ChainOfCommandData = {
  id: string;
  user_id: string;
  name: string;
  manager: string;
  jobtitle: string;
  criticalaccountabilities: { value: string }[];
  playbooksowned: { value: string }[];
  department: string;
  created_at?: string;
  updated_at?: string;
};

type ChainOfCommandFormProps = {
  data: ChainOfCommandData | null;
  onUpdate: () => void;
  commandId: string | undefined;
};

const DEPARTMENTS = [
  "ACCOUNTING/FINANCE",
  "OPERATIONS",
  "SUCCESS/SUPPORT",
  "TECHNOLOGY/DEVELOPMENT",
  "PRODUCT/PROGRAMS",
  "SALES",
  "MARKETING"
];

export default function ChainOfCommandForm({ data, onUpdate, commandId }: ChainOfCommandFormProps) {
  const [formData, setFormData] = useState<Omit<ChainOfCommandData, 'id' | 'user_id' | 'created_at' | 'updated_at'>>({
    name: "",
    manager: "",
    jobtitle: "",
    criticalaccountabilities: [],
    playbooksowned: [],
    department: ""
  });
  const [newAccountability, setNewAccountability] = useState("");
  const [newPlaybook, setNewPlaybook] = useState("");
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (data) {
      setFormData({
        name: data.name || "",
        manager: data.manager || "",
        jobtitle: data.jobtitle || "",
        criticalaccountabilities: data.criticalaccountabilities || [],
        playbooksowned: data.playbooksowned || [],
        department: data.department || ""
      });
    } else {
      // Reset form when adding new
      setFormData({
        name: "",
        manager: "",
        jobtitle: "",
        criticalaccountabilities: [],
        playbooksowned: [],
        department: ""
      });
    }
  }, [data]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddAccountability = () => {
    if (!newAccountability.trim()) return;
    setFormData((prev) => ({
      ...prev,
      criticalaccountabilities: [...prev.criticalaccountabilities, { value: newAccountability.trim() }]
    }));
    setNewAccountability("");
  };

  const handleRemoveAccountability = (index: number) => {
    setFormData((prev) => {
      const updated = [...prev.criticalaccountabilities];
      updated.splice(index, 1);
      return {
        ...prev,
        criticalaccountabilities: updated
      };
    });
  };

  const handleAddPlaybook = () => {
    if (!newPlaybook.trim()) return;
    setFormData((prev) => ({
      ...prev,
      playbooksowned: [...prev.playbooksowned, { value: newPlaybook.trim() }]
    }));
    setNewPlaybook("");
  };

  const handleRemovePlaybook = (index: number) => {
    setFormData((prev) => {
      const updated = [...prev.playbooksowned];
      updated.splice(index, 1);
      return {
        ...prev,
        playbooksowned: updated
      };
    });
  };

  const handleAccountabilityChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    // Check for Enter key in change event's native event
    if (e.nativeEvent instanceof KeyboardEvent && e.nativeEvent.key === 'Enter') {
      e.preventDefault();
      if (value.trim()) {
        handleAddAccountability();
      }
      return;
    }
    setNewAccountability(value);
  };

  const handlePlaybookChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    // Check for Enter key in change event's native event
    if (e.nativeEvent instanceof KeyboardEvent && e.nativeEvent.key === 'Enter') {
      e.preventDefault();
      if (value.trim()) {
        handleAddPlaybook();
      }
      return;
    }
    setNewPlaybook(value);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      let error;
      if (data && data.id) {
        // Update existing record
        const result = await supabase
          .from("chain_of_command")
          .update(formData)
          .eq("id", commandId);
        
        error = result.error;
      } else {
        // Insert new record
        const result = await supabase
          .from("chain_of_command")
          .insert({
            ...formData,
            user_id: (await supabase.auth.getUser()).data.user?.id
          });
        
        error = result.error;
      }
        
      if (error) throw error;
      
      onUpdate();
    } catch (error) {
      console.error("Error saving chain of command data:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 space-y-5">
      <div className="space-y-4">
        {/* Name */}
        <div>
          <div className="flex items-center mb-2">
            <User className="h-4 w-4 text-blue-600 mr-2" />
            <label className="block text-sm font-medium text-gray-700">Name</label>
          </div>
          <ExpandableInput
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder="Enter name"
            className="w-full"
            expandAfter={40}
            lined={true}
          />
        </div>

        {/* Manager */}
        <div>
          <div className="flex items-center mb-2">
            <Users className="h-4 w-4 text-blue-600 mr-2" />
            <label className="block text-sm font-medium text-gray-700">Manager</label>
          </div>
          <ExpandableInput
            value={formData.manager}
            onChange={(e) => handleInputChange("manager", e.target.value)}
            placeholder="Enter manager's name"
            className="w-full"
            expandAfter={40}
            lined={true}
          />
        </div>

        {/* Job Title */}
        <div>
          <div className="flex items-center mb-2">
            <Briefcase className="h-4 w-4 text-blue-600 mr-2" />
            <label className="block text-sm font-medium text-gray-700">Job Title</label>
          </div>
          <ExpandableInput
            value={formData.jobtitle}
            onChange={(e) => handleInputChange("jobtitle", e.target.value)}
            placeholder="Enter job title"
            className="w-full"
            expandAfter={40}
            lined={true}
          />
        </div>

        {/* Department */}
        <div>
          <div className="flex items-center mb-2">
            <Building className="h-4 w-4 text-blue-600 mr-2" />
            <label className="block text-sm font-medium text-gray-700">Department</label>
          </div>
          <Select 
            value={formData.department} 
            onValueChange={(value) => handleInputChange("department", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {DEPARTMENTS.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Critical Accountabilities */}
        <div>
          <div className="flex items-center mb-2">
            <ClipboardList className="h-4 w-4 text-blue-600 mr-2" />
            <label className="block text-sm font-medium text-gray-700">Critical Accountabilities</label>
          </div>
          <div className="border rounded-md p-3 space-y-2">
            {formData.criticalaccountabilities.length > 0 ? (
              <div className="space-y-2">
                {formData.criticalaccountabilities.map((item, index) => (
                  <div key={index} className="flex items-center">
                    <div className="flex-1 p-2 bg-gray-50 rounded text-sm">
                      {item.value}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 ml-2"
                      onClick={() => handleRemoveAccountability(index)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-sm italic">No critical accountabilities added yet</div>
            )}
            <div className="flex mt-2">
              <ExpandableInput
                value={newAccountability}
                onChange={handleAccountabilityChange}
                placeholder="Add an accountability..."
                className="flex-1"
                expandAfter={40}
                lined={true}
              />
              <Button
                type="button"
                className="ml-2 bg-blue-600 hover:bg-blue-700"
                onClick={handleAddAccountability}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Playbooks Owned */}
        <div>
          <div className="flex items-center mb-2">
            <BookOpen className="h-4 w-4 text-blue-600 mr-2" />
            <label className="block text-sm font-medium text-gray-700">Playbooks Owned</label>
          </div>
          <div className="border rounded-md p-3 space-y-2">
            {formData.playbooksowned.length > 0 ? (
              <div className="space-y-2">
                {formData.playbooksowned.map((item, index) => (
                  <div key={index} className="flex items-center">
                    <div className="flex-1 p-2 bg-gray-50 rounded text-sm">
                      {item.value}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 ml-2"
                      onClick={() => handleRemovePlaybook(index)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-sm italic">No playbooks added yet</div>
            )}
            <div className="flex mt-2">
              <ExpandableInput
                value={newPlaybook}
                onChange={handlePlaybookChange}
                placeholder="Add a playbook..."
                className="flex-1"
                expandAfter={40}
                lined={true}
              />
              <Button
                type="button"
                className="ml-2 bg-blue-600 hover:bg-blue-700"
                onClick={handleAddPlaybook}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-3 flex justify-end border-t">
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </div>
  );
} 