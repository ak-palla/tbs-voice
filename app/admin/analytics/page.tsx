"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/loading-spinner";
import { 
  BarChart3, 
  LinkIcon, 
  ExternalLink, 
  CheckCircle, 
  AlertCircle,
  Unlink,
  RefreshCw,
  Users,
  Building,
  Shield,
  TrendingUp,
  Activity,
  Search,
  MoreVertical,
  User,
  Calendar,
  UserCheck,
  X
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import { cn } from "@/lib/utils";

interface AnalyticsAccount {
  name: string;
  displayName: string;
  properties: AnalyticsProperty[];
}

interface AnalyticsProperty {
  name: string;
  displayName: string;
  propertyType: string;
}

interface Assignment {
  id: string;
  assigned_user_id: string;
  property_id: string;
  property_name: string;
  account_name: string;
  assigned_at: string;
  assigned_user: {
    full_name: string;
    business_name: string;
    email: string;
  };
}

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  business_name: string;
  email: string;
  profile_picture_url?: string;
  role: string;
  team_id?: string;
}

export default function AnalyticsManagementPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<AnalyticsAccount[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [assigning, setAssigning] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [disconnecting, setDisconnecting] = useState(false);
  const [showAssignmentView, setShowAssignmentView] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [propertySearchTerm, setPropertySearchTerm] = useState("");
  const supabase = createClient();

  useEffect(() => {
    checkConnectionStatus();
    fetchAssignments();
    fetchUsers();
  }, []);

  // Reset selected property when account changes
  useEffect(() => {
    setSelectedProperty('');
  }, [selectedAccount]);

  const fetchUsers = async () => {
    try {
      const { data: profiles, error } = await supabase
        .from('business_info')
        .select('id, user_id, full_name, business_name, email, profile_picture_url, role, team_id, created_at')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setUsers(profiles || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    }
  };

  const checkConnectionStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/superadmin/analytics-properties');
      
      if (response.ok) {
        const data = await response.json();
        setAccounts(data.accounts || []);
        setIsConnected(true);
      } else if (response.status === 404) {
        setIsConnected(false);
        setAccounts([]);
      } else {
        console.error('Error checking connection status');
        setIsConnected(false);
      }
    } catch (error) {
      console.error('Error checking connection:', error);
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async () => {
    try {
      const response = await fetch('/api/superadmin/assign-analytics');
      if (response.ok) {
        const data = await response.json();
        setAssignments(data.assignments || []);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  const handleConnect = async () => {
    try {
      setConnecting(true);
      
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      
      if (!clientId) {
        toast.error('Google OAuth is not configured');
        return;
      }
      
      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: `${window.location.origin}/api/auth/google/superadmin-callback`,
        response_type: 'code',
        scope: [
          'openid',
          'email',
          'profile',
          'https://www.googleapis.com/auth/analytics.readonly',
          'https://www.googleapis.com/auth/analytics.manage.users.readonly'
        ].join(' '),
        access_type: 'offline',
        prompt: 'consent',
      });

      window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    } catch (error) {
      console.error('Error initiating Google connection:', error);
      setConnecting(false);
    }
  };

  const handleAssignProperty = async () => {
    if (!selectedUser || !selectedProperty) {
      toast.error('Please select both user and property');
      return;
    }

    try {
      setAssigning(true);

      const selectedAccountData = accounts.find(acc => acc.name === selectedAccount);
      const selectedPropertyData = selectedAccountData?.properties.find(prop => prop.name === selectedProperty);

      const response = await fetch('/api/superadmin/assign-analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assigned_user_id: selectedUser,
          property_id: selectedProperty,
          property_name: selectedPropertyData?.displayName,
          account_name: selectedAccountData?.displayName,
        }),
      });

      if (response.ok) {
        toast.success('Analytics property assigned successfully');
        setIsAssignDialogOpen(false);
        setSelectedUser('');
        setSelectedAccount('');
        setSelectedProperty('');
        await fetchAssignments();
        await fetchUsers(); // Refresh users list
        // Keep the assignment view open to allow multiple assignments
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to assign property');
      }
    } catch (error) {
      console.error('Error assigning property:', error);
      toast.error('Failed to assign property');
    } finally {
      setAssigning(false);
    }
  };

  const handleRemoveAssignment = async (userId: string) => {
    try {
      console.log('Attempting to remove assignment for user:', userId);
      
      const response = await fetch('/api/superadmin/assign-analytics', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assigned_user_id: userId }),
      });

      if (response.ok) {
        toast.success('Assignment removed successfully');
        await fetchAssignments();
        await fetchUsers(); // Refresh users list to update status
      } else {
        const error = await response.json();
        console.error('API Error:', error);
        toast.error(error.message || error.error || 'Failed to remove assignment');
      }
    } catch (error) {
      console.error('Error removing assignment:', error);
      toast.error('Network error: Failed to remove assignment');
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect your Google Analytics account? This will remove all user assignments.')) {
      return;
    }

    try {
      setDisconnecting(true);
      
      // First remove all assignments
      for (const assignment of assignments) {
        await handleRemoveAssignment(assignment.assigned_user_id);
      }

      // Then disconnect the account
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from('superadmin_google_analytics_tokens')
          .delete()
          .eq('superadmin_user_id', user.id);

        if (error) {
          throw error;
        }
      }

      toast.success('Google Analytics account disconnected successfully');
      setIsConnected(false);
      setAccounts([]);
      setAssignments([]);
    } catch (error) {
      console.error('Error disconnecting account:', error);
      toast.error('Failed to disconnect account');
    } finally {
      setDisconnecting(false);
    }
  };

  const getSelectedAccountProperties = () => {
    const selectedAccountData = accounts.find(acc => acc.name === selectedAccount);
    return selectedAccountData?.properties || [];
  };

  const getUnassignedUsers = () => {
    const assignedUserIds = assignments.map(a => a.assigned_user_id);
    return users.filter(user => {
      // Exclude superadmins from assignment logic
      if (user.role === 'super_admin') {
        return false;
      }
      
      // Filter out already assigned users
      if (assignedUserIds.includes(user.user_id)) {
        return false;
      }
      
      // Filter out team members if their admin is already assigned
      if (user.role !== 'admin' && user.team_id) {
        const teamAdmin = users.find(u => 
          u.team_id === user.team_id && 
          u.role === 'admin'
        );
        if (teamAdmin && assignedUserIds.includes(teamAdmin.user_id)) {
          return false;
        }
      }
      
      return true;
    });
  };

  const isPropertyAssigned = (propertyId: string) => {
    return assignments.some(a => a.property_id === propertyId);
  };

  const getPropertyAssignment = (propertyId: string) => {
    return assignments.find(a => a.property_id === propertyId);
  };

  const isUserAssigned = (userId: string) => {
    return assignments.some(a => a.assigned_user_id === userId);
  };

  const isUserBlockedByTeam = (user: UserProfile) => {
    if (user.role === 'admin' || !user.team_id) {
      return false;
    }
    
    const assignedUserIds = assignments.map(a => a.assigned_user_id);
    const teamAdmin = users.find(u => 
      u.team_id === user.team_id && 
      u.role === 'admin'
    );
    
    return teamAdmin && assignedUserIds.includes(teamAdmin.user_id);
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
    const hash = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const filteredAssignments = assignments.filter(assignment => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      assignment.assigned_user?.full_name.toLowerCase().includes(searchTermLower) ||
      assignment.assigned_user?.business_name.toLowerCase().includes(searchTermLower) ||
      assignment.assigned_user?.email.toLowerCase().includes(searchTermLower) ||
      assignment.property_name.toLowerCase().includes(searchTermLower)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
        <span className="ml-2 text-gray-600">Loading Google Analytics status...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-blue-600" />
          Google Analytics Management
        </h1>
        <p className="text-muted-foreground mt-1">
          Connect Google Analytics and assign properties to users
        </p>
      </div>

      {/* Connection Status Card */}
      {!isConnected ? (
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <BarChart3 className="h-10 w-10 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Connect Your Google Analytics</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Connect your Google Analytics account to manage and assign properties to your users. This will allow users to view their analytics data directly in the dashboard.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                <Button
                  onClick={handleConnect}
                  className="bg-blue-600 hover:bg-blue-700 gap-2"
                  size="lg"
                  disabled={connecting}
                >
                  {connecting ? (
                    <>
                      <LoadingSpinner />
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <>
                      <LinkIcon className="h-4 w-4" />
                      Connect Google Analytics
                      <ExternalLink className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
                <div className="p-4 bg-white rounded-lg border border-blue-100">
                  <Shield className="h-8 w-8 text-blue-600 mb-2" />
                  <h4 className="font-medium mb-1">Secure Connection</h4>
                  <p className="text-sm text-gray-600">OAuth 2.0 authentication with read-only access</p>
                </div>
                <div className="p-4 bg-white rounded-lg border border-blue-100">
                  <Users className="h-8 w-8 text-blue-600 mb-2" />
                  <h4 className="font-medium mb-1">User Assignment</h4>
                  <p className="text-sm text-gray-600">Assign specific properties to individual users</p>
                </div>
                <div className="p-4 bg-white rounded-lg border border-blue-100">
                  <Activity className="h-8 w-8 text-blue-600 mb-2" />
                  <h4 className="font-medium mb-1">Real-time Data</h4>
                  <p className="text-sm text-gray-600">Users see live analytics data in their dashboard</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Connected Status */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle>Google Analytics Connected</CardTitle>
                    <CardDescription>
                      {accounts.length} account{accounts.length !== 1 ? 's' : ''} available with {
                        accounts.reduce((total, acc) => total + acc.properties.length, 0)
                      } properties total
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={checkConnectionStatus}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleDisconnect}
                    disabled={disconnecting}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    {disconnecting ? <LoadingSpinner /> : <Unlink className="h-4 w-4" />}
                  </Button>
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => setShowAssignmentView(true)}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Manage Assignments
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Assignment Management View */}
          {showAssignmentView && (
            <Card className="border-blue-200">
              <CardHeader className="bg-blue-50/50">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <UserCheck className="h-5 w-5 text-blue-600" />
                      Assign Analytics Properties
                    </CardTitle>
                    <CardDescription>
                      Select users and properties to grant analytics access
                    </CardDescription>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowAssignmentView(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Users Column */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-sm text-gray-700 flex items-center gap-2 mb-2">
                        <Users className="h-4 w-4" />
                        All Users ({users.filter(u => u.role !== 'super_admin').length})
                      </h3>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search users..."
                          className="pl-10 h-9 text-sm"
                          value={userSearchTerm}
                          onChange={(e) => setUserSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="border rounded-lg max-h-96 overflow-y-auto">
                                            {users.filter(u => u.role !== 'super_admin').length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                          <Users className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                          <p className="text-sm">No users available for assignment</p>
                        </div>
                      ) : (
                          <div className="divide-y">
                            {users
                              .filter(user => {
                                // Exclude superadmins from the assignment list
                                if (user.role === 'super_admin') {
                                  return false;
                                }
                                
                                const searchLower = userSearchTerm.toLowerCase();
                                return (
                                  user.full_name.toLowerCase().includes(searchLower) ||
                                  user.business_name.toLowerCase().includes(searchLower) ||
                                  user.email.toLowerCase().includes(searchLower)
                                );
                              })
                              .map((user) => {
                                const isAssigned = isUserAssigned(user.user_id);
                                const isBlocked = isUserBlockedByTeam(user);
                                const userAssignment = assignments.find(a => a.assigned_user_id === user.user_id);
                                const canSelect = !isAssigned && !isBlocked;
                                
                                return (
                                  <div
                                    key={user.user_id}
                                    className={cn(
                                      "p-4 cursor-pointer transition-all duration-200",
                                      selectedUser === user.user_id 
                                        ? "bg-blue-100 hover:bg-blue-100 border-l-4 border-blue-600" 
                                        : isAssigned 
                                          ? "bg-gray-50 hover:bg-gray-100 opacity-60"
                                          : isBlocked
                                            ? "bg-orange-50 hover:bg-orange-100 opacity-70"
                                            : "hover:bg-gray-50"
                                    )}
                                    onClick={() => canSelect && setSelectedUser(user.user_id)}
                                  >
                                    <div className="flex items-center gap-3">
                                      <Avatar className="h-8 w-8">
                                        <AvatarFallback className={getRandomColor(user.user_id)}>
                                          {getInitials(user.full_name)}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                          <p className="font-medium text-sm truncate">{user.full_name}</p>
                                          <Badge variant="outline" className="text-xs">
                                            {user.role}
                                          </Badge>
                                        </div>
                                        <p className="text-xs text-gray-500 truncate">{user.business_name}</p>
                                        {isAssigned && userAssignment && (
                                          <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                                            <CheckCircle className="h-3 w-3" />
                                            Assigned to: {userAssignment.property_name}
                                          </p>
                                        )}
                                        {isBlocked && (
                                          <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" />
                                            Team admin already has analytics assigned
                                          </p>
                                        )}
                                      </div>
                                      {selectedUser === user.user_id && (
                                        <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                                      )}
                                      {isAssigned && (
                                        <Badge variant="outline" className="text-xs">Assigned</Badge>
                                      )}
                                      {isBlocked && (
                                        <Badge variant="outline" className="text-xs text-orange-600 border-orange-200">In a team</Badge>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            {users.filter(user => {
                              // Exclude superadmins
                              if (user.role === 'super_admin') {
                                return false;
                              }
                              
                              const searchLower = userSearchTerm.toLowerCase();
                              return (
                                user.full_name.toLowerCase().includes(searchLower) ||
                                user.business_name.toLowerCase().includes(searchLower) ||
                                user.email.toLowerCase().includes(searchLower)
                              );
                            }).length === 0 && userSearchTerm && (
                              <div className="p-8 text-center text-gray-500">
                                <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                                <p className="text-sm">No users found matching "{userSearchTerm}"</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                  {/* Properties Column */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-sm text-gray-700 flex items-center gap-2 mb-2">
                        <BarChart3 className="h-4 w-4" />
                        Analytics Properties
                      </h3>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search properties..."
                          className="pl-10 h-9 text-sm"
                          value={propertySearchTerm}
                          onChange={(e) => setPropertySearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="border rounded-lg max-h-96 overflow-y-auto">
                      {accounts.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                          <BarChart3 className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                          <p className="text-sm">No properties available</p>
                        </div>
                                              ) : (
                          <div className="divide-y">
                            {accounts.map((account) => {
                              const searchLower = propertySearchTerm.toLowerCase();
                              const filteredProperties = account.properties.filter(property =>
                                property.displayName.toLowerCase().includes(searchLower) ||
                                account.displayName.toLowerCase().includes(searchLower)
                              );
                              
                              if (filteredProperties.length === 0 && propertySearchTerm) {
                                return null;
                              }
                              
                              return (
                                <div key={account.name} className="p-4">
                                  <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                                    <Building className="h-3 w-3" />
                                    {account.displayName}
                                  </h4>
                                  <div className="ml-5 space-y-1">
                                    {filteredProperties.map((property) => {
                                  const isAssigned = isPropertyAssigned(property.name);
                                  const propertyAssignment = getPropertyAssignment(property.name);
                                  return (
                                    <div
                                      key={property.name}
                                      className={cn(
                                        "p-3 rounded cursor-pointer transition-all duration-200 text-sm",
                                        selectedProperty === property.name && selectedAccount === account.name
                                          ? "bg-blue-100 hover:bg-blue-100 border-l-4 border-blue-600 pl-2"
                                          : isAssigned
                                            ? "bg-gray-50 hover:bg-gray-100 opacity-60"
                                            : "hover:bg-gray-50"
                                      )}
                                      onClick={() => {
                                        if (!isAssigned) {
                                          if (selectedProperty === property.name && selectedAccount === account.name) {
                                            // Deselect if clicking the already selected property
                                            setSelectedProperty('');
                                            setSelectedAccount('');
                                          } else {
                                            setSelectedAccount(account.name);
                                            setSelectedProperty(property.name);
                                          }
                                        }
                                      }}
                                    >
                                      <div className="flex items-center justify-between">
                                        <div className="flex-1 min-w-0">
                                          <span className="truncate block">{property.displayName}</span>
                                          {isAssigned && propertyAssignment && (
                                            <span className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                                              <CheckCircle className="h-3 w-3" />
                                              Assigned to: {propertyAssignment.assigned_user?.full_name}
                                            </span>
                                          )}
                                        </div>
                                        {selectedProperty === property.name && selectedAccount === account.name && (
                                          <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 ml-2" />
                                        )}
                                        {isAssigned && (
                                          <Badge variant="outline" className="text-xs ml-2">Assigned</Badge>
                                        )}
                                      </div>
                                    </div>
                                                                        );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                            {(() => {
                              const hasVisibleProperties = accounts.some((account) => {
                                const searchLower = propertySearchTerm.toLowerCase();
                                return account.properties.some(property =>
                                  property.displayName.toLowerCase().includes(searchLower) ||
                                  account.displayName.toLowerCase().includes(searchLower)
                                );
                              });
                              
                              if (!hasVisibleProperties && propertySearchTerm) {
                                return (
                                  <div className="p-8 text-center text-gray-500">
                                    <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                                    <p className="text-sm">No properties found matching "{propertySearchTerm}"</p>
                                  </div>
                                );
                              }
                              return null;
                            })()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                {/* Action Bar */}
                <div className="mt-6 flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">
                    {selectedUser && selectedProperty ? (
                      <p>
                        Ready to assign <span className="font-medium">
                          {getUnassignedUsers().find(u => u.user_id === selectedUser)?.full_name}
                        </span> to <span className="font-medium">
                          {accounts.find(a => a.name === selectedAccount)?.properties.find(p => p.name === selectedProperty)?.displayName}
                        </span>
                      </p>
                    ) : (
                      <p>Select a user and property to create an assignment</p>
                    )}
                  </div>
                  <Button
                    onClick={handleAssignProperty}
                    disabled={!selectedUser || !selectedProperty || assigning}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {assigning ? (
                      <>
                        <LoadingSpinner />
                        <span className="ml-2">Assigning...</span>
                      </>
                    ) : (
                      <>
                        <UserCheck className="h-4 w-4 mr-2" />
                        Assign Access
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Assignments */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Current Assignments</CardTitle>
                  <CardDescription>
                    {assignments.length} user{assignments.length !== 1 ? 's' : ''} with analytics access
                  </CardDescription>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search assignments..."
                    className="pl-10 w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredAssignments.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">
                    {searchTerm ? "No assignments found matching your search." : "No analytics properties assigned yet."}
                  </p>
                  {!searchTerm && (
                    <p className="text-sm text-gray-400 mt-1">
                      Click "Assign Property" to get started.
                    </p>
                  )}
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredAssignments.map((assignment) => (
                    <div key={assignment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className={getRandomColor(assignment.assigned_user_id)}>
                            {getInitials(assignment.assigned_user?.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{assignment.assigned_user?.full_name}</span>
                            <Badge variant="outline" className="text-xs">
                              {assignment.assigned_user?.business_name}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                            <span className="flex items-center gap-1">
                              <BarChart3 className="h-3 w-3" />
                              {assignment.property_name}
                            </span>
                            <span className="flex items-center gap-1">
                              <Building className="h-3 w-3" />
                              {assignment.account_name}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(assignment.assigned_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => handleRemoveAssignment(assignment.assigned_user_id)}
                            className="text-red-600"
                          >
                            <Unlink className="h-4 w-4 mr-2" />
                            Remove Assignment
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
} 