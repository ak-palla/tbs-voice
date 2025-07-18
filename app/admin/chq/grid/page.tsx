"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Pencil, Trash2, Calendar, Clock, CheckSquare, Gift, FileText } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// TIMELINE TYPES AND COMPONENTS
type TimelineEvent = {
  id: string;
  week_number: number;
  event_name: string;
  scheduled_date: string;
  duration_minutes: number | null;
  description: string | null;
  created_at: string;
  updated_at: string;
};

function TimelineManager() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);
  const [formData, setFormData] = useState({
    week_number: "",
    event_name: "",
    scheduled_date: "",
    duration_minutes: "",
    description: "",
  });
  const supabase = createClient();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("chq_timeline")
        .select("*")
        .order("week_number", { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error("Error fetching timeline events:", error);
      toast.error("Failed to load timeline events");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert form data to correct types
    const eventData = {
      ...formData,
      week_number: parseInt(formData.week_number),
      duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : null,
    };

    try {
      const submitButton = document.querySelector("button[type='submit']") as HTMLButtonElement;
      if (submitButton) submitButton.disabled = true;
      
      if (editingEvent) {
        const { error } = await supabase
          .from("chq_timeline")
          .update(eventData)
          .eq("id", editingEvent.id);

        if (error) throw error;
        toast.success("Timeline event updated successfully");
      } else {
        const { error } = await supabase
          .from("chq_timeline")
          .insert([eventData]);

        if (error) throw error;
        toast.success("Timeline event created successfully");
      }

      setIsDialogOpen(false);
      setEditingEvent(null);
      setFormData({
        week_number: "",
        event_name: "",
        scheduled_date: "",
        duration_minutes: "",
        description: "",
      });
      fetchEvents();
    } catch (error) {
      console.error("Error saving timeline event:", error);
      toast.error("Failed to save timeline event");
    } finally {
      const submitButton = document.querySelector("button[type='submit']") as HTMLButtonElement;
      if (submitButton) submitButton.disabled = false;
    }
  };

  const handleEdit = (event: TimelineEvent) => {
    setEditingEvent(event);
    setFormData({
      week_number: event.week_number.toString(),
      event_name: event.event_name,
      scheduled_date: event.scheduled_date,
      duration_minutes: event.duration_minutes?.toString() || "",
      description: event.description || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this timeline event?")) return;

    try {
      const { error } = await supabase
        .from("chq_timeline")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Timeline event deleted successfully");
      fetchEvents();
    } catch (error) {
      console.error("Error deleting timeline event:", error);
      toast.error("Failed to delete timeline event");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4 h-full">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Timeline Events</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add Event
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingEvent ? "Edit Timeline Event" : "Add New Timeline Event"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="week_number">Week Number</label>
                <Input
                  id="week_number"
                  type="number"
                  min="1"
                  value={formData.week_number}
                  onChange={(e) =>
                    setFormData({ ...formData, week_number: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="event_name">Event Name</label>
                <Input
                  id="event_name"
                  value={formData.event_name}
                  onChange={(e) =>
                    setFormData({ ...formData, event_name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="scheduled_date">Scheduled Date</label>
                <Input
                  id="scheduled_date"
                  type="date"
                  value={formData.scheduled_date}
                  onChange={(e) =>
                    setFormData({ ...formData, scheduled_date: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="duration_minutes">Duration (minutes)</label>
                <Input
                  id="duration_minutes"
                  type="number"
                  min="1"
                  value={formData.duration_minutes}
                  onChange={(e) =>
                    setFormData({ ...formData, duration_minutes: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="description">Description</label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
              <Button type="submit" className="w-full">
                {editingEvent ? (
                  <>Update</>
                ) : (
                  <>Create</>
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2 overflow-auto max-h-[calc(100vh-200px)]">
        {events.map((event) => (
          <Card key={event.id} className="p-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    Week {event.week_number}
                  </span>
                  <h3 className="font-medium text-sm">{event.event_name}</h3>
                </div>
                {event.description && (
                  <p className="text-xs text-muted-foreground">
                    {event.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-blue-500" />
                    <span>{new Date(event.scheduled_date).toLocaleDateString()}</span>
                  </div>
                  {event.duration_minutes && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-blue-500" />
                      <span>{event.duration_minutes} minutes</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 w-7 p-0 border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                  onClick={() => handleEdit(event)}
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => handleDelete(event.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// CHECKLIST TYPES AND COMPONENTS
type ChecklistItem = {
  id: string;
  checklist_item: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

function ChecklistManager() {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ChecklistItem | null>(null);
  const [formData, setFormData] = useState({
    checklist_item: "",
    notes: "",
  });
  const supabase = createClient();

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("chq_checklist")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error("Error fetching checklist items:", error);
      toast.error("Failed to load checklist items");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitButton = document.querySelector("button[type='submit']") as HTMLButtonElement;
      if (submitButton) submitButton.disabled = true;
      
      if (editingItem) {
        const { error } = await supabase
          .from("chq_checklist")
          .update(formData)
          .eq("id", editingItem.id);

        if (error) throw error;
        toast.success("Checklist item updated successfully");
      } else {
        const { error } = await supabase
          .from("chq_checklist")
          .insert([formData]);

        if (error) throw error;
        toast.success("Checklist item created successfully");
      }

      setIsDialogOpen(false);
      setEditingItem(null);
      setFormData({ checklist_item: "", notes: "" });
      fetchItems();
    } catch (error) {
      console.error("Error saving checklist item:", error);
      toast.error("Failed to save checklist item");
    } finally {
      const submitButton = document.querySelector("button[type='submit']") as HTMLButtonElement;
      if (submitButton) submitButton.disabled = false;
    }
  };

  const handleEdit = (item: ChecklistItem) => {
    setEditingItem(item);
    setFormData({
      checklist_item: item.checklist_item,
      notes: item.notes || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this checklist item?")) return;

    try {
      const { error } = await supabase
        .from("chq_checklist")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Checklist item deleted successfully");
      fetchItems();
    } catch (error) {
      console.error("Error deleting checklist item:", error);
      toast.error("Failed to delete checklist item");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4 h-full">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Checklist Items</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingItem ? "Edit Checklist Item" : "Add New Checklist Item"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="checklist_item">Checklist Item</label>
                <Input
                  id="checklist_item"
                  value={formData.checklist_item}
                  onChange={(e) =>
                    setFormData({ ...formData, checklist_item: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="notes">Notes</label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                />
              </div>
              <Button type="submit" className="w-full">
                {editingItem ? (
                  <>Update</>
                ) : (
                  <>Create</>
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2 overflow-auto max-h-[calc(100vh-200px)]">
        {items.length > 0 ? (
          items.map((item) => (
            <Card key={item.id} className="p-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-1.5">
                    <CheckSquare className="h-3.5 w-3.5 text-blue-500" />
                    <h3 className="font-medium text-sm">{item.checklist_item}</h3>
                  </div>
                  {item.notes && (
                    <div className="flex items-center gap-1.5">
                      <FileText className="h-3 w-3 text-gray-400" />
                      <p className="text-xs text-muted-foreground">{item.notes}</p>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 ml-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 w-7 p-0 border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                    onClick={() => handleEdit(item)}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="py-4 text-center border rounded-md bg-gray-50">
            <p className="text-xs text-muted-foreground">No checklist items found. Click "Add Item" to create one.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// BENEFITS TYPES AND COMPONENTS
type Benefit = {
  id: string;
  benefit_name: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

function BenefitsManager() {
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBenefit, setEditingBenefit] = useState<Benefit | null>(null);
  const [formData, setFormData] = useState({
    benefit_name: "",
    notes: "",
  });
  const supabase = createClient();

  useEffect(() => {
    fetchBenefits();
  }, []);

  const fetchBenefits = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("chq_benefits")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      console.log("Fetched benefits (grid view):", data);
      setBenefits(data || []);
    } catch (error) {
      console.error("Error fetching benefits:", error);
      toast.error("Failed to load benefits");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitButton = document.querySelector("button[type='submit']") as HTMLButtonElement;
      if (submitButton) submitButton.disabled = true;
      
      if (editingBenefit) {
        const { error } = await supabase
          .from("chq_benefits")
          .update(formData)
          .eq("id", editingBenefit.id);

        if (error) throw error;
        toast.success("Benefit updated successfully");
      } else {
        const { error } = await supabase
          .from("chq_benefits")
          .insert([formData]);

        if (error) throw error;
        toast.success("Benefit created successfully");
      }

      setIsDialogOpen(false);
      setEditingBenefit(null);
      setFormData({
        benefit_name: "",
        notes: "",
      });
      fetchBenefits();
    } catch (error) {
      console.error("Error saving benefit:", error);
      toast.error("Failed to save benefit");
    } finally {
      const submitButton = document.querySelector("button[type='submit']") as HTMLButtonElement;
      if (submitButton) submitButton.disabled = false;
    }
  };

  const handleEdit = (benefit: Benefit) => {
    setEditingBenefit(benefit);
    setFormData({
      benefit_name: benefit.benefit_name || "",
      notes: benefit.notes || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this benefit?")) return;

    try {
      const { error } = await supabase
        .from("chq_benefits")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Benefit deleted successfully");
      fetchBenefits();
    } catch (error) {
      console.error("Error deleting benefit:", error);
      toast.error("Failed to delete benefit");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Benefits</h2>
          <p className="text-xs text-muted-foreground">
            Manage the benefits that users can access and claim
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add Benefit
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingBenefit ? "Edit Benefit" : "Add New Benefit"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="benefit_name">Benefit Name</label>
                <Input
                  id="benefit_name"
                  value={formData.benefit_name}
                  onChange={(e) =>
                    setFormData({ ...formData, benefit_name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="notes">Notes</label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                />
              </div>
              <Button type="submit" className="w-full">
                {editingBenefit ? (
                  <>Update</>
                ) : (
                  <>Create</>
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2 overflow-auto max-h-[calc(100vh-200px)]">
        {benefits.length > 0 ? (
          benefits.map((benefit) => (
            <Card key={benefit.id} className="p-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-1.5">
                    <Gift className="h-3.5 w-3.5 text-blue-500" />
                    <h3 className="font-medium text-sm">{benefit.benefit_name || "Untitled Benefit"}</h3>
                  </div>
                  {benefit.notes && (
                    <div className="flex items-center gap-1.5">
                      <FileText className="h-3 w-3 text-gray-400" />
                      <p className="text-xs text-muted-foreground">
                        {benefit.notes || "No notes provided"}
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 ml-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 w-7 p-0 border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                    onClick={() => handleEdit(benefit)}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => handleDelete(benefit.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="py-4 text-center border rounded-md bg-gray-50">
            <p className="text-xs text-muted-foreground">No benefits found. Click "Add Benefit" to create one.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// MAIN COMPONENT
export default function AdminCHQGridPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
<<<<<<< HEAD
          <h1 className="text-2xl font-bold">CHQ Timeline</h1>
=======
          <h1 className="text-2xl font-bold">Calendar</h1>
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
          <p className="text-muted-foreground">
            Manage timeline events, checklist items, and benefits
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <a href="/admin/chq">Switch to Tabs View</a>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-4 h-full">
          <TimelineManager />
        </Card>

        <Card className="p-4 h-full">
          <ChecklistManager />
        </Card>

        <Card className="p-4 h-full">
          <BenefitsManager />
        </Card>
      </div>
    </div>
  );
} 