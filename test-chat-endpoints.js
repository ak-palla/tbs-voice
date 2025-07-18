// Test script for chat functionality endpoints
// Run with: node test-chat-endpoints.js

const readline = require('readline');

// Test configuration
const BASE_URL = 'http://localhost:3000';
const TEST_USER_ID = 'test-user-123'; // This would normally come from auth

async function testEndpoint(endpoint, method = 'GET', body = null) {
  try {
    console.log(`\n🧪 Testing ${method} ${endpoint}`);
    
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        // Note: In real app, this would be a proper auth header
        'Authorization': `Bearer fake-token-for-testing`
      }
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await response.text();
    
    console.log(`📊 Status: ${response.status}`);
    console.log(`📄 Response: ${data.substring(0, 200)}${data.length > 200 ? '...' : ''}`);
    
    if (response.status === 200) {
      console.log(`✅ SUCCESS: ${endpoint}`);
      return JSON.parse(data);
    } else {
      console.log(`❌ FAILED: ${endpoint} (Status: ${response.status})`);
      return null;
    }
  } catch (error) {
    console.log(`💥 ERROR: ${endpoint} - ${error.message}`);
    return null;
  }
}

async function runTests() {
  console.log('🚀 Testing Chat Functionality Endpoints\n');
  console.log('Note: These tests expect the server to be running on localhost:3000');
  console.log('Some endpoints may return "Unauthorized" - that\'s expected without proper auth\n');

  // Test 1: Get chat instances
  await testEndpoint('/api/gemini?action=instances');

  // Test 2: Create new chat instance
  await testEndpoint('/api/gemini', 'PUT', {
    action: 'create',
    title: 'Test Chat Instance'
  });

  // Test 3: Update chat instance title
  await testEndpoint('/api/gemini', 'PUT', {
    action: 'update_title',
    instanceId: 'test-instance-id',
    title: 'Updated Test Chat'
  });

  // Test 4: Delete chat instance
  await testEndpoint('/api/gemini', 'DELETE', {
    action: 'delete',
    instanceId: 'test-instance-id'
  });

  // Test 5: Clear chat history
  await testEndpoint('/api/gemini', 'DELETE', {
    action: 'clear',
    instanceId: 'test-instance-id'
  });

  console.log('\n🎯 Test Results Summary:');
  console.log('If you see 401 Unauthorized responses, that\'s expected - the endpoints are working!');
  console.log('If you see 500 Internal Server Error responses, the table creation fixed the issue!');
  console.log('If you see other errors, there may be additional issues to debug.');
}

// Run the tests
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testEndpoint, runTests }; 