#!/usr/bin/env node

/**
 * Chatbot Performance Benchmark Script
 * Tests response times for different chat endpoints
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000'; // Adjust as needed
const TEST_MESSAGES = [
  "Hello, how can you help me with my business?",
  "What's the best way to improve productivity?",
  "Can you analyze my business metrics?",
  "Help me create a marketing strategy",
  "What are some innovation opportunities?"
];

// Simulate a test user session
const TEST_USER_DATA = {
  conversationId: 'benchmark-test-' + Date.now(),
  instanceId: null // Will be created during test
};

async function benchmarkEndpoint(endpoint, payload, iterations = 3) {
  const times = [];
  console.log(`\n🔥 Benchmarking ${endpoint}...`);
  
  for (let i = 0; i < iterations; i++) {
    const startTime = performance.now();
    
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      
      let responseData;
      if (endpoint.includes('innovation-chat') && payload.action === 'send_message') {
        // Handle streaming response
        const reader = response.body.getReader();
        let fullResponse = '';
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = new TextDecoder().decode(value);
          fullResponse += chunk;
        }
        responseData = { fullResponse };
      } else {
        responseData = await response.json();
      }
      
      // Log performance metrics if available
      if (responseData.performance) {
        console.log(`    📊 API Performance: ${responseData.performance.totalTime}ms (${responseData.performance.cacheHits} cache hits)`);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      times.push(duration);
      
      console.log(`  Iteration ${i + 1}: ${duration.toFixed(2)}ms`);
    } catch (error) {
      console.error(`  Iteration ${i + 1} failed:`, error.message);
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  if (times.length > 0) {
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const min = Math.min(...times);
    const max = Math.max(...times);
    
    console.log(`  📊 Average: ${avg.toFixed(2)}ms`);
    console.log(`  📊 Min: ${min.toFixed(2)}ms`);
    console.log(`  📊 Max: ${max.toFixed(2)}ms`);
    
    return { avg, min, max, times };
  }
  
  return null;
}

async function testChatEndpoint() {
  console.log('\n=== TESTING /api/chat ENDPOINT ===');
  
  const results = [];
  
  for (const message of TEST_MESSAGES) {
    const payload = {
      messages: [
        { role: 'user', content: message }
      ],
      conversationId: TEST_USER_DATA.conversationId
    };
    
    const result = await benchmarkEndpoint('/api/chat', payload, 2);
    if (result) {
      results.push({ message, ...result });
    }
  }
  
  return results;
}

async function testInnovationChatEndpoint() {
  console.log('\n=== TESTING /api/innovation-chat ENDPOINT ===');
  
  // First create an instance
  console.log('🔄 Creating innovation chat instance...');
  const createResponse = await fetch(`${BASE_URL}/api/innovation-chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'create_instance',
      title: 'Benchmark Test Instance'
    })
  });
  
  const createData = await createResponse.json();
  const instanceId = createData.instance?.id;
  
  if (!instanceId) {
    console.error('❌ Failed to create innovation chat instance');
    return [];
  }
  
  console.log(`✅ Created instance: ${instanceId}`);
  
  const results = [];
  
  for (const message of TEST_MESSAGES) {
    const payload = {
      action: 'send_message',
      message,
      instanceId
    };
    
    const result = await benchmarkEndpoint('/api/innovation-chat', payload, 2);
    if (result) {
      results.push({ message, ...result });
    }
  }
  
  return results;
}

async function analyzeResults(chatResults, innovationResults) {
  console.log('\n=== PERFORMANCE ANALYSIS ===');
  
  if (chatResults.length > 0) {
    const chatAvg = chatResults.reduce((sum, r) => sum + r.avg, 0) / chatResults.length;
    console.log(`📈 Regular Chat Average: ${chatAvg.toFixed(2)}ms`);
  }
  
  if (innovationResults.length > 0) {
    const innovationAvg = innovationResults.reduce((sum, r) => sum + r.avg, 0) / innovationResults.length;
    console.log(`📈 Innovation Chat Average: ${innovationAvg.toFixed(2)}ms`);
  }
  
  // Identify slow operations
  const allResults = [...chatResults, ...innovationResults];
  const slowResults = allResults.filter(r => r.avg > 5000); // > 5 seconds
  
  if (slowResults.length > 0) {
    console.log('\n⚠️  SLOW OPERATIONS (>5s):');
    slowResults.forEach(r => {
      console.log(`  - "${r.message.substring(0, 30)}...": ${r.avg.toFixed(2)}ms`);
    });
  }
  
  // Performance recommendations
  console.log('\n💡 RECOMMENDATIONS:');
  if (chatResults.some(r => r.avg > 3000)) {
    console.log('  - Regular chat responses > 3s - optimize vector search');
  }
  if (innovationResults.some(r => r.avg > 8000)) {
    console.log('  - Innovation chat responses > 8s - optimize database queries');
  }
  
  return {
    chatAverage: chatResults.length > 0 ? chatResults.reduce((sum, r) => sum + r.avg, 0) / chatResults.length : 0,
    innovationAverage: innovationResults.length > 0 ? innovationResults.reduce((sum, r) => sum + r.avg, 0) / innovationResults.length : 0
  };
}

async function main() {
  console.log('🚀 Starting Chatbot Performance Benchmark');
  console.log(`📊 Testing against: ${BASE_URL}`);
  console.log(`🔄 Test messages: ${TEST_MESSAGES.length}`);
  
  try {
    const chatResults = await testChatEndpoint();
    const innovationResults = await testInnovationChatEndpoint();
    
    const analysis = await analyzeResults(chatResults, innovationResults);
    
    console.log('\n=== BENCHMARK COMPLETE ===');
    console.log(`✅ Regular Chat Avg: ${analysis.chatAverage.toFixed(2)}ms`);
    console.log(`✅ Innovation Chat Avg: ${analysis.innovationAverage.toFixed(2)}ms`);
    
  } catch (error) {
    console.error('❌ Benchmark failed:', error);
  }
}

if (require.main === module) {
  main();
}

module.exports = { benchmarkEndpoint, analyzeResults };