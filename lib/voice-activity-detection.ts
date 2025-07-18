/**
 * Voice Activity Detection (VAD) System
 * Provides intelligent voice detection and silence handling for better UX
 */

export interface VADConfig {
  // Silence detection settings
  silenceThreshold: number;          // Volume threshold for silence (0-1)
  silenceDurationMs: number;         // Duration of silence before auto-stop (ms)
  minRecordingDurationMs: number;    // Minimum recording duration before allowing auto-stop
  maxRecordingDurationMs: number;    // Maximum recording duration (auto-stop)
  
  // Voice detection settings
  voiceThreshold: number;            // Volume threshold for voice detection
  voiceStartDelayMs: number;         // Delay before starting recording after voice detected
  
  // Audio processing settings
  sampleRate: number;                // Audio sample rate
  analyzerFFTSize: number;           // FFT size for frequency analysis
  smoothingTimeConstant: number;     // Smoothing for volume analysis
  
  // Advanced features
  enableNoiseGate: boolean;          // Enable noise gate to filter background noise
  noiseGateThreshold: number;        // Noise gate threshold
  enableEnergyBasedDetection: boolean; // Use energy-based detection vs simple volume
  adaptiveThreshold: boolean;        // Automatically adjust thresholds based on environment
}

export interface VADCallbacks {
  onVoiceStart?: () => void;
  onVoiceEnd?: () => void;
  onSilenceDetected?: (duration: number) => void;
  onVolumeChange?: (volume: number) => void;
  onAutoStop?: (reason: 'silence' | 'maxDuration' | 'lowEnergy') => void;
  onError?: (error: Error) => void;
}

export class VoiceActivityDetector {
  private config: VADConfig;
  private callbacks: VADCallbacks;
  
  // Audio context and analysis
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private microphone: MediaStreamAudioSourceNode | null = null;
  private dataArray: Uint8Array | null = null;
  private stream: MediaStream | null = null;
  
  // Detection state
  private isDetecting = false;
  private isVoiceActive = false;
  private silenceStartTime = 0;
  private recordingStartTime = 0;
  private currentVolume = 0;
  private backgroundNoiseLevel = 0;
  private adaptiveThreshold = 0;
  
  // Animation frame for real-time analysis
  private animationFrameId: number | null = null;
  
  // Calibration data
  private calibrationSamples: number[] = [];
  private isCalibrated = false;

  constructor(config: Partial<VADConfig> = {}, callbacks: VADCallbacks = {}) {
    this.config = {
      silenceThreshold: 0.02,
      silenceDurationMs: 2000,
      minRecordingDurationMs: 500,
      maxRecordingDurationMs: 30000,
      voiceThreshold: 0.05,
      voiceStartDelayMs: 100,
      sampleRate: 44100,
      analyzerFFTSize: 1024,
      smoothingTimeConstant: 0.8,
      enableNoiseGate: true,
      noiseGateThreshold: 0.01,
      enableEnergyBasedDetection: true,
      adaptiveThreshold: true,
      ...config
    };
    
    this.callbacks = callbacks;
    this.adaptiveThreshold = this.config.voiceThreshold;
  }

  /**
   * Initialize VAD with microphone access
   */
  async initialize(): Promise<void> {
    try {
      console.log('🎤 [VAD] Initializing Voice Activity Detection...');
      
      // Get microphone access
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: this.config.sampleRate,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      // Create audio context
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: this.config.sampleRate
      });

      // Create analyser
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = this.config.analyzerFFTSize;
      this.analyser.smoothingTimeConstant = this.config.smoothingTimeConstant;

      // Connect microphone to analyser
      this.microphone = this.audioContext.createMediaStreamSource(this.stream);
      this.microphone.connect(this.analyser);

      // Initialize data array for frequency analysis
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

      console.log('✅ [VAD] Initialized successfully');
      
