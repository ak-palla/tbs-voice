/**
 * Browser TTS Service for Client-Side Fallback
 * Uses Web Speech Synthesis API
 */

interface BrowserTTSOptions {
  text: string;
  accent: 'US' | 'UK';
  gender: 'female' | 'male';
  rate?: number;
  pitch?: number;
  volume?: number;
}

interface BrowserTTSResult {
  success: boolean;
  audioUrl?: string; // Data URL for the generated audio
  duration?: number;
  voice?: string;
  error?: string;
}

export class BrowserTTSService {
  private synthesis: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private isSupported = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
      this.isSupported = true;
      this.loadVoices();
    }
  }

  /**
   * Load available voices
   */
  private loadVoices(): void {
    if (!this.synthesis) return;

    const updateVoices = () => {
      this.voices = this.synthesis!.getVoices();
      console.log(`🌐 [BROWSER TTS] Loaded ${this.voices.length} voices`);
    };

    // Load voices immediately if available
    updateVoices();

    // Also listen for voice changes (some browsers load voices asynchronously)
    this.synthesis.onvoiceschanged = updateVoices;
  }

  /**
   * Generate audio using Browser TTS
   */
  async generateAudio(options: BrowserTTSOptions): Promise<BrowserTTSResult> {
    if (!this.isSupported || !this.synthesis) {
      return {
        success: false,
        error: 'Browser TTS not supported'
      };
    }

    console.log(`🌐 [BROWSER TTS] Generating audio for: "${options.text.substring(0, 50)}..."`);

    try {
      // Find the best matching voice
      const selectedVoice = this.selectVoice(options.accent, options.gender);
      
      // Create utterance
      const utterance = new SpeechSynthesisUtterance(options.text);
      utterance.voice = selectedVoice;
      utterance.rate = options.rate || 1.0;
      utterance.pitch = options.pitch || 1.0;
      utterance.volume = options.volume || 1.0;

      console.log(`🌐 [BROWSER TTS] Using voice: ${selectedVoice?.name || 'default'}`);

      // For now, we'll just use direct speech synthesis
      // In the future, we could capture audio to create a data URL
      return new Promise((resolve) => {
        utterance.onend = () => {
          console.log(`✅ [BROWSER TTS] Speech completed`);
          resolve({
            success: true,
            voice: selectedVoice?.name || 'default'
          });
        };

        utterance.onerror = (event) => {
          console.error(`❌ [BROWSER TTS] Speech error:`, event);
          resolve({
            success: false,
            error: `Speech synthesis error: ${event.error}`
          });
        };

        // Speak the text
        this.synthesis!.speak(utterance);
      });

    } catch (error) {
      console.error(`❌ [BROWSER TTS] Generation failed:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Generate audio with recording capability (advanced fallback)
   */
  async generateAudioWithRecording(options: BrowserTTSOptions): Promise<BrowserTTSResult> {
    if (!this.isSupported) {
      return { success: false, error: 'Browser TTS not supported' };
    }

    try {
      // Create an audio context for recording
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const mediaStreamDestination = audioContext.createMediaStreamDestination();
      
      // Create a oscillator to generate audio (placeholder for actual TTS audio)
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(mediaStreamDestination);
      gainNode.connect(audioContext.destination);
      
      // Record the audio
      const mediaRecorder = new MediaRecorder(mediaStreamDestination.stream);
      const audioChunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      return new Promise((resolve) => {
        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
          const audioUrl = URL.createObjectURL(audioBlob);
          
          resolve({
            success: true,
            audioUrl,
            voice: 'browser-generated'
          });
        };

        // Start recording and synthesis
        mediaRecorder.start();
        
        // Use regular speech synthesis as the audio source
        const utterance = new SpeechSynthesisUtterance(options.text);
        utterance.voice = this.selectVoice(options.accent, options.gender);
        
        utterance.onend = () => {
          setTimeout(() => mediaRecorder.stop(), 100); // Small delay to ensure audio is captured
        };

        utterance.onerror = () => {
          mediaRecorder.stop();
          resolve({
            success: false,
            error: 'Speech synthesis failed during recording'
          });
        };

        this.synthesis!.speak(utterance);
      });

    } catch (error) {
      console.error(`❌ [BROWSER TTS] Recording generation failed:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Select the best voice based on accent and gender preferences
   */
  private selectVoice(accent: 'US' | 'UK', gender: 'female' | 'male'): SpeechSynthesisVoice | null {
    if (this.voices.length === 0) return null;

    // Voice selection priority
    const preferences = [
      // Exact matches
      (voice: SpeechSynthesisVoice) => 
        voice.lang.includes(accent === 'US' ? 'en-US' : 'en-GB') && 
        voice.name.toLowerCase().includes(gender),
      
      // Language matches
      (voice: SpeechSynthesisVoice) => 
        voice.lang.includes(accent === 'US' ? 'en-US' : 'en-GB'),
      
      // Gender matches in any English
      (voice: SpeechSynthesisVoice) => 
        voice.lang.startsWith('en') && voice.name.toLowerCase().includes(gender),
      
      // Any English voice
      (voice: SpeechSynthesisVoice) => voice.lang.startsWith('en'),
      
      // Default voice
      (voice: SpeechSynthesisVoice) => voice.default
    ];

    for (const preference of preferences) {
      const matchingVoice = this.voices.find(preference);
      if (matchingVoice) {
        console.log(`🌐 [BROWSER TTS] Selected voice: ${matchingVoice.name} (${matchingVoice.lang})`);
        return matchingVoice;
      }
    }

    // Fallback to first available voice
    console.log(`🌐 [BROWSER TTS] Using fallback voice: ${this.voices[0].name}`);
    return this.voices[0];
  }

  /**
   * Stop any ongoing speech
   */
  stop(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }

  /**
   * Check if browser TTS is supported
   */
  isSupported(): boolean {
    return this.isSupported;
  }

  /**
   * Get available voices
   */
  getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.voices;
  }

  /**
   * Get voice recommendations for accent/gender combination
   */
  getVoiceRecommendations(accent: 'US' | 'UK', gender: 'female' | 'male'): SpeechSynthesisVoice[] {
    return this.voices.filter(voice => {
      const langMatch = voice.lang.includes(accent === 'US' ? 'en-US' : 'en-GB');
      const genderMatch = voice.name.toLowerCase().includes(gender);
      return langMatch || genderMatch;
    });
  }
}

// Export singleton instance
export const browserTTSService = new BrowserTTSService();