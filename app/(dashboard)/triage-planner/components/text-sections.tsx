"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, LightbulbIcon, Pencil, Save, X, Loader2 } from "lucide-react";

type TextSectionsProps = {
  whatYouDo: string;
  whoYouServe: string;
  notes: string;
  onUpdate: () => void;
  plannerId: string | undefined;
};

export default function TextSections({ 
  whatYouDo, 
  whoYouServe, 
  notes, 
  onUpdate, 
  plannerId
}: TextSectionsProps) {
  const [whatYouDoContent, setWhatYouDoContent] = useState(whatYouDo);
  const [whoYouServeContent, setWhoYouServeContent] = useState(whoYouServe);
  const [notesContent, setNotesContent] = useState(notes);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const supabase = createClient();

  const handleSave = async () => {
    if (!plannerId) return;
    
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from("triage_planner")
        .update({
          what_you_do: whatYouDoContent,
          who_you_serve: whoYouServeContent,
          notes: notesContent
        })
        .eq("id", plannerId);
        
      if (error) throw error;
      
      onUpdate();
      setEditMode(false);
    } catch (error) {
      console.error("Error saving text sections:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <CardHeader className="flex flex-row items-center justify-between py-3">
        <div className="flex items-center">
          <FileText className="h-5 w-5 text-blue-600 mr-2" />
          <CardTitle className="text-lg font-semibold text-gray-800">Additional Info</CardTitle>
        </div>
        {!editMode ? (
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-7 px-2 text-xs" 
            onClick={() => setEditMode(true)}
          >
            <Pencil className="h-3 w-3 mr-1 text-gray-500" />
            Edit
          </Button>
        ) : (
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2 text-xs"
              onClick={() => setEditMode(false)}
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
                  <Save className="mr-2 h-3 w-3" />
                  Save
                </>
              )}
            </Button>
          </div>
        )}
      </CardHeader>

      <div className="px-5 pb-5 space-y-5">
        {/* What You Do */}
        <div className="space-y-2 border rounded-md p-4">
          <div className="flex items-center mb-1">
            <LightbulbIcon className="h-4 w-4 text-blue-600 mr-1.5" />
            <h3 className="text-sm font-medium text-gray-800">What You Do</h3>
          </div>
          {editMode ? (
            <Textarea
              value={whatYouDoContent}
              onChange={(e) => setWhatYouDoContent(e.target.value)}
              placeholder="Describe what your business does..."
              rows={3}
              className="min-h-[80px] text-sm"
              autoExpand={true}
              lined={true}
            />
          ) : (
            <div className="text-sm text-gray-700 rounded-md">
              {whatYouDoContent ? (
                <p className="whitespace-pre-wrap">{whatYouDoContent}</p>
              ) : (
                <p className="text-gray-400 italic">
                  Describe what your business does, including products, services, and key offerings.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Who You Serve */}
        <div className="space-y-2 border rounded-md p-4">
          <div className="flex items-center mb-1">
            <Users className="h-4 w-4 text-blue-600 mr-1.5" />
            <h3 className="text-sm font-medium text-gray-800">Who You Serve</h3>
          </div>
          {editMode ? (
            <Textarea
              value={whoYouServeContent}
              onChange={(e) => setWhoYouServeContent(e.target.value)}
              placeholder="Describe who your business serves..."
              rows={3}
              className="min-h-[80px] text-sm"
              autoExpand={true}
              lined={true}
            />
          ) : (
            <div className="text-sm text-gray-700 rounded-md ">
              {whoYouServeContent ? (
                <p className="whitespace-pre-wrap">{whoYouServeContent}</p>
              ) : (
                <p className="text-gray-400 italic">
                  Describe your target audience, ideal customers, and markets you serve.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="space-y-2 border rounded-md p-4">
          <div className="flex items-center mb-1">
            <FileText className="h-4 w-4 text-blue-600 mr-1.5" />
            <h3 className="text-sm font-medium text-gray-800">Notes</h3>
          </div>
          {editMode ? (
            <Textarea
              value={notesContent}
              onChange={(e) => setNotesContent(e.target.value)}
              placeholder="Add your notes here..."
              rows={3}
              className="min-h-[80px] text-sm"
              autoExpand={true}
              lined={true}
            />
          ) : (
            <div className="text-sm text-gray-700 rounded-md ">
              {notesContent ? (
                <p className="whitespace-pre-wrap">{notesContent}</p>
              ) : (
                <p className="text-gray-400 italic">
                  Add additional notes, thoughts, or reminders.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
} 