      // Start background noise calibration
      await this.calibrateBackgroundNoise();
      
    } catch (error) {
      console.error('❌ [VAD] Initialization failed:', error);
      this.callbacks.onError?.(error instanceof Error ? error : new Error('VAD initialization failed'));
      throw error;
    }
  }

  /**
   * Calibrate background noise level for adaptive thresholding
   */
  private async calibrateBackgroundNoise(): Promise<void> {
    console.log('🔧 [VAD] Calibrating background noise...');
    
    this.calibrationSamples = [];
    
    return new Promise((resolve) => {
      const calibrationDuration = 2000; // 2 seconds
      const startTime = Date.now();
      
      const calibrate = () => {
        if (Date.now() - startTime > calibrationDuration) {
          // Calculate average background noise
          this.backgroundNoiseLevel = this.calibrationSamples.reduce((sum, sample) => sum + sample, 0) / this.calibrationSamples.length;
          
          if (this.config.adaptiveThreshold) {
            // Set adaptive threshold based on background noise
            this.adaptiveThreshold = Math.max(
              this.backgroundNoiseLevel * 3,
              this.config.voiceThreshold
            );
          }
          
          this.isCalibrated = true;
          console.log(`✅ [VAD] Calibration complete. Background noise: ${this.backgroundNoiseLevel.toFixed(4)}, Adaptive threshold: ${this.adaptiveThreshold.toFixed(4)}`);
          resolve();
          return;
        }
        
        const volume = this.getCurrentVolume();
        if (volume > 0) {
          this.calibrationSamples.push(volume);
        }
        
        requestAnimationFrame(calibrate);
      };
      
      calibrate();
    });
  }

  /**
   * Start voice activity detection
   */
  startDetection(): void {
    if (!this.audioContext || !this.analyser || !this.dataArray) {
      throw new Error('VAD not initialized');
    }

    if (this.isDetecting) {
      return;
    }

    console.log('🔍 [VAD] Starting voice detection...');
    this.isDetecting = true;
    this.recordingStartTime = Date.now();
    this.silenceStartTime = 0;
    this.isVoiceActive = false;
    
    this.detectVoiceActivity();
  }

  /**
   * Stop voice activity detection
   */
  stopDetection(): void {
    if (!this.isDetecting) {
      return;
    }

    console.log('⏹️ [VAD] Stopping voice detection...');
    this.isDetecting = false;
    this.isVoiceActive = false;
    
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Main voice detection loop
   */
  private detectVoiceActivity(): void {
    if (!this.isDetecting || !this.analyser || !this.dataArray) {
      return;
    }

    // Get current audio data
    this.analyser.getByteFrequencyData(this.dataArray);
    
    // Calculate volume and energy
    const volume = this.getCurrentVolume();
    const energy = this.calculateAudioEnergy();
    
    this.currentVolume = volume;
    this.callbacks.onVolumeChange?.(volume);

    // Apply noise gate if enabled
    const effectiveVolume = this.config.enableNoiseGate 
      ? this.applyNoiseGate(volume)
      : volume;

    // Determine if voice is active
    const threshold = this.config.adaptiveThreshold ? this.adaptiveThreshold : this.config.voiceThreshold;
    const isVoiceDetected = this.config.enableEnergyBasedDetection
      ? energy > threshold && effectiveVolume > this.config.silenceThreshold
      : effectiveVolume > threshold;

    const currentTime = Date.now();
    const recordingDuration = currentTime - this.recordingStartTime;

    // Handle voice state changes
    if (isVoiceDetected && !this.isVoiceActive) {
      // Voice started
      this.isVoiceActive = true;
      this.silenceStartTime = 0;
      this.callbacks.onVoiceStart?.();
      console.log('🎤 [VAD] Voice activity started');
      
    } else if (!isVoiceDetected && this.isVoiceActive) {
      // Voice stopped
      this.isVoiceActive = false;
      this.silenceStartTime = currentTime;
      this.callbacks.onVoiceEnd?.();
      console.log('🔇 [VAD] Voice activity ended');
    }

    // Handle silence detection
    if (!this.isVoiceActive && this.silenceStartTime > 0) {
      const silenceDuration = currentTime - this.silenceStartTime;
      this.callbacks.onSilenceDetected?.(silenceDuration);
      
      // Auto-stop on prolonged silence (but only after minimum recording duration)
      if (silenceDuration > this.config.silenceDurationMs && 
          recordingDuration > this.config.minRecordingDurationMs) {
        console.log(`⏹️ [VAD] Auto-stopping due to silence (${silenceDuration}ms)`);
        this.callbacks.onAutoStop?.('silence');
        this.stopDetection();
        return;
      }
    }

    // Auto-stop on maximum duration
    if (recordingDuration > this.config.maxRecordingDurationMs) {
      console.log(`⏹️ [VAD] Auto-stopping due to max duration (${recordingDuration}ms)`);
      this.callbacks.onAutoStop?.('maxDuration');
      this.stopDetection();
      return;
    }

    // Auto-stop on consistently low energy (possible microphone issue)
    if (recordingDuration > 5000 && energy < 0.001) {
      console.log('⏹️ [VAD] Auto-stopping due to low energy');
      this.callbacks.onAutoStop?.('lowEnergy');
      this.stopDetection();
      return;
    }

    // Continue detection
    this.animationFrameId = requestAnimationFrame(() => this.detectVoiceActivity());
  }

  /**
   * Calculate current volume level
   */
  private getCurrentVolume(): number {
    if (!this.analyser || !this.dataArray) {
      return 0;
    }

    this.analyser.getByteFrequencyData(this.dataArray);
    
    // Calculate RMS (Root Mean Square) volume
    let sum = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      const amplitude = this.dataArray[i] / 255;
      sum += amplitude * amplitude;
    }
    
    return Math.sqrt(sum / this.dataArray.length);
  }

  /**
   * Calculate audio energy (frequency-based)
   */
  private calculateAudioEnergy(): number {
    if (!this.analyser || !this.dataArray) {
      return 0;
    }

    this.analyser.getByteFrequencyData(this.dataArray);
    
    // Focus on speech frequency range (300-3400 Hz)
    const nyquist = this.config.sampleRate / 2;
    const binWidth = nyquist / this.dataArray.length;
    const startBin = Math.floor(300 / binWidth);
    const endBin = Math.floor(3400 / binWidth);
    
    let energy = 0;
    for (let i = startBin; i < Math.min(endBin, this.dataArray.length); i++) {
      energy += this.dataArray[i] * this.dataArray[i];
    }
    
    return Math.sqrt(energy / (endBin - startBin)) / 255;
  }

  /**
   * Apply noise gate to filter background noise
   */
  private applyNoiseGate(volume: number): number {
    if (volume < this.config.noiseGateThreshold) {
      return 0;
    }
    
    // Apply smooth transition above threshold
    const ratio = (volume - this.config.noiseGateThreshold) / (1 - this.config.noiseGateThreshold);
    return Math.pow(ratio, 0.5); // Soft knee
  }

  /**
   * Get current detection state
   */
  getState(): {
    isDetecting: boolean;
    isVoiceActive: boolean;
    currentVolume: number;
    backgroundNoiseLevel: number;
    adaptiveThreshold: number;
    isCalibrated: boolean;
  } {
    return {
      isDetecting: this.isDetecting,
      isVoiceActive: this.isVoiceActive,
      currentVolume: this.currentVolume,
      backgroundNoiseLevel: this.backgroundNoiseLevel,
      adaptiveThreshold: this.adaptiveThreshold,
      isCalibrated: this.isCalibrated
    };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<VADConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    if (newConfig.adaptiveThreshold !== undefined && !newConfig.adaptiveThreshold) {
      this.adaptiveThreshold = this.config.voiceThreshold;
    }
    
    console.log('🔧 [VAD] Configuration updated:', newConfig);
  }

  /**
   * Manually trigger recalibration
   */
  async recalibrate(): Promise<void> {
    if (this.isDetecting) {
      console.warn('⚠️ [VAD] Cannot recalibrate while detecting');
      return;
    }
    
    this.isCalibrated = false;
    await this.calibrateBackgroundNoise();
  }

  /**
   * Cleanup and release resources
   */
  dispose(): void {
    console.log('🧹 [VAD] Disposing resources...');
    
    this.stopDetection();
    
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    
    if (this.microphone) {
      this.microphone.disconnect();
      this.microphone = null;
    }
    
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    this.analyser = null;
    this.dataArray = null;
  }
}

