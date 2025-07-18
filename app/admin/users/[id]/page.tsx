"use client";

<<<<<<< HEAD
import { useState, useEffect } from "react";
=======
import { useState, useEffect, use } from "react";
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Loader2,
  ArrowLeft,
  User,
  Building,
  Mail,
  Phone,
  CreditCard,
  Calendar,
  CheckSquare,
  ChevronRight,
  Link as LinkIcon,
  MoreHorizontal,
  Save,
  Gift,
  CheckCircle2,
  UserCircle,
  AlertCircle,
  Edit,
} from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import OnboardingDataModal from "@/components/admin/OnboardingDataModal"; // Added import

// Types
interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  business_name: string;
  phone_number: string;
  payment_option: string;
  payment_remaining: number;
  command_hq_link?: string;
  command_hq_created?: boolean;
  gd_folder_created?: boolean;
  meeting_scheduled?: boolean;
  profile_picture_url?: string;
  role: string;
  created_at: string;
  updated_at: string;
}

interface TimelineEvent {
  id: string;
  event_name: string;
  week_number: number;
  scheduled_date: string;
  description?: string;
  is_completed?: boolean;
  completion_date?: string;
}

interface ChecklistItem {
  id: string;
  checklist_item: string;
  notes?: string;
  is_completed?: boolean;
  completion_date?: string;
}

interface Benefit {
  id: string;
  benefit_name: string;
  notes: string | null;
  is_claimed?: boolean;
  claimed_date?: string;
}

interface BattlePlan {
  id: string;
  missionstatement: string;
  visionstatement: string;
  businessplanlink: string;
  purposewhy: any[];
  strategicanchors: any[];
  corevalues: any[];
  threeyeartarget: any[];
  created_at: string;
  updated_at: string;
}

interface ChainOfCommand {
  id: string;
  name: string;
  manager: string;
  jobtitle: string;
  department: string;
  criticalaccountabilities: any[];
  playbooksowned: any[];
  created_at: string;
  updated_at: string;
}

interface HWGTPlan {
  id: string;
  howwegetthereplan: any;
  created_at: string;
  updated_at: string;
}

interface Machine {
  id: string;
  enginename: string;
  enginetype: string;
  description: string;
  triggeringevents: any[];
  endingevent: any[];
  actionsactivities: any[];
  figma_link: string;
  figma_embed: string;
  created_at: string;
  updated_at: string;
}

interface Meeting {
  id: string;
  meeting_type: string;
  meeting_date: string;
  meeting_title: string;
  meeting_description: string;
  meeting_color: string;
  created_at: string;
  updated_at: string;
}

interface Playbook {
  id: string;
  playbookname: string;
  description: string;
  enginetype: string;
  owner: string;
  status: string;
  link: string;
  created_at: string;
  updated_at: string;
}

interface QuarterlySprint {
  id: string;
  theme: string;
  revenuegoals: any;
  unitgoals: any[];
  revenuebymonth: any[];
  strategicpillars: string[];
  northstarmetrics: any[];
  keyinitiatives: any[];
  created_at: string;
  updated_at: string;
}

interface TriagePlanner {
  id: string;
  company_info: any;
  what_you_do: string;
  who_you_serve: string;
  what_is_right: any[];
  what_is_wrong: any[];
  what_is_missing: any[];
  what_is_confusing: any[];
  internal_tasks: any[];
  notes: string;
  created_at: string;
  updated_at: string;
}

<<<<<<< HEAD
export default function UserDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const supabase = createClient();
  const { id } = params;
=======
export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const supabase = createClient();
  const { id } = use(params);
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a

  // State
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editedUser, setEditedUser] = useState<UserProfile | null>(null);
  const [saving, setSaving] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
<<<<<<< HEAD
=======
  const [dropdownOpen, setDropdownOpen] = useState(false);
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
  const [userDetails, setUserDetails] = useState({
    timeline: [] as TimelineEvent[],
    checklist: [] as ChecklistItem[],
    benefits: [] as Benefit[],
    battlePlan: null as BattlePlan | null,
    chainOfCommand: [] as ChainOfCommand[],
    hwgtPlan: null as HWGTPlan | null,
    machines: [] as Machine[],
    meetings: [] as Meeting[],
    playbooks: [] as Playbook[],
    quarterlySprint: null as QuarterlySprint | null,
    triagePlanner: null as TriagePlanner | null,
  });
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [onboardingData, setOnboardingData] = useState<any>(null);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
  const [loadingOnboardingData, setLoadingOnboardingData] = useState(true);

  // Load user data
  useEffect(() => {
    fetchUser();
  }, [id]);

  useEffect(() => {
    const fetchOnboardingData = async () => {
      if (user?.user_id) { // Check if user and user.user_id are available
        setLoadingOnboardingData(true);
        // supabase client is already defined at component scope
        const { data, error } = await supabase
          .from("company_onboarding")
          .select("onboarding_data, completed") // Fetching the specific fields
          .eq("user_id", user.user_id) // Use user.user_id
          .single();

        if (error && error.code !== "PGRST116") { // PGRST116 means no rows found
          console.error("Error fetching onboarding data:", error);
          toast.error("Failed to load onboarding data.");
          setOnboardingData(null);
        } else {
          setOnboardingData(data); // Store the whole data object
        }
        setLoadingOnboardingData(false);
      } else {
        // If no user.user_id, it means no onboarding data can be fetched for this relation yet, or user is not loaded
        setLoadingOnboardingData(false); // Set to false as we are not fetching
        setOnboardingData(null);
      }
    };

    // Only attempt to fetch if user.user_id is present
    if (user?.user_id) {
      fetchOnboardingData();
    } else {
      // If user or user.user_id is not yet available, reflect that we're not actively loading onboarding data for a non-existent/unidentified user.
      // This prevents showing "Loading data..." indefinitely if the main user object hasn't loaded its user_id.
      setLoadingOnboardingData(false); 
      setOnboardingData(null);
    }
  }, [user?.user_id, supabase]); // Depend on user.user_id and supabase client

  const fetchUser = async () => {
    try {
      setLoading(true);
      
      // Fetch user profile
      const { data, error } = await supabase
        .from('business_info')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      setUser(data);
      setEditedUser(data);
      
      // Fetch user details
      if (data.user_id) {
        fetchUserDetails(data.user_id);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      toast.error("Failed to load user data");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async (userId: string) => {
    try {
      setDetailsLoading(true);
      
      // Fetch timeline items with user claims - use left join to get all claims
      const { data: timeline, error: timelineError } = await supabase
        .from('chq_timeline')
        .select(`
          id,
          event_name,
          week_number,
          scheduled_date,
          description,
          user_timeline_claims (
            is_completed,
            completion_date,
            user_id
          )
        `)
        .order('week_number', { ascending: true });
      
      if (timelineError) throw timelineError;

      // Fetch checklist items with user claims - use left join to get all claims
      const { data: checklist, error: checklistError } = await supabase
        .from('chq_checklist')
        .select(`
          id,
          checklist_item,
          notes,
          user_checklist_claims (
            is_completed,
            completion_date,
            user_id
          )
        `);
      
      if (checklistError) throw checklistError;

      // Fetch benefits with user claims - use left join to get all claims
      const { data: benefits, error: benefitsError } = await supabase
        .from('chq_benefits')
        .select(`
          id,
          benefit_name,
          notes,
          user_benefit_claims (
            is_claimed,
            claimed_date,
            user_id
          )
        `);
      
      if (benefitsError) throw benefitsError;

      // Fetch battle plan
      const { data: battlePlan, error: battlePlanError } = await supabase
        .from('battle_plan')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (battlePlanError && battlePlanError.code !== 'PGRST116') throw battlePlanError;

      // Fetch chain of command
      const { data: chainOfCommand, error: chainOfCommandError } = await supabase
        .from('chain_of_command')
        .select('*')
        .eq('user_id', userId);
      
      if (chainOfCommandError) throw chainOfCommandError;

      // Fetch HWGT plan
      const { data: hwgtPlan, error: hwgtPlanError } = await supabase
        .from('hwgt_plan')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (hwgtPlanError && hwgtPlanError.code !== 'PGRST116') throw hwgtPlanError;

      // Fetch machines
      const { data: machines, error: machinesError } = await supabase
        .from('machines')
        .select('*')
        .eq('user_id', userId);
      
      if (machinesError) throw machinesError;

      // Fetch meeting rhythm planner
      const { data: meetings, error: meetingsError } = await supabase
        .from('meeting_rhythm_planner')
        .select('*')
        .eq('user_id', userId);
      
      if (meetingsError) throw meetingsError;

      // Fetch playbooks
      const { data: playbooks, error: playbooksError } = await supabase
        .from('playbooks')
        .select('*')
        .eq('user_id', userId);
      
      if (playbooksError) throw playbooksError;

      // Fetch quarterly sprint canvas
      const { data: quarterlySprint, error: quarterlySprintError } = await supabase
        .from('quarterly_sprint_canvas')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (quarterlySprintError && quarterlySprintError.code !== 'PGRST116') throw quarterlySprintError;

      // Fetch triage planner
      const { data: triagePlanner, error: triagePlannerError } = await supabase
        .from('triage_planner')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (triagePlannerError && triagePlannerError.code !== 'PGRST116') throw triagePlannerError;

      // Transform data to include claim status for user-specific items
      const formattedTimeline = timeline?.map(item => ({
        id: item.id,
        event_name: item.event_name,
        week_number: item.week_number,
        scheduled_date: item.scheduled_date,
        description: item.description,
        is_completed: item.user_timeline_claims.find(c => c.user_id === userId)?.is_completed || false,
        completion_date: item.user_timeline_claims.find(c => c.user_id === userId)?.completion_date || null,
      })) || [];

      const formattedChecklist = checklist?.map(item => ({
        id: item.id,
        checklist_item: item.checklist_item,
        notes: item.notes,
        is_completed: item.user_checklist_claims.find(c => c.user_id === userId)?.is_completed || false,
        completion_date: item.user_checklist_claims.find(c => c.user_id === userId)?.completion_date || null,
      })) || [];

      const formattedBenefits = benefits?.map(item => ({
        id: item.id,
        benefit_name: item.benefit_name,
        notes: item.notes,
        is_claimed: item.user_benefit_claims.find(c => c.user_id === userId)?.is_claimed || false,
        claimed_date: item.user_benefit_claims.find(c => c.user_id === userId)?.claimed_date || null,
      })) || [];

      console.log("Fetched data:", { 
        battlePlan, 
        chainOfCommand, 
        hwgtPlan, 
        machines, 
        meetings, 
        playbooks, 
        quarterlySprint, 
        triagePlanner 
      });

      setUserDetails({
        timeline: formattedTimeline,
        checklist: formattedChecklist,
        benefits: formattedBenefits,
        battlePlan: battlePlan || null,
        chainOfCommand: chainOfCommand || [],
        hwgtPlan: hwgtPlan || null,
        machines: machines || [],
        meetings: meetings || [],
        playbooks: playbooks || [],
        quarterlySprint: quarterlySprint || null,
        triagePlanner: triagePlanner || null,
      });
    } catch (error) {
      console.error("Error fetching user details:", error);
      toast.error("Failed to load user activity data");
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editedUser) return;
    
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('business_info')
        .update({
          full_name: editedUser.full_name,
          business_name: editedUser.business_name,
          email: editedUser.email,
          phone_number: editedUser.phone_number,
          payment_option: editedUser.payment_option,
          payment_remaining: editedUser.payment_remaining,
          command_hq_link: editedUser.command_hq_link,
          command_hq_created: editedUser.command_hq_created,
          gd_folder_created: editedUser.gd_folder_created,
          meeting_scheduled: editedUser.meeting_scheduled,
          role: editedUser.role,
        })
        .eq('id', id);
      
      if (error) throw error;
      
      setUser(editedUser);
      setEditMode(false);
      toast.success("User information updated successfully");
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user information");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    
    try {
      setIsDeleting(true);
      
      // Delete the business_info record
      const { error: businessError } = await supabase
        .from('business_info')
        .delete()
        .eq('id', id);
      
      if (businessError) throw businessError;
      
      // We can't delete auth users without admin privileges
      // Instead, we just delete the business_info record
      
      toast.success("User record deleted successfully");
      router.push("/admin/users");
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editedUser) return;
    const { name, value } = e.target;
    setEditedUser(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    if (!editedUser) return;
    setEditedUser(prev => prev ? { ...prev, [name]: checked } : null);
  };

  const handleSelectChange = (name: string, value: string) => {
    if (!editedUser) return;
    setEditedUser(prev => prev ? { ...prev, [name]: value } : null);
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const getRandomColor = (id: string) => {
    const colors = [
      "bg-red-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
    ];
    
    // Simple hash function
    const hash = id.split("").reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);
    
    return colors[hash % colors.length];
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-purple-100 text-purple-800';
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <h2 className="text-xl font-semibold">User Not Found</h2>
        <p className="text-muted-foreground">The requested user could not be found.</p>
        <Button asChild>
          <Link href="/admin/users">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Users
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/users">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">User Profile</h1>
            <p className="text-muted-foreground">
              View and manage user information
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {editMode ? (
            <>
              <Button variant="outline" onClick={() => {
                setEditMode(false);
                setEditedUser(user);
              }} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setEditMode(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
<<<<<<< HEAD
              <DropdownMenu>
=======
              <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
<<<<<<< HEAD
                  <DropdownMenuItem>
                    <UserCircle className="w-4 h-4 mr-2" />
                    <span>Reset Password</span>
                  </DropdownMenuItem>
                  <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <DialogTrigger asChild>
                      <DropdownMenuItem className="text-red-600">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        <span>Delete User</span>
                      </DropdownMenuItem>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Are you sure you want to delete this user?</DialogTitle>
                        <DialogDescription>
                          This action cannot be undone. This will permanently delete the user account
                          and remove all associated data.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting}>
                          Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                          {isDeleting ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Deleting...
                            </>
                          ) : (
                            "Delete User"
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
=======
                  <DropdownMenuItem 
                    onClick={() => {
                      setDropdownOpen(false);
                      router.push(`/admin/users/${user.id}/reset-password`);
                    }}
                    className="cursor-pointer"
                  >
                    <UserCircle className="w-4 h-4 mr-2" />
                    <span>Reset Password</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => {
                      setDropdownOpen(false);
                      // Use setTimeout to ensure dropdown closes before dialog opens
                      setTimeout(() => setIsDeleteDialogOpen(true), 0);
                    }}
                    className="text-red-600 cursor-pointer"
                  >
                    <AlertCircle className="w-4 h-4 mr-2" />
                    <span>Delete User</span>
                  </DropdownMenuItem>
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>
<<<<<<< HEAD
=======

      {/* Delete User Dialog - moved outside of DropdownMenu to prevent focus conflicts */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure you want to delete this user?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the user account
              and remove all associated data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete User"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
      
      {/* User Info & Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar with user info */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="overflow-hidden">
            <div className="p-6 flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={user.profile_picture_url || ""} alt={user.full_name} />
                <AvatarFallback className={getRandomColor(user.id)}>
                  {getInitials(user.full_name)}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-semibold">{user.full_name}</h2>
              <Badge className={`mt-2 ${getRoleBadgeColor(user.role)}`}>
                {user.role}
              </Badge>
              <p className="text-muted-foreground mt-1 text-sm">{user.email}</p>
              <p className="text-muted-foreground text-sm">{user.phone_number}</p>
              
              <Separator className="my-4" />
              
              <div className="w-full space-y-4 text-left">
                <div>
                  <p className="text-sm font-medium">Business</p>
                  <p className="text-muted-foreground">{user.business_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Member Since</p>
                  <p className="text-muted-foreground">{new Date(user.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Last Updated</p>
                  <p className="text-muted-foreground">{new Date(user.updated_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">User ID</p>
                  <p className="text-muted-foreground text-xs truncate">{user.user_id}</p>
                </div>

                {/* START: Added Company Onboarding Section */}
                <div>
                  <p className="text-sm font-medium mt-2">Company Onboarding</p>
                  {loadingOnboardingData ? (
                    <p className="text-muted-foreground text-sm">Loading data...</p>
                  ) : onboardingData && onboardingData.onboarding_data ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-1 w-full justify-start text-left"
                      onClick={() => setIsOnboardingModalOpen(true)}
                    >
                      View Onboarding Data
                    </Button>
                  ) : (
                    <p className="text-muted-foreground text-sm">No data submitted.</p>
                  )}
                </div>
                {/* END: Added Company Onboarding Section */}

              </div>
            </div>
          </Card>
          
          <Card>
            <div className="p-6 space-y-4">
              <h3 className="text-lg font-medium">Setup Status</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full ${user.command_hq_created ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                    <span className="text-sm">Command HQ Created</span>
                  </div>
                  {editMode ? (
                    <Switch
                      checked={editedUser?.command_hq_created || false}
                      onCheckedChange={(checked) => handleSwitchChange("command_hq_created", checked)}
                    />
                  ) : (
                    <Badge variant="outline">
                      {user.command_hq_created ? 'Yes' : 'No'}
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full ${user.gd_folder_created ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                    <span className="text-sm">GD Folder Created</span>
                  </div>
                  {editMode ? (
                    <Switch
                      checked={editedUser?.gd_folder_created || false}
                      onCheckedChange={(checked) => handleSwitchChange("gd_folder_created", checked)}
                    />
                  ) : (
                    <Badge variant="outline">
                      {user.gd_folder_created ? 'Yes' : 'No'}
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full ${user.meeting_scheduled ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                    <span className="text-sm">Meeting Scheduled</span>
                  </div>
                  {editMode ? (
                    <Switch
                      checked={editedUser?.meeting_scheduled || false}
                      onCheckedChange={(checked) => handleSwitchChange("meeting_scheduled", checked)}
                    />
                  ) : (
                    <Badge variant="outline">
                      {user.meeting_scheduled ? 'Yes' : 'No'}
                    </Badge>
                  )}
                </div>
              </div>
              
              {editMode && (
                <div className="space-y-2 pt-2">
                  <Label htmlFor="command_hq_link">Command HQ Link</Label>
                  <Input
                    id="command_hq_link"
                    name="command_hq_link"
                    placeholder="https://..."
                    value={editedUser?.command_hq_link || ""}
                    onChange={handleInputChange}
                  />
                </div>
              )}
              
              {!editMode && user.command_hq_link && (
                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm">Command HQ Link</span>
                  <Button variant="link" className="h-auto p-0 text-blue-600" asChild>
                    <a href={user.command_hq_link} target="_blank" rel="noopener noreferrer">
                      <LinkIcon className="w-3 h-3 mr-1" />
                      Open
                    </a>
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
        
        {/* Main content area with tabs */}
        <div className="lg:col-span-3 space-y-6">
          {editMode && (
            <Card>
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Edit Profile</h3>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input
                        id="full_name"
                        name="full_name"
                        value={editedUser?.full_name || ""}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={editedUser?.email || ""}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="business_name">Business Name</Label>
                      <Input
                        id="business_name"
                        name="business_name"
                        value={editedUser?.business_name || ""}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone_number">Phone Number</Label>
                      <Input
                        id="phone_number"
                        name="phone_number"
                        value={editedUser?.phone_number || ""}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="payment_option">Payment Option</Label>
                      <Select
                        value={editedUser?.payment_option || ""}
                        onValueChange={(value) => handleSelectChange("payment_option", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment option" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="FULL">Full Payment</SelectItem>
                          <SelectItem value="6_MONTH_SPLIT">6 Month Split</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="payment_remaining">Payment Remaining</Label>
                      <Input
                        id="payment_remaining"
                        name="payment_remaining"
                        type="number"
                        step="0.01"
                        value={editedUser?.payment_remaining.toString() || "0"}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Select
                        value={editedUser?.role || "user"}
                        onValueChange={(value) => handleSelectChange("role", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="super_admin">Super Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}
          
          <Tabs defaultValue="timeline" className="space-y-4">
            <TabsList>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="checklist">Checklist</TabsTrigger>
              <TabsTrigger value="benefits">Benefits</TabsTrigger>
<<<<<<< HEAD
              <TabsTrigger value="battle-plan">Battle Plan</TabsTrigger>
=======
              <TabsTrigger value="business-battle-plan">Battle Plan</TabsTrigger>
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
              <TabsTrigger value="command">Chain of Command</TabsTrigger>
              <TabsTrigger value="hwgt">HWGT Plan</TabsTrigger>
              <TabsTrigger value="machines">Machines</TabsTrigger>
              <TabsTrigger value="meetings">Meetings</TabsTrigger>
              <TabsTrigger value="playbooks">Playbooks</TabsTrigger>
              <TabsTrigger value="quarterly">Quarterly Sprint</TabsTrigger>
<<<<<<< HEAD
              <TabsTrigger value="triage">Triage Planner</TabsTrigger>
=======
              <TabsTrigger value="triage">Company Overview</TabsTrigger>
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
            </TabsList>
            
            <TabsContent value="timeline" className="space-y-4">
              <Card>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Timeline Progress</h3>
                    <Badge variant="outline">
                      {userDetails.timeline.filter(item => item.is_completed).length}/{userDetails.timeline.length} Completed
                    </Badge>
                  </div>
                  
                  {detailsLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                    </div>
                  ) : userDetails.timeline.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No timeline events for this user</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userDetails.timeline
                        .sort((a, b) => a.week_number - b.week_number)
                        .map((event) => (
                          <div key={event.id} className="flex items-start gap-3 pb-4 border-b last:border-0">
                            <div className={`rounded-full w-8 h-8 flex items-center justify-center ${event.is_completed ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                              {event.week_number}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-sm">{event.event_name}</h4>
                                {event.is_completed ? (
                                  <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    Completed
                                  </Badge>
                                ) : (
                                  <Badge variant="outline">Pending</Badge>
                                )}
                              </div>
                              {event.description && (
                                <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                              )}
                              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                <Calendar className="w-3 h-3" />
                                <span>Scheduled: {new Date(event.scheduled_date).toLocaleDateString()}</span>
                                {event.completion_date && (
                                  <>
                                    <span>•</span>
                                    <span>Completed: {new Date(event.completion_date).toLocaleDateString()}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>
            
            <TabsContent value="checklist" className="space-y-4">
              <Card>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Build Checklist</h3>
                    <Badge variant="outline">
                      {userDetails.checklist.filter(item => item.is_completed).length}/{userDetails.checklist.length} Completed
                    </Badge>
                  </div>
                  
                  {detailsLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                    </div>
                  ) : userDetails.checklist.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No checklist items for this user</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {userDetails.checklist.map((item) => (
                        <div key={item.id} className="flex items-start gap-3 py-3 border-b last:border-0">
                          <div className={`flex-shrink-0 w-5 h-5 mt-0.5 rounded-full ${item.is_completed ? 'bg-green-500' : 'border-2 border-gray-300'}`}>
                            {item.is_completed && <CheckCircle2 className="w-5 h-5 text-white" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className={`font-medium text-sm ${item.is_completed ? 'line-through text-muted-foreground' : ''}`}>
                                {item.checklist_item}
                              </h4>
                              {item.is_completed && (
                                <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                                  Completed
                                </Badge>
                              )}
                            </div>
                            {item.notes && (
                              <p className="text-sm text-muted-foreground mt-1">{item.notes}</p>
                            )}
                            {item.completion_date && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Completed on: {new Date(item.completion_date).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>
            
            <TabsContent value="benefits" className="space-y-4">
              <Card>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Available Benefits</h3>
                    <Badge variant="outline">
                      {userDetails.benefits.filter(item => item.is_claimed).length}/{userDetails.benefits.length} Claimed
                    </Badge>
                  </div>
                  
                  {detailsLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                    </div>
                  ) : userDetails.benefits.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No benefits for this user</p>
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {userDetails.benefits.map((benefit) => (
                        <Card key={benefit.id} className={`overflow-hidden ${benefit.is_claimed ? 'border-green-200 bg-green-50/20' : ''}`}>
                          <div className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-full ${benefit.is_claimed ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                  <Gift className="w-4 h-4" />
                                </div>
                                <div>
                                  <h4 className="font-medium">{benefit.benefit_name}</h4>
                                  {benefit.notes && (
                                    <p className="text-sm text-muted-foreground mt-1">{benefit.notes}</p>
                                  )}
                                  {benefit.claimed_date && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Claimed on: {new Date(benefit.claimed_date).toLocaleDateString()}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <Badge className={benefit.is_claimed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                                {benefit.is_claimed ? 'Claimed' : 'Not Claimed'}
                              </Badge>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>
            
<<<<<<< HEAD
            <TabsContent value="battle-plan" className="space-y-4">
=======
            <TabsContent value="business-battle-plan" className="space-y-4">
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
              <Card>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Battle Plan</h3>
                    {userDetails.battlePlan ? (
                      <Badge variant="outline" className="bg-blue-100 text-blue-700">
                        Last Updated: {new Date(userDetails.battlePlan.updated_at).toLocaleDateString()}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-gray-100">
                        Not Created
                      </Badge>
                    )}
                  </div>
                  
                  {detailsLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                    </div>
                  ) : !userDetails.battlePlan ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No battle plan found for this user</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Mission & Vision */}
                      <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                          <h4 className="font-medium">Mission Statement</h4>
                          <Card className="bg-muted/40">
                            <div className="p-4">
                              <p className="text-sm">{userDetails.battlePlan.missionstatement || "Not defined"}</p>
                            </div>
                          </Card>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Vision Statement</h4>
                          <Card className="bg-muted/40">
                            <div className="p-4">
                              <p className="text-sm">{userDetails.battlePlan.visionstatement || "Not defined"}</p>
                            </div>
                          </Card>
                        </div>
                      </div>
                      
                      {/* Business Plan Link */}
                      {userDetails.battlePlan.businessplanlink && (
                        <div className="space-y-2">
                          <h4 className="font-medium">Business Plan Link</h4>
                          <div className="flex">
                            <Button variant="link" className="h-auto p-0 text-blue-600" asChild>
                              <a href={userDetails.battlePlan.businessplanlink} target="_blank" rel="noopener noreferrer">
                                <LinkIcon className="w-3 h-3 mr-1" />
                                {userDetails.battlePlan.businessplanlink}
                              </a>
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      {/* Purpose Why */}
                      <div className="space-y-2">
                        <h4 className="font-medium">Purpose Why</h4>
                        {!userDetails.battlePlan?.purposewhy || userDetails.battlePlan.purposewhy.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No purpose defined</p>
                        ) : (
                          <div className="grid gap-3 sm:grid-cols-2">
                            {userDetails.battlePlan.purposewhy.map((purpose, index) => (
                              <Card key={index} className="bg-blue-50">
                                <div className="p-4">
                                  <p className="text-sm">{typeof purpose === 'string' ? purpose : purpose.text || purpose.purpose || purpose.value || JSON.stringify(purpose)}</p>
                                </div>
                              </Card>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Strategic Anchors */}
                      <div className="space-y-2">
                        <h4 className="font-medium">Strategic Anchors</h4>
                        {!userDetails.battlePlan?.strategicanchors || userDetails.battlePlan.strategicanchors.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No strategic anchors defined</p>
                        ) : (
                          <div className="grid gap-3 sm:grid-cols-2">
                            {userDetails.battlePlan.strategicanchors.map((anchor, index) => (
                              <Card key={index} className="bg-green-50">
                                <div className="p-4">
                                  <p className="text-sm">{typeof anchor === 'string' ? anchor : anchor.text || anchor.anchor || anchor.value || JSON.stringify(anchor)}</p>
                                </div>
                              </Card>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Core Values */}
                      <div className="space-y-2">
                        <h4 className="font-medium">Core Values</h4>
                        {!userDetails.battlePlan?.corevalues || userDetails.battlePlan.corevalues.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No core values defined</p>
                        ) : (
                          <div className="grid gap-3 sm:grid-cols-2">
                            {userDetails.battlePlan.corevalues.map((value, index) => (
                              <Card key={index} className="bg-purple-50">
                                <div className="p-4">
                                  {typeof value === 'string' ? (
                                    <p className="text-sm">{value}</p>
                                  ) : (
                                    <>
                                      <p className="text-sm font-medium">{value.title || value.name || "Value"}</p>
                                      <p className="text-sm">{value.text || value.description || value.content || ""}</p>
                                    </>
                                  )}
                                </div>
                              </Card>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Three Year Target */}
                      <div className="space-y-2">
                        <h4 className="font-medium">Three Year Target</h4>
                        {!userDetails.battlePlan?.threeyeartarget || userDetails.battlePlan.threeyeartarget.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No three year targets defined</p>
                        ) : (
                          <div className="grid gap-3 sm:grid-cols-2">
                            {userDetails.battlePlan.threeyeartarget.map((target, index) => (
                              <Card key={index} className="bg-yellow-50">
                                <div className="p-4">
                                  <p className="text-sm">{typeof target === 'string' ? target : target.text || target.target || target.value || JSON.stringify(target)}</p>
                                </div>
                              </Card>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>
            
            <TabsContent value="command" className="space-y-4">
              <Card>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Chain of Command</h3>
                    <Badge variant="outline">
                      {userDetails.chainOfCommand.length} Team Members
                    </Badge>
                  </div>
                  
                  {detailsLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                    </div>
                  ) : userDetails.chainOfCommand.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No chain of command entries found</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userDetails.chainOfCommand.map((member) => (
                        <Card key={member.id} className="overflow-hidden">
                          <div className="p-4 border-b bg-muted/30">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarFallback className={getRandomColor(member.id)}>
                                    {getInitials(member.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <h4 className="font-medium">{member.name || "Unnamed"}</h4>
                                  <p className="text-sm text-muted-foreground">{member.jobtitle || "No Job Title"}</p>
                                </div>
                              </div>
                              <Badge>{member.department || "No Department"}</Badge>
                            </div>
                          </div>
                          <div className="p-4 space-y-4">
                            {/* Manager */}
                            <div className="space-y-1">
                              <p className="text-sm font-medium">Reports To</p>
                              <p className="text-sm">{member.manager || "Not specified"}</p>
                            </div>
                            
                            {/* Critical Accountabilities */}
                            <div className="space-y-1">
                              <p className="text-sm font-medium">Critical Accountabilities</p>
                              {!member.criticalaccountabilities || 
                               typeof member.criticalaccountabilities === 'string' ||
                               member.criticalaccountabilities.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No accountabilities defined</p>
                              ) : (
                                <ul className="list-disc list-inside space-y-1">
                                  {Array.isArray(member.criticalaccountabilities) && member.criticalaccountabilities.map((item: any, index: number) => (
                                    <li key={index} className="text-sm">
                                      {typeof item === 'string' ? item : 
                                       typeof item === 'object' ? (item.text || item.accountability || item.item || item.value || JSON.stringify(item)) : 
                                       String(item)}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                            
                            {/* Playbooks Owned */}
                            <div className="space-y-1">
                              <p className="text-sm font-medium">Playbooks Owned</p>
                              {!member.playbooksowned || 
                               typeof member.playbooksowned === 'string' ||
                               member.playbooksowned.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No playbooks assigned</p>
                              ) : (
                                <div className="flex flex-wrap gap-2">
                                  {Array.isArray(member.playbooksowned) && member.playbooksowned.map((playbook: any, index: number) => (
                                    <Badge key={index} variant="outline" className="bg-blue-50">
                                      {typeof playbook === 'string' ? playbook : 
                                       typeof playbook === 'object' ? (playbook.name || playbook.title || playbook.playbookname || playbook.value || JSON.stringify(playbook)) : 
                                       String(playbook)}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>
            
            <TabsContent value="hwgt" className="space-y-4">
              <Card>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">How We Get There Plan</h3>
                    {userDetails.hwgtPlan ? (
                      <Badge variant="outline" className="bg-blue-100 text-blue-700">
                        Last Updated: {new Date(userDetails.hwgtPlan.updated_at).toLocaleDateString()}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-gray-100">
                        Not Created
                      </Badge>
                    )}
                  </div>
                  
                  {detailsLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                    </div>
                  ) : !userDetails.hwgtPlan ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No HWGT plan found for this user</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-muted/40">
                              <th className="text-left p-3 border">Category</th>
                              <th className="text-left p-3 border">Q0</th>
                              <th className="text-left p-3 border">Q4</th>
                              <th className="text-left p-3 border">Q8</th>
                              <th className="text-left p-3 border">Q12</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="p-3 border font-medium">Model & Brand</td>
                              <td className="p-3 border text-sm">{userDetails.hwgtPlan.howwegetthereplan.modelBrand?.Q0 || "-"}</td>
                              <td className="p-3 border text-sm">{userDetails.hwgtPlan.howwegetthereplan.modelBrand?.Q4 || "-"}</td>
                              <td className="p-3 border text-sm">{userDetails.hwgtPlan.howwegetthereplan.modelBrand?.Q8 || "-"}</td>
                              <td className="p-3 border text-sm">{userDetails.hwgtPlan.howwegetthereplan.modelBrand?.Q12 || "-"}</td>
                            </tr>
                            <tr>
                              <td className="p-3 border font-medium">Customer Avatars</td>
                              <td className="p-3 border text-sm">{userDetails.hwgtPlan.howwegetthereplan.customerAvatars?.Q0 || "-"}</td>
                              <td className="p-3 border text-sm">{userDetails.hwgtPlan.howwegetthereplan.customerAvatars?.Q4 || "-"}</td>
                              <td className="p-3 border text-sm">{userDetails.hwgtPlan.howwegetthereplan.customerAvatars?.Q8 || "-"}</td>
                              <td className="p-3 border text-sm">{userDetails.hwgtPlan.howwegetthereplan.customerAvatars?.Q12 || "-"}</td>
                            </tr>
                            <tr>
                              <td className="p-3 border font-medium">Products & Services</td>
                              <td className="p-3 border text-sm">{userDetails.hwgtPlan.howwegetthereplan.productsServices?.Q0 || "-"}</td>
                              <td className="p-3 border text-sm">{userDetails.hwgtPlan.howwegetthereplan.productsServices?.Q4 || "-"}</td>
                              <td className="p-3 border text-sm">{userDetails.hwgtPlan.howwegetthereplan.productsServices?.Q8 || "-"}</td>
                              <td className="p-3 border text-sm">{userDetails.hwgtPlan.howwegetthereplan.productsServices?.Q12 || "-"}</td>
                            </tr>
                            <tr>
                              <td className="p-3 border font-medium">Team Organisation</td>
                              <td className="p-3 border text-sm">{userDetails.hwgtPlan.howwegetthereplan.teamOrganisation?.Q0 || "-"}</td>
                              <td className="p-3 border text-sm">{userDetails.hwgtPlan.howwegetthereplan.teamOrganisation?.Q4 || "-"}</td>
                              <td className="p-3 border text-sm">{userDetails.hwgtPlan.howwegetthereplan.teamOrganisation?.Q8 || "-"}</td>
                              <td className="p-3 border text-sm">{userDetails.hwgtPlan.howwegetthereplan.teamOrganisation?.Q12 || "-"}</td>
                            </tr>
                            <tr>
                              <td className="p-3 border font-medium">Customer Acquisition</td>
                              <td className="p-3 border text-sm">{userDetails.hwgtPlan.howwegetthereplan.customerAcquisition?.Q0 || "-"}</td>
                              <td className="p-3 border text-sm">{userDetails.hwgtPlan.howwegetthereplan.customerAcquisition?.Q4 || "-"}</td>
                              <td className="p-3 border text-sm">{userDetails.hwgtPlan.howwegetthereplan.customerAcquisition?.Q8 || "-"}</td>
                              <td className="p-3 border text-sm">{userDetails.hwgtPlan.howwegetthereplan.customerAcquisition?.Q12 || "-"}</td>
                            </tr>
                            <tr>
<<<<<<< HEAD
                              <td className="p-3 border font-medium">Fulfillment Production</td>
=======
                              <td className="p-3 border font-medium">Fulfilment Production</td>
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
                              <td className="p-3 border text-sm">{userDetails.hwgtPlan.howwegetthereplan.fulfillmentProduction?.Q0 || "-"}</td>
                              <td className="p-3 border text-sm">{userDetails.hwgtPlan.howwegetthereplan.fulfillmentProduction?.Q4 || "-"}</td>
                              <td className="p-3 border text-sm">{userDetails.hwgtPlan.howwegetthereplan.fulfillmentProduction?.Q8 || "-"}</td>
                              <td className="p-3 border text-sm">{userDetails.hwgtPlan.howwegetthereplan.fulfillmentProduction?.Q12 || "-"}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>
            
            <TabsContent value="machines" className="space-y-4">
              <Card>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Machines</h3>
                    <Badge variant="outline">
                      {userDetails.machines.length} Machines
                    </Badge>
                  </div>
                  
                  {detailsLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                    </div>
                  ) : userDetails.machines.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No machines found for this user</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {userDetails.machines.map((machine) => (
                        <Card key={machine.id} className="overflow-hidden">
                          <div className="p-4 border-b bg-muted/30">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium">{machine.enginename}</h4>
                                <p className="text-sm text-muted-foreground">{machine.description}</p>
                              </div>
                              <Badge className={
                                machine.enginetype === 'GROWTH' ? 'bg-green-100 text-green-700' :
                                machine.enginetype === 'FULFILLMENT' ? 'bg-blue-100 text-blue-700' :
                                'bg-purple-100 text-purple-700'
                              }>
                                {machine.enginetype}
                              </Badge>
                            </div>
                          </div>
                          <div className="p-4 space-y-4">
                            {/* Triggering Events */}
                            <div className="space-y-2">
                              <h5 className="text-sm font-medium">Triggering Events</h5>
                              {!machine.triggeringevents || 
                               typeof machine.triggeringevents === 'string' ||
                               machine.triggeringevents.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No triggering events defined</p>
                              ) : (
                                <div className="space-y-2">
                                  {Array.isArray(machine.triggeringevents) && machine.triggeringevents.map((event: any, index: number) => (
                                    <Badge key={index} variant="outline" className="mr-2 mb-2">
                                      {typeof event === 'string' ? event : 
                                       typeof event === 'object' ? (event.text || event.event || event.name || event.value || JSON.stringify(event)) : 
                                       String(event)}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                            
                            {/* Ending Event */}
                            <div className="space-y-2">
                              <h5 className="text-sm font-medium">Ending Event</h5>
                              {!machine.endingevent || 
                               typeof machine.endingevent === 'string' ||
                               machine.endingevent.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No ending event defined</p>
                              ) : (
                                <div className="space-y-2">
                                  {Array.isArray(machine.endingevent) && machine.endingevent.map((event: any, index: number) => (
                                    <Badge key={index} variant="outline" className="bg-blue-50 mr-2 mb-2">
                                      {typeof event === 'string' ? event : 
                                       typeof event === 'object' ? (event.text || event.event || event.name || event.value || JSON.stringify(event)) : 
                                       String(event)}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                            
                            {/* Actions & Activities */}
                            <div className="space-y-2">
                              <h5 className="text-sm font-medium">Actions & Activities</h5>
                              {!machine.actionsactivities || 
                               typeof machine.actionsactivities === 'string' ||
                               machine.actionsactivities.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No actions defined</p>
                              ) : (
                                <ul className="list-disc list-inside space-y-1">
                                  {Array.isArray(machine.actionsactivities) && machine.actionsactivities.map((action: any, index: number) => (
                                    <li key={index} className="text-sm">
                                      {typeof action === 'string' ? action : 
                                       typeof action === 'object' ? (action.text || action.action || action.activity || action.name || action.value || JSON.stringify(action)) : 
                                       String(action)}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                            
                            {/* Figma Link */}
                            {machine.figma_link && (
                              <div className="space-y-1">
                                <h5 className="text-sm font-medium">Figma Link</h5>
                                <Button variant="link" className="h-auto p-0 text-blue-600" asChild>
                                  <a href={machine.figma_link} target="_blank" rel="noopener noreferrer">
                                    <LinkIcon className="w-3 h-3 mr-1" />
                                    Open Figma
                                  </a>
                                </Button>
                              </div>
                            )}
                            
                            {/* Figma Embed */}
                            {machine.figma_embed && (
                              <div className="space-y-1">
                                <h5 className="text-sm font-medium">Figma Embed</h5>
                                <div className="border rounded-md p-2 bg-muted/20">
                                  <code className="text-xs">{machine.figma_embed}</code>
                                </div>
                              </div>
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>
            
            <TabsContent value="meetings" className="space-y-4">
              <Card>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Meeting Rhythm Planner</h3>
                    <Badge variant="outline">
                      {userDetails.meetings.length} Meetings
                    </Badge>
                  </div>
                  
                  {detailsLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                    </div>
                  ) : userDetails.meetings.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No meetings found for this user</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex space-x-4">
                          <Badge variant="outline" className="bg-blue-50">Daily</Badge>
                          <Badge variant="outline" className="bg-green-50">Weekly</Badge>
                          <Badge variant="outline" className="bg-yellow-50">Monthly</Badge>
                          <Badge variant="outline" className="bg-purple-50">Quarterly</Badge>
                          <Badge variant="outline" className="bg-pink-50">Annual</Badge>
                        </div>
                      </div>
                      
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-muted/40">
                              <th className="text-left p-3 border">Meeting Type</th>
                              <th className="text-left p-3 border">Title</th>
                              <th className="text-left p-3 border">Date</th>
                              <th className="text-left p-3 border">Description</th>
                            </tr>
                          </thead>
                          <tbody>
                            {userDetails.meetings
                              .sort((a, b) => new Date(a.meeting_date).getTime() - new Date(b.meeting_date).getTime())
                              .map((meeting) => (
                                <tr key={meeting.id}>
                                  <td className="p-3 border">
                                    <Badge className={
                                      meeting.meeting_type === 'DAILY' ? 'bg-blue-100 text-blue-700' :
                                      meeting.meeting_type === 'WEEKLY' ? 'bg-green-100 text-green-700' :
                                      meeting.meeting_type === 'MONTHLY' ? 'bg-yellow-100 text-yellow-700' :
                                      meeting.meeting_type === 'QUARTERLY' ? 'bg-purple-100 text-purple-700' :
                                      'bg-pink-100 text-pink-700'
                                    }>
                                      {meeting.meeting_type}
                                    </Badge>
                                  </td>
                                  <td className="p-3 border font-medium">
                                    {meeting.meeting_title || "Untitled Meeting"}
                                  </td>
                                  <td className="p-3 border text-sm">
                                    {new Date(meeting.meeting_date).toLocaleDateString()}
                                  </td>
                                  <td className="p-3 border text-sm">
                                    {meeting.meeting_description || "-"}
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>
            
            <TabsContent value="playbooks" className="space-y-4">
              <Card>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Playbooks</h3>
                    <Badge variant="outline">
                      {userDetails.playbooks.length} Playbooks
                    </Badge>
                  </div>
                  
                  {detailsLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                    </div>
                  ) : userDetails.playbooks.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No playbooks found for this user</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Playbook Status Summary */}
                      <div className="grid grid-cols-4 gap-3">
                        <Card className="bg-gray-50">
                          <div className="p-3 text-center">
                            <p className="text-sm font-medium">Backlog</p>
                            <p className="text-2xl font-bold mt-1">
                              {userDetails.playbooks.filter(p => p.status === 'Backlog').length}
                            </p>
                          </div>
                        </Card>
                        <Card className="bg-blue-50">
                          <div className="p-3 text-center">
                            <p className="text-sm font-medium">In Progress</p>
                            <p className="text-2xl font-bold mt-1 text-blue-700">
                              {userDetails.playbooks.filter(p => p.status === 'In Progress').length}
                            </p>
                          </div>
                        </Card>
                        <Card className="bg-yellow-50">
                          <div className="p-3 text-center">
                            <p className="text-sm font-medium">Behind</p>
                            <p className="text-2xl font-bold mt-1 text-yellow-700">
                              {userDetails.playbooks.filter(p => p.status === 'Behind').length}
                            </p>
                          </div>
                        </Card>
                        <Card className="bg-green-50">
                          <div className="p-3 text-center">
                            <p className="text-sm font-medium">Completed</p>
                            <p className="text-2xl font-bold mt-1 text-green-700">
                              {userDetails.playbooks.filter(p => p.status === 'Completed').length}
                            </p>
                          </div>
                        </Card>
                      </div>
                      
                      {/* Playbooks List */}
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-muted/40">
                              <th className="text-left p-3 border">Name</th>
                              <th className="text-left p-3 border">Engine Type</th>
                              <th className="text-left p-3 border">Owner</th>
                              <th className="text-left p-3 border">Status</th>
                              <th className="text-left p-3 border">Link</th>
                            </tr>
                          </thead>
                          <tbody>
                            {userDetails.playbooks.map((playbook) => (
                              <tr key={playbook.id}>
                                <td className="p-3 border font-medium">
                                  <div className="flex flex-col">
                                    <span>{playbook.playbookname}</span>
                                    {playbook.description && (
                                      <span className="text-xs text-muted-foreground mt-1">{playbook.description}</span>
                                    )}
                                  </div>
                                </td>
                                <td className="p-3 border">
                                  <Badge className={
                                    playbook.enginetype === 'GROWTH' ? 'bg-green-100 text-green-700' :
                                    playbook.enginetype === 'FULFILLMENT' ? 'bg-blue-100 text-blue-700' :
                                    'bg-purple-100 text-purple-700'
                                  }>
                                    {playbook.enginetype}
                                  </Badge>
                                </td>
                                <td className="p-3 border text-sm">
                                  {playbook.owner || "-"}
                                </td>
                                <td className="p-3 border">
                                  <Badge className={
                                    playbook.status === 'Backlog' ? 'bg-gray-100 text-gray-700' :
                                    playbook.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                                    playbook.status === 'Behind' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-green-100 text-green-700'
                                  }>
                                    {playbook.status}
                                  </Badge>
                                </td>
                                <td className="p-3 border">
                                  {playbook.link ? (
                                    <Button variant="link" className="h-auto p-0 text-blue-600" asChild>
                                      <a href={playbook.link} target="_blank" rel="noopener noreferrer">
                                        <LinkIcon className="w-3 h-3 mr-1" />
                                        Open
                                      </a>
                                    </Button>
                                  ) : (
                                    <span className="text-sm text-muted-foreground">-</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>
            
            <TabsContent value="quarterly" className="space-y-4">
              <Card>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Quarterly Sprint Canvas</h3>
                    {userDetails.quarterlySprint ? (
                      <Badge variant="outline" className="bg-blue-100 text-blue-700">
                        Last Updated: {new Date(userDetails.quarterlySprint.updated_at).toLocaleDateString()}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-gray-100">
                        Not Created
                      </Badge>
                    )}
                  </div>
                  
                  {detailsLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                    </div>
                  ) : !userDetails.quarterlySprint ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No quarterly sprint canvas found for this user</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Theme */}
                      {userDetails.quarterlySprint.theme && (
                        <div className="space-y-2">
                          <h4 className="font-medium">Theme</h4>
                          <Card className="bg-purple-50">
                            <div className="p-4">
                              <p className="text-lg font-medium text-center">{userDetails.quarterlySprint.theme}</p>
                            </div>
                          </Card>
                        </div>
                      )}
                      
                      {/* Revenue Goals */}
                      <div className="space-y-2">
                        <h4 className="font-medium">Revenue Goals</h4>
                        <div className="grid grid-cols-3 gap-4">
                          <Card className="bg-green-50">
                            <div className="p-4 text-center">
                              <p className="text-sm font-medium">GOOD</p>
                              <p className="text-xl mt-1">{userDetails.quarterlySprint.revenuegoals.good || "-"}</p>
                            </div>
                          </Card>
                          <Card className="bg-blue-50">
                            <div className="p-4 text-center">
                              <p className="text-sm font-medium">BETTER</p>
                              <p className="text-xl mt-1">{userDetails.quarterlySprint.revenuegoals.better || "-"}</p>
                            </div>
                          </Card>
                          <Card className="bg-purple-50">
                            <div className="p-4 text-center">
                              <p className="text-sm font-medium">BEST</p>
                              <p className="text-xl mt-1">{userDetails.quarterlySprint.revenuegoals.best || "-"}</p>
                            </div>
                          </Card>
                        </div>
                      </div>
                      
                      {/* Unit Goals */}
                      <div className="space-y-2">
                        <h4 className="font-medium">Unit Goals</h4>
                        {userDetails.quarterlySprint.unitgoals.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No unit goals defined</p>
                        ) : (
                          <div className="grid sm:grid-cols-2 gap-3">
                            {userDetails.quarterlySprint.unitgoals.map((goal, index) => (
                              <Card key={index} className="bg-blue-50/50">
                                <div className="p-4">
                                  <p className="text-sm font-medium">{typeof goal === 'string' ? goal : goal.title || goal.name || "Unit Goal"}</p>
                                  <p className="text-lg mt-1">{typeof goal === 'string' ? "" : goal.value || goal.target || goal.amount || "-"}</p>
                                  {typeof goal !== 'string' && goal.description && (
                                    <p className="text-xs text-muted-foreground mt-1">{goal.description}</p>
                                  )}
                                </div>
                              </Card>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Revenue by Month */}
                      <div className="space-y-2">
                        <h4 className="font-medium">Revenue by Month</h4>
                        {userDetails.quarterlySprint.revenuebymonth.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No monthly revenue targets defined</p>
                        ) : (
                          <div className="grid grid-cols-3 gap-3">
                            {userDetails.quarterlySprint.revenuebymonth.map((month, index) => (
                              <Card key={index} className="bg-green-50/50">
                                <div className="p-4 text-center">
                                  <p className="text-sm font-medium">{typeof month === 'string' ? month : month.month || month.name || `Month ${index + 1}`}</p>
                                  <p className="text-lg mt-1">{typeof month === 'string' ? "" : month.value || month.revenue || month.amount || "-"}</p>
                                </div>
                              </Card>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Strategic Pillars */}
                      <div className="space-y-2">
                        <h4 className="font-medium">Strategic Pillars</h4>
                        {userDetails.quarterlySprint.strategicpillars.every(p => !p) ? (
                          <p className="text-sm text-muted-foreground">No strategic pillars defined</p>
                        ) : (
                          <div className="grid grid-cols-3 gap-3">
                            {userDetails.quarterlySprint.strategicpillars.map((pillar, index) => (
                              pillar && (
                                <Card key={index} className="bg-yellow-50">
                                  <div className="p-4 text-center">
                                    <p className="font-medium">{pillar}</p>
                                  </div>
                                </Card>
                              )
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* North Star Metrics */}
                      <div className="space-y-2">
                        <h4 className="font-medium">North Star Metrics</h4>
                        {userDetails.quarterlySprint.northstarmetrics.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No north star metrics defined</p>
                        ) : (
                          <div className="grid sm:grid-cols-2 gap-3">
                            {userDetails.quarterlySprint.northstarmetrics.map((metric, index) => (
                              <Card key={index} className="bg-blue-50">
                                <div className="p-4">
                                  <div className="flex justify-between items-center">
                                    <p className="font-medium">{typeof metric === 'string' ? metric : metric.name || metric.title || "Metric"}</p>
                                    {typeof metric !== 'string' && metric.category && <Badge>{metric.category}</Badge>}
                                  </div>
                                  {typeof metric !== 'string' && (
                                    <>
                                      <p className="text-sm mt-2">{metric.description || "-"}</p>
                                      {metric.target && (
                                        <div className="mt-2">
                                          <span className="text-sm font-medium">Target: </span>
                                          <span>{metric.target}</span>
                                        </div>
                                      )}
                                    </>
                                  )}
                                </div>
                              </Card>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Key Initiatives */}
                      <div className="space-y-2">
                        <h4 className="font-medium">Key Initiatives</h4>
                        {userDetails.quarterlySprint.keyinitiatives.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No key initiatives defined</p>
                        ) : (
                          <div className="space-y-3">
                            {userDetails.quarterlySprint.keyinitiatives.map((initiative, index) => (
                              <Card key={index}>
                                <div className="p-4">
                                  <div className="flex justify-between items-center">
                                    <p className="font-medium">{typeof initiative === 'string' ? initiative : initiative.name || initiative.title || "Initiative"}</p>
                                    {typeof initiative !== 'string' && initiative.status && (
                                      <Badge className={
                                        initiative.status === 'completed' ? 'bg-green-100 text-green-700' :
                                        initiative.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                                        'bg-gray-100 text-gray-700'
                                      }>
                                        {initiative.status}
                                      </Badge>
                                    )}
                                  </div>
                                  {typeof initiative !== 'string' && (
                                    <>
                                      <p className="text-sm mt-2">{initiative.description || "-"}</p>
                                      {initiative.owner && (
                                        <div className="mt-2 text-sm">
                                          <span className="font-medium">Owner: </span>
                                          <span>{initiative.owner}</span>
                                        </div>
                                      )}
                                    </>
                                  )}
                                </div>
                              </Card>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>
            
            <TabsContent value="triage" className="space-y-4">
              <Card>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
<<<<<<< HEAD
                    <h3 className="text-lg font-medium">Triage Planner</h3>
=======
                    <h3 className="text-lg font-medium">Company Overview</h3>
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
                    {userDetails.triagePlanner ? (
                      <Badge variant="outline" className="bg-blue-100 text-blue-700">
                        Last Updated: {new Date(userDetails.triagePlanner.updated_at).toLocaleDateString()}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-gray-100">
                        Not Created
                      </Badge>
                    )}
                  </div>
                  
                  {detailsLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                    </div>
                  ) : !userDetails.triagePlanner ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No triage planner found for this user</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Company Overview */}
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <h4 className="font-medium">What You Do</h4>
                          <Card className="bg-muted/40">
                            <div className="p-4">
                              <p className="text-sm">{userDetails.triagePlanner.what_you_do || "Not defined"}</p>
                            </div>
                          </Card>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Who You Serve</h4>
                          <Card className="bg-muted/40">
                            <div className="p-4">
                              <p className="text-sm">{userDetails.triagePlanner.who_you_serve || "Not defined"}</p>
                            </div>
                          </Card>
                        </div>
                      </div>
                      
                      {/* Company Info */}
                      {userDetails.triagePlanner && userDetails.triagePlanner.company_info && Object.keys(userDetails.triagePlanner.company_info || {}).length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium">Company Information</h4>
                          <Card>
                            <div className="p-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {Object.entries(userDetails.triagePlanner.company_info || {}).map(([key, value]) => {
                                  // Parse the value depending on the key
                                  const parseValueFromObject = (obj: any): { current: string; target?: string } => {
                                    // If value is already a string, just return it
                                    if (typeof obj !== 'object' || obj === null) {
                                      return { current: String(obj || '-') };
                                    }
                                    
                                    // Try to extract key-value pairs from the object
                                    const strValue = JSON.stringify(obj);
                                    let result: { current: string; target?: string } = { current: '-' };
                                    
                                    // Handle common patterns like "target:X,current:Y"
                                    if (strValue.includes('target') && strValue.includes('current')) {
                                      const current = (obj.current !== undefined) ? obj.current : 
                                        strValue.match(/current:([^,}]+)/i)?.[1] || '-';
                                      const target = (obj.target !== undefined) ? obj.target : 
                                        strValue.match(/target:([^,}]+)/i)?.[1] || '-';
                                      result = { current: String(current), target: String(target) };
                                    } else {
                                      // Use the first property as the value
                                      result = { current: obj.value || obj.text || obj.name || strValue.replace(/[{}"]/g, '') };
                                    }
                                    
                                    return result;
                                  };
                                  
                                  const parsedValue = parseValueFromObject(value);
                                  const hasTarget = parsedValue.target !== undefined;
                                  
                                  // Format the values based on the key
                                  const formatValue = (val: string, keyName: string): string => {
                                    if (val === '-') return '-';
                                    
                                    if (keyName.toLowerCase().includes('revenue') || 
                                        keyName.toLowerCase().includes('income') || 
                                        keyName.toLowerCase().includes('sale')) {
                                      // Format currency values
                                      return val.startsWith('$') ? val : 
                                        val.startsWith('£') ? val : 
                                        `£${val}`;
                                    } else if (keyName.toLowerCase().includes('margin') || 
                                              keyName.toLowerCase().includes('rate') || 
                                              keyName.toLowerCase().includes('percentage')) {
                                      // Format percentage values
                                      return val.endsWith('%') ? val : `${val}%`;
                                    }
                                    
                                    return val;
                                  };
                                  
                                  const formattedCurrent = formatValue(parsedValue.current, key);
                                  const formattedTarget = parsedValue.target ? formatValue(parsedValue.target, key) : undefined;
                                  
                                  return (
                                    <div key={key} className="border rounded-md p-4 bg-muted/10">
                                      <p className="text-sm font-medium capitalize mb-2 text-blue-700">
                                        {key.replace(/_/g, ' ')}
                                      </p>
                                      
                                      {hasTarget ? (
                                        <div className="space-y-2">
                                          <div className="flex justify-between items-center">
                                            <span className="text-xs text-muted-foreground">Current</span>
                                            <span className="font-semibold text-lg">{formattedCurrent}</span>
                                          </div>
                                          
                                          <div className="flex justify-between items-center">
                                            <span className="text-xs text-muted-foreground">Target</span>
                                            <span className="font-semibold text-lg text-blue-600">{formattedTarget}</span>
                                          </div>
                                          
                                          {/* Progress visualization if we can calculate percentage */}
                                          {key.toLowerCase().includes('revenue') && 
                                           parseFloat(parsedValue.current.replace(/[^\d.-]/g, '')) > 0 && 
                                           parseFloat(parsedValue.target?.replace(/[^\d.-]/g, '') || '0') > 0 && (
                                            <div className="mt-2">
                                              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                                <div 
                                                  className="h-full bg-blue-500 transition-all duration-500" 
                                                  style={{ 
                                                    width: `${Math.min(100, (parseFloat(parsedValue.current.replace(/[^\d.-]/g, '')) / parseFloat(parsedValue.target?.replace(/[^\d.-]/g, '') || '1')) * 100)}%` 
                                                  }}
                                                />
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      ) : (
                                        <p className="font-semibold text-lg">{formattedCurrent}</p>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </Card>
                        </div>
                      )}
                      
                      {/* Four Quadrants */}
                      <div className="grid md:grid-cols-2 gap-4">
                        {/* What's Right */}
                        <Card className="bg-green-50">
                          <div className="p-4">
                            <h4 className="font-medium mb-2">What's Right</h4>
                            {userDetails.triagePlanner.what_is_right.length === 0 ? (
                              <p className="text-sm text-muted-foreground">Nothing identified</p>
                            ) : (
                              <ul className="list-disc list-inside space-y-1">
                                {userDetails.triagePlanner.what_is_right.map((item, index) => (
                                  <li key={index} className="text-sm">
                                    {typeof item === 'string' ? item : item.text || item.content || JSON.stringify(item)}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </Card>
                        
                        {/* What's Wrong */}
                        <Card className="bg-red-50">
                          <div className="p-4">
                            <h4 className="font-medium mb-2">What's Wrong</h4>
                            {userDetails.triagePlanner.what_is_wrong.length === 0 ? (
                              <p className="text-sm text-muted-foreground">Nothing identified</p>
                            ) : (
                              <ul className="list-disc list-inside space-y-1">
                                {userDetails.triagePlanner.what_is_wrong.map((item, index) => (
                                  <li key={index} className="text-sm">
                                    {typeof item === 'string' ? item : item.text || item.content || JSON.stringify(item)}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </Card>
                        
                        {/* What's Missing */}
                        <Card className="bg-amber-50">
                          <div className="p-4">
                            <h4 className="font-medium mb-2">What's Missing</h4>
                            {userDetails.triagePlanner.what_is_missing.length === 0 ? (
                              <p className="text-sm text-muted-foreground">Nothing identified</p>
                            ) : (
                              <ul className="list-disc list-inside space-y-1">
                                {userDetails.triagePlanner.what_is_missing.map((item, index) => (
                                  <li key={index} className="text-sm">
                                    {typeof item === 'string' ? item : item.text || item.content || JSON.stringify(item)}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </Card>
                        
                        {/* What's Confusing */}
                        <Card className="bg-blue-50">
                          <div className="p-4">
                            <h4 className="font-medium mb-2">What's Confusing</h4>
                            {userDetails.triagePlanner.what_is_confusing.length === 0 ? (
                              <p className="text-sm text-muted-foreground">Nothing identified</p>
                            ) : (
                              <ul className="list-disc list-inside space-y-1">
                                {userDetails.triagePlanner.what_is_confusing.map((item, index) => (
                                  <li key={index} className="text-sm">
                                    {typeof item === 'string' ? item : item.text || item.content || JSON.stringify(item)}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </Card>
                      </div>
                      
                      {/* Internal Tasks */}
                      <div className="space-y-2">
                        <h4 className="font-medium">Internal Tasks</h4>
                        {userDetails.triagePlanner.internal_tasks.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No internal tasks defined</p>
                        ) : (
                          <div className="space-y-3">
                            {userDetails.triagePlanner.internal_tasks.map((task, index) => (
                              <Card key={index} className="overflow-hidden">
                                <div className="p-4 flex items-start gap-3">
                                  <div className={`flex-shrink-0 w-5 h-5 mt-0.5 rounded-full ${task.completed ? 'bg-green-500' : 'border-2 border-gray-300'}`}>
                                    {task.completed && <CheckCircle2 className="w-5 h-5 text-white" />}
                                  </div>
                                  <div className="flex-1">
                                    <p className={`text-sm font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                                      {typeof task === 'string' ? task : task.text || task.title || task.description || "Task"}
                                    </p>
                                    {typeof task !== 'string' && task.assignee && (
                                      <p className="text-xs text-muted-foreground mt-1">
                                        Assigned to: {task.assignee}
                                      </p>
                                    )}
                                    {typeof task !== 'string' && task.due_date && (
                                      <p className="text-xs text-muted-foreground mt-1">
                                        Due: {new Date(task.due_date).toLocaleDateString()}
                                      </p>
                                    )}
                                  </div>
                                  {typeof task !== 'string' && task.priority && (
                                    <Badge className={
                                      task.priority === 'high' ? 'bg-red-100 text-red-700' :
                                      task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                      'bg-blue-100 text-blue-700'
                                    }>
                                      {task.priority}
                                    </Badge>
                                  )}
                                </div>
                              </Card>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Notes */}
                      {userDetails.triagePlanner.notes && (
                        <div className="space-y-2">
                          <h4 className="font-medium">Notes</h4>
                          <Card className="bg-muted/30">
                            <div className="p-4">
                              <p className="text-sm whitespace-pre-line">{userDetails.triagePlanner.notes}</p>
                            </div>
                          </Card>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Add the Modal component here, within the main return structure */}
      <OnboardingDataModal
        isOpen={isOnboardingModalOpen}
        onClose={() => setIsOnboardingModalOpen(false)}
        data={onboardingData?.onboarding_data} // Pass the actual JSONB data
        companyName={user?.business_name || "Company"} // Changed from userName to companyName, using business_name
      />

    </div>
  );
}