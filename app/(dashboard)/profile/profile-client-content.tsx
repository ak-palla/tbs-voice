"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, Check, X, Edit, Save, Camera } from "lucide-react";
import { toast } from "sonner";
// Remove SubmitButton import if not used after refactor, keep if needed for forms
// import { SubmitButton } from "@/components/submit-button"; 
import { LoadingSpinner } from "@/components/loading-spinner";
import { DebugSession } from "@/components/debug-session"; // Keep if useful for debugging client side
import type { User } from '@supabase/supabase-js';
import { Textarea } from "@/components/ui/textarea";
<<<<<<< HEAD
=======
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a

// Use the same BusinessInfo interface
interface BusinessInfo {
  id: string;
  user_id: string;
  full_name: string;
  business_name: string;
  email: string;
  phone_number: string;
  payment_option: string;
  payment_remaining: number;
  command_hq_created: boolean;
  gd_folder_created: boolean;
  meeting_scheduled: boolean;
  command_hq_link: string | null;
  profile_picture_url: string | null;
  google_review_link: string | null;
}

interface ProfileClientContentProps {
  user: User;
  initialBusinessInfo: BusinessInfo | null;
<<<<<<< HEAD
}

export function ProfileClientContent({ user, initialBusinessInfo }: ProfileClientContentProps) {
=======
  userRole: string;
  teamId: string;
}