/**
 * Factory function to create VAD with common presets
 */
export function createVAD(preset: 'sensitive' | 'balanced' | 'noise-tolerant' | 'custom', customConfig?: Partial<VADConfig>): VADConfig {
  const presets: Record<string, VADConfig> = {
    sensitive: {
      silenceThreshold: 0.01,
      silenceDurationMs: 1500,
      minRecordingDurationMs: 300,
      maxRecordingDurationMs: 25000,
      voiceThreshold: 0.03,
      voiceStartDelayMs: 50,
      sampleRate: 44100,
      analyzerFFTSize: 2048,
      smoothingTimeConstant: 0.9,
      enableNoiseGate: true,
      noiseGateThreshold: 0.005,
      enableEnergyBasedDetection: true,
      adaptiveThreshold: true
    },
    
    balanced: {
      silenceThreshold: 0.02,
      silenceDurationMs: 2000,
      minRecordingDurationMs: 500,
      maxRecordingDurationMs: 30000,
      voiceThreshold: 0.05,
      voiceStartDelayMs: 100,
      sampleRate: 44100,
      analyzerFFTSize: 1024,
      smoothingTimeConstant: 0.8,
      enableNoiseGate: true,
      noiseGateThreshold: 0.01,
      enableEnergyBasedDetection: true,
      adaptiveThreshold: true
    },
    
    'noise-tolerant': {
      silenceThreshold: 0.05,
      silenceDurationMs: 2500,
      minRecordingDurationMs: 800,
      maxRecordingDurationMs: 35000,
      voiceThreshold: 0.1,
      voiceStartDelayMs: 200,
      sampleRate: 44100,
      analyzerFFTSize: 512,
      smoothingTimeConstant: 0.7,
      enableNoiseGate: true,
      noiseGateThreshold: 0.02,
      enableEnergyBasedDetection: true,
      adaptiveThreshold: true
    },
    
    custom: {
      silenceThreshold: 0.02,
      silenceDurationMs: 2000,
      minRecordingDurationMs: 500,
      maxRecordingDurationMs: 30000,
      voiceThreshold: 0.05,
      voiceStartDelayMs: 100,
      sampleRate: 44100,
      analyzerFFTSize: 1024,
      smoothingTimeConstant: 0.8,
      enableNoiseGate: true,
      noiseGateThreshold: 0.01,
      enableEnergyBasedDetection: true,
      adaptiveThreshold: true
    }
  };
  
  return { ...presets[preset], ...customConfig };
} 