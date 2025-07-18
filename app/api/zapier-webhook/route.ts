import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('Received Zapier webhook:', body);

    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Get the user ID from the webhook payload
    const userId = body.user_id;
    if (!userId) {
      console.error('User ID not provided in webhook payload');
      return NextResponse.json({ error: 'User ID is required in the webhook payload' }, { status: 400 });
    }
    console.log('Extracted userId:', userId);

    // Fetch user-defined mappings
    const { data: mappings, error: mappingsError } = await supabase
      .from('zapier_mappings')
      .select('zapier_field_name, internal_field_name')
      .eq('user_id', userId);

    if (mappingsError) {
      console.error('Error fetching mappings:', mappingsError);
      return NextResponse.json({ error: mappingsError.message }, { status: 500 });
    }
    console.log('Fetched mappings:', mappings);

    // Prepare data for updating user profile based on mappings
    const userProfileUpdates: { [key: string]: any } = {};
    mappings.forEach(mapping => {
      const zapierValue = body[mapping.zapier_field_name];
      if (zapierValue !== undefined) {
        userProfileUpdates[mapping.internal_field_name] = zapierValue;
      }
    });

    console.log('Prepared user profile updates:', userProfileUpdates);

    // Update the user's profile with the mapped data
    // IMPORTANT: Assuming 'business_info' is the correct table for user data.
    // If not, this needs to be changed to the correct table name.
    if (Object.keys(userProfileUpdates).length > 0) {
      const { error: updateError } = await supabase
        .from('business_info') // <--- VERIFY THIS TABLE NAME
        .update(userProfileUpdates)
        .eq('user_id', userId);

      if (updateError) {
        console.error('Error updating user profile:', updateError);
        // Continue processing webhook even if profile update fails to avoid data loss on webhook side
      }
      console.log('User profile updated successfully.');
    }

    const webhookData: { [key: string]: any } = {
      source_app: body.source_app || 'unknown',
      event_type: body.event_type || 'unknown',
      raw_payload: body,
      user_id: userId,
    };

    console.log('Webhook data before insert:', webhookData);

    const { data, error } = await supabase.from('zapier_webhooks').insert([
      webhookData
    ]);

    if (error) {
      console.error('Error inserting webhook data:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Webhook received and processed', data });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 