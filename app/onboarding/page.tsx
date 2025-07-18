"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import OnboardingClient from "./onboarding.client";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/sign-in');
  }

  // Check if user has already completed onboarding
  const { data: onboardingData } = await supabase
    .from('company_onboarding')
    .select('*')
    .eq('user_id', session.user.id)
    .single();

  if (onboardingData?.completed) {
    redirect('/dashboard');
  }

  return <OnboardingClient />;
}
