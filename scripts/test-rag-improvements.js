const { createClient } = require('@supabase/supabase-js');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

// Test queries to validate improvements
const testQueries = [
  {
    query: "How can I showcase my business more on social media platform?",
    expectedTopics: ["marketing", "social media", "business", "strategy"],
    category: "Marketing"
  },
  {
    query: "Help me create a business plan",
    expectedTopics: ["business plan", "strategy", "battle plan"],
    category: "Business Strategy"
  },
  {
    query: "How do I build a growth machine for my company?",
    expectedTopics: ["growth", "machine", "business"],
    category: "Growth Strategy"
  },
  {
    query: "What are victory metrics and how do I design them?",
    expectedTopics: ["victory", "metrics", "design", "performance"],
    category: "Performance Metrics"
  },
  {
    query: "How do I build a chain of command?",
    expectedTopics: ["chain", "command", "organization", "structure"],
    category: "Organization"
  }
];

async function getRelevantInstructions(query, limit = 5) {
  try {
    // Simple semantic search using Supabase's built-in similarity
    const { generateQueryEmbedding } = await import('../utils/embeddings.ts');
    const queryEmbedding = await generateQueryEmbedding(query);
    
    const { data, error } = await supabase.rpc('match_instructions', {
      query_embedding: queryEmbedding,
      match_threshold: 0.6,
      match_count: limit
    });

    if (error) {
      console.error('Error in semantic search:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error generating embeddings:', error);
    return [];
  }
}

async function generateResponse(query, instructions) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    
    let context = "";
    if (instructions.length > 0) {
      context = `Based on the following business knowledge:\n\n`;
      instructions.forEach((inst, index) => {
        context += `${index + 1}. ${inst.title}: ${inst.content.substring(0, 200)}...\n\n`;
      });
    }
    
    const prompt = `${context}

User Question: "${query}"

Please provide a comprehensive, actionable response that:
1. Directly addresses the user's question
2. Uses specific business knowledge when available
3. Provides concrete, actionable steps
4. Is well-structured and easy to follow
5. Focuses on practical implementation

Response:`;

    const result = await model.generateContent([{ text: prompt }]);
    return result.response.text();
  } catch (error) {
    console.error('Error generating response:', error);
    return "Error generating response";
  }
}

function analyzeResponseQuality(query, response, expectedTopics) {
  const responseLower = response.toLowerCase();
  const queryLower = query.toLowerCase();
  
  // Check relevance (how many expected topics are covered)
  const topicsFound = expectedTopics.filter(topic => 
    responseLower.includes(topic.toLowerCase())
  ).length;
  const relevanceScore = expectedTopics.length > 0 ? topicsFound / expectedTopics.length : 0;
  
  // Check actionability (presence of action words)
  const actionWords = ['should', 'can', 'will', 'start', 'create', 'implement', 'use', 'try', 'consider', 'focus'];
  const actionWordsFound = actionWords.filter(word => responseLower.includes(word)).length;
  const actionabilityScore = Math.min(1, actionWordsFound / 5);
  
  // Check structure (bullet points, numbering, clear sections)
  const hasStructure = responseLower.includes('1.') || responseLower.includes('•') || 
                       responseLower.includes('-') || responseLower.includes('first') ||
                       responseLower.includes('step');
  const structureScore = hasStructure ? 1 : 0.5;
  
  // Check business context
  const businessWords = ['business', 'company', 'strategy', 'growth', 'revenue', 'customers', 'market'];
  const businessWordsFound = businessWords.filter(word => responseLower.includes(word)).length;
  const businessContextScore = Math.min(1, businessWordsFound / 3);
  
  // Calculate overall score
  const overallScore = (relevanceScore + actionabilityScore + structureScore + businessContextScore) / 4;
  
  return {
    relevanceScore,
    actionabilityScore,
    structureScore,
    businessContextScore,
    overallScore,
    topicsFound,
    actionWordsFound,
    wordCount: response.split(' ').length
  };
}

