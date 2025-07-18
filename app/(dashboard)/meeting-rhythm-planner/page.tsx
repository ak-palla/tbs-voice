"use client";

import { useState, useEffect } from "react";
import { format, parseISO, getYear, getMonth, getDaysInMonth, getDay } from "date-fns";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
<<<<<<< HEAD
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
=======
import { CustomDropdown } from "@/components/ui/custom-dropdown";
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Info, Plus, Trash2, Eye, Edit, ChevronRight, ChevronLeft, SquareCode } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { getTeamMemberIds } from "@/utils/supabase/teams";

type Meeting = {
  id: string;
  user_id?: string;
  meeting_type: string;
  meeting_date: string;
  meeting_title: string;
  meeting_description: string;
  meeting_color: string;
};

type MeetingDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (meeting: Partial<Meeting>) => void;
  onDelete?: (id: string) => void;
  onEdit?: () => void;
  meeting?: Meeting;
  isLoading: boolean;
  viewOnly?: boolean;
};

const MEETING_TYPES = [
  { id: "quarterly_sprint_planning", name: "Quarterly Sprint Planning", color: "#C8E6C9" },
  { id: "all_hands", name: "All Hands", color: "#BBDEFB" },
  { id: "holidays", name: "Holidays", color: "#263238" },
  { id: "monthly_business_review", name: "Monthly Business Review", color: "#FFF9C4" },
  { id: "weekly_pulse", name: "Weekly Pulse", color: "#E1BEE7" },
<<<<<<< HEAD
=======
  { id: "others", name: "Others", color: "#FF9800" },
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
];

