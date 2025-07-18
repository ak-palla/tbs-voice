"use client";

import { useState, useEffect } from "react";
<<<<<<< HEAD
=======
import { useRouter } from "next/navigation";
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Loader2, 
  Search, 
  User, 
  UserPlus, 
  Plus, 
  Building,
  Mail, 
  Phone,
  CreditCard,
  Eye,
<<<<<<< HEAD
=======
  MoreHorizontal,
  KeyRound,
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
<<<<<<< HEAD
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
=======
import { CustomDropdown } from "@/components/ui/custom-dropdown";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a

// Define types
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
<<<<<<< HEAD
=======
  team_id?: string;
  team_admin?: {
    business_name: string;
    full_name: string;
  };
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
}

interface TimelineEvent {
  id: string;
  event_name: string;
  week_number: number;
  description?: string;
  is_completed?: boolean;
  completion_date?: string;
}

interface ChecklistItem {
  id: string;
  checklist_item: string;
  description?: string;
  is_completed?: boolean;
  completion_date?: string;
}

interface Benefit {
  id: string;
  benefit_title: string;
  benefit_description: string | null;
  is_claimed?: boolean;
  claimed_date?: string;
}

interface NewUserForm {
  email: string;
  password: string;
  full_name: string;
  business_name: string;
  phone_number: string;
  payment_option: string;
  payment_remaining: number;
  command_hq_link: string;
  command_hq_created: boolean;
  gd_folder_created: boolean;
  meeting_scheduled: boolean;
  role: string;
}

export default function UserManagementPage() {
<<<<<<< HEAD
=======
  const router = useRouter();
  
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
  // State
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [userDetails, setUserDetails] = useState({
    timeline: [] as TimelineEvent[],
    checklist: [] as ChecklistItem[],
    benefits: [] as Benefit[],
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
<<<<<<< HEAD
=======
  const [showTeamMembers, setShowTeamMembers] = useState(false);
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
  const [newUserForm, setNewUserForm] = useState<NewUserForm>({
    email: "",
    password: "",
    full_name: "",
    business_name: "",
    phone_number: "",
    payment_option: "FULL",
    payment_remaining: 0,
    command_hq_link: "",
    command_hq_created: false,
    gd_folder_created: false,
    meeting_scheduled: false,
<<<<<<< HEAD
    role: "user",
  });
  const supabase = createClient();
=======
    role: "admin",
  });
  const supabase = createClient();
  
  // Current user role for superadmin check
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a

  // Fetch users on load
  useEffect(() => {
    fetchUsers();
<<<<<<< HEAD
=======
    fetchCurrentUserRole();
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
<<<<<<< HEAD
      // Fetch user profiles from business_info table
=======
      // First, fetch all user profiles
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
      const { data: profiles, error } = await supabase
        .from('business_info')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      
      console.log("Fetched profiles:", profiles); // Debug log
      
      if (!profiles || profiles.length === 0) {
        console.log("No profiles found");
        setUsers([]);
        return;
      }
      
<<<<<<< HEAD
      setUsers(profiles);
=======
      // Get unique team IDs
      const teamIds = Array.from(new Set(profiles.map(p => p.team_id).filter(Boolean)));
      
      // Fetch team admin information
      let teamAdmins: any[] = [];
      if (teamIds.length > 0) {
        const { data: admins, error: adminError } = await supabase
          .from('business_info')
          .select('user_id, business_name, full_name')
          .in('user_id', teamIds);
        
        if (adminError) {
          console.error("Error fetching team admins:", adminError);
        } else {
          teamAdmins = admins || [];
        }
      }
      
      // Merge profiles with team admin info
      const profilesWithTeamAdmin = profiles.map(profile => ({
        ...profile,
        team_admin: profile.team_id 
          ? teamAdmins.find(admin => admin.user_id === profile.team_id) || null
          : null
      }));
      
      setUsers(profilesWithTeamAdmin);
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async (userId: string) => {
    try {
      setDetailsLoading(true);
      
      // Fetch timeline items with user claims
      const { data: timeline, error: timelineError } = await supabase
        .from('chq_timeline')
        .select(`
          id,
          event_name,
          week_number,
          description,
          user_timeline_claims (
            is_completed,
            completion_date
          )
        `)
        .order('week_number', { ascending: true });
      
      if (timelineError) throw timelineError;

      // Fetch checklist items with user claims
      const { data: checklist, error: checklistError } = await supabase
        .from('chq_checklist')
        .select(`
          id,
          checklist_item,
          description,
          user_checklist_claims (
            is_completed,
            completion_date
          )
        `);
      
      if (checklistError) throw checklistError;

      // Fetch benefits with user claims
      const { data: benefits, error: benefitsError } = await supabase
        .from('chq_benefits')
        .select(`
          id,
          benefit_title,
          benefit_description,
          user_benefit_claims (
            is_claimed,
            claimed_date
          )
        `);
      
      if (benefitsError) throw benefitsError;

      // Transform data to include claim status
      const formattedTimeline = timeline?.map(item => ({
        id: item.id,
        event_name: item.event_name,
        week_number: item.week_number,
        description: item.description,
        is_completed: item.user_timeline_claims.length > 0 ? item.user_timeline_claims[0].is_completed : false,
        completion_date: item.user_timeline_claims.length > 0 ? item.user_timeline_claims[0].completion_date : null,
      })) || [];

      const formattedChecklist = checklist?.map(item => ({
        id: item.id,
        checklist_item: item.checklist_item,
        description: item.description,
        is_completed: item.user_checklist_claims.length > 0 ? item.user_checklist_claims[0].is_completed : false,
        completion_date: item.user_checklist_claims.length > 0 ? item.user_checklist_claims[0].completion_date : null,
      })) || [];

      const formattedBenefits = benefits?.map(item => ({
        id: item.id,
        benefit_title: item.benefit_title,
        benefit_description: item.benefit_description,
        is_claimed: item.user_benefit_claims.length > 0 ? item.user_benefit_claims[0].is_claimed : false,
        claimed_date: item.user_benefit_claims.length > 0 ? item.user_benefit_claims[0].claimed_date : null,
      })) || [];

      setUserDetails({
        timeline: formattedTimeline,
        checklist: formattedChecklist,
        benefits: formattedBenefits,
      });
    } catch (error) {
      console.error("Error fetching user details:", error);
      toast.error("Failed to load user details");
    } finally {
      setDetailsLoading(false);
    }
  };

<<<<<<< HEAD
=======
  const fetchCurrentUserRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile, error } = await supabase
          .from('business_info')
          .select('role')
          .eq('user_id', user.id)
          .single();
        
        if (!error && profile) {
          setCurrentUserRole(profile.role);
        }
      }
    } catch (error) {
      console.error("Error fetching current user role:", error);
    }
  };



