// Removed "use client"; - This is now a Server Component

// Import server-side Supabase client and redirect
import { createClient } from "@/utils/supabase/server";
import { redirect } from 'next/navigation';
import { getTeamId } from "@/utils/supabase/teams";

// Import the new client component
import { ProfileClientContent } from './profile-client-content';

// Import types if needed, or define them if not already shared
// Assuming BusinessInfo is defined in profile-client-content.tsx or a shared types file
// If not, define it here or import it.
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
<<<<<<< HEAD
=======
  role?: string;
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
}

// Make the page component async
export default async function ProfilePage() {
  const supabase = await createClient();

  // Fetch user session server-side
  const { data: { user } } = await supabase.auth.getUser();

  // Redirect to login if no user
  if (!user) {
    return redirect('/sign-in');
  }

<<<<<<< HEAD
  const teamId = await getTeamId(supabase, user.id);

  // Fetch business info for the admin of the team
=======
  // Fetch user's role and team info
  const { data: userProfile, error: userError } = await supabase
    .from('business_info')
    .select('role, team_id')
    .eq('user_id', user.id)
    .single();

  if (userError) {
    console.error("Error fetching user profile:", userError);
    return redirect('/sign-in');
  }

  const userRole = userProfile?.role || 'user';
  const teamId = await getTeamId(supabase, user.id);

  // Fetch business info for the admin of the team (company profile)
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
  const { data: businessInfo, error } = await supabase
    .from('business_info')
    .select('*')
    .eq('user_id', teamId) // Use teamId to fetch the admin's profile
    .maybeSingle(); 

  // Handle potential errors during data fetching
  if (error) {
    console.error("Error fetching business info:", error);
    // Optionally, render an error message to the user
    // return <div>Error loading profile data. Please try again later.</div>;
    // For now, we'll proceed and let the client component handle null initialBusinessInfo
  }

  // Render the client component, passing the fetched data as props
<<<<<<< HEAD
  return <ProfileClientContent user={user} initialBusinessInfo={businessInfo as BusinessInfo | null} />;
=======
  return <ProfileClientContent 
    user={user} 
    initialBusinessInfo={businessInfo as BusinessInfo | null} 
    userRole={userRole}
    teamId={teamId}
  />;
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
} 