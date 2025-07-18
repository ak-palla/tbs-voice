"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Loader2,
  ArrowLeft,
  KeyRound,
  Shield,
  User,
} from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  business_name: string;
  profile_picture_url?: string;
  role: string;
}

export default function ResetPasswordPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const supabase = createClient();
  const { id } = use(params);

  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

  useEffect(() => {
    fetchUser();
    fetchCurrentUserRole();
  }, [id]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('business_info')
        .select('id, user_id, email, full_name, business_name, profile_picture_url, role')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      setUser(data);
    } catch (error) {
      console.error("Error fetching user:", error);
      toast.error("Failed to load user data");
      router.push('/admin/users');
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentUserRole = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) {
        const { data: profile, error } = await supabase
          .from('business_info')
          .select('role')
          .eq('user_id', currentUser.id)
          .single();
        
        if (!error && profile) {
          setCurrentUserRole(profile.role);
          
          // Redirect non-superadmins
          if (profile.role !== 'super_admin') {
            toast.error("Only superadmins can reset passwords");
            router.push('/admin/users');
          }
        }
      }
    } catch (error) {
      console.error("Error fetching current user role:", error);
      router.push('/admin/users');
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("User data not loaded");
      return;
    }

    if (!newPassword || !confirmPassword) {
      toast.error("Please fill in both password fields");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setIsResetting(true);

      const response = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.user_id,
          newPassword: newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      toast.success(`Password reset successfully for ${user.email}`);
      
      // Redirect back to user detail page
      router.push(`/admin/users/${user.id}`);
    } catch (error: any) {
      console.error("Error resetting password:", error);
      toast.error(error.message || "Failed to reset password");
    } finally {
      setIsResetting(false);
    }
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
    
    const hash = id.split("").reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);
    
    return colors[hash % colors.length];
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
      </div>
    );
  }

  // Show error state if user not found or not authorized
  if (!user || currentUserRole !== 'super_admin') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">Only superadmins can access this page.</p>
          <Link href="/admin/users">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Users
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/users">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Users
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <KeyRound className="w-6 h-6 text-red-600" />
            Reset Password
          </h1>
          <p className="text-muted-foreground">
            Reset password for user account
          </p>
        </div>
      </div>

      {/* User Info Card */}
      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.profile_picture_url || ""} alt={user.full_name} />
            <AvatarFallback className={getRandomColor(user.id)}>
              {getInitials(user.full_name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-semibold">{user.full_name}</h2>
            <p className="text-gray-600">{user.business_name}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>

        {/* Password Reset Form */}
        <form onSubmit={handlePasswordReset} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isResetting}
                required
                minLength={6}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isResetting}
                required
                minLength={6}
              />
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground">
            <p>• Password must be at least 6 characters long</p>
            <p>• Both password fields must match</p>
            <p>• The user will need to use this new password to log in</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Link href="/admin/users">
              <Button variant="outline" disabled={isResetting}>
                Cancel
              </Button>
            </Link>
            <Button 
              type="submit"
              disabled={isResetting || !newPassword || !confirmPassword}
              variant="destructive"
            >
              {isResetting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting Password...
                </>
              ) : (
                <>
                  <KeyRound className="mr-2 h-4 w-4" />
                  Reset Password
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>

      {/* Warning Card */}
      <Card className="p-6 bg-yellow-50 border-yellow-200">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-yellow-800 mb-1">Important Security Notice</h3>
            <div className="text-sm text-yellow-700 space-y-1">
              <p>• This action will immediately change the user's password</p>
              <p>• The user will be logged out of all devices</p>
              <p>• Make sure to communicate the new password securely</p>
              <p>• This action is logged for security purposes</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
} 