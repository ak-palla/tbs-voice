"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type TimelineEvent = {
  id: string;
  week_number: number;
  event_name: string;
  scheduled_date: string;
  duration_minutes: number | null;
  description: string | null;
  meeting_link: string | null;
  created_at: string;
  updated_at: string;
};

export default function AdminTimelinePage() {
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
    meeting_link: "",
  });
  const supabase = createClient();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
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
        meeting_link: "",
      });
      fetchEvents();
    } catch (error) {
      console.error("Error saving timeline event:", error);
      toast.error("Failed to save timeline event");
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
      meeting_link: event.meeting_link || "",
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Manage Timeline Events</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
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
              <div className="space-y-2">
                <label htmlFor="meeting_link">Meeting Link</label>
                <Input
                  id="meeting_link"
                  type="url"
                  placeholder="https://meet.google.com/..."
                  value={formData.meeting_link}
                  onChange={(e) =>
                    setFormData({ ...formData, meeting_link: e.target.value })
                  }
                />
              </div>
              <Button type="submit" className="w-full">
                {editingEvent ? "Update" : "Create"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {events.map((event) => (
          <Card key={event.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
                    Week {event.week_number}
                  </span>
                  <h3 className="font-medium">{event.event_name}</h3>
                </div>
                {event.description && (
                  <p className="text-sm text-muted-foreground">
                    {event.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <p>📅 {new Date(event.scheduled_date).toLocaleDateString()}</p>
                  {event.duration_minutes && (
                    <p>⏱️ {event.duration_minutes} minutes</p>
                  )}
                  {event.meeting_link && (
                    <a 
                      href={event.meeting_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      🔗 Join Meeting
                    </a>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(event)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(event.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
} 