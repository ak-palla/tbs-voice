'use server'

import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { sendEmail } from '@/lib/send-email'
import { getInvitationEmailHtml } from '@/lib/email-templates/invitation'
<<<<<<< HEAD
=======
import { revalidatePath } from 'next/cache'
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a

const inviteFormSchema = z.object({
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  password: z.string().min(8, {
    message: 'Password must be at least 8 characters long.',
  }).optional(),
  full_name: z.string().min(1, {
    message: 'Full name is required.',
  }),
  phone_number: z.string().min(1, {
    message: 'Phone number is required.',
  }),
<<<<<<< HEAD
  permissions: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: 'You have to select at least one permission.',
  }),
=======
  job_title: z.string().optional(),
  manager_id: z.string().nullable().optional(),
  department_id: z.string().nullable().optional(),
  critical_accountabilities: z.array(z.object({ value: z.string() })).optional(),
  playbook_ids: z.array(z.string()).optional(),
  permissions: z.array(z.string()).optional(),
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
})

type InviteFormValues = z.infer<typeof inviteFormSchema>

<<<<<<< HEAD
=======
async function handlePlaybookAssignments(supabase: any, businessInfoId: string, playbookIds: string[] = []) {
  // First, delete all existing assignments for this user
  const { error: deleteError } = await supabase
    .from('playbook_assignments')
    .delete()
    .eq('user_id', businessInfoId);

  if (deleteError) {
    console.error('Error clearing playbook assignments:', deleteError);
    throw new Error(`Error clearing playbook assignments: ${deleteError.message}`);
  }

  // If there are no new playbooks to assign, we're done
  if (playbookIds.length === 0) {
    return;
  }

  // Create new assignments
  const assignments = playbookIds.map(playbookId => ({
    user_id: businessInfoId,
    playbook_id: playbookId,
    assignment_type: 'Owner', // Defaulting to 'Owner' as per current UI
  }));

  const { error: insertError } = await supabase
    .from('playbook_assignments')
    .insert(assignments);

  if (insertError) {
    console.error('Error creating new playbook assignments:', insertError);
    throw new Error(`Error creating new playbook assignments: ${insertError.message}`);
  }
}

