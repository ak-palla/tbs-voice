import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getUserRole } from '@/utils/utils'
import InviteClientContent from './invite-client-content'

export default async function InvitePage() {
  const supabase = await createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return redirect('/sign-in')
  }

  return <InviteClientContent />
} 