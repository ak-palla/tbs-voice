/**
 * Comprehensive Vector Search Diagnostics Script
 * 
 * Run this with: npx ts-node test-vector-search.ts
 * Or create a temporary API endpoint to execute this
 */

import { createClient } from './utils/supabase/server';
import { generateQueryEmbedding } from './utils/embeddings';

async function runDiagnostics() {
  console.log('🔍 Starting Vector Search Diagnostics...\n');
  
  try {
    const supabase = await createClient();
    
    // 1. Check if table exists and basic structure
    console.log('📊 Step 1: Checking table structure...');
    const { data: allRecords, error: fetchError } = await supabase
      .from('chatbot_instructions')
      .select('*');
    
    if (fetchError) {
      console.error('❌ Error fetching from chatbot_instructions table:', fetchError);
      return;
    }
    
    console.log(`✅ Table exists with ${allRecords?.length || 0} total records`);
    
    if (!allRecords || allRecords.length === 0) {
      console.log('⚠️  ISSUE FOUND: No records in chatbot_instructions table!');
      console.log('   This explains why vector search returns 0 results.');
      console.log('   Solution: Add some instructions via the admin interface at /admin/instructions');
      return;
    }
    
    // 2. Analyze record status
    console.log('\n📈 Step 2: Analyzing record status...');
    const activeRecords = allRecords.filter(r => r.is_active);
    const recordsWithEmbeddings = allRecords.filter(r => r.embedding);
    const searchableRecords = allRecords.filter(r => r.is_active && r.embedding);
    
    console.log(`   Total records: ${allRecords.length}`);
    console.log(`   Active records: ${activeRecords.length}`);
    console.log(`   Records with embeddings: ${recordsWithEmbeddings.length}`);
    console.log(`   Searchable records (active + embedding): ${searchableRecords.length}`);
    
    if (searchableRecords.length === 0) {
      console.log('⚠️  ISSUE FOUND: No searchable records!');
      if (activeRecords.length > 0 && recordsWithEmbeddings.length === 0) {
        console.log('   Problem: Active records exist but no embeddings generated');
        console.log('   Solution: Run embedding generation via /api/embeddings/init');
      } else if (recordsWithEmbeddings.length > 0 && activeRecords.length === 0) {
        console.log('   Problem: Records have embeddings but are not active');
        console.log('   Solution: Set is_active=true for relevant records');
      }
      return;
    }
    
    // 3. Sample a few records to check structure
    console.log('\n🔍 Step 3: Examining sample records...');
    const sampleRecords = allRecords.slice(0, 3);
    sampleRecords.forEach((record, index) => {
      console.log(`   Record ${index + 1}:`);
      console.log(`     ID: ${record.id}`);
      console.log(`     Title: ${record.title || 'No title'}`);
      console.log(`     Active: ${record.is_active}`);
      console.log(`     Has embedding: ${!!record.embedding}`);
      console.log(`     Content length: ${record.content?.length || 0} chars`);
      console.log(`     Category: ${record.category || 'None'}`);
      console.log(`     Priority: ${record.priority || 0}`);
    });
    
    // 4. Test the match function exists
    console.log('\n🔧 Step 4: Testing match_chatbot_instructions function...');
    try {
      const { data: functionTest, error: functionError } = await supabase.rpc(
        'match_chatbot_instructions',
        {
          query_embedding: Array(1536).fill(0.1),
          match_threshold: 0.0,
          match_count: 1
        }
      );
      
      if (functionError) {
        console.log('❌ match_chatbot_instructions function error:', functionError);
        console.log('   Solution: Run the corrected function definition from fix-match-function.sql');
        return;
      }
      
      console.log('✅ Function exists and callable');
      console.log(`   Test returned ${functionTest?.length || 0} results with dummy embedding`);
    } catch (error) {
      console.log('❌ Function test failed:', error);
      return;
    }
    
    // 5. Test actual embedding generation and search
    if (searchableRecords.length > 0) {
      console.log('\n🎯 Step 5: Testing real vector search...');
      
      try {
        const testQuery = "How do I get started with my business?";
        console.log(`   Test query: "${testQuery}"`);
        
        const queryEmbedding = await generateQueryEmbedding(testQuery);
        console.log(`   Generated embedding with ${queryEmbedding.length} dimensions`);
        
        // Test with very low threshold
        const { data: results, error: searchError } = await supabase.rpc(
          'match_chatbot_instructions',
          {
            query_embedding: queryEmbedding,
            match_threshold: 0.0, // Very low threshold
            match_count: 5
          }
        );
        
        if (searchError) {
          console.log('❌ Vector search failed:', searchError);
          return;
        }
        
        console.log(`   Search results: ${results?.length || 0} instructions found`);
        
        if (results && results.length > 0) {
          console.log('   Top results:');
          results.slice(0, 3).forEach((result, index) => {
            console.log(`     ${index + 1}. "${result.title}" (similarity: ${result.similarity?.toFixed(3)})`);
          });
        }
        
        // Test with normal thresholds
        const tests = [
          { threshold: 0.6, name: 'Normal (0.6)' },
          { threshold: 0.8, name: 'High (0.8)' }
        ];
        
        for (const test of tests) {
          const { data: thresholdResults } = await supabase.rpc(
            'match_chatbot_instructions',
            {
              query_embedding: queryEmbedding,
              match_threshold: test.threshold,
              match_count: 5
            }
          );
          
          console.log(`   ${test.name} threshold: ${thresholdResults?.length || 0} results`);
        }
        
      } catch (error) {
        console.log('❌ Embedding generation or search failed:', error);
        console.log('   Check OPENAI_API_KEY is set correctly');
        return;
      }
    }
    
    // 6. Final summary
    console.log('\n📋 DIAGNOSTIC SUMMARY:');
    if (searchableRecords.length === 0) {
      console.log('❌ CRITICAL: No searchable records available');
    } else {
      console.log('✅ Vector search infrastructure is working');
      console.log('   If you\'re still getting 0 results in production:');
      console.log('   1. Check that queries are relevant to your instruction content');
      console.log('   2. Consider lowering similarity thresholds');
      console.log('   3. Add more diverse instruction content');
      console.log('   4. Verify OpenAI API key is working in production');
    }
    
  } catch (error) {
    console.error('❌ Diagnostic script failed:', error);
  }
}

// Export for use in API endpoints or run directly
export { runDiagnostics };

// Uncomment to run directly with ts-node
// runDiagnostics().then(() => {
//   console.log('\n🏁 Diagnostics complete');
//   process.exit(0);
// }).catch(console.error);