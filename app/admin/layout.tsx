"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import AdminLayoutClient from "./layout.client";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/sign-in');
  }

  // Double-check the user is a super_admin
  const { data, error } = await supabase
    .from('business_info')
    .select('role')
    .eq('user_id', session.user.id)
    .single();

  if (error || !data || data.role !== 'super_admin') {
    console.error("User is not authorized to access admin pages");
    redirect('/dashboard');
  }

  return <AdminLayoutClient>{children}</AdminLayoutClient>;
} 