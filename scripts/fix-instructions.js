const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixInstructions() {
  console.log('🔧 [FIX] Starting instruction activation...');
  
  try {
    // Get all inactive instructions with embeddings
    const { data: inactiveInstructions, error: fetchError } = await supabase
      .from('chatbot_instructions')
      .select('id, title, is_active, embedding')
      .eq('is_active', false)
      .not('embedding', 'is', null);

    if (fetchError) {
      throw new Error(`Failed to fetch instructions: ${fetchError.message}`);
    }

    console.log(`📋 [FIX] Found ${inactiveInstructions?.length || 0} inactive instructions with embeddings`);

    if (!inactiveInstructions || inactiveInstructions.length === 0) {
      console.log('✅ [FIX] No inactive instructions found to activate');
      return;
    }

    // Activate all instructions with embeddings
    const { data: updatedInstructions, error: updateError } = await supabase
      .from('chatbot_instructions')
      .update({ is_active: true })
      .eq('is_active', false)
      .not('embedding', 'is', null)
      .select('id, title');

    if (updateError) {
      throw new Error(`Failed to activate instructions: ${updateError.message}`);
    }

    console.log(`✅ [FIX] Successfully activated ${updatedInstructions?.length || 0} instructions`);
    
    // List activated instructions
    if (updatedInstructions && updatedInstructions.length > 0) {
      console.log('\n📝 [FIX] Activated instructions:');
      updatedInstructions.forEach((inst, index) => {
        console.log(`   ${index + 1}. ${inst.title}`);
      });
    }

    // Test the fix by checking active count
    const { data: statusCheck } = await supabase
      .from('chatbot_instructions')
      .select('id, is_active, embedding')
      .not('embedding', 'is', null);

    const totalWithEmbeddings = statusCheck?.length || 0;
    const activeWithEmbeddings = statusCheck?.filter(i => i.is_active).length || 0;

    console.log(`\n📊 [FIX] Final Status:`);
    console.log(`   Total instructions with embeddings: ${totalWithEmbeddings}`);
    console.log(`   Active instructions with embeddings: ${activeWithEmbeddings}`);
    console.log(`   Fix success rate: ${totalWithEmbeddings > 0 ? Math.round((activeWithEmbeddings / totalWithEmbeddings) * 100) : 0}%`);

    if (activeWithEmbeddings === totalWithEmbeddings && totalWithEmbeddings > 0) {
      console.log('\n🎉 [FIX] SUCCESS! All instructions with embeddings are now active!');
      console.log('🚀 [FIX] Your chatbot should now provide much more relevant business responses.');
    } else {
      console.log('\n⚠️  [FIX] Partial success - some instructions may still be inactive');
    }

  } catch (error) {
    console.error('❌ [FIX] Failed to activate instructions:', error);
    process.exit(1);
  }
}

// Run the fix
fixInstructions(); 