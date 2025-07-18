/**
 * Groq API Client for Ultra-Fast AI Generation (JavaScript version for CommonJS)
 * Implements high-speed inference for sub-5s response times
 */

const Groq = require("groq-sdk");

// Lazy initialize Groq client to ensure environment variables are loaded
let groq = null;
function getGroqClient() {
  if (!groq) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error('GROQ_API_KEY environment variable is not set');
    }
    groq = new Groq({ apiKey });
  }
  return groq;
}

// Available Groq models (sorted by speed)
const GROQ_MODELS = {
  INSTANT: "llama3-70b-8192", // Using 70B model for all use cases
  FASTEST: "llama3-70b-8192", // Standardized to 70B model
  BALANCED: "llama3-70b-8192", // Standardized to 70B model
  QUALITY: "llama3-70b-8192", // Standardized to 70B model
};

class GroqClient {
  constructor() {
    this.defaultConfig = {
      model: GROQ_MODELS.INSTANT, // Will now use llama3-70b-8192 consistently
      maxTokens: 2000,
      temperature: 0.4,
      topP: 0.9,
      stream: false
    };
  }

  /**
   * Generate response with ultra-fast Groq inference and rate limit handling
   */
  async generateResponse(messages, config = {}) {
    const startTime = Date.now();
    const finalConfig = { ...this.defaultConfig, ...config };
    
    console.log(`🚀 [GROQ] Starting generation with ${finalConfig.model}`);
    console.log(`🔧 [GROQ] Config: ${finalConfig.maxTokens} tokens, temp: ${finalConfig.temperature}`);

    // Rate limit retry logic
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const completion = await getGroqClient().chat.completions.create({
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          model: finalConfig.model,
          max_tokens: finalConfig.maxTokens,
          temperature: finalConfig.temperature,
          top_p: finalConfig.topP,
          stream: finalConfig.stream
        });

        const responseText = completion.choices[0]?.message?.content || '';
        const generationTime = Date.now() - startTime;
        
        console.log(`✅ [GROQ] Generated ${responseText.length} chars in ${generationTime}ms (attempt ${attempt})`);
        console.log(`⚡ [GROQ] Speed: ${Math.round(responseText.length / generationTime * 1000)} chars/sec`);
        
        return responseText;
        
      } catch (error) {
        const isRateLimit = error?.message?.includes('rate limit') || 
                           error?.message?.includes('429') ||
                           error?.status === 429;
        
        if (isRateLimit && attempt < 3) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          console.warn(`⚠️ [GROQ] Rate limit hit (attempt ${attempt}/3), retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        console.error(`❌ [GROQ] Generation failed (attempt ${attempt}/3):`, error);
        throw new Error(`Groq generation failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    throw new Error('Groq generation failed after 3 attempts');
  }

  /**
   * Test Groq API connectivity and speed
   */
  async testConnection() {
    try {
      const testMessages = [
        { role: 'user', content: 'Say "test successful" if you can hear me.' }
      ];
      
      const response = await this.generateResponse(testMessages, { maxTokens: 50 });
      return response.toLowerCase().includes('test successful');
    } catch (error) {
      console.error('❌ [GROQ TEST] Connection test failed:', error);
      return false;
    }
  }
}

// Create singleton instance
const groqClient = new GroqClient();

// Helper function for formatting messages (simplified version)
function formatMessagesForGroq(systemPrompt, userMessage) {
  const messages = [];
  
  if (systemPrompt) {
    messages.push({
      role: 'system',
      content: systemPrompt
    });
  }
  
  messages.push({
    role: 'user',
    content: userMessage
  });
  
  return messages;
}

module.exports = {
  groqClient,
  GROQ_MODELS,
  GroqClient,
  formatMessagesForGroq
};