export function ProfileClientContent({ user, initialBusinessInfo, userRole, teamId }: ProfileClientContentProps) {
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
  // const [loading, setLoading] = useState(true); // Removed: Initial loading handled by Server Component
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo | null>(initialBusinessInfo);
  const [editing, setEditing] = useState(false);
<<<<<<< HEAD
=======
  const [profileType, setProfileType] = useState<'user' | 'company'>('company'); // Default to company profile
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
  // Initialize formData with initialBusinessInfo or default values
  const [formData, setFormData] = useState<Partial<BusinessInfo>>(initialBusinessInfo || {
    full_name: '',
    business_name: '',
    email: user.email || '', // Pre-fill email from user object if available
    phone_number: '',
    payment_option: '',
    // Add other fields as necessary with default values
  });
  const supabase = createClient(); // Use client-side Supabase client

<<<<<<< HEAD
  // Removed useEffect for initial fetch
=======
  // Fetch user profile data when switching to user profile
  useEffect(() => {
    if (profileType === 'user') {
      fetchUserProfile();
    } else {
      // Reset form data to company profile data when switching back
      setFormData(initialBusinessInfo || {
        full_name: '',
        business_name: '',
        email: user.email || '',
        phone_number: '',
        payment_option: '',
      });
    }
    // Reset editing state when switching profile types
    setEditing(false);
  }, [profileType, initialBusinessInfo, user.email]);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('business_info')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }
      
      if (data) {
        setFormData(data);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return; // Only submit if editing

    setSaving(true);
    try {
      // User ID is available from props
      if (!user) {
        toast.error("User session expired. Please refresh.");
        return;
      }
      
      // Construct the update object, excluding fields that shouldn't be updated directly if needed
      const updateData = { ...formData };
      // delete updateData.id; // Don't update primary key
      // delete updateData.user_id; // Don't update user_id

<<<<<<< HEAD
      const { error } = await supabase
        .from('business_info')
        .update(updateData)
        .eq('user_id', user.id); // Use user.id from props
=======
      // Determine which user_id to update based on profile type
      const targetUserId = profileType === 'user' ? user.id : teamId;

      const { error } = await supabase
        .from('business_info')
        .update(updateData)
        .eq('user_id', targetUserId);
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a

      if (error) {
        console.error('Error updating profile:', error);
        throw new Error(error.message || 'Failed to update profile');
      }

      // Update local state optimistically or after confirmation
<<<<<<< HEAD
      setBusinessInfo(prev => ({ ...prev, ...updateData } as BusinessInfo));
      setEditing(false);
      toast.success('Profile updated successfully');
=======
      if (profileType === 'user') {
        setFormData(prev => ({ ...prev, ...updateData }));
      } else {
        setBusinessInfo(prev => ({ ...prev, ...updateData } as BusinessInfo));
      }
      setEditing(false);
      toast.success(`${profileType === 'user' ? 'Personal' : 'Company'} profile updated successfully`);
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // User ID is available from props
    if (!user) {
      toast.error("User session expired. Please refresh.");
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      // Create a path that includes the user's ID as the first folder
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file, { 
          upsert: true,
          cacheControl: '3600'
        });

      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        throw new Error(uploadError.message || 'Failed to upload profile picture');
      }

      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      if (!publicUrl) {
        throw new Error('Could not get public URL for the uploaded image.');
      }

<<<<<<< HEAD
      const { error: updateError } = await supabase
        .from('business_info')
        .update({ profile_picture_url: publicUrl })
        .eq('user_id', user.id);
=======
      // Determine which user_id to update based on profile type
      const targetUserId = profileType === 'user' ? user.id : teamId;

      const { error: updateError } = await supabase
        .from('business_info')
        .update({ profile_picture_url: publicUrl })
        .eq('user_id', targetUserId);
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a

      if (updateError) {
        console.error('Error updating profile picture URL:', updateError);
        // Attempt to delete the orphaned file from storage
        await supabase.storage.from('profiles').remove([filePath]);
        throw new Error(updateError.message || 'Failed to update profile picture link.');
      }

      // Update local state
<<<<<<< HEAD
      setBusinessInfo(prev => ({ ...prev, profile_picture_url: publicUrl } as BusinessInfo));
      setFormData(prev => ({ ...prev, profile_picture_url: publicUrl }));
      toast.success('Profile picture updated successfully');
=======
      if (profileType === 'user') {
        setFormData(prev => ({ ...prev, profile_picture_url: publicUrl }));
      } else {
        setBusinessInfo(prev => ({ ...prev, profile_picture_url: publicUrl } as BusinessInfo));
      }
      toast.success(`${profileType === 'user' ? 'Personal' : 'Company'} profile picture updated successfully`);
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
    } catch (error: any) {
      console.error('Error uploading profile picture:', error);
      toast.error(error.message || 'Failed to upload profile picture');
    } finally {
      setUploading(false);
    }
  };

  // Onboarding info state
  const [onboardingInfo, setOnboardingInfo] = useState<any>(null);
  const [editingOnboarding, setEditingOnboarding] = useState(false);
  const [onboardingForm, setOnboardingForm] = useState<any>({});
  const [savingOnboarding, setSavingOnboarding] = useState(false);

  useEffect(() => {
    // Fetch onboarding info
    async function fetchOnboarding() {
      const { data, error } = await supabase
        .from('company_onboarding')
        .select('onboarding_data')
        .eq('user_id', user.id)
        .single();
      if (data?.onboarding_data) {
        setOnboardingInfo(data.onboarding_data);
        setOnboardingForm(data.onboarding_data);
      }
    }
    fetchOnboarding();
  }, [user.id]);

  const handleOnboardingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setOnboardingForm((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleOnboardingSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingOnboarding(true);
    try {
      const { error } = await supabase
        .from('company_onboarding')
        .update({ onboarding_data: onboardingForm })
        .eq('user_id', user.id);
      if (error) throw error;
      setOnboardingInfo(onboardingForm);
      setEditingOnboarding(false);
      toast.success('Onboarding info updated');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update onboarding info');
    } finally {
      setSavingOnboarding(false);
    }
  };

  // Removed initial loading state return

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="max-w-4xl mx-auto">
        {/* <DebugSession /> Consider passing session from server if needed */} 
<<<<<<< HEAD
        <Card className="border-0  overflow-hidden">
          <CardHeader className="bg-gray-50/50 border-b px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl font-semibold">Profile</CardTitle>
                <CardDescription className="text-sm text-gray-500">Manage your business information</CardDescription>
              </div>
              <Button 
                variant={editing ? "secondary" : "outline"} 
                size="sm"
                onClick={() => setEditing(!editing)}
                disabled={saving}
              >
                {editing ? 
                  <><X className="h-4 w-4 mr-1.5" /> Cancel</> : 
                  <><Edit className="h-4 w-4 mr-1.5" /> Edit</>
                }
              </Button>
            </div>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Profile Picture Section */} 
                <div className="flex flex-col items-center md:items-start gap-3">
                  <div className="relative group">
                    <Avatar className="h-28 w-28 rounded-full border-2 border-white -md">
                      <AvatarImage src={businessInfo?.profile_picture_url || ''} alt={businessInfo?.business_name || 'User'} />
                      <AvatarFallback className="text-2xl bg-blue-100 text-blue-700 font-medium">
                        {businessInfo?.business_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {uploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full">
                        <LoadingSpinner size="md" className="text-white" />
                      </div>
                    )}
                    <label
                      htmlFor="profile-picture"
                      className={`absolute bottom-1 right-1 bg-white p-2 rounded-full cursor-pointer hover:bg-gray-100 transition-colors  border border-gray-200 ${uploading ? 'cursor-not-allowed opacity-50' : ''}`}
                    >
                      <Camera className="h-4 w-4 text-gray-600" />
                    </label>
                    <input
                      id="profile-picture"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                      disabled={uploading}
                    />
                  </div>
                  <p className="text-xs text-gray-500 text-center md:text-left">Upload a profile picture</p>
                </div>

                {/* Form Fields Section */} 
                <div className="flex-1 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                    <div className="space-y-1.5">
                      <Label htmlFor="full_name" className="text-sm font-medium text-gray-700">Full Name</Label>
                      <Input
                        id="full_name"
                        name="full_name"
                        value={formData.full_name || ''}
                        onChange={handleInputChange}
                        disabled={!editing || saving}
                        className="h-10"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="business_name" className="text-sm font-medium text-gray-700">Business Name</Label>
                      <Input
                        id="business_name"
                        name="business_name"
                        value={formData.business_name || ''}
                        onChange={handleInputChange}
                        disabled={!editing || saving}
                        className="h-10"
                        placeholder="Enter your business name"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email || ''}
                        onChange={handleInputChange}
                        disabled // Generally email shouldn't be editable here, depends on auth setup
                        className="h-10 bg-gray-100 cursor-not-allowed"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="phone_number" className="text-sm font-medium text-gray-700">Phone Number</Label>
                      <Input
                        id="phone_number"
                        name="phone_number"
                        value={formData.phone_number || ''}
                        onChange={handleInputChange}
                        disabled={!editing || saving}
                        className="h-10"
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label htmlFor="google_review_link" className="text-sm font-medium text-gray-700">Google Review Link</Label>
                      <Input
                        id="google_review_link"
                        name="google_review_link"
                        type="url"
                        value={formData.google_review_link || ''}
                        onChange={handleInputChange}
                        disabled={!editing || saving}
                        className="h-10"
                        placeholder="Enter your Google Business review link (e.g., https://maps.google.com/...)"
                      />
                      <p className="text-xs text-gray-500">
                        This link will be used to fetch and analyze your Google Business reviews for the dashboard.
                      </p>
                    </div>
                  </div>
                  {/* Read-only fields */} 
