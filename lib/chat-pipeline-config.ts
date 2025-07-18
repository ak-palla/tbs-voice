import { TitleGenerationOptions } from './title-generator';

export const CHAT_PIPELINE_CONFIG = {
  // Standardized token limits
  tokenLimits: {
    default: 500,
    voice: 350,
    streaming: 400
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
} as const;

// Helper to get consistent title generation options
export function getTitleGenerationOptions(
  userMessage: string,
  assistantResponse?: string
): TitleGenerationOptions {
  return {
    userMessage,
    assistantResponse,
    maxLength: CHAT_PIPELINE_CONFIG.titleGeneration.maxLength,
    fallbackToKeyPhrases: CHAT_PIPELINE_CONFIG.titleGeneration.fallbackToKeyPhrases
  };
}

// Helper to get consistent quality config
export function getQualityConfig(
  type: 'text' | 'voice' | 'streaming',
  message: string
) {
  const configName = CHAT_PIPELINE_CONFIG.qualityConfigs[type];
  return {
    configName,
    maxTokens: CHAT_PIPELINE_CONFIG.tokenLimits[type] || CHAT_PIPELINE_CONFIG.tokenLimits.default
  };
} 