const MeetingDialog = ({ isOpen, onClose, onSave, onDelete, onEdit, meeting, isLoading, viewOnly = false }: MeetingDialogProps) => {
  const [formData, setFormData] = useState<Partial<Meeting>>({
    meeting_type: "",
    meeting_date: format(new Date(), "yyyy-MM-dd"),
    meeting_title: "",
    meeting_description: "",
    meeting_color: "",
  });

  useEffect(() => {
    if (meeting) {
      setFormData({
        id: meeting.id,
        meeting_type: meeting.meeting_type,
        meeting_date: meeting.meeting_date,
        meeting_title: meeting.meeting_title,
        meeting_description: meeting.meeting_description,
        meeting_color: meeting.meeting_color,
      });
    } else {
      setFormData({
        meeting_type: "",
        meeting_date: format(new Date(), "yyyy-MM-dd"),
        meeting_title: "",
        meeting_description: "",
        meeting_color: "",
      });
    }
  }, [meeting, isOpen]);

  const handleChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });

    // Set color automatically based on meeting type
    if (name === "meeting_type") {
      const selectedType = MEETING_TYPES.find(type => type.id === value);
      if (selectedType) {
        setFormData(prev => ({ ...prev, [name]: value, meeting_color: selectedType.color }));
      }
    }
  };

  const handleSubmit = () => {
    onSave(formData);
  };

  // Get meeting type name for displaying in view mode
  const getMeetingTypeName = (typeId: string) => {
    const meetingType = MEETING_TYPES.find(type => type.id === typeId);
    return meetingType?.name || typeId;
  };

  // Get meeting type color
  const getMeetingTypeColor = (typeId: string) => {
    const meetingType = MEETING_TYPES.find(type => type.id === typeId);
    return meetingType?.color || "#e0e0e0";
  };

  if (viewOnly && meeting) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[450px] rounded-xl p-0 overflow-hidden border-none shadow-lg">
          <div 
            className="py-5 px-6" 
            style={{
              backgroundColor: meeting.meeting_color,
              color: meeting.meeting_color === "#263238" ? "white" : "black"
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">{meeting.meeting_title || getMeetingTypeName(meeting.meeting_type)}</h2>
                <p className="text-sm opacity-80 mt-1">{format(new Date(meeting.meeting_date), "EEEE, MMMM d, yyyy")}</p>
              </div>
              <Badge 
                className="text-xs font-medium py-1 px-2"
                style={{
                  backgroundColor: "rgba(255,255,255,0.25)",
                  backdropFilter: "blur(4px)",
                  color: meeting.meeting_color === "#263238" ? "white" : "black"
                }}
              >
                {getMeetingTypeName(meeting.meeting_type)}
              </Badge>
            </div>
          </div>
          
          <div className="p-6">
            {meeting.meeting_description && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Description</h3>
                <p className="text-sm text-gray-800">{meeting.meeting_description}</p>
              </div>
            )}
          </div>
          
          <div className="py-3 px-6 flex justify-between items-center border-t border-gray-100">
            {onDelete && (
              <Button 
                variant="ghost" 
                onClick={() => onDelete(meeting.id)}
                disabled={isLoading}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                {isLoading ? <Spinner className="mr-2 h-4 w-4" /> : <Trash2 className="mr-2 h-4 w-4" />}
                Delete
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button variant="outline" onClick={onClose} size="sm" className="rounded-lg">
                Close
              </Button>
              {onEdit && (
                <Button onClick={onEdit} size="sm" className="bg-blue-600 hover:bg-blue-700 rounded-lg">
                  <Edit className="mr-2 h-3.5 w-3.5" />
                  Edit
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] rounded-lg p-0 overflow-hidden">
        <DialogHeader className="px-6 py-5 border-b border-gray-100">
          <DialogTitle>{meeting ? "Edit Meeting" : "Add Meeting"}</DialogTitle>
        </DialogHeader>
        <div className="px-6 py-4 space-y-5">
          <div className="space-y-1">
            <Label htmlFor="meeting_type" className="text-sm font-medium">
              Meeting Type
            </Label>
<<<<<<< HEAD
            <Select
              value={formData.meeting_type}
              onValueChange={(value) => handleChange("meeting_type", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select meeting type" />
              </SelectTrigger>
              <SelectContent>
                {MEETING_TYPES.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-sm mr-2" 
                        style={{ backgroundColor: type.color }}
                      />
                      {type.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
=======
            <CustomDropdown
              value={formData.meeting_type || ""}
              onChange={(value) => handleChange("meeting_type", value)}
              placeholder="Select meeting type"
              options={MEETING_TYPES.map(type => ({ 
                value: type.id, 
                label: type.name, 
                data: type 
              }))}
              renderOption={(option) => (
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-sm mr-2" 
                    style={{ backgroundColor: option.data.color }}
                  />
                  {option.label}
                </div>
              )}
              renderSelected={(option) => (
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-sm mr-2" 
                    style={{ backgroundColor: option.data.color }}
                  />
                  {option.label}
                </div>
              )}
              className="w-full"
            />
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="meeting_date" className="text-sm font-medium">
              Date
            </Label>
            <Input
              id="meeting_date"
              type="date"
              value={formData.meeting_date}
              onChange={(e) => handleChange("meeting_date", e.target.value)}
              className="w-full"
<<<<<<< HEAD
=======
              min={format(new Date(), "yyyy-MM-dd")}
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
            />
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="meeting_title" className="text-sm font-medium">
              Title
            </Label>
            <Input
              id="meeting_title"
              value={formData.meeting_title || ""}
              onChange={(e) => handleChange("meeting_title", e.target.value)}
              className="w-full"
              placeholder="Meeting title (optional)"
            />
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="meeting_description" className="text-sm font-medium">
              Description
            </Label>
            <Input
              id="meeting_description"
              value={formData.meeting_description || ""}
              onChange={(e) => handleChange("meeting_description", e.target.value)}
              className="w-full"
              placeholder="Meeting description (optional)"
            />
          </div>
        </div>
        
        <DialogFooter className="px-6 py-4 bg-gray-50 flex items-center justify-between">
          {meeting && onDelete && (
            <Button 
              variant="ghost" 
              onClick={() => onDelete(meeting.id)}
              disabled={isLoading}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              {isLoading ? <Spinner className="mr-2 h-4 w-4" /> : <Trash2 className="mr-2 h-4 w-4" />}
              Delete
            </Button>
          )}
          <div className={`flex gap-2 ${meeting && onDelete ? "" : "ml-auto"}`}>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
              {isLoading ? <Spinner className="mr-2 h-4 w-4" /> : null}
              {meeting ? "Update" : "Save"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default function MeetingRhythmPlannerPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isViewOnly, setIsViewOnly] = useState<boolean>(false);
  const [currentMeeting, setCurrentMeeting] = useState<Meeting | undefined>(undefined);
  const { toast } = useToast();
  const supabase = createClient();

  const fetchMeetings = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("No authenticated user");
      
      const teamMemberIds = await getTeamMemberIds(supabase, user.id);

      const { data, error } = await supabase
        .from('meeting_rhythm_planner')
        .select('*')
        .in('user_id', teamMemberIds)
        .gte('meeting_date', `${selectedYear}-01-01`)
        .lte('meeting_date', `${selectedYear}-12-31`)
        .order('meeting_date', { ascending: true });

      if (error) throw error;
      setMeetings(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching meetings",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, [selectedYear]);

  const handleSaveMeeting = async (meeting: Partial<Meeting>) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("No authenticated user");
      
      if (meeting.id) {
        // Update existing meeting
        const { error } = await supabase
          .from('meeting_rhythm_planner')
          .update({
            meeting_type: meeting.meeting_type,
            meeting_date: meeting.meeting_date,
            meeting_title: meeting.meeting_title,
            meeting_description: meeting.meeting_description,
            meeting_color: meeting.meeting_color,
          })
          .eq('id', meeting.id);

        if (error) throw error;
        toast({
          title: "Meeting updated",
          description: "The meeting has been updated successfully.",
        });
      } else {
        // Create new meeting
        const { error } = await supabase
          .from('meeting_rhythm_planner')
          .insert({
            user_id: user.id,
            meeting_type: meeting.meeting_type,
            meeting_date: meeting.meeting_date,
            meeting_title: meeting.meeting_title,
            meeting_description: meeting.meeting_description,
            meeting_color: meeting.meeting_color,
          });

        if (error) throw error;
        toast({
          title: "Meeting created",
          description: "The meeting has been created successfully.",
        });
      }

      fetchMeetings();
      setIsDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error saving meeting",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMeeting = async (id: string) => {
    if (!confirm("Are you sure you want to delete this meeting?")) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('meeting_rhythm_planner')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({
        title: "Meeting deleted",
        description: "The meeting has been deleted successfully.",
      });
      fetchMeetings();
      setIsDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error deleting meeting",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMeeting = () => {
    setCurrentMeeting(undefined);
    setIsViewOnly(false);
    setIsDialogOpen(true);
  };

  const handleViewMeeting = (meeting: Meeting) => {
    setCurrentMeeting(meeting);
    setIsViewOnly(true);
    setIsDialogOpen(true);
  };

  const handleEditMeeting = () => {
    setIsViewOnly(false);
  };

  const getMeetingsForDate = (year: number, month: number, day: number) => {
    const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return meetings.filter(meeting => meeting.meeting_date === date);
  };

  const getMeetingTypeColor = (type: string) => {
    const meetingType = MEETING_TYPES.find(t => t.id === type);
    return meetingType?.color || "#e0e0e0";
  };

  const renderCalendar = () => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const daysOfWeek = ["M", "T", "W", "T", "F", "S", "S"];

    // Function to check if a date is a Thursday
    const isThursday = (year: number, month: number, day: number) => {
      // getDay returns 0 for Sunday, so Thursday is 4
      const date = new Date(year, month, day);
      return getDay(date) === 4; // 4 represents Thursday
    };

    // Function to check if a date is a weekend (Saturday or Sunday)
    const isWeekend = (year: number, month: number, day: number) => {
      const date = new Date(year, month, day);
      const dayOfWeek = getDay(date);
      return dayOfWeek === 0 || dayOfWeek === 6; // 0 = Sunday, 6 = Saturday
    };

    return (
      <Card className=" border-0 overflow-hidden bg-white">
        <CardHeader className="pb-0 pt-6 px-6">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl font-bold">{selectedYear}</CardTitle>
            </div>
            <div className="flex items-center gap-1">
              <Button 
                onClick={() => setSelectedYear(selectedYear - 1)} 
                variant="outline" 
                size="icon"
                className="h-8 w-8 rounded-full"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button 
                onClick={() => setSelectedYear(selectedYear + 1)} 
                variant="outline" 
                size="icon"
                className="h-8 w-8 rounded-full"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-4 pt-4">
          <ScrollArea className="h-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 p-2">
              {months.map((month, monthIndex) => (
                <Card key={month} className="border overflow-hidden rounded-xl bg-gray-50">
                  <CardHeader className="py-2 px-3 border-b ">
                    <h3 className="text-sm font-semibold text-gray-700 tracking-wide">{month}</h3>
                  </CardHeader>
                  <div className="grid grid-cols-7 text-center text-[10px]">
                    {daysOfWeek.map((day, i) => (
                      <div key={i} className="p-1 border-b font-semibold text-gray-500">
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1 p-1 text-xs">
                    {/* Add empty cells for days before the 1st of the month */}
                    {(() => {
                      // Get the day of the week for the 1st day of the month (0 = Sunday, 1 = Monday, etc.)
                      const firstDayOfMonth = new Date(selectedYear, monthIndex, 1);
                      // Convert to 0 = Monday, 1 = Tuesday, etc. (since our grid starts with Monday)
                      let dayOffset = getDay(firstDayOfMonth);
                      // Adjust from Sunday = 0 to Monday = 0
                      dayOffset = dayOffset === 0 ? 6 : dayOffset - 1;
                      
                      // Create empty cells for days before the 1st
                      return Array.from({ length: dayOffset }).map((_, index) => (
                        <div key={`empty-${index}`} className="aspect-square p-1"></div>
                      ));
                    })()}
                    
                    {Array.from({ length: getDaysInMonth(new Date(selectedYear, monthIndex)) }).map((_, day) => {
                      const dayNumber = day + 1;
                      const dateMeetings = getMeetingsForDate(selectedYear, monthIndex, dayNumber);
                      const isWeekendDay = isWeekend(selectedYear, monthIndex, dayNumber);
                      const isThursdayDay = isThursday(selectedYear, monthIndex, dayNumber);
                      
<<<<<<< HEAD
=======
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const currentDate = new Date(selectedYear, monthIndex, dayNumber);
                      currentDate.setHours(0, 0, 0, 0);
                      const isPastAndEmpty = currentDate < today && dateMeetings.length === 0;

>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
                      // Default background for the day cell
                      let bgColor = isWeekendDay ? "bg-gray-50" : "bg-white";
                      let mainMeeting = dateMeetings[0]; // Get the first meeting for this date
                      
                      // Thursday default to Weekly Pulse if no other meeting exists
                      if (isThursdayDay && dateMeetings.length === 0) {
                        const weeklyPulseType = MEETING_TYPES.find(t => t.id === "weekly_pulse");
                        if (weeklyPulseType) {
                          bgColor = `bg-[${weeklyPulseType.color}]`;
                        }
                      }
                      
                      // If there's a meeting, use its color
                      if (mainMeeting) {
                        bgColor = `bg-[${mainMeeting.meeting_color}]`;
                      }
                      
                      return (
                        <div
                          key={day}
<<<<<<< HEAD
                          className="aspect-square p-1 relative cursor-pointer hover:opacity-90 transition-all rounded-md hover:scale-105 hover:z-10 hover:border transform"
                          onClick={() => {
                            // If there are meetings, show the first one
                            if (dateMeetings.length > 0) {
                              handleViewMeeting(dateMeetings[0]);
                            } else if (isThursdayDay) {
=======
                          className={`aspect-square p-1 relative transition-all rounded-md transform ${!isPastAndEmpty ? 'cursor-pointer hover:opacity-90 hover:scale-105 hover:z-10 border-2 border-transparent hover:border-gray-200' : 'cursor-not-allowed'}`}
                          onClick={() => {
                            // Allow viewing meetings on any date
                            if (dateMeetings.length > 0) {
                              handleViewMeeting(dateMeetings[0]);
                              return;
                            }

                            // Prevent creating meetings on past dates
                            if (isPastAndEmpty) {
                              return;
                            }
                            
                            // Handle future date clicks
                            if (isThursdayDay) {
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
                              // If it's a Thursday with no meeting, create a Weekly Pulse entry
                              const weeklyPulseType = MEETING_TYPES.find(t => t.id === "weekly_pulse");
                              const dateStr = `${selectedYear}-${String(monthIndex + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
                              setCurrentMeeting({
                                id: "",
                                meeting_type: "weekly_pulse",
                                meeting_date: dateStr,
                                meeting_title: "Weekly Pulse",
                                meeting_description: "Regular weekly meeting",
                                meeting_color: weeklyPulseType?.color || "#E1BEE7"
                              });
                              setIsViewOnly(false);
                              setIsDialogOpen(true);
                            } else {
                              // For other dates, open the add dialog
                              const dateStr = `${selectedYear}-${String(monthIndex + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
                              setCurrentMeeting({
                                id: "",
                                meeting_type: "",
                                meeting_date: dateStr,
                                meeting_title: "",
                                meeting_description: "",
                                meeting_color: ""
                              });
                              setIsViewOnly(false);
                              setIsDialogOpen(true);
                            }
                          }}
                          style={{
                            backgroundColor: mainMeeting ? mainMeeting.meeting_color : 
                                            isThursdayDay && dateMeetings.length === 0 ? getMeetingTypeColor("weekly_pulse") : 
                                            isWeekendDay ? "#f4f5f6" : "#ffffff",
<<<<<<< HEAD
                            opacity: isWeekendDay ? 0.9 : 1
=======
                            opacity: isWeekendDay || isPastAndEmpty ? 0.7 : 1
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
                          }}
                        >
                          <div className="w-6 h-6 flex items-center justify-center rounded-full text-xs font-medium" style={{
                            color: (mainMeeting && mainMeeting.meeting_color === "#263238") || 
                                  (isThursdayDay && dateMeetings.length === 0 && getMeetingTypeColor("weekly_pulse") === "#263238") 
<<<<<<< HEAD
                                  ? "white" : "black"
=======
                                  ? "white" : "black",
                             opacity: isPastAndEmpty ? 0.6 : 1,
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
                          }}>
                            {dayNumber}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6 py-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">Meeting Rhythm Planner</h1>
          <p className="text-sm text-gray-500 mt-1">
<<<<<<< HEAD
            Organize your company's meeting schedule for the year.
=======
            Organise your company's meeting schedule for the year.
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
          </p>
        </div>
        <Button onClick={handleAddMeeting} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          Add Meeting
        </Button>
      </div>
      
      <Card className="border-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center text-gray-700">
            <Info className="mr-2 h-4 w-4 text-blue-500" />
            Legend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {MEETING_TYPES.map((type) => (
              <div 
                key={type.id} 
                className="flex items-center"
              >
                <div 
                  className="w-4 h-4 rounded-sm mr-2" 
                  style={{ backgroundColor: type.color }}
                />
                <span className="text-xs text-gray-700">{type.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

<<<<<<< HEAD
      {isLoading && !isDialogOpen ? (
        <div className="flex justify-center my-12">
          <Spinner className="h-8 w-8 text-blue-600" />
        </div>
      ) : (
        renderCalendar()
      )}
=======
      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar Section - Left side (3/4 width) */}
        <div className="lg:col-span-3">
          {isLoading && !isDialogOpen ? (
            <div className="flex justify-center my-12">
              <Spinner className="h-8 w-8 text-blue-600" />
            </div>
          ) : (
            renderCalendar()
          )}
        </div>

        {/* Meetings List Section - Right side (1/4 width) */}
        <div className="lg:col-span-1">
          <Card className="border shadow-sm bg-white h-fit">
            <CardHeader className="py-3 bg-blue-50 border-b">
              <CardTitle className="text-base font-semibold flex items-center text-gray-800">
                <div className="bg-blue-100 p-1.5 rounded-lg mr-3">
                  <Calendar className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm font-medium">All Meetings</div>
                  <div className="text-xs text-gray-500 font-normal">{meetings.length} scheduled</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-auto">
                <div className="p-4">
                  {meetings.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <div className="bg-gray-50 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <Calendar className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-sm font-medium text-gray-600">No meetings scheduled</p>
                      <p className="text-xs text-gray-400 mt-1">Add your first meeting to get started</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {meetings
                        .sort((a, b) => new Date(a.meeting_date).getTime() - new Date(b.meeting_date).getTime())
                        .map((meeting) => {
                          const meetingType = MEETING_TYPES.find(t => t.id === meeting.meeting_type);
                          return (
                            <div
                              key={meeting.id}
                              className="relative overflow-hidden rounded-xl cursor-pointer transition-all duration-200 border border-gray-200"
                              style={{ 
                                backgroundColor: meeting.meeting_color,
                              }}
                              onClick={() => handleViewMeeting(meeting)}
                            >
                              {/* Subtle gradient overlay */}
                              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-60"></div>
                              
                              <div className="relative p-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1 min-w-0 mr-2">
                                    <div className="flex items-center gap-2 mb-1 justify-between">
                                      <h4 className="text-sm font-semibold leading-tight" style={{
                                        color: meeting.meeting_color === "#263238" ? "white" : "#1f2937"
                                      }}>
                                        {meeting.meeting_title || meetingType?.name || meeting.meeting_type}
                                      </h4>
                                      <Badge 
                                        className="text-xs font-medium px-2 py-1 rounded-md border-0"
                                        style={{
                                          backgroundColor: meeting.meeting_color === "#263238" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)",
                                          color: meeting.meeting_color === "#263238" ? "white" : "#374151",
                                          backdropFilter: "blur(4px)"
                                        }}
                                      >
                                        {meetingType?.name || meeting.meeting_type}
                                      </Badge>
                                    </div>
                                    <div className="flex items-center gap-1 mb-2">
                                      <div className="w-1 h-1 rounded-full" style={{
                                        backgroundColor: meeting.meeting_color === "#263238" ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.4)"
                                      }}></div>
                                      <p className="text-xs font-medium" style={{
                                        color: meeting.meeting_color === "#263238" ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.7)"
                                      }}>
                                        {format(new Date(meeting.meeting_date), "MMM d, yyyy")}
                                      </p>
                                    </div>
                                    {meeting.meeting_description && (
                                      <p className="text-xs leading-relaxed line-clamp-2" style={{
                                        color: meeting.meeting_color === "#263238" ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.6)"
                                      }}>
                                        {meeting.meeting_description}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      }
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a

      <MeetingDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSaveMeeting}
        onDelete={handleDeleteMeeting}
        onEdit={handleEditMeeting}
        meeting={currentMeeting}
        isLoading={isLoading}
        viewOnly={isViewOnly}
      />
    </div>
  );
} 