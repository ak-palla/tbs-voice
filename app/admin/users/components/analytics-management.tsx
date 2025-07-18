"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Building
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
import { toast } from "sonner";

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
}

interface AnalyticsManagementProps {
  users: UserProfile[];
  onRefresh: () => void;
}

export default function AnalyticsManagement({ users, onRefresh }: AnalyticsManagementProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<AnalyticsAccount[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [assigning, setAssigning] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [debugging, setDebugging] = useState(false);

  useEffect(() => {
    checkConnectionStatus();
    fetchAssignments();
  }, []);

  // Reset selected property when account changes
  useEffect(() => {
    setSelectedProperty('');
  }, [selectedAccount]);

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
        fetchAssignments();
        onRefresh();
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
      const response = await fetch('/api/superadmin/assign-analytics', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assigned_user_id: userId }),
      });

      if (response.ok) {
        toast.success('Assignment removed successfully');
        fetchAssignments();
        onRefresh();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to remove assignment');
      }
    } catch (error) {
      console.error('Error removing assignment:', error);
      toast.error('Failed to remove assignment');
    }
  };

  const handleSyncAssignments = async () => {
    try {
      setSyncing(true);
      const response = await fetch('/api/superadmin/sync-assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
        onRefresh();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to sync assignments');
      }
    } catch (error) {
      console.error('Error syncing assignments:', error);
      toast.error('Failed to sync assignments');
    } finally {
      setSyncing(false);
    }
  };

  const handleDebugTokens = async () => {
    try {
      setDebugging(true);
      const response = await fetch('/api/debug/analytics-tokens');

      if (response.ok) {
        const data = await response.json();
        console.log('Debug Data:', data);
        
        // Open debug data in a new tab for easy viewing
        const debugWindow = window.open('', '_blank');
        if (debugWindow) {
          debugWindow.document.write(`
            <html>
              <head><title>Analytics Tokens Debug</title></head>
              <body>
                <h1>Analytics Tokens Debug</h1>
                <h2>Summary</h2>
                <pre>${JSON.stringify(data.summary, null, 2)}</pre>
                <h2>Full Data</h2>
                <pre>${JSON.stringify(data, null, 2)}</pre>
              </body>
            </html>
          `);
          debugWindow.document.close();
        }
        
        toast.success(`Debug data retrieved. Check console and new tab.`);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to get debug data');
      }
    } catch (error) {
      console.error('Error getting debug data:', error);
      toast.error('Failed to get debug data');
    } finally {
      setDebugging(false);
    }
  };

  const getSelectedAccountProperties = () => {
    const selectedAccountData = accounts.find(acc => acc.name === selectedAccount);
    return selectedAccountData?.properties || [];
  };

  const getUnassignedUsers = () => {
    const assignedUserIds = assignments.map(a => a.assigned_user_id);
    return users.filter(user => !assignedUserIds.includes(user.user_id));
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <LoadingSpinner />
            <span className="ml-2 text-gray-600">Loading Google Analytics status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Google Analytics Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!isConnected ? (
            <div className="text-center space-y-4">
              <div className="p-6 border border-dashed border-gray-300 rounded-lg">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Connect Your Google Analytics</h3>
                <p className="text-gray-600 mb-4">
                  Connect your Google Analytics account to assign properties to your users.
                </p>
                <Button
                  onClick={handleConnect}
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={connecting}
                >
                  {connecting ? (
                    <>
                      <LoadingSpinner />
                      <span className="ml-2">Connecting...</span>
                    </>
                  ) : (
                    <>
                      <LinkIcon className="h-4 w-4 mr-2" />
                      Connect Google Analytics
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-900">Google Analytics Connected</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    {accounts.length} accounts
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={checkConnectionStatus}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleSyncAssignments}
                    disabled={syncing}
                    title="Sync existing assignments to user tokens"
                  >
                    {syncing ? <LoadingSpinner /> : 'Sync'}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleDebugTokens}
                    disabled={debugging}
                    title="Debug tokens table"
                  >
                    {debugging ? <LoadingSpinner /> : 'Debug'}
                  </Button>
                  <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <Users className="h-4 w-4 mr-2" />
                        Assign Property
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Assign Analytics Property</DialogTitle>
                        <DialogDescription>
                          Select a user and property to assign Google Analytics access.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">User</label>
                          <Select value={selectedUser} onValueChange={setSelectedUser}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select user" />
                            </SelectTrigger>
                            <SelectContent>
                              {getUnassignedUsers().map((user) => (
                                <SelectItem key={user.user_id} value={user.user_id}>
                                  {user.full_name} ({user.business_name})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="text-sm font-medium">Account</label>
                          <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select account" />
                            </SelectTrigger>
                            <SelectContent>
                              {accounts.map((account) => (
                                <SelectItem key={account.name} value={account.name}>
                                  {account.displayName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {selectedAccount && (
                          <div>
                            <label className="text-sm font-medium">Property</label>
                            <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select property" />
                              </SelectTrigger>
                              <SelectContent>
                                {getSelectedAccountProperties().length === 0 ? (
                                  <SelectItem value="no-properties" disabled>
                                    No properties found for this account
                                  </SelectItem>
                                ) : (
                                  getSelectedAccountProperties().map((property) => (
                                    <SelectItem key={property.name} value={property.name}>
                                      {property.displayName}
                                    </SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleAssignProperty}
                          disabled={assigning || !selectedUser || !selectedProperty}
                        >
                          {assigning ? <LoadingSpinner /> : 'Assign Property'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assignments List */}
      {isConnected && assignments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Current Assignments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {assignments.map((assignment) => (
                <div key={assignment.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{assignment.assigned_user?.full_name}</span>
                      <Badge variant="outline">{assignment.assigned_user?.business_name}</Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      {assignment.property_name} • {assignment.account_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      Assigned {new Date(assignment.assigned_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveAssignment(assignment.assigned_user_id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Unlink className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 