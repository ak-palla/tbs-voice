/**
 * Enhanced TTS Service with Complete Audio File Generation
 * Primary: Deepgram TTS
 * Fallback: Browser TTS
 */

import { createClient as createDeepgramClient } from "@deepgram/sdk";

// Voice configuration for Deepgram TTS
const VOICE_OPTIONS = {
  'US': {
    'female': 'aura-asteria-en',
    'male': 'aura-arcas-en'
  },
  'UK': {
    'female': 'aura-luna-en', 
    'male': 'aura-perseus-en'
  }
} as const;

// Voice descriptions for UI
export const VOICE_DESCRIPTIONS = {
  'aura-asteria-en': 'Asteria (US Female) - Warm, friendly voice',
  'aura-arcas-en': 'Arcas (US Male) - Deep, professional voice',
  'aura-luna-en': 'Luna (UK Female) - British, elegant voice',
  'aura-perseus-en': 'Perseus (UK Male) - British, authoritative voice'
} as const;

interface TTSOptions {
  text: string;
  accent: 'US' | 'UK';
  gender: 'female' | 'male';
  sessionId?: string;
}

interface TTSResult {
  success: boolean;
  audioData?: string; // Base64 audio data
  audioUrl?: string; // Data URL for playback
  format: 'mp3' | 'wav';
  duration?: number;
  voice: string;
  service: 'deepgram' | 'browser';
  error?: string;
}

export class EnhancedTTSService {
  private deepgramClient: any;
  
  constructor() {
    const apiKey = process.env.DEEPGRAM_API_KEY;
    if (apiKey) {
      this.deepgramClient = createDeepgramClient(apiKey);
    }
  }

  /**
   * Generate complete audio file using Deepgram TTS as primary, Browser TTS as fallback
   */
  async generateCompleteAudio(options: TTSOptions): Promise<TTSResult> {
    console.error(`🎵 [ENHANCED TTS] ==> FUNCTION CALLED <==`);
    console.error(`🎵 [ENHANCED TTS] Starting audio generation for: "${options.text.substring(0, 50)}..."`);
    console.error(`🎵 [ENHANCED TTS] Options:`, { accent: options.accent, gender: options.gender, sessionId: options.sessionId });
    console.error(`🎵 [ENHANCED TTS] Deepgram client available:`, !!this.deepgramClient);
    console.error(`🎵 [ENHANCED TTS] API key available:`, !!process.env.DEEPGRAM_API_KEY);
    
    // Try Deepgram TTS first
    try {
      console.error(`🎵 [ENHANCED TTS] Attempting Deepgram TTS...`);
      const deepgramResult = await this.generateDeepgramAudio(options);
      console.error(`🎵 [ENHANCED TTS] Deepgram TTS result:`, { success: deepgramResult.success, service: deepgramResult.service });
      if (deepgramResult.success) {
        console.error(`✅ [ENHANCED TTS] Deepgram TTS completed successfully`);
        return deepgramResult;
      }
    } catch (error) {
      console.error(`⚠️ [ENHANCED TTS] Deepgram TTS failed:`, error);
    }

    // Fallback to Browser TTS
    console.error(`🔄 [ENHANCED TTS] Falling back to Browser TTS`);
    const browserResult = await this.generateBrowserTTS(options);
    console.error(`🔄 [ENHANCED TTS] Browser TTS result:`, { success: browserResult.success, service: browserResult.service });
    return browserResult;
  }

