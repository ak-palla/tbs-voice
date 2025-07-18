import { groqClient, GROQ_MODELS } from './groq-client';
import { responseQualityOptimizer } from './response-quality-optimizer';
import { getQualityConfig } from './chat-pipeline-config';

export type GenerateGroqAIResponseParams = {
  message: string; // user message
  userData?: any;
  instructions?: any[];
  mode?: 'text' | 'voice';
};

export async function generateGroqAIResponse({
  message,
  userData,
  instructions = [],
  mode = 'text',
}: GenerateGroqAIResponseParams): Promise<string> {
  // 1. Build prompt
  let basePrompt = "You are Command HQ, an AI assistant focused on helping users achieve their goals.\n\n";
  if (userData) {
    basePrompt += `User Context:\n`;
    if (userData.first_name) basePrompt += `- Name: ${userData.first_name} ${userData.last_name || ''}\n`;
    if (userData.role) basePrompt += `- Role: ${userData.role}\n`;
    if (userData.company) basePrompt += `- Company: ${userData.company}\n`;
    if (userData.industry) basePrompt += `- Industry: ${userData.industry}\n`;
    if (userData.goals) basePrompt += `- Goals: ${userData.goals}\n`;
    if (userData.challenges) basePrompt += `- Challenges: ${userData.challenges}\n`;
    if (userData.preferred_communication_style) basePrompt += `- Communication Style: ${userData.preferred_communication_style}\n`;
    basePrompt += '\n';
  }
  if (instructions.length > 0) {
    basePrompt += `Key Instructions:\n`;
    instructions.slice(0, mode === 'voice' ? 2 : 3).forEach((inst, i) => {
      basePrompt += `${i + 1}. ${inst.title}: ${inst.content}\n`;
    });
  }
  basePrompt += "\nProvide helpful, actionable responses based on this context.";

  // 2. Get quality config
  const { configName, maxTokens } = getQualityConfig(mode, message);
  const qualityConfig = responseQualityOptimizer.getGenerationConfig(configName, message, mode);
  const qualityEnhancement = responseQualityOptimizer.getPromptEnhancement(configName, message, mode);
  const systemPrompt = basePrompt + qualityEnhancement;

  // 3. Generate response
  try {
    const response = await groqClient.generateResponse([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message }
    ], { maxTokens });
    return response;
  } catch (err) {
    // Fallback logic (e.g., call Gemini or return error)
    throw err;
  }
} 