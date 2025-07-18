/**
 * Enhanced Audio Handler for Complete Audio Files
 * Handles both Deepgram TTS audio files and Browser TTS fallback
 */

import { browserTTSService } from './browser-tts-service';

interface AudioPlaybackOptions {
  volume?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
}

interface AudioControlState {
  isPlaying: boolean;
  isPaused: boolean;
  duration: number;
  currentTime: number;
  volume: number;
}

export class EnhancedAudioHandler {
  private currentAudio: HTMLAudioElement | null = null;
  private audioContext: AudioContext | null = null;
  private controlCallbacks: Map<string, (state: AudioControlState) => void> = new Map();

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  /**
   * Play complete audio file from Deepgram TTS
   */
  async playDeepgramAudio(audioData: string, audioUrl: string, options: AudioPlaybackOptions = {}): Promise<void> {
    try {
      console.log(`🎵 [AUDIO HANDLER] Playing Deepgram audio file`);
      
      // Stop any currently playing audio
      this.stopCurrentAudio();
      
      // Create audio element from data URL
      const audio = new Audio(audioUrl);
      audio.volume = options.volume || 1.0;
      
      // Set up event listeners
      audio.onloadstart = () => {
        console.log(`🎵 [AUDIO HANDLER] Audio loading started`);
      };
      
      audio.oncanplay = () => {
        console.log(`🎵 [AUDIO HANDLER] Audio can start playing`);
        options.onStart?.();
        this.updateControlState(audio);
      };
      
      audio.onended = () => {
        console.log(`🎵 [AUDIO HANDLER] Audio playback completed`);
        options.onEnd?.();
        this.currentAudio = null;
        this.updateControlState(null);
      };
      
      audio.onerror = (event) => {
        console.error(`❌ [AUDIO HANDLER] Audio playback error:`, event);
        options.onError?.('Audio playback failed');
        this.currentAudio = null;
        this.updateControlState(null);
      };
      
      audio.ontimeupdate = () => {
        this.updateControlState(audio);
      };
      
      // Start playback
      this.currentAudio = audio;
      await audio.play();
      
      console.log(`✅ [AUDIO HANDLER] Deepgram audio playback started`);
      
    } catch (error) {
      console.error(`❌ [AUDIO HANDLER] Failed to play Deepgram audio:`, error);
      options.onError?.(error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Play audio using Browser TTS fallback
   */
  async playBrowserTTS(text: string, accent: 'US' | 'UK', gender: 'female' | 'male', options: AudioPlaybackOptions = {}): Promise<void> {
    try {
      console.log(`🌐 [AUDIO HANDLER] Playing Browser TTS audio`);
      
      // Stop any currently playing audio
      this.stopCurrentAudio();
      
      options.onStart?.();
      
      const result = await browserTTSService.generateAudio({
        text,
        accent,
        gender,
        volume: options.volume || 1.0
      });
      
      if (result.success) {
        console.log(`✅ [AUDIO HANDLER] Browser TTS playback completed`);
        options.onEnd?.();
      } else {
        console.error(`❌ [AUDIO HANDLER] Browser TTS failed:`, result.error);
        options.onError?.(result.error || 'Browser TTS failed');
      }
      
    } catch (error) {
      console.error(`❌ [AUDIO HANDLER] Failed to play Browser TTS:`, error);
      options.onError?.(error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Play audio with enhanced recording capability (Browser TTS)
   */
  async playBrowserTTSWithRecording(text: string, accent: 'US' | 'UK', gender: 'female' | 'male', options: AudioPlaybackOptions = {}): Promise<void> {
    try {
      console.log(`🌐 [AUDIO HANDLER] Playing Browser TTS with recording capability`);
      
      // Stop any currently playing audio
      this.stopCurrentAudio();
      
      const result = await browserTTSService.generateAudioWithRecording({
        text,
        accent,
        gender,
        volume: options.volume || 1.0
      });
      
      if (result.success && result.audioUrl) {
        // Play the recorded audio file
        await this.playDeepgramAudio('', result.audioUrl, options);
      } else {
        // Fallback to direct speech synthesis
        await this.playBrowserTTS(text, accent, gender, options);
      }
      
    } catch (error) {
      console.error(`❌ [AUDIO HANDLER] Failed to play Browser TTS with recording:`, error);
      options.onError?.(error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Control audio playback
   */
  pause(): void {
    if (this.currentAudio && !this.currentAudio.paused) {
      this.currentAudio.pause();
      console.log(`⏸️ [AUDIO HANDLER] Audio paused`);
      this.updateControlState(this.currentAudio);
    }
  }

  resume(): void {
    if (this.currentAudio && this.currentAudio.paused) {
      this.currentAudio.play();
      console.log(`▶️ [AUDIO HANDLER] Audio resumed`);
      this.updateControlState(this.currentAudio);
    }
  }

  stop(): void {
    this.stopCurrentAudio();
    console.log(`⏹️ [AUDIO HANDLER] Audio stopped`);
  }

  /**
   * Set volume (0.0 to 1.0)
   */
  setVolume(volume: number): void {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    if (this.currentAudio) {
      this.currentAudio.volume = clampedVolume;
      this.updateControlState(this.currentAudio);
    }
  }

  /**
   * Seek to specific time
   */
  seekTo(time: number): void {
    if (this.currentAudio) {
      this.currentAudio.currentTime = Math.max(0, Math.min(this.currentAudio.duration || 0, time));
      this.updateControlState(this.currentAudio);
    }
  }

  /**
   * Get current playback state
   */
  getPlaybackState(): AudioControlState {
    if (!this.currentAudio) {
      return {
        isPlaying: false,
        isPaused: false,
        duration: 0,
        currentTime: 0,
        volume: 1.0
      };
    }

    return {
      isPlaying: !this.currentAudio.paused,
      isPaused: this.currentAudio.paused,
      duration: this.currentAudio.duration || 0,
      currentTime: this.currentAudio.currentTime || 0,
      volume: this.currentAudio.volume || 1.0
    };
  }

  /**
   * Register callback for control state updates
   */
  onControlStateUpdate(id: string, callback: (state: AudioControlState) => void): void {
    this.controlCallbacks.set(id, callback);
  }

  /**
   * Unregister callback
   */
  offControlStateUpdate(id: string): void {
    this.controlCallbacks.delete(id);
  }

  /**
   * Check if audio is currently playing
   */
  isPlaying(): boolean {
    return this.currentAudio !== null && !this.currentAudio.paused;
  }

  /**
   * Private: Stop current audio
   */
  private stopCurrentAudio(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
      this.updateControlState(null);
    }
  }

  /**
   * Private: Update control state and notify callbacks
   */
  private updateControlState(audio: HTMLAudioElement | null): void {
    const state = this.getPlaybackState();
    this.controlCallbacks.forEach(callback => {
      try {
        callback(state);
      } catch (error) {
        console.error(`❌ [AUDIO HANDLER] Control callback error:`, error);
      }
    });
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.stopCurrentAudio();
    this.controlCallbacks.clear();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

// Export singleton instance
export const enhancedAudioHandler = new EnhancedAudioHandler();