import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

/**
 * Redirects to a specified path with an encoded message as a query parameter.
 * @param {('error' | 'success')} type - The type of message, either 'error' or 'success'.
 * @param {string} path - The path to redirect to.
 * @param {string} message - The message to be encoded and added as a query parameter.
 * @returns {never} This function doesn't return as it triggers a redirect.
 */
export function encodedRedirect(
  type: "error" | "success",
  path: string,
  message: string,
) {
  return redirect(`${path}?${type}=${encodeURIComponent(message)}`);
}

/**
 * Gets the role of a user from the business_info table.
 * @param {string} userId - The user ID to check.
 * @returns {Promise<'super_admin' | 'admin' | 'user' | null>} The role of the user, or null if not found.
 */
export async function getUserRole(userId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('business_info')
    .select('role')
    .eq('user_id', userId)
    .single();
  
  if (error || !data) {
    console.error("Error fetching user role:", error);
    return null;
  }
  
  return data.role as 'super_admin' | 'admin' | 'user';
}