  /**
   * Generate audio using Deepgram TTS
   */
  private async generateDeepgramAudio(options: TTSOptions): Promise<TTSResult> {
    console.error(`🎤 [DEEPGRAM TTS] ==> FUNCTION CALLED <==`);
    
    if (!this.deepgramClient) {
      console.error(`❌ [DEEPGRAM TTS] Client not initialized`);
      throw new Error('Deepgram client not initialized');
    }

    const selectedVoice = VOICE_OPTIONS[options.accent]?.[options.gender] || 'aura-asteria-en';
    console.error(`🎤 [DEEPGRAM TTS] Selected voice: ${selectedVoice}`);
    
    // Clean and prepare text
    const cleanText = this.cleanTextForTTS(options.text);
    console.error(`🎤 [DEEPGRAM TTS] Clean text: "${cleanText.substring(0, 100)}..."`);
    console.error(`🎤 [DEEPGRAM TTS] Text length: ${cleanText.length}`);
    
    const deepgramOptions = {
      model: selectedVoice,
      encoding: 'mp3' as const
      // Note: MP3 encoding doesn't support container parameter
    };

    console.log(`🎤 [DEEPGRAM TTS] Using voice: ${selectedVoice}`);
    console.log(`🎤 [DEEPGRAM TTS] Options:`, deepgramOptions);

    try {
      const response = await this.deepgramClient.speak.request(
        { text: cleanText },
        deepgramOptions
      );

      // Convert response to audio buffer
      const audioBuffer = await response.getBody();
      if (!audioBuffer || audioBuffer.byteLength === 0) {
        throw new Error('Empty audio response from Deepgram');
      }

      // Convert to base64
      const audioData = Buffer.from(audioBuffer).toString('base64');
      const audioUrl = `data:audio/mp3;base64,${audioData}`;

      console.log(`✅ [DEEPGRAM TTS] Generated ${audioBuffer.byteLength} bytes of audio`);

      return {
        success: true,
        audioData,
        audioUrl,
        format: 'mp3',
        voice: selectedVoice,
        service: 'deepgram'
      };

    } catch (error) {
      console.error(`❌ [DEEPGRAM TTS] Generation failed:`, error);
      throw error;
    }
  }

  /**
   * Generate audio using Browser TTS (fallback)
   */
  private async generateBrowserTTS(options: TTSOptions): Promise<TTSResult> {
    console.error(`🌐 [BROWSER TTS] ==> FALLBACK FUNCTION CALLED <==`);
    console.error(`🌐 [BROWSER TTS] Generating fallback audio for server-side`);
    console.error(`🌐 [BROWSER TTS] Text: "${options.text.substring(0, 50)}..."`);
    
    // For server-side, we'll return a placeholder that tells the client to use browser TTS
    const selectedVoice = VOICE_OPTIONS[options.accent]?.[options.gender] || 'aura-asteria-en';
    console.error(`🌐 [BROWSER TTS] Selected voice: ${selectedVoice}`);
    
    const result = {
      success: true,
      audioData: '', // Empty - client will generate
      audioUrl: '', // Empty - client will generate
      format: 'wav' as const,
      voice: selectedVoice,
      service: 'browser' as const,
      useBrowserTTS: true,
      text: options.text // Pass text for client-side TTS
    } as TTSResult & { useBrowserTTS: boolean; text: string };
    
    console.error(`🌐 [BROWSER TTS] Returning fallback result:`, { success: result.success, service: result.service, useBrowserTTS: true });
    return result;
  }

  /**
   * Clean text for optimal TTS processing
   */
  private cleanTextForTTS(text: string): string {
    return text
      .replace(/[^\w\s.,!?;:()\-'"]/g, '') // Remove special characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
      .substring(0, 4000); // Limit length
  }

  /**
   * Get voice information
   */
  getVoiceInfo(accent: 'US' | 'UK', gender: 'female' | 'male') {
    const voice = VOICE_OPTIONS[accent]?.[gender] || 'aura-asteria-en';
    return {
      voice,
      description: VOICE_DESCRIPTIONS[voice] || 'Unknown voice'
    };
  }

  /**
   * Check if Deepgram is available
   */
  isDeepgramAvailable(): boolean {
    return !!this.deepgramClient && !!process.env.DEEPGRAM_API_KEY;
  }
}

// Export singleton instance
export const enhancedTTSService = new EnhancedTTSService();