=======
        
        {/* Profile Tabs - Only show for user role, else just company profile */}
        {userRole === 'user' ? (
          <Tabs value={profileType} onValueChange={val => setProfileType(val as 'user' | 'company')} className="w-full mb-6">
            <TabsList className="w-full flex justify-center mb-2">
              <TabsTrigger value="user" className="flex-1">My Profile</TabsTrigger>
              <TabsTrigger value="company" className="flex-1">Company Profile</TabsTrigger>
            </TabsList>
            <TabsContent value="user">
              {/* My Profile Content */}
              {renderProfileForm('user')}
            </TabsContent>
            <TabsContent value="company">
              {/* Company Profile Content */}
              {renderProfileForm('company')}
            </TabsContent>
          </Tabs>
        ) : (
          // Only show company profile for admin/super_admin
          renderProfileForm('company')
        )}
      </div>
    </div>
  );

  // Helper to render the profile form for each tab
  function renderProfileForm(type: 'user' | 'company') {
    return (
      <Card className="border-0 overflow-hidden">
        <CardHeader className="bg-gray-50/50 border-b px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl font-semibold">
                {type === 'user' ? 'My Profile' : 'Company Profile'}
              </CardTitle>
              <CardDescription className="text-sm text-gray-500">
                {type === 'user' 
                  ? 'Manage your personal information' 
                  : 'Manage your business information'
                }
              </CardDescription>
            </div>
            <Button 
              variant={editing ? "secondary" : "outline"} 
              size="sm"
              onClick={() => setEditing(!editing)}
              disabled={saving}
            >
              {editing ? 
                <><X className="h-4 w-4 mr-1.5" /> Cancel</> : 
                <><Edit className="h-4 w-4 mr-1.5" /> Edit</>
              }
            </Button>
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Profile Picture Section */} 
              <div className="flex flex-col items-center md:items-start gap-3">
                <div className="relative group">
                  <Avatar className="h-28 w-28 rounded-full border-2 border-white -md">
                    <AvatarImage 
                      src={type === 'user' ? formData.profile_picture_url || '' : businessInfo?.profile_picture_url || ''} 
                      alt={type === 'user' ? formData.full_name || 'User' : businessInfo?.business_name || 'User'} 
                    />
                    <AvatarFallback className="text-2xl bg-blue-100 text-blue-700 font-medium">
                      {type === 'user' 
                        ? formData.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()
                        : businessInfo?.business_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()
                      }
                    </AvatarFallback>
                  </Avatar>
                  {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full">
                      <LoadingSpinner size="md" className="text-white" />
                    </div>
                  )}
                  <label
                    htmlFor="profile-picture"
                    className={`absolute bottom-1 right-1 bg-white p-2 rounded-full cursor-pointer hover:bg-gray-100 transition-colors  border border-gray-200 ${uploading ? 'cursor-not-allowed opacity-50' : ''}`}
                  >
                    <Camera className="h-4 w-4 text-gray-600" />
                  </label>
                  <input
                    id="profile-picture"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />
                </div>
                <p className="text-xs text-gray-500 text-center md:text-left">Upload a profile picture</p>
              </div>

              {/* Form Fields Section */} 
              <div className="flex-1 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                  {type === 'user' ? (
                    // User Profile Fields
                    <>
                      <div className="space-y-1.5">
                        <Label htmlFor="full_name" className="text-sm font-medium text-gray-700">Full Name</Label>
                        <Input
                          id="full_name"
                          name="full_name"
                          value={formData.full_name || ''}
                          onChange={handleInputChange}
                          disabled={!editing || saving}
                          className="h-10"
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email || ''}
                          onChange={handleInputChange}
                          disabled // Generally email shouldn't be editable here, depends on auth setup
                          className="h-10 bg-gray-100 cursor-not-allowed"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="phone_number" className="text-sm font-medium text-gray-700">Phone Number</Label>
                        <Input
                          id="phone_number"
                          name="phone_number"
                          value={formData.phone_number || ''}
                          onChange={handleInputChange}
                          disabled={!editing || saving}
                          className="h-10"
                          placeholder="Enter phone number"
                        />
                      </div>
                    </>
                  ) : (
                    // Company Profile Fields
                    <>
                      <div className="space-y-1.5">
                        <Label htmlFor="full_name" className="text-sm font-medium text-gray-700">Full Name</Label>
                        <Input
                          id="full_name"
                          name="full_name"
                          value={formData.full_name || ''}
                          onChange={handleInputChange}
                          disabled={!editing || saving}
                          className="h-10"
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="business_name" className="text-sm font-medium text-gray-700">Business Name</Label>
                        <Input
                          id="business_name"
                          name="business_name"
                          value={formData.business_name || ''}
                          onChange={handleInputChange}
                          disabled={!editing || saving}
                          className="h-10"
                          placeholder="Enter your business name"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email || ''}
                          onChange={handleInputChange}
                          disabled // Generally email shouldn't be editable here, depends on auth setup
                          className="h-10 bg-gray-100 cursor-not-allowed"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="phone_number" className="text-sm font-medium text-gray-700">Phone Number</Label>
                        <Input
                          id="phone_number"
                          name="phone_number"
                          value={formData.phone_number || ''}
                          onChange={handleInputChange}
                          disabled={!editing || saving}
                          className="h-10"
                          placeholder="Enter phone number"
                        />
                      </div>
                      <div className="space-y-1.5 sm:col-span-2">
                        <Label htmlFor="google_review_link" className="text-sm font-medium text-gray-700">Google Review Link</Label>
                        <Input
                          id="google_review_link"
                          name="google_review_link"
                          type="url"
                          value={formData.google_review_link || ''}
                          onChange={handleInputChange}
                          disabled={!editing || saving}
                          className="h-10"
                          placeholder="Enter your Google Business review link (e.g., https://maps.google.com/...)"
                        />
                        <p className="text-xs text-gray-500">
                          This link will be used to fetch and analyse your Google Business reviews for the dashboard.
                        </p>
                      </div>
                    </>
                  )}
                </div>
                {/* Read-only fields - Only show for company profile */} 
                {type === 'company' && (
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 pt-4 border-t border-gray-100">
                     <div className="space-y-1.5">
                       <Label className="text-sm font-medium text-gray-700 block">Payment Option</Label>
                       <p className="text-sm text-gray-800 h-10 flex items-center px-3 rounded-md bg-gray-50 border border-gray-200">
                         {businessInfo?.payment_option || 'N/A'}
                       </p>
                     </div>
                      <div className="space-y-1.5">
                       <Label className="text-sm font-medium text-gray-700 block">Payment Remaining</Label>
                       <p className="text-sm text-gray-800 h-10 flex items-center px-3 rounded-md bg-gray-50 border border-gray-200">
<<<<<<< HEAD
                         {businessInfo?.payment_remaining ?? 'N/A'}
=======
                         {businessInfo?.payment_remaining ? `£${new Intl.NumberFormat('en-US').format(businessInfo.payment_remaining)}` : 'N/A'}
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
                       </p>
                     </div>
                     <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-gray-700 block">Command HQ Created</Label>
                        <p className="text-sm text-gray-800 h-10 flex items-center px-3 rounded-md bg-gray-50 border border-gray-200">
                          {businessInfo?.command_hq_created ? <Check className="h-4 w-4 text-green-600 mr-1"/> : <X className="h-4 w-4 text-red-600 mr-1"/>} {businessInfo?.command_hq_created ? 'Yes' : 'No'}
                        </p>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-gray-700 block">GD Folder Created</Label>
                        <p className="text-sm text-gray-800 h-10 flex items-center px-3 rounded-md bg-gray-50 border border-gray-200">
                          {businessInfo?.gd_folder_created ? <Check className="h-4 w-4 text-green-600 mr-1"/> : <X className="h-4 w-4 text-red-600 mr-1"/>} {businessInfo?.gd_folder_created ? 'Yes' : 'No'}
                        </p>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-gray-700 block">Meeting Scheduled</Label>
                        <p className="text-sm text-gray-800 h-10 flex items-center px-3 rounded-md bg-gray-50 border border-gray-200">
                          {businessInfo?.meeting_scheduled ? <Check className="h-4 w-4 text-green-600 mr-1"/> : <X className="h-4 w-4 text-red-600 mr-1"/>} {businessInfo?.meeting_scheduled ? 'Yes' : 'No'}
                        </p>
                      </div>
                      <div className="space-y-1.5">
                       <Label className="text-sm font-medium text-gray-700 block">Command HQ Link</Label>
                       <p className="text-sm text-gray-800 h-10 flex items-center px-3 rounded-md bg-gray-50 border border-gray-200 truncate">
                         {businessInfo?.command_hq_link ? (
                           <a href={businessInfo.command_hq_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                             {businessInfo.command_hq_link}
                           </a>
                         ) : 'N/A'}
                       </p>
                     </div>
                  </div>
<<<<<<< HEAD
                </div>
              </div>
            </CardContent>
            {editing && (
              <div className="px-6 py-4 bg-gray-50/50 border-t flex justify-end">
                <Button 
                  type="submit"
                  disabled={saving || uploading}
                >
                  {saving ? <LoadingSpinner className="mr-2" /> : <Save className="h-4 w-4 mr-2"/>}
                  Save Changes
                </Button>
              </div>
            )}
          </form>
        </Card>

        {/* Onboarding Info Section */}
        <Card className="border-0 mt-10 overflow-hidden">
          <CardHeader className="bg-blue-50/50 border-b px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-lg font-semibold text-blue-900">Company Onboarding Info</CardTitle>
                <CardDescription className="text-sm text-blue-700">This information was provided during onboarding. You can update it here.</CardDescription>
              </div>
              <Button 
                variant={editingOnboarding ? "secondary" : "outline"} 
                size="sm"
                onClick={() => setEditingOnboarding(!editingOnboarding)}
                disabled={savingOnboarding}
              >
                {editingOnboarding ? <><X className="h-4 w-4 mr-1.5" /> Cancel</> : <><Edit className="h-4 w-4 mr-1.5" /> Edit</>}
              </Button>
            </div>
          </CardHeader>
          <form onSubmit={handleOnboardingSave}>
            <CardContent className="p-6 space-y-8">
              {onboardingInfo ? (
                <>
                  {/* Company Information */}
                  <div>
                    <h3 className="font-semibold text-blue-800 mb-2">Company Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Full Legal Company Name</Label>
                        {editingOnboarding ? (
                          <Input name="company_name_official_registered" value={onboardingForm.company_name_official_registered || ''} onChange={handleOnboardingChange} />
                        ) : (
                          <p className="text-gray-800 bg-gray-50 border rounded px-3 py-2">{onboardingInfo.company_name_official_registered}</p>
                        )}
                      </div>
                      <div>
                        <Label>Business Owners (Full Names & Roles)</Label>
                        {editingOnboarding ? (
                          <Textarea name="list_of_business_owners_full_names" value={onboardingForm.list_of_business_owners_full_names || ''} onChange={handleOnboardingChange} />
                        ) : (
                          <p className="text-gray-800 bg-gray-50 border rounded px-3 py-2 whitespace-pre-line">{onboardingInfo.list_of_business_owners_full_names}</p>
                        )}
                      </div>
                      <div>
                        <Label>Primary Company Email Address</Label>
                        {editingOnboarding ? (
                          <Input name="primary_company_email_address" value={onboardingForm.primary_company_email_address || ''} onChange={handleOnboardingChange} />
                        ) : (
                          <p className="text-gray-800 bg-gray-50 border rounded px-3 py-2">{onboardingInfo.primary_company_email_address}</p>
                        )}
                      </div>
                      <div>
                        <Label>Primary Company Phone Number</Label>
                        {editingOnboarding ? (
                          <Input name="primary_company_phone_number" value={onboardingForm.primary_company_phone_number || ''} onChange={handleOnboardingChange} />
                        ) : (
                          <p className="text-gray-800 bg-gray-50 border rounded px-3 py-2">{onboardingInfo.primary_company_phone_number}</p>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <Label>Main Office Physical Address (Full)</Label>
                        {editingOnboarding ? (
                          <Textarea name="main_office_physical_address_full" value={onboardingForm.main_office_physical_address_full || ''} onChange={handleOnboardingChange} />
                        ) : (
                          <p className="text-gray-800 bg-gray-50 border rounded px-3 py-2 whitespace-pre-line">{onboardingInfo.main_office_physical_address_full}</p>
                        )}
                      </div>
                      <div>
                        <Label>Business Founding Date (YYYY-MM-DD)</Label>
                        {editingOnboarding ? (
                          <Input name="business_founding_date_iso" value={onboardingForm.business_founding_date_iso || ''} onChange={handleOnboardingChange} type="date" />
                        ) : (
                          <p className="text-gray-800 bg-gray-50 border rounded px-3 py-2">{onboardingInfo.business_founding_date_iso}</p>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <Label>Company Origin Story & Founder Motivation</Label>
                        {editingOnboarding ? (
                          <Textarea name="company_origin_story_and_founder_motivation" value={onboardingForm.company_origin_story_and_founder_motivation || ''} onChange={handleOnboardingChange} />
                        ) : (
                          <p className="text-gray-800 bg-gray-50 border rounded px-3 py-2 whitespace-pre-line">{onboardingInfo.company_origin_story_and_founder_motivation}</p>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <Label>Main Competitors (List & Reasons)</Label>
                        {editingOnboarding ? (
                          <Textarea name="main_competitors_list_and_reasons" value={onboardingForm.main_competitors_list_and_reasons || ''} onChange={handleOnboardingChange} />
                        ) : (
                          <p className="text-gray-800 bg-gray-50 border rounded px-3 py-2 whitespace-pre-line">{onboardingInfo.main_competitors_list_and_reasons}</p>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <Label>Current Employees & Roles/Responsibilities</Label>
                        {editingOnboarding ? (
                          <Textarea name="current_employees_and_roles_responsibilities" value={onboardingForm.current_employees_and_roles_responsibilities || ''} onChange={handleOnboardingChange} />
                        ) : (
                          <p className="text-gray-800 bg-gray-50 border rounded px-3 py-2 whitespace-pre-line">{onboardingInfo.current_employees_and_roles_responsibilities}</p>
                        )}
                      </div>
                      <div>
                        <Label>Last Full Year Annual Revenue</Label>
                        {editingOnboarding ? (
                          <Input name="last_full_year_annual_revenue_amount" value={onboardingForm.last_full_year_annual_revenue_amount || ''} onChange={handleOnboardingChange} />
                        ) : (
                          <p className="text-gray-800 bg-gray-50 border rounded px-3 py-2">{onboardingInfo.last_full_year_annual_revenue_amount}</p>
                        )}
                      </div>
                      <div>
                        <Label>Current Profit Margin (%)</Label>
                        {editingOnboarding ? (
                          <Input name="current_profit_margin_percentage" value={onboardingForm.current_profit_margin_percentage || ''} onChange={handleOnboardingChange} />
                        ) : (
                          <p className="text-gray-800 bg-gray-50 border rounded px-3 py-2">{onboardingInfo.current_profit_margin_percentage}</p>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <Label>Company Long-Term Vision Statement</Label>
                        {editingOnboarding ? (
                          <Textarea name="company_long_term_vision_statement" value={onboardingForm.company_long_term_vision_statement || ''} onChange={handleOnboardingChange} />
                        ) : (
                          <p className="text-gray-800 bg-gray-50 border rounded px-3 py-2 whitespace-pre-line">{onboardingInfo.company_long_term_vision_statement}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* War Machine Vision */}
                  <div>
                    <h3 className="font-semibold text-blue-800 mt-8 mb-2">War Machine Vision</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <Label>Ultimate Long-Term Goal for Business Owner</Label>
                        {editingOnboarding ? (
                          <Textarea name="ultimate_long_term_goal_for_business_owner" value={onboardingForm.ultimate_long_term_goal_for_business_owner || ''} onChange={handleOnboardingChange} />
                        ) : (
                          <p className="text-gray-800 bg-gray-50 border rounded px-3 py-2 whitespace-pre-line">{onboardingInfo.ultimate_long_term_goal_for_business_owner}</p>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <Label>Definition of Success in 5, 10, 20 Years</Label>
                        {editingOnboarding ? (
                          <Textarea name="definition_of_success_in_5_10_20_years" value={onboardingForm.definition_of_success_in_5_10_20_years || ''} onChange={handleOnboardingChange} />
                        ) : (
                          <p className="text-gray-800 bg-gray-50 border rounded px-3 py-2 whitespace-pre-line">{onboardingInfo.definition_of_success_in_5_10_20_years}</p>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <Label>Additional Income Streams or Investments Needed</Label>
                        {editingOnboarding ? (
                          <Textarea name="additional_income_streams_or_investments_needed" value={onboardingForm.additional_income_streams_or_investments_needed || ''} onChange={handleOnboardingChange} />
                        ) : (
                          <p className="text-gray-800 bg-gray-50 border rounded px-3 py-2 whitespace-pre-line">{onboardingInfo.additional_income_streams_or_investments_needed}</p>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <Label>Focus on Single Business or Multiple Long-Term</Label>
                        {editingOnboarding ? (
                          <Textarea name="focus_on_single_business_or_multiple_long_term" value={onboardingForm.focus_on_single_business_or_multiple_long_term || ''} onChange={handleOnboardingChange} />
                        ) : (
                          <p className="text-gray-800 bg-gray-50 border rounded px-3 py-2 whitespace-pre-line">{onboardingInfo.focus_on_single_business_or_multiple_long_term}</p>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <Label>Personal Skills, Knowledge, or Networks to Develop</Label>
                        {editingOnboarding ? (
                          <Textarea name="personal_skills_knowledge_networks_to_develop" value={onboardingForm.personal_skills_knowledge_networks_to_develop || ''} onChange={handleOnboardingChange} />
                        ) : (
                          <p className="text-gray-800 bg-gray-50 border rounded px-3 py-2 whitespace-pre-line">{onboardingInfo.personal_skills_knowledge_networks_to_develop}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Products and Services */}
                  <div>
                    <h3 className="font-semibold text-blue-800 mt-8 mb-2">Products and Services</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <Label>Business Overview for Potential Investor</Label>
                        {editingOnboarding ? (
                          <Textarea name="business_overview_for_potential_investor" value={onboardingForm.business_overview_for_potential_investor || ''} onChange={handleOnboardingChange} />
                        ) : (
                          <p className="text-gray-800 bg-gray-50 border rounded px-3 py-2 whitespace-pre-line">{onboardingInfo.business_overview_for_potential_investor}</p>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <Label>Description of Target Customers for Investor</Label>
                        {editingOnboarding ? (
                          <Textarea name="description_of_target_customers_for_investor" value={onboardingForm.description_of_target_customers_for_investor || ''} onChange={handleOnboardingChange} />
                        ) : (
                          <p className="text-gray-800 bg-gray-50 border rounded px-3 py-2 whitespace-pre-line">{onboardingInfo.description_of_target_customers_for_investor}</p>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <Label>Things Going Right in Business</Label>
                        {editingOnboarding ? (
                          <Textarea name="list_of_things_going_right_in_business" value={onboardingForm.list_of_things_going_right_in_business || ''} onChange={handleOnboardingChange} />
                        ) : (
                          <p className="text-gray-800 bg-gray-50 border rounded px-3 py-2 whitespace-pre-line">{onboardingInfo.list_of_things_going_right_in_business}</p>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <Label>Things Going Wrong in Business</Label>
                        {editingOnboarding ? (
                          <Textarea name="list_of_things_going_wrong_in_business" value={onboardingForm.list_of_things_going_wrong_in_business || ''} onChange={handleOnboardingChange} />
                        ) : (
                          <p className="text-gray-800 bg-gray-50 border rounded px-3 py-2 whitespace-pre-line">{onboardingInfo.list_of_things_going_wrong_in_business}</p>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <Label>Things Missing in Business</Label>
                        {editingOnboarding ? (
                          <Textarea name="list_of_things_missing_in_business" value={onboardingForm.list_of_things_missing_in_business || ''} onChange={handleOnboardingChange} />
                        ) : (
                          <p className="text-gray-800 bg-gray-50 border rounded px-3 py-2 whitespace-pre-line">{onboardingInfo.list_of_things_missing_in_business}</p>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <Label>Things Confusing in Business</Label>
                        {editingOnboarding ? (
                          <Textarea name="list_of_things_confusing_in_business" value={onboardingForm.list_of_things_confusing_in_business || ''} onChange={handleOnboardingChange} />
                        ) : (
                          <p className="text-gray-800 bg-gray-50 border rounded px-3 py-2 whitespace-pre-line">{onboardingInfo.list_of_things_confusing_in_business}</p>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <Label>Plans to Expand Services or Locations</Label>
                        {editingOnboarding ? (
                          <Textarea name="plans_to_expand_services_or_locations" value={onboardingForm.plans_to_expand_services_or_locations || ''} onChange={handleOnboardingChange} />
                        ) : (
                          <p className="text-gray-800 bg-gray-50 border rounded px-3 py-2 whitespace-pre-line">{onboardingInfo.plans_to_expand_services_or_locations}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Sales & Customer Journey */}
                  <div>
                    <h3 className="font-semibold text-blue-800 mt-8 mb-2">Sales & Customer Journey</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <Label>Detailed Sales Process (First Contact to Close)</Label>
                        {editingOnboarding ? (
                          <Textarea name="detailed_sales_process_from_first_contact_to_close" value={onboardingForm.detailed_sales_process_from_first_contact_to_close || ''} onChange={handleOnboardingChange} />
                        ) : (
                          <p className="text-gray-800 bg-gray-50 border rounded px-3 py-2 whitespace-pre-line">{onboardingInfo.detailed_sales_process_from_first_contact_to_close}</p>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <Label>Structured Follow-Up Process for Unconverted Leads</Label>
                        {editingOnboarding ? (
                          <Textarea name="structured_follow_up_process_for_unconverted_leads" value={onboardingForm.structured_follow_up_process_for_unconverted_leads || ''} onChange={handleOnboardingChange} />
                        ) : (
                          <p className="text-gray-800 bg-gray-50 border rounded px-3 py-2 whitespace-pre-line">{onboardingInfo.structured_follow_up_process_for_unconverted_leads}</p>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <Label>Customer Experience & Fulfillment Process</Label>
                        {editingOnboarding ? (
                          <Textarea name="customer_experience_and_fulfillment_process" value={onboardingForm.customer_experience_and_fulfillment_process || ''} onChange={handleOnboardingChange} />
                        ) : (
                          <p className="text-gray-800 bg-gray-50 border rounded px-3 py-2 whitespace-pre-line">{onboardingInfo.customer_experience_and_fulfillment_process}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Operations & Systems */}
                  <div>
                    <h3 className="font-semibold text-blue-800 mt-8 mb-2">Operations & Systems</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <Label>Documented Systems or SOPs (Links)</Label>
                        {editingOnboarding ? (
                          <Textarea name="documented_systems_or_sops_links" value={onboardingForm.documented_systems_or_sops_links || ''} onChange={handleOnboardingChange} />
                        ) : (
                          <p className="text-gray-800 bg-gray-50 border rounded px-3 py-2 whitespace-pre-line">{onboardingInfo.documented_systems_or_sops_links}</p>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <Label>Software & Tools Used for Operations</Label>
                        {editingOnboarding ? (
                          <Textarea name="software_and_tools_used_for_operations" value={onboardingForm.software_and_tools_used_for_operations || ''} onChange={handleOnboardingChange} />
                        ) : (
                          <p className="text-gray-800 bg-gray-50 border rounded px-3 py-2 whitespace-pre-line">{onboardingInfo.software_and_tools_used_for_operations}</p>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <Label>Team Structure & Admin/Sales/Marketing Roles</Label>
                        {editingOnboarding ? (
                          <Textarea name="team_structure_and_admin_sales_marketing_roles" value={onboardingForm.team_structure_and_admin_sales_marketing_roles || ''} onChange={handleOnboardingChange} />
                        ) : (
                          <p className="text-gray-800 bg-gray-50 border rounded px-3 py-2 whitespace-pre-line">{onboardingInfo.team_structure_and_admin_sales_marketing_roles}</p>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <Label>Regular Team Meetings (Frequency, Attendees, Agenda)</Label>
                        {editingOnboarding ? (
                          <Textarea name="regular_team_meetings_frequency_attendees_agenda" value={onboardingForm.regular_team_meetings_frequency_attendees_agenda || ''} onChange={handleOnboardingChange} />
                        ) : (
                          <p className="text-gray-800 bg-gray-50 border rounded px-3 py-2 whitespace-pre-line">{onboardingInfo.regular_team_meetings_frequency_attendees_agenda}</p>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <Label>KPI Scorecards, Metrics Tracked & Review Frequency</Label>
                        {editingOnboarding ? (
                          <Textarea name="kpi_scorecards_metrics_tracked_and_review_frequency" value={onboardingForm.kpi_scorecards_metrics_tracked_and_review_frequency || ''} onChange={handleOnboardingChange} />
                        ) : (
                          <p className="text-gray-800 bg-gray-50 border rounded px-3 py-2 whitespace-pre-line">{onboardingInfo.kpi_scorecards_metrics_tracked_and_review_frequency}</p>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <Label>Biggest Current Operational Headache</Label>
                        {editingOnboarding ? (
                          <Textarea name="biggest_current_operational_headache" value={onboardingForm.biggest_current_operational_headache || ''} onChange={handleOnboardingChange} />
                        ) : (
                          <p className="text-gray-800 bg-gray-50 border rounded px-3 py-2 whitespace-pre-line">{onboardingInfo.biggest_current_operational_headache}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Final Section */}
                  <div>
                    <h3 className="font-semibold text-blue-800 mt-8 mb-2">Final Section</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <Label>Most Exciting Aspect of Bootcamp for You</Label>
                        {editingOnboarding ? (
                          <Textarea name="most_exciting_aspect_of_bootcamp_for_you" value={onboardingForm.most_exciting_aspect_of_bootcamp_for_you || ''} onChange={handleOnboardingChange} />
                        ) : (
                          <p className="text-gray-800 bg-gray-50 border rounded px-3 py-2 whitespace-pre-line">{onboardingInfo.most_exciting_aspect_of_bootcamp_for_you}</p>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <Label>Specific Expectations or Requests for Bootcamp</Label>
                        {editingOnboarding ? (
                          <Textarea name="specific_expectations_or_requests_for_bootcamp" value={onboardingForm.specific_expectations_or_requests_for_bootcamp || ''} onChange={handleOnboardingChange} />
                        ) : (
                          <p className="text-gray-800 bg-gray-50 border rounded px-3 py-2 whitespace-pre-line">{onboardingInfo.specific_expectations_or_requests_for_bootcamp}</p>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <Label>Additional Comments or Items for Attention</Label>
                        {editingOnboarding ? (
                          <Textarea name="additional_comments_or_items_for_attention" value={onboardingForm.additional_comments_or_items_for_attention || ''} onChange={handleOnboardingChange} />
                        ) : (
                          <p className="text-gray-800 bg-gray-50 border rounded px-3 py-2 whitespace-pre-line">{onboardingInfo.additional_comments_or_items_for_attention}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-gray-500">No onboarding info found.</p>
              )}
            </CardContent>
            {editingOnboarding && (
              <div className="px-6 py-4 bg-blue-50/50 border-t flex justify-end">
                <Button type="submit" disabled={savingOnboarding}>
                  {savingOnboarding ? <LoadingSpinner className="mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  Save Changes
                </Button>
              </div>
            )}
          </form>
        </Card>
      </div>
    </div>
  );
=======
                )}
              </div>
            </div>
          </CardContent>
          {editing && (
            <div className="px-6 py-4 bg-gray-50/50 border-t flex justify-end">
              <Button 
                type="submit"
                disabled={saving || uploading}
              >
                {saving ? <LoadingSpinner className="mr-2" /> : <Save className="h-4 w-4 mr-2"/>}
                Save Changes
              </Button>
            </div>
          )}
        </form>
      </Card>
    );
  }
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
}