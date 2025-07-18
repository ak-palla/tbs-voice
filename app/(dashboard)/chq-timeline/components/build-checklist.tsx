"use client";

import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { 
  Loader2, 
  CheckCircle2, 
  Circle, 
  BarChart3, 
  Users, 
  Calendar, 
  Award, 
  Check, 
  ListTodo,
  Target,
  FileCheck
} from "lucide-react";
import { toast } from "sonner";

type ChecklistItem = {
  id: string;
  checklist_item: string;
  notes: string | null;
  completed: boolean;
  completion_date: string | null;
};

export default function BuildChecklist() {
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchChecklistItems();
  }, []);

  const fetchChecklistItems = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // First get all checklist items
      const { data: items, error: itemsError } = await supabase
        .from("chq_checklist")
        .select("*")
        .order("created_at", { ascending: true });

      if (itemsError) throw itemsError;

      // Then get user's claims
      const { data: userClaims, error: claimsError } = await supabase
        .from('user_checklist_claims')
        .select('*')
        .eq('user_id', user.id);

      if (claimsError) throw claimsError;

      // Combine the data
      const itemsWithClaims = items.map(item => {
        const claim = userClaims?.find(claim => claim.checklist_id === item.id);
        return {
          ...item,
          completed: claim?.is_completed || false,
          completion_date: claim?.completion_date || null
        };
      });

      setChecklistItems(itemsWithClaims);
    } catch (error) {
      console.error("Error fetching checklist items:", error);
      toast.error("Failed to load checklist items");
    } finally {
      setLoading(false);
    }
  };

  const toggleCompleted = async (item: ChecklistItem) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      setUpdating(item.id);
      const isCompleted = !item.completed;

      // Check if claim already exists
      const { data: existingClaim } = await supabase
        .from('user_checklist_claims')
        .select('id')
        .eq('user_id', user.id)
        .eq('checklist_id', item.id)
        .single();

      if (existingClaim) {
        // Update existing claim
        const { error } = await supabase
          .from('user_checklist_claims')
          .update({
            is_completed: isCompleted,
            completion_date: isCompleted ? new Date().toISOString() : null
          })
          .eq('id', existingClaim.id);

        if (error) throw error;
      } else {
        // Create new claim
        const { error } = await supabase
          .from('user_checklist_claims')
          .insert([{
            user_id: user.id,
            checklist_id: item.id,
            is_completed: isCompleted,
            completion_date: isCompleted ? new Date().toISOString() : null
          }]);

        if (error) throw error;
      }

      // Update local state
      setChecklistItems(currentItems => 
        currentItems.map(i => 
          i.id === item.id 
            ? { ...i, completed: isCompleted }
            : i
        )
      );

      toast.success(isCompleted ? "Item marked as complete" : "Item marked as incomplete");
    } catch (error) {
      console.error("Error updating checklist item:", error);
      toast.error("Failed to update checklist item");
    } finally {
      setUpdating(null);
    }
  };

  const completedCount = checklistItems.filter(item => item.completed).length;
  const totalCount = checklistItems.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
      </div>
    );
  }

  // Helper function to get icon for checklist item
  const getItemIcon = (title: string) => {
    if (title.toLowerCase().includes('growth')) return BarChart3;
    if (title.toLowerCase().includes('team') || title.toLowerCase().includes('command')) return Users;
    if (title.toLowerCase().includes('meeting')) return Calendar;
    if (title.toLowerCase().includes('target') || title.toLowerCase().includes('goal')) return Target;
    if (title.toLowerCase().includes('check') || title.toLowerCase().includes('review')) return FileCheck;
    return Award;
  };
  
  // Group items by completion status
  const completedItems = checklistItems.filter(item => item.completed);
  const pendingItems = checklistItems.filter(item => !item.completed);

  return (
    <div className="space-y-8">
      

      <div className="flex items-center gap-4">
        <div className="flex-grow">
          <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 transition-all duration-500" 
              style={{ width: `${progressPercentage}%` }} 
            />
          </div>
          <div className="flex justify-between mt-1 text-sm">
            <span className="text-muted-foreground">{completedCount} of {totalCount} tasks completed</span>
            <span className="font-medium text-blue-700">{Math.round(progressPercentage)}%</span>
          </div>
        </div>
      </div>

      {pendingItems.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-md font-medium flex items-center gap-2">
            <Circle className="w-4 h-4 text-blue-600" />
            Pending Tasks ({pendingItems.length})
          </h3>
          <div className="grid gap-3">
            {pendingItems.map((item) => {
              const ItemIcon = getItemIcon(item.checklist_item);
              return (
                <Card 
                  key={item.id} 
                  className="p-4 border border-blue-100 hover:border-blue-300 transition-colors duration-200"
                >
                  <div className="flex items-start gap-4">
                    <div className="pt-0.5">
                      <Checkbox
                        id={`item-${item.id}`}
                        checked={item.completed}
                        onCheckedChange={() => toggleCompleted(item)}
                        disabled={!!updating}
                        className={`h-5 w-5 rounded-sm ${updating === item.id ? "opacity-50" : ""}`}
                      />
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center gap-2">
                        <ItemIcon className="w-4 h-4 text-blue-600" />
                        <label
                          htmlFor={`item-${item.id}`}
                          className="font-medium cursor-pointer"
                        >
                          {item.checklist_item}
                        </label>
                      </div>
                      {item.notes && (
                        <p className="mt-1 text-sm text-muted-foreground ml-6">
                          {item.notes}
                        </p>
                      )}
                      {updating === item.id && (
                        <div className="mt-1 flex items-center gap-2 ml-6">
                          <Loader2 className="w-3 h-3 text-blue-600 animate-spin" />
                          <span className="text-xs text-muted-foreground">Saving...</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {completedItems.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-md font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
            Completed Tasks ({completedItems.length})
          </h3>
          <div className="grid gap-3">
            {completedItems.map((item) => {
              const ItemIcon = getItemIcon(item.checklist_item);
              return (
                <Card 
                  key={item.id} 
                  className="p-4 bg-blue-50/30 border border-blue-100"
                >
                  <div className="flex items-start gap-4">
                    <div className="pt-0.5">
                      <Checkbox
                        id={`item-${item.id}`}
                        checked={item.completed}
                        onCheckedChange={() => toggleCompleted(item)}
                        disabled={!!updating}
                        className={`h-5 w-5 rounded-sm ${updating === item.id ? "opacity-50" : ""}`}
                      />
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center gap-2">
                        <ItemIcon className="w-4 h-4 text-blue-600" />
                        <label
                          htmlFor={`item-${item.id}`}
                          className="font-medium cursor-pointer text-muted-foreground line-through"
                        >
                          {item.checklist_item}
                        </label>
                      </div>
                      {item.notes && (
                        <p className="mt-1 text-sm text-muted-foreground ml-6">
                          {item.notes}
                        </p>
                      )}
                      {updating === item.id && (
                        <div className="mt-1 flex items-center gap-2 ml-6">
                          <Loader2 className="w-3 h-3 text-blue-600 animate-spin" />
                          <span className="text-xs text-muted-foreground">Saving...</span>
                        </div>
                      )}
                      {item.completion_date && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground ml-6">
                          <Check className="w-3 h-3" />
                          Completed on {new Date(item.completion_date).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
} 