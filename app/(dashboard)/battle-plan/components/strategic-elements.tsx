"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ExpandableInput } from "@/components/ui/input";
import { 
  Loader2, Save, X, Pencil, Plus, Trash2, 
  Heart, Anchor, Target, CalendarClock
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { CardHeader, CardTitle, Card } from "@/components/ui/card";

type Item = {
  value: string;
};

type StrategicElementsProps = {
  coreValues: Item[];
  strategicAnchors: Item[];
  purposeWhy: Item[];
  threeYearTarget: Item[];
  onUpdate: () => void;
  planId: string | undefined;
};

export default function StrategicElements({ 
  coreValues, 
  strategicAnchors, 
  purposeWhy, 
  threeYearTarget, 
  onUpdate, 
  planId 
}: StrategicElementsProps) {
  const [values, setValues] = useState<Item[]>(coreValues);
  const [anchors, setAnchors] = useState<Item[]>(strategicAnchors);
  const [purposes, setPurposes] = useState<Item[]>(purposeWhy);
  const [targets, setTargets] = useState<Item[]>(threeYearTarget);
  
  const [newItems, setNewItems] = useState({
    coreValues: "",
    strategicAnchors: "",
    purposeWhy: "",
    threeYearTarget: ""
  });
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const handleAddItem = (section: string) => {
    const item = newItems[section as keyof typeof newItems];
    if (!item.trim()) return;
    
    switch (section) {
      case "coreValues":
        setValues([...values, { value: item.trim() }]);
        setNewItems({...newItems, coreValues: ""});
        break;
      case "strategicAnchors":
        setAnchors([...anchors, { value: item.trim() }]);
        setNewItems({...newItems, strategicAnchors: ""});
        break;
      case "purposeWhy":
        setPurposes([...purposes, { value: item.trim() }]);
        setNewItems({...newItems, purposeWhy: ""});
        break;
      case "threeYearTarget":
        setTargets([...targets, { value: item.trim() }]);
        setNewItems({...newItems, threeYearTarget: ""});
        break;
    }
  };

  const handleRemoveItem = (section: string, index: number) => {
    switch (section) {
      case "coreValues":
        const updatedValues = [...values];
        updatedValues.splice(index, 1);
        setValues(updatedValues);
        break;
      case "strategicAnchors":
        const updatedAnchors = [...anchors];
        updatedAnchors.splice(index, 1);
        setAnchors(updatedAnchors);
        break;
      case "purposeWhy":
        const updatedPurposes = [...purposes];
        updatedPurposes.splice(index, 1);
        setPurposes(updatedPurposes);
        break;
      case "threeYearTarget":
        const updatedTargets = [...targets];
        updatedTargets.splice(index, 1);
        setTargets(updatedTargets);
        break;
    }
  };

  const handleChangeItem = (section: string, index: number, value: string) => {
    switch (section) {
      case "coreValues":
        const updatedValues = [...values];
        updatedValues[index] = { value };
        setValues(updatedValues);
        break;
      case "strategicAnchors":
        const updatedAnchors = [...anchors];
        updatedAnchors[index] = { value };
        setAnchors(updatedAnchors);
        break;
      case "purposeWhy":
        const updatedPurposes = [...purposes];
        updatedPurposes[index] = { value };
        setPurposes(updatedPurposes);
        break;
      case "threeYearTarget":
        const updatedTargets = [...targets];
        updatedTargets[index] = { value };
        setTargets(updatedTargets);
        break;
    }
  };

  const handleSave = async () => {
    if (!planId) return;
    
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from("battle_plan")
        .update({
          corevalues: values,
          strategicanchors: anchors,
          purposewhy: purposes,
          threeyeartarget: targets
        })
        .eq("id", planId);
        
      if (error) throw error;
      
      onUpdate();
      setEditMode(false);
    } catch (error) {
      console.error("Error saving strategic elements:", error);
    } finally {
      setSaving(false);
    }
  };

  const getIcon = (section: string) => {
    switch (section) {
      case "coreValues":
        return <Heart className="h-5 w-5 text-red-600" />;
      case "strategicAnchors":
        return <Anchor className="h-5 w-5 text-blue-600" />;
      case "purposeWhy":
        return <Target className="h-5 w-5 text-amber-500" />;
      case "threeYearTarget":
        return <CalendarClock className="h-5 w-5 text-emerald-600" />;
      default:
        return null;
    }
  };

  const getSectionStyle = (section: string) => {
    switch (section) {
      case "coreValues":
        return {
          icon: <Heart className="h-4 w-4 text-red-600 mr-2 flex-shrink-0" />,
          cardHeaderClass: "border-b border-red-100 bg-red-50",
          titleClass: "text-red-800"
        };
      case "strategicAnchors":
        return {
          icon: <Anchor className="h-4 w-4 text-blue-600 mr-2 flex-shrink-0" />,
          cardHeaderClass: "border-b border-blue-100 bg-blue-50",
          titleClass: "text-blue-800"
        };
      case "purposeWhy":
        return {
          icon: <Target className="h-4 w-4 text-amber-600 mr-2 flex-shrink-0" />,
          cardHeaderClass: "border-b border-amber-100 bg-amber-50",
          titleClass: "text-amber-800"
        };
      case "threeYearTarget":
        return {
          icon: <CalendarClock className="h-4 w-4 text-emerald-600 mr-2 flex-shrink-0" />,
          cardHeaderClass: "border-b border-emerald-100 bg-emerald-50",
          titleClass: "text-emerald-800"
        };
      default:
        return {
          icon: null,
          cardHeaderClass: "",
          titleClass: ""
        };
    }
  };

  const getTitle = (section: string) => {
    switch (section) {
      case "coreValues":
        return "Core Values";
      case "strategicAnchors":
        return "Strategic Anchors";
      case "purposeWhy":
        return "Purpose & Why";
      case "threeYearTarget":
        return "3-Year Targets";
      default:
        return "";
    }
  };

  const getPlaceholder = (section: string) => {
    switch (section) {
      case "coreValues":
        return "Add a core value...";
      case "strategicAnchors":
        return "Add a strategic anchor...";
      case "purposeWhy":
        return "Add a purpose statement...";
      case "threeYearTarget":
        return "Add a 3-year target...";
      default:
        return "Add new item...";
    }
  };

  const getEmptyMessage = (section: string) => {
    switch (section) {
      case "coreValues":
        return "No core values added yet";
      case "strategicAnchors":
        return "No strategic anchors added yet";
      case "purposeWhy":
        return "No purpose statements added yet";
      case "threeYearTarget":
        return "No 3-year targets added yet";
      default:
        return "No items added yet";
    }
  };

  const getItems = (section: string) => {
    switch (section) {
      case "coreValues":
        return values;
      case "strategicAnchors":
        return anchors;
      case "purposeWhy":
        return purposes;
      case "threeYearTarget":
        return targets;
      default:
        return [];
    }
  };

  const renderSection = (section: string) => {
    const items = getItems(section);
    const title = getTitle(section);
    const placeholder = getPlaceholder(section);
    const emptyMessage = getEmptyMessage(section);
    const style = getSectionStyle(section);

    return (
      <Card className="overflow-hidden border-gray-200 h-full">
        <CardHeader className={`py-3 px-4 ${style.cardHeaderClass}`}>
          <div className="flex items-center">
            {style.icon}
            <h3 className={`text-sm font-semibold ${style.titleClass}`}>{title}</h3>
          </div>
        </CardHeader>
        <div className="px-4 py-3">
          {editMode ? (
            <div className="space-y-3">
              <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                {items.map((item, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <ExpandableInput
                      value={item.value}
                      onChange={(e) => handleChangeItem(section, index, e.target.value)}
                      className="flex-1 text-sm"
                      expandAfter={40}
                      lined={true}
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-gray-500 hover:text-red-600"
                      onClick={() => handleRemoveItem(section, index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              
              <div className="flex items-center space-x-2 pt-2">
                <ExpandableInput
                  value={newItems[section as keyof typeof newItems]}
                  onChange={(e) => setNewItems({...newItems, [section]: e.target.value})}
                  placeholder={placeholder}
                  className="flex-1 text-sm"
                  expandAfter={40}
                  lined={true}
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs"
                  onClick={() => handleAddItem(section)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
              {items.length === 0 ? (
                <p className="text-sm text-gray-400 italic">{emptyMessage}</p>
              ) : (
                <div className="space-y-2">
                  {items.map((item, index) => (
                    <div 
                      key={index} 
                      className="flex items-start text-sm text-gray-700 rounded-md p-2 bg-gray-50 border border-gray-100"
                    >
                      {style.icon}
                      <span className="flex-1">{item.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center border-b pb-2">
        <h2 className="text-lg font-semibold text-gray-800">Strategic Elements</h2>
        {!editMode ? (
          <Button 
            size="sm" 
            variant="outline" 
            className="h-8 px-3 text-xs border-gray-300" 
            onClick={() => setEditMode(true)}
          >
            <Pencil className="h-3 w-3 mr-2 text-gray-600" />
            Edit All
          </Button>
        ) : (
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              className="h-8 px-3 text-xs border-gray-300"
              onClick={() => setEditMode(false)}
            >
              <X className="h-3 w-3 mr-2" />
              Cancel
            </Button>
            <Button
              size="sm"
              className="h-8 px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-3 w-3" />
                  Save
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {renderSection("coreValues")}
        {renderSection("strategicAnchors")}
        {renderSection("purposeWhy")}
        {renderSection("threeYearTarget")}
      </div>
    </div>
  );
} 