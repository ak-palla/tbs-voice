/**
 * Chat Pipeline Configuration (JavaScript version for CommonJS)
 */

const CHAT_PIPELINE_CONFIG = {
  // Standardized token limits
  tokenLimits: {
    default: 500,
    voice: 350,
    streaming: 400,
    text: 400  // Add text specific limit
  },

  // Standardized title generation options
  titleGeneration: {
    maxLength: 50,
    fallbackToKeyPhrases: true,
    confidenceThreshold: 0.7
  },

  // Quality configuration mapping
  qualityConfigs: {
    text: 'main-chat',
    voice: 'websocket-voice',
    streaming: 'enhanced-chat'
  }
};

// Helper to get consistent title generation options
function getTitleGenerationOptions(
  userMessage,
  assistantResponse,
  inputType = 'text'
) {
  return {
    userMessage,
    assistantResponse,
    inputType,
    maxLength: CHAT_PIPELINE_CONFIG.titleGeneration.maxLength,
    temperature: 0.3
  };
}

// Helper to get consistent quality config
function getQualityConfig(type, message) {
  const configName = CHAT_PIPELINE_CONFIG.qualityConfigs[type] || CHAT_PIPELINE_CONFIG.qualityConfigs.text;
  return {
    configName,
    maxTokens: CHAT_PIPELINE_CONFIG.tokenLimits[type] || CHAT_PIPELINE_CONFIG.tokenLimits.default
  };
}

module.exports = {
  CHAT_PIPELINE_CONFIG,
  getTitleGenerationOptions,
  getQualityConfig
};