async function createOnboardingRecord(supabase: any, userId: string, adminBusinessInfo: any, userFullName: string, userEmail: string, userPhone: string) {
  try {
    // Get admin's onboarding data to inherit company-level information
    const { data: adminOnboarding, error: adminOnboardingError } = await supabase
      .from('company_onboarding')
      .select('onboarding_data')
      .eq('user_id', adminBusinessInfo.team_id || adminBusinessInfo.user_id)
      .single();

    let adminOnboardingData = {};
    if (!adminOnboardingError && adminOnboarding?.onboarding_data) {
      adminOnboardingData = adminOnboarding.onboarding_data;
    }

    // Create default onboarding data inheriting company info from admin
    const defaultOnboardingData = {
      // Company Information (inherited from admin)
      company_name_official_registered: (adminOnboardingData as any)?.company_name_official_registered || adminBusinessInfo.business_name || "",
      list_of_business_owners_full_names: (adminOnboardingData as any)?.list_of_business_owners_full_names || "",
      primary_company_email_address: (adminOnboardingData as any)?.primary_company_email_address || "",
      primary_company_phone_number: (adminOnboardingData as any)?.primary_company_phone_number || "",
      main_office_physical_address_full: (adminOnboardingData as any)?.main_office_physical_address_full || "",
      business_founding_date_iso: (adminOnboardingData as any)?.business_founding_date_iso || "",
      company_origin_story_and_founder_motivation: (adminOnboardingData as any)?.company_origin_story_and_founder_motivation || "",
      main_competitors_list_and_reasons: (adminOnboardingData as any)?.main_competitors_list_and_reasons || "",
      current_employees_and_roles_responsibilities: (adminOnboardingData as any)?.current_employees_and_roles_responsibilities || "",
      last_full_year_annual_revenue_amount: (adminOnboardingData as any)?.last_full_year_annual_revenue_amount || "",
      current_profit_margin_percentage: (adminOnboardingData as any)?.current_profit_margin_percentage || "",
      company_long_term_vision_statement: (adminOnboardingData as any)?.company_long_term_vision_statement || "",

      // War Machine Vision (user-specific, set to empty)
      ultimate_long_term_goal_for_business_owner: "",
      definition_of_success_in_5_10_20_years: "",
      additional_income_streams_or_investments_needed: "",
      focus_on_single_business_or_multiple_long_term: "",
      personal_skills_knowledge_networks_to_develop: "",

      // Products and Services (inherited from admin)
      business_overview_for_potential_investor: (adminOnboardingData as any)?.business_overview_for_potential_investor || "",
      description_of_target_customers_for_investor: (adminOnboardingData as any)?.description_of_target_customers_for_investor || "",
      list_of_things_going_right_in_business: (adminOnboardingData as any)?.list_of_things_going_right_in_business || "",
      list_of_things_going_wrong_in_business: (adminOnboardingData as any)?.list_of_things_going_wrong_in_business || "",
      list_of_things_missing_in_business: (adminOnboardingData as any)?.list_of_things_missing_in_business || "",
      list_of_things_confusing_in_business: (adminOnboardingData as any)?.list_of_things_confusing_in_business || "",
      plans_to_expand_services_or_locations: (adminOnboardingData as any)?.plans_to_expand_services_or_locations || "",

      // Sales & Customer Journey (inherited from admin)
      detailed_sales_process_from_first_contact_to_close: (adminOnboardingData as any)?.detailed_sales_process_from_first_contact_to_close || "",
      structured_follow_up_process_for_unconverted_leads: (adminOnboardingData as any)?.structured_follow_up_process_for_unconverted_leads || "",
      customer_experience_and_fulfillment_process: (adminOnboardingData as any)?.customer_experience_and_fulfillment_process || "",

      // Operations & Systems (inherited from admin)
      documented_systems_or_sops_links: (adminOnboardingData as any)?.documented_systems_or_sops_links || "",
      software_and_tools_used_for_operations: (adminOnboardingData as any)?.software_and_tools_used_for_operations || "",
      team_structure_and_admin_sales_marketing_roles: (adminOnboardingData as any)?.team_structure_and_admin_sales_marketing_roles || "",
      regular_team_meetings_frequency_attendees_agenda: (adminOnboardingData as any)?.regular_team_meetings_frequency_attendees_agenda || "",
      kpi_scorecards_metrics_tracked_and_review_frequency: (adminOnboardingData as any)?.kpi_scorecards_metrics_tracked_and_review_frequency || "",
      biggest_current_operational_headache: (adminOnboardingData as any)?.biggest_current_operational_headache || "",

      // Final Section (user-specific, set to defaults)
      most_exciting_aspect_of_bootcamp_for_you: `As a new team member (${userFullName}), I'm excited to contribute to the company's success.`,
      specific_expectations_or_requests_for_bootcamp: "",
      additional_comments_or_items_for_attention: `Invited user: ${userFullName} (${userEmail}). This onboarding was auto-completed when the user was invited.`,
    };

    // Insert the onboarding record
    const { error: onboardingError } = await supabase
      .from('company_onboarding')
      .insert({
        user_id: userId,
        onboarding_data: defaultOnboardingData,
        completed: true,
      });

    if (onboardingError) {
      console.error('Error creating onboarding record:', onboardingError);
      throw new Error(`Error creating onboarding record: ${onboardingError.message}`);
    }

    console.log('✅ Successfully created onboarding record for invited user:', userId);
  } catch (error) {
    console.error('Error in createOnboardingRecord:', error);
    // Don't throw here to prevent breaking the invite process
    // The user can still complete onboarding manually if this fails
  }
}