>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
  const handleViewDetails = (user: UserProfile) => {
    setSelectedUser(user);
    if (user.user_id) {
      fetchUserDetails(user.user_id);
    }
    setIsDialogOpen(true);
  };

  const handleCreateUser = async () => {
    if (!newUserForm.email || !newUserForm.password || !newUserForm.full_name || !newUserForm.business_name) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setIsCreatingUser(true);

      // Use signUp instead of admin.createUser
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUserForm.email,
        password: newUserForm.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      });

      if (authError) {
        throw authError;
      }

      if (!authData.user) {
        throw new Error("Failed to create user");
      }

      // Create business_info record
      const { error: businessError } = await supabase
        .from('business_info')
        .insert({
          user_id: authData.user.id,
<<<<<<< HEAD
=======
          team_id: authData.user.id,
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
          full_name: newUserForm.full_name,
          business_name: newUserForm.business_name,
          email: newUserForm.email,
          phone_number: newUserForm.phone_number,
          payment_option: newUserForm.payment_option,
          payment_remaining: newUserForm.payment_remaining,
          command_hq_link: newUserForm.command_hq_link,
          command_hq_created: newUserForm.command_hq_created,
          gd_folder_created: newUserForm.gd_folder_created,
          meeting_scheduled: newUserForm.meeting_scheduled,
          role: newUserForm.role,
        });

      if (businessError) {
        throw businessError;
      }

      toast.success("User created successfully. Email verification sent.");
      setIsCreateDialogOpen(false);
      
      // Reset form
      setNewUserForm({
        email: "",
        password: "",
        full_name: "",
        business_name: "",
        phone_number: "",
        payment_option: "FULL",
        payment_remaining: 0,
        command_hq_link: "",
        command_hq_created: false,
        gd_folder_created: false,
        meeting_scheduled: false,
<<<<<<< HEAD
        role: "user",
=======
        role: "admin",
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
      });
      
      // Refresh users list
      fetchUsers();
    } catch (error: any) {
      console.error("Error creating user:", error);
      toast.error(error.message || "Failed to create user");
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewUserForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setNewUserForm(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setNewUserForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

<<<<<<< HEAD
  const filteredUsers = users.filter(user => {
=======
  // Separate regular users from team members
  const regularUsers = users.filter(user => 
    user.role !== 'super_admin' && (!user.team_id || user.role === 'admin')
  );
  
  const teamMembers = users.filter(user => 
    user.team_id && user.role === 'user'
  );

  const displayUsers = showTeamMembers ? [...regularUsers, ...teamMembers] : regularUsers;

  const filteredUsers = displayUsers.filter(user => {
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
    const searchTermLower = searchTerm.toLowerCase();
    return (
      user.full_name.toLowerCase().includes(searchTermLower) ||
      user.business_name.toLowerCase().includes(searchTermLower) ||
      user.email.toLowerCase().includes(searchTermLower)
    );
  });

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-muted-foreground mt-1">
            View, create, and manage user accounts
          </p>
<<<<<<< HEAD
=======
          <div className="flex gap-4 mt-3">
            <div className="text-sm">
              <span className="font-medium">{regularUsers.length}</span> regular users
            </div>
            <div className="text-sm text-orange-600">
              <span className="font-medium">{teamMembers.length}</span> team members
            </div>
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">{users.filter(u => u.role === 'super_admin').length}</span> super admins (hidden)
            </div>
          </div>
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <UserPlus className="w-4 h-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Create New User
              </DialogTitle>
              <DialogDescription>
                Create a new user account and business profile.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-5 py-4">
              <div className="space-y-5">
                <h3 className="font-medium text-sm text-blue-600">Account Information</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="user@example.com"
                      value={newUserForm.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password <span className="text-red-500">*</span></Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      value={newUserForm.password}
                      onChange={handleInputChange}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Must be at least 6 characters.
                    </p>
                  </div>
<<<<<<< HEAD
                  
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select
                      name="role"
                      value={newUserForm.role}
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
=======
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
                </div>
              </div>
              
              <div className="space-y-5">
                <h3 className="font-medium text-sm text-blue-600">Personal & Business Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="full_name"
                      name="full_name"
                      placeholder="John Doe"
                      value={newUserForm.full_name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="business_name">Business Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="business_name"
                      name="business_name"
                      placeholder="Acme Inc."
                      value={newUserForm.business_name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone_number">Phone Number</Label>
          <Input
                      id="phone_number"
                      name="phone_number"
                      placeholder="+1 (555) 555-5555"
                      value={newUserForm.phone_number}
                      onChange={handleInputChange}
          />
        </div>
                </div>
              </div>
              
              <div className="space-y-5">
                <h3 className="font-medium text-sm text-blue-600">Payment Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="payment_option">Payment Option</Label>
<<<<<<< HEAD
                    <Select
                      name="payment_option"
                      value={newUserForm.payment_option}
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
=======
                    <CustomDropdown
                      options={[
                        { value: "FULL", label: "Full Payment" },
                        { value: "6_MONTH_SPLIT", label: "6 Month Split" },
                      ]}
                      value={newUserForm.payment_option}
                      onChange={(value) => handleSelectChange("payment_option", value)}
                      placeholder="Select payment option"
                    />
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
      </div>

                  <div className="space-y-2">
                    <Label htmlFor="payment_remaining">Payment Remaining (EX VAT)</Label>
                    <Input
                      id="payment_remaining"
                      name="payment_remaining"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={newUserForm.payment_remaining.toString()}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
          </div>
              
              <div className="space-y-5">
                <h3 className="font-medium text-sm text-blue-600">Setup Information</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="command_hq_link">Command HQ Link</Label>
                    <Input
                      id="command_hq_link"
                      name="command_hq_link"
                      placeholder="https://..."
                      value={newUserForm.command_hq_link}
                      onChange={handleInputChange}
                    />
          </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="command_hq_created">Command HQ Created</Label>
                      <Switch
                        id="command_hq_created"
                        checked={newUserForm.command_hq_created}
                        onCheckedChange={(checked) => handleSwitchChange("command_hq_created", checked)}
                      />
          </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="gd_folder_created">GD Folder Created</Label>
                      <Switch
                        id="gd_folder_created"
                        checked={newUserForm.gd_folder_created}
                        onCheckedChange={(checked) => handleSwitchChange("gd_folder_created", checked)}
                      />
          </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="meeting_scheduled">3-1 Meeting Scheduled</Label>
                      <Switch
                        id="meeting_scheduled"
                        checked={newUserForm.meeting_scheduled}
                        onCheckedChange={(checked) => handleSwitchChange("meeting_scheduled", checked)}
                      />
                    </div>
                  </div>
                </div>
          </div>
          </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsCreateDialogOpen(false)}
                disabled={isCreatingUser}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateUser}
                disabled={isCreatingUser}
              >
                {isCreatingUser ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>Create User</>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
          </div>

      <Card className="p-4">
<<<<<<< HEAD
        <div className="flex items-center gap-2 mb-6">
=======
        <div className="flex items-center gap-4 mb-6">
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
<<<<<<< HEAD
      </div>
=======
          
          <div className="flex items-center gap-2">
            <Switch
              id="show-team-members"
              checked={showTeamMembers}
              onCheckedChange={setShowTeamMembers}
            />
            <Label htmlFor="show-team-members" className="text-sm whitespace-nowrap">
              Show team members ({teamMembers.length})
            </Label>
          </div>
        </div>

        {!showTeamMembers && teamMembers.length > 0 && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>{teamMembers.length} team member{teamMembers.length !== 1 ? 's' : ''}</strong> hidden. 
              Team members are managed by their team admins and cannot be directly administered.
            </p>
          </div>
        )}

        <div className="mb-4 text-sm text-muted-foreground">
          Showing {filteredUsers.length} of {displayUsers.length} users
          {showTeamMembers && teamMembers.length > 0 && (
            <span className="text-blue-600 ml-2">
              (includes {teamMembers.filter(member => 
                member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                member.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                member.email.toLowerCase().includes(searchTerm.toLowerCase())
              ).length} team members)
            </span>
          )}
        </div>
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a

        <div className="rounded-md border">
        <Table>
            <TableHeader>
            <TableRow>
                <TableHead className="w-12"></TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Business</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
                <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                    {searchTerm 
                      ? "No users found matching your search." 
                      : "No users found. Create your first user by clicking the Add User button."}
                </TableCell>
              </TableRow>
            ) : (
<<<<<<< HEAD
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.profile_picture_url || ""} alt={user.full_name} />
                      <AvatarFallback className={getRandomColor(user.id)}>
                        {getInitials(user.full_name)}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">{user.full_name}</TableCell>
                  <TableCell>{user.business_name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge className={getRoleBadgeColor(user.role)}>
                        {user.role}
                      </Badge>
                    </TableCell>
                  <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                      <Link href={`/admin/users/${user.id}`}>
                        <Button variant="outline" size="sm" className="gap-1">
                          <Eye className="h-3.5 w-3.5" />
                          View
                    </Button>
                      </Link>
                  </TableCell>
                </TableRow>
              ))
=======
              filteredUsers.map((user) => {
                const isTeamMember = user.team_id && user.role === 'user';
                return (
                  <TableRow 
                    key={user.id}
                    className={isTeamMember ? 'bg-orange-50 hover:bg-orange-100' : ''}
                  >
                    <TableCell>
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.profile_picture_url || ""} alt={user.full_name} />
                        <AvatarFallback className={getRandomColor(user.id)}>
                          {getInitials(user.full_name)}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {user.full_name}
                        {isTeamMember && (
                          <Badge variant="outline" className="text-xs bg-orange-100 text-orange-700 border-orange-300">
                            Team Member
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        {user.business_name}
                        {isTeamMember && user.team_admin && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Team: {user.team_admin.business_name}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge className={getRoleBadgeColor(user.role)}>
                          {user.role}
                        </Badge>
                        {isTeamMember && (
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-300">
                            In Team
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      {isTeamMember ? (
                        <div className="text-xs text-muted-foreground">
                          Managed by team admin
                        </div>
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => router.push(`/admin/users/${user.id}`)}
                              className="flex items-center cursor-pointer"
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            {currentUserRole === 'super_admin' && (
                              <DropdownMenuItem 
                                onClick={() => router.push(`/admin/users/${user.id}/reset-password`)}
                                className="flex items-center cursor-pointer text-red-600"
                              >
                                <KeyRound className="mr-2 h-4 w-4" />
                                Reset Password
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
            )}
          </TableBody>
        </Table>
        </div>
      </Card>
<<<<<<< HEAD
=======


>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
    </div>
  );
} 