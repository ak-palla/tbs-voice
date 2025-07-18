import { SupabaseClient } from '@supabase/supabase-js'

/**
 * Gets the team ID for a given user.
 * The team ID is the user_id of the admin of the team.
 * @param supabase
 * @param userId The ID of the currently logged-in user.
 * @returns The team ID, or the user's own ID if they are not part of a team.
 */
export async function getTeamId(supabase: SupabaseClient, userId: string): Promise<string> {
  const { data, error } = await supabase
    .from('business_info')
    .select('team_id')
    .eq('user_id', userId)
    .single()

  if (error || !data || !data.team_id) {
    // Return own ID if no team found or on error
    return userId
  }

  return data.team_id
}


/**
 * Gets the user IDs of all members of a team.
 * @param supabase
 * @param userId The ID of any user in the team.
 * @returns An array of user IDs belonging to the team.
 */
export async function getTeamMemberIds(supabase: SupabaseClient, userId: string): Promise<string[]> {
  const teamId = await getTeamId(supabase, userId);

  const { data: teamMembers, error } = await supabase
    .from('business_info')
    .select('user_id')
    .eq('team_id', teamId)

  if (error || !teamMembers) {
    return [userId]; // Fallback
  }

  const userIds = teamMembers.map(member => member.user_id).filter((id): id is string => id !== null);
  return userIds;
} 