async function testRAGImprovements() {
  console.log('🧪 [TEST] Starting comprehensive RAG testing...\n');
  
  const results = [];
  
  for (const testCase of testQueries) {
    console.log(`📝 [TEST] Testing: "${testCase.query}"`);
    console.log(`📂 [TEST] Category: ${testCase.category}`);
    
    const startTime = Date.now();
    
    // Get relevant instructions
    const instructions = await getRelevantInstructions(testCase.query);
    const retrievalTime = Date.now() - startTime;
    
    console.log(`🔍 [TEST] Found ${instructions.length} relevant instructions (${retrievalTime}ms)`);
    
    if (instructions.length > 0) {
      console.log(`📋 [TEST] Top instructions:`);
      instructions.slice(0, 3).forEach((inst, index) => {
        console.log(`   ${index + 1}. ${inst.title} (similarity: ${(inst.similarity || 0).toFixed(3)})`);
      });
    }
    
    // Generate response
    const responseStartTime = Date.now();
    const response = await generateResponse(testCase.query, instructions);
    const responseTime = Date.now() - responseStartTime;
    
    // Analyze quality
    const qualityAnalysis = analyzeResponseQuality(testCase.query, response, testCase.expectedTopics);
    
    const totalTime = Date.now() - startTime;
    
    console.log(`⚡ [TEST] Response generated (${responseTime}ms, total: ${totalTime}ms)`);
    console.log(`📊 [TEST] Quality scores:`);
    console.log(`   🎯 Relevance: ${(qualityAnalysis.relevanceScore * 100).toFixed(0)}% (${qualityAnalysis.topicsFound}/${testCase.expectedTopics.length} topics)`);
    console.log(`   ⚡ Actionability: ${(qualityAnalysis.actionabilityScore * 100).toFixed(0)}%`);
    console.log(`   📐 Structure: ${(qualityAnalysis.structureScore * 100).toFixed(0)}%`);
    console.log(`   💼 Business Context: ${(qualityAnalysis.businessContextScore * 100).toFixed(0)}%`);
    console.log(`   🏆 Overall Score: ${(qualityAnalysis.overallScore * 100).toFixed(0)}%`);
    console.log(`   📝 Word Count: ${qualityAnalysis.wordCount}`);
    
    // Show response preview
    const preview = response.length > 200 ? response.substring(0, 200) + "..." : response;
    console.log(`💬 [TEST] Response preview: "${preview}"`);
    
    results.push({
      ...testCase,
      instructions: instructions.length,
      retrievalTime,
      responseTime,
      totalTime,
      qualityAnalysis,
      response: response.substring(0, 500) // Store first 500 chars
    });
    
    console.log(`\n${'='.repeat(80)}\n`);
  }
  
  // Summary
  console.log('📊 [SUMMARY] RAG Performance Results:');
  console.log(`📈 Average retrieval time: ${Math.round(results.reduce((sum, r) => sum + r.retrievalTime, 0) / results.length)}ms`);
  console.log(`🤖 Average response time: ${Math.round(results.reduce((sum, r) => sum + r.responseTime, 0) / results.length)}ms`);
  console.log(`⏱️  Average total time: ${Math.round(results.reduce((sum, r) => sum + r.totalTime, 0) / results.length)}ms`);
  console.log(`🔍 Average instructions retrieved: ${Math.round(results.reduce((sum, r) => sum + r.instructions, 0) / results.length)}`);
  console.log(`🏆 Average overall quality: ${Math.round(results.reduce((sum, r) => sum + r.qualityAnalysis.overallScore, 0) / results.length * 100)}%`);
  
  const categoryScores = {};
  results.forEach(result => {
    if (!categoryScores[result.category]) {
      categoryScores[result.category] = [];
    }
    categoryScores[result.category].push(result.qualityAnalysis.overallScore);
  });
  
  console.log('\n📂 [SUMMARY] Quality by Category:');
  Object.entries(categoryScores).forEach(([category, scores]) => {
    const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    console.log(`   ${category}: ${Math.round(avgScore * 100)}%`);
  });
  
  // Check if improvements are working
  const highQualityResponses = results.filter(r => r.qualityAnalysis.overallScore >= 0.7).length;
  const successRate = Math.round((highQualityResponses / results.length) * 100);
  
  console.log(`\n🎯 [SUMMARY] Success Rate: ${successRate}% (${highQualityResponses}/${results.length} high-quality responses)`);
  
  if (successRate >= 80) {
    console.log('🎉 [SUCCESS] RAG improvements are working excellently!');
  } else if (successRate >= 60) {
    console.log('✅ [GOOD] RAG improvements are working well with room for optimization');
  } else {
    console.log('⚠️  [NEEDS WORK] RAG improvements need further optimization');
  }
}

// Run the test
testRAGImprovements().catch(console.error); 