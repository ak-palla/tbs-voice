'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteTeamMember(businessInfoId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('business_info')
    .delete()
    .eq('id', businessInfoId)

  if (error) {
    console.error('Error deleting team member:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/chain-of-command')
  return { success: true }
} 