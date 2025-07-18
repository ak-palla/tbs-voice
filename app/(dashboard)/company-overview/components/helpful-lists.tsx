"use client";

import { useState, useEffect } from "react";
import { ExpandableInput } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Trash2, Pencil, Save, X, CheckCircle, XCircle, PlusCircle, HelpCircle, ListChecks } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { Badge } from "@/components/ui/badge";
import { CardHeader, CardTitle, Card } from "@/components/ui/card";

type HelpfulListsProps = {
  rightData: string[];
  wrongData: string[];
  missingData: string[];
  confusingData: string[];
  onUpdate: () => void;
  plannerId: string | undefined;
  generatedData?: any;
  onGeneratedDataChange?: (data: any) => void;
};

export default function HelpfulLists({
  rightData,
  wrongData,
  missingData,
  confusingData,
  onUpdate,
  plannerId,
  generatedData,
  onGeneratedDataChange,
}: HelpfulListsProps) {
  const [right, setRight] = useState<string[]>(rightData);
  const [wrong, setWrong] = useState<string[]>(wrongData);
  const [missing, setMissing] = useState<string[]>(missingData);
  const [confusing, setConfusing] = useState<string[]>(confusingData);

  // Update lists when generated data is available
  useEffect(() => {
    if (generatedData) {
      if (generatedData.what_is_right) setRight(generatedData.what_is_right);
      if (generatedData.what_is_wrong) setWrong(generatedData.what_is_wrong);
      if (generatedData.what_is_missing) setMissing(generatedData.what_is_missing);
      if (generatedData.what_is_confusing) setConfusing(generatedData.what_is_confusing);
    }
  }, [generatedData]);
  
  const [newItem, setNewItem] = useState("");
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editSection, setEditSection] = useState<string | null>(null);
  
  const supabase = createClient();

  const handleAddItem = () => {
    if (!newItem.trim() || !addingTo) return;
    
    switch (addingTo) {
      case "right":
        setRight([...right, newItem.trim()]);
        break;
      case "wrong":
        setWrong([...wrong, newItem.trim()]);
        break;
      case "missing":
        setMissing([...missing, newItem.trim()]);
        break;
      case "confusing":
        setConfusing([...confusing, newItem.trim()]);
        break;
    }
    
    setNewItem("");
  };

  const handleRemoveItem = (section: string, index: number) => {
    switch (section) {
      case "right":
        const updatedRight = [...right];
        updatedRight.splice(index, 1);
        setRight(updatedRight);
        break;
      case "wrong":
        const updatedWrong = [...wrong];
        updatedWrong.splice(index, 1);
        setWrong(updatedWrong);
        break;
      case "missing":
        const updatedMissing = [...missing];
        updatedMissing.splice(index, 1);
        setMissing(updatedMissing);
        break;
      case "confusing":
        const updatedConfusing = [...confusing];
        updatedConfusing.splice(index, 1);
        setConfusing(updatedConfusing);
        break;
    }
  };

  const handleSave = async () => {
    if (!plannerId) return;
    
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from("triage_planner")
        .update({
          what_is_right: right,
          what_is_wrong: wrong,
          what_is_missing: missing,
          what_is_confusing: confusing,
        })
        .eq("id", plannerId);
        
      if (error) throw error;
      
      onUpdate();
      setAddingTo(null);
      setEditMode(false);
      setEditSection(null);
    } catch (error) {
      console.error("Error saving helpful lists:", error);
    } finally {
      setSaving(false);
    }
  };

  const toggleEditSection = (section: string) => {
    if (editSection === section) {
      setEditSection(null);
      setAddingTo(null);
    } else {
      setEditSection(section);
      setEditMode(true);
    }
  };

  const exitEditMode = () => {
    setEditMode(false);
    setEditSection(null);
    setAddingTo(null);
  };

  const getSectionStyle = (section: string) => {
    switch (section) {
      case "right":
        return {
          icon: <CheckCircle className="h-4 w-4 text-emerald-600 mr-2 flex-shrink-0" />,
          cardHeaderClass: "border-b border-emerald-100 bg-emerald-50",
          titleClass: "text-emerald-800",
          itemIcon: <CheckCircle className="h-3 w-3 text-emerald-600 mr-1.5 flex-shrink-0" />,
          bgColor: "bg-emerald-50/50",
          buttonClass: "border-emerald-200 text-emerald-700 hover:bg-emerald-50",
          actionBtnClass: "bg-emerald-600 hover:bg-emerald-700 text-white"
        };
      case "wrong":
        return {
          icon: <XCircle className="h-4 w-4 text-red-600 mr-2 flex-shrink-0" />,
          cardHeaderClass: "border-b border-red-100 bg-red-50",
          titleClass: "text-red-800",
          itemIcon: <XCircle className="h-3 w-3 text-red-600 mr-1.5 flex-shrink-0" />,
          bgColor: "bg-red-50/50",
          buttonClass: "border-red-200 text-red-700 hover:bg-red-50",
          actionBtnClass: "bg-red-600 hover:bg-red-700 text-white"
        };
      case "missing":
        return {
          icon: <PlusCircle className="h-4 w-4 text-blue-600 mr-2 flex-shrink-0" />,
          cardHeaderClass: "border-b border-blue-100 bg-blue-50",
          titleClass: "text-blue-800",
          itemIcon: <PlusCircle className="h-3 w-3 text-blue-600 mr-1.5 flex-shrink-0" />,
          bgColor: "bg-blue-50/50",
          buttonClass: "border-blue-200 text-blue-700 hover:bg-blue-50",
          actionBtnClass: "bg-blue-600 hover:bg-blue-700 text-white"
        };
      case "confusing":
        return {
          icon: <HelpCircle className="h-4 w-4 text-amber-600 mr-2 flex-shrink-0" />,
          cardHeaderClass: "border-b border-amber-100 bg-amber-50",
          titleClass: "text-amber-800",
          itemIcon: <HelpCircle className="h-3 w-3 text-amber-600 mr-1.5 flex-shrink-0" />,
          bgColor: "bg-amber-50/50",
          buttonClass: "border-amber-200 text-amber-700 hover:bg-amber-50",
          actionBtnClass: "bg-amber-600 hover:bg-amber-700 text-white"
        };
      default:
        return {
          icon: null,
          cardHeaderClass: "",
          titleClass: "",
          itemIcon: null,
          bgColor: "",
          buttonClass: "",
          actionBtnClass: ""
        };
    }
  };

  const getItemsForSection = (section: string) => {
    switch (section) {
      case "right":
        return right;
      case "wrong":
        return wrong;
      case "missing":
        return missing;
      case "confusing":
        return confusing;
      default:
        return [];
    }
  };

  const getSectionTitle = (section: string) => {
    switch (section) {
      case "right":
        return "What Is Right? (Optimise)";
      case "wrong":
        return "What Is Wrong? (Change)";
      case "missing":
        return "What Is Missing? (Add)";
      case "confusing":
        return "What Is Confusing? (Clarify)";
      default:
        return "";
    }
  };

  const renderSection = (section: string) => {
    const items = getItemsForSection(section);
    const title = getSectionTitle(section);
    const style = getSectionStyle(section);

    return (
      <Card className="overflow-hidden border-gray-200 h-full">
        <CardHeader className={`py-3 px-4 ${style.cardHeaderClass}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {style.icon}
              <h3 className={`text-sm font-semibold ${style.titleClass}`}>{title}</h3>
            </div>
            {!editMode && (
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={() => toggleEditSection(section)}
              >
                <Pencil className="h-3 w-3 text-gray-500" />
              </Button>
            )}
          </div>
        </CardHeader>
        <div className="px-4 py-3">
          {editSection === section ? (
            <div className="space-y-3">
              <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                {items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between bg-white rounded-md px-2.5 py-1.5 text-sm border border-gray-100">
                    <span className="mr-2">{item}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveItem(section, index)}
                      className="h-6 w-6 p-0"
                    >
                      <Trash2 className="h-3 w-3 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
              
              {addingTo === section ? (
                <div className="flex items-center space-x-2 pt-2">
                  <ExpandableInput
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    placeholder="Add new item..."
                    className="flex-1"
                    expandAfter={40}
                    lined={true}
                  />
                  <Button 
                    size="sm"
                    className={`h-8 px-3 text-xs ${style.actionBtnClass}`}
                    onClick={handleAddItem}
                    disabled={!newItem.trim()}
                  >
                    <Plus className="mr-1 h-3 w-3" /> Add
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={() => setAddingTo(section)} 
                  variant="outline"
                  className={`w-full mt-2 h-8 text-xs ${style.buttonClass}`}
                  size="sm"
                >
                  <Plus className="mr-1 h-3 w-3" /> Add Item
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
              {items.length === 0 ? (
                <p className="text-sm text-gray-400 italic">No items added yet</p>
              ) : (
                <div className="space-y-2">
                  {items.map((item, index) => (
                    <div 
                      key={index} 
                      className="flex items-start text-sm text-gray-700 rounded-md p-2 bg-gray-50 border border-gray-100"
                    >
                      {style.itemIcon}
                      <span className="flex-1">{item}</span>
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

  if (!editMode) {
    return (
      <>
        <CardHeader className="flex flex-row items-center justify-between py-3">
          <div className="flex items-center">
            <ListChecks className="h-5 w-5 text-blue-600 mr-2" />
            <CardTitle className="text-lg font-semibold text-gray-800">Helpful Lists</CardTitle>
          </div>
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-7 px-2 text-xs" 
            onClick={() => setEditMode(true)}
          >
            <Pencil className="h-3 w-3 mr-1 text-gray-500" />
            Edit
          </Button>
        </CardHeader>

        <div className="px-4 py-4 pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {renderSection("right")}
            {renderSection("wrong")}
            {renderSection("missing")}
            {renderSection("confusing")}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <CardHeader className="flex flex-row items-center justify-between py-3">
        <div className="flex items-center">
          <ListChecks className="h-5 w-5 text-blue-600 mr-2" />
          <CardTitle className="text-lg font-semibold text-gray-800">Helpful Lists</CardTitle>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-xs"
            onClick={exitEditMode}
          >
            <X className="h-3 w-3 mr-1" />
            Cancel
          </Button>
          <Button
            size="sm"
            className="h-7 px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white"
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
                <Save className="mr-1 h-3 w-3" />
                Save
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <div className="px-4 py-4">
        <div className="space-y-4">
          {editSection ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {renderSection("right")}
              {renderSection("wrong")}
              {renderSection("missing")}
              {renderSection("confusing")}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button 
                onClick={() => toggleEditSection("right")} 
                variant="outline" 
                className="h-10 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
              >
                <CheckCircle className="mr-2 h-4 w-4 text-emerald-600" /> 
                <span className="font-medium">What Is Right?</span>
              </Button>
              <Button 
                onClick={() => toggleEditSection("wrong")} 
                variant="outline" 
                className="h-10 border-red-200 text-red-700 hover:bg-red-50"
              >
                <XCircle className="mr-2 h-4 w-4 text-red-600" /> 
                <span className="font-medium">What Is Wrong?</span>
              </Button>
              <Button 
                onClick={() => toggleEditSection("missing")} 
                variant="outline" 
                className="h-10 border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                <PlusCircle className="mr-2 h-4 w-4 text-blue-600" /> 
                <span className="font-medium">What Is Missing?</span>
              </Button>
              <Button 
                onClick={() => toggleEditSection("confusing")} 
                variant="outline" 
                className="h-10 border-amber-200 text-amber-700 hover:bg-amber-50"
              >
                <HelpCircle className="mr-2 h-4 w-4 text-amber-600" /> 
                <span className="font-medium">What Is Confusing?</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
} 