>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
export async function inviteUser(values: InviteFormValues, editUserId?: string) {
  const cookieStore = await cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Handle cookie errors
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Handle cookie errors
          }
        },
      },
    }
  )

<<<<<<< HEAD
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return { success: false, error: 'Not authenticated' }
  }

  const { data: adminBusinessInfo, error: adminError } = await supabase
    .from('business_info')
    .select('role, team_id, business_name, full_name')
    .eq('user_id', session.user.id)
    .single()

  if (adminError || !adminBusinessInfo) {
    return { success: false, error: 'Could not verify admin status.' }
  }

  if (adminBusinessInfo.role !== 'admin' && adminBusinessInfo.role !== 'super_admin') {
    return { success: false, error: 'You are not authorized to invite users.' }
  }

  const validatedData = inviteFormSchema.safeParse(values)
  if (!validatedData.success) {
    return { success: false, error: 'Invalid input.' }
  }
  
  const { email, password, full_name, phone_number, permissions } = validatedData.data

  if (editUserId) {
    const { error: updateError } = await supabase
      .from('business_info')
      .update({
        full_name,
        phone_number,
        permissions: { pages: permissions },
      })
      .eq('id', editUserId)

    if (updateError) {
      return { success: false, error: `Error updating user: ${updateError.message}` }
    }

    if (password) {
=======
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return { success: false, error: 'Not authenticated' }
    }

    const { data: adminBusinessInfo, error: adminError } = await supabase
      .from('business_info')
      .select('role, team_id, business_name, full_name')
      .eq('user_id', session.user.id)
      .single()

    if (adminError || !adminBusinessInfo) {
      return { success: false, error: 'Could not verify admin status.' }
    }

    if (adminBusinessInfo.role !== 'admin' && adminBusinessInfo.role !== 'super_admin') {
      return { success: false, error: 'You are not authorized to invite users.' }
    }

    const validatedData = inviteFormSchema.safeParse(values)
    if (!validatedData.success) {
      return { success: false, error: 'Invalid input.' }
    }
    
    const { 
      email, 
      password, 
      full_name, 
      phone_number, 
      job_title,
      manager_id,
      department_id,
      critical_accountabilities,
      playbook_ids,
      permissions 
    } = validatedData.data

    if (editUserId) {
      // --- UPDATE EXISTING USER ---
      const { error: updateError } = await supabase
        .from('business_info')
        .update({
          full_name,
          phone_number,
          job_title: job_title || '',
          manager_id: manager_id || null,
          department_id: department_id || null,
          critical_accountabilities: critical_accountabilities || [],
          permissions: { pages: permissions || [] },
        })
        .eq('id', editUserId)

      if (updateError) throw new Error(`Error updating user: ${updateError.message}`);

      // Handle playbook assignments
      await handlePlaybookAssignments(supabase, editUserId, playbook_ids || []);

      if (password) {
        const supabaseAdmin = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          {
            auth: {
              autoRefreshToken: false,
              persistSession: false,
            },
          }
        )

        const { data: userInfo, error: userError } = await supabase
          .from('business_info')
          .select('user_id')
          .eq('id', editUserId)
          .single()

        if (userError || !userInfo) throw new Error('Could not find user to update password.');

        const { error: passwordError } = await supabaseAdmin.auth.admin.updateUserById(
          userInfo.user_id,
          { password }
        )

        if (passwordError) throw new Error(`Error updating password: ${passwordError.message}`);
      }

    } else {
      // --- CREATE NEW USER ---
      if (!password) {
        return { success: false, error: 'Password is required for new users' }
      }

>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        }
      )

<<<<<<< HEAD
      const { data: userInfo, error: userError } = await supabase
        .from('business_info')
        .select('user_id')
        .eq('id', editUserId)
        .single()

      if (userError || !userInfo) {
        return { success: false, error: 'Could not find user to update password.' }
      }

      const { error: passwordError } = await supabaseAdmin.auth.admin.updateUserById(
        userInfo.user_id,
        { password }
      )

      if (passwordError) {
        return { success: false, error: `Error updating password: ${passwordError.message}` }
      }
    }

    return { success: true }
  } else {
    if (!password) {
      return { success: false, error: 'Password is required for new users' }
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    const { data: createUserData, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (createUserError) {
      return { success: false, error: `Error creating user: ${createUserError.message}` }
    }

    if (createUserData && createUserData.user) {
      const newUser = createUserData.user;
      const teamId = adminBusinessInfo.team_id || session.user.id;

      const { error: createError } = await supabase.from('business_info').insert({
        user_id: newUser.id,
        email: email,
        full_name: full_name,
        business_name: adminBusinessInfo.business_name,
        phone_number: phone_number,
        role: 'user',
        team_id: teamId,
        permissions: { pages: permissions },
        payment_option: 'none',
      });

      if (createError) {
        await supabaseAdmin.auth.admin.deleteUser(newUser.id);
        return { success: false, error: `Error creating user profile: ${createError.message}` };
      }
      
      const { error: onboardingError } = await supabase.from('company_onboarding').insert({
        user_id: newUser.id,
        onboarding_data: {},
        completed: true,
      });

      if (onboardingError) {
        console.error('Failed to create completed onboarding record for user:', onboardingError.message);
      }

      // Send invitation email
      const loginUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/sign-in`;
      const emailHtml = getInvitationEmailHtml({
        invitedBy: adminBusinessInfo.full_name,
        companyName: adminBusinessInfo.business_name,
        userEmail: email,
        userPassword: password,
        loginUrl,
      });

      const emailResult = await sendEmail({
        to: email,
        subject: `You're invited to join ${adminBusinessInfo.business_name}`,
        html: emailHtml,
      });

      if (!emailResult.success) {
        console.error('Failed to send invitation email:', emailResult.error);
      }

      return { success: true }
    }
  }

  return { success: false, error: 'An unknown error occurred.' }
=======
      const { data: createUserData, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      })

      if (createUserError) throw new Error(`Error creating user: ${createUserError.message}`);

      if (createUserData && createUserData.user) {
        const newUser = createUserData.user;
        const teamId = adminBusinessInfo.team_id || session.user.id;

        const { data: newBusinessInfo, error: createError } = await supabase
          .from('business_info')
          .insert({
            user_id: newUser.id,
            email: email,
            full_name: full_name,
            business_name: adminBusinessInfo.business_name,
            phone_number: phone_number,
            job_title: job_title || '',
            manager_id: manager_id || null,
            department_id: department_id || null,
            critical_accountabilities: critical_accountabilities || [],
            role: 'user',
            team_id: teamId,
            permissions: { pages: permissions || [] },
            payment_option: 'none',
          })
          .select('id')
          .single();

        if (createError || !newBusinessInfo) {
          await supabaseAdmin.auth.admin.deleteUser(newUser.id);
          throw new Error(`Error creating user profile: ${createError?.message}`);
        }
        
        // Handle playbook assignments
        await handlePlaybookAssignments(supabase, newBusinessInfo.id, playbook_ids || []);

        // Create onboarding record for invited user so they skip onboarding
        await createOnboardingRecord(supabase, newUser.id, adminBusinessInfo, full_name, email, phone_number);

        // Send invitation email
        const loginUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/sign-in`;
        const emailHtml = getInvitationEmailHtml({
          invitedBy: adminBusinessInfo.full_name,
          companyName: adminBusinessInfo.business_name,
          userEmail: email,
          userPassword: password,
          loginUrl,
        });

        await sendEmail({
          to: email,
          subject: `You're invited to join ${adminBusinessInfo.business_name}`,
          html: emailHtml,
        });

        revalidatePath('/chain-of-command');
        return { success: true, userId: newBusinessInfo.id, userName: full_name }
      }
    }
    revalidatePath('/chain-of-command');
    return { success: true }
  } catch (error: any) {
    console.error('Server Action Error:', error.message);
    return { success: false, error: error.message }
  }
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
} 