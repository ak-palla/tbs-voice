/**
 * Pipeline State Tracker - Accurate Service Usage & Timing Tracking
 * Replaces timing-based assumptions with actual service state tracking
 */

interface ServiceUsage {
  service: string;
  model?: string;
  status: 'success' | 'fallback' | 'failed';
  startTime: number;
  endTime?: number;
  duration?: number;
  error?: string;
}

interface PipelineState {
  sessionId: string;
  startTime: number;
  endTime?: number;
  totalDuration?: number;
  services: {
    stt?: ServiceUsage;
    ai?: ServiceUsage;
    tts?: ServiceUsage;
    vectorSearch?: ServiceUsage;
    database?: ServiceUsage;
  };
  metadata: {
    userId?: string;
    accent?: string;
    gender?: string;
    inputType?: 'voice' | 'text';
  };
}

class PipelineTracker {
  private static instance: PipelineTracker;
  private activePipelines = new Map<string, PipelineState>();

  static getInstance(): PipelineTracker {
    if (!PipelineTracker.instance) {
      PipelineTracker.instance = new PipelineTracker();
    }
    return PipelineTracker.instance;
  }

  /**
   * Start tracking a new pipeline session
   */
  startPipeline(sessionId: string, metadata: PipelineState['metadata'] = {}): void {
    const pipeline: PipelineState = {
      sessionId,
      startTime: Date.now(),
      services: {},
      metadata
    };
    
    this.activePipelines.set(sessionId, pipeline);
    console.log(`🔍 [PIPELINE] Started tracking session: ${sessionId}`);
  }

  /**
   * Start tracking a specific service
   */
  startService(sessionId: string, serviceType: keyof PipelineState['services'], service: string, model?: string): void {
    const pipeline = this.activePipelines.get(sessionId);
    if (!pipeline) {
      console.warn(`⚠️ [PIPELINE] Session ${sessionId} not found for service ${serviceType}`);
      return;
    }

    pipeline.services[serviceType] = {
      service,
      model,
      status: 'success', // Will be updated if fallback/failure occurs
      startTime: Date.now()
    };

    console.log(`⏱️ [PIPELINE] ${serviceType.toUpperCase()} started: ${service}${model ? ` (${model})` : ''}`);
  }

  /**
   * Mark a service as completed successfully
   */
  completeService(sessionId: string, serviceType: keyof PipelineState['services']): void {
    const pipeline = this.activePipelines.get(sessionId);
    if (!pipeline || !pipeline.services[serviceType]) {
      console.warn(`⚠️ [PIPELINE] Service ${serviceType} not found for session ${sessionId}`);
      return;
    }

    const service = pipeline.services[serviceType]!;
    service.endTime = Date.now();
    service.duration = service.endTime - service.startTime;
    service.status = 'success';

    console.log(`✅ [PIPELINE] ${serviceType.toUpperCase()} completed: ${service.service} (${service.duration}ms)`);
  }

  /**
   * Mark a service as using fallback
   */
  markFallback(sessionId: string, serviceType: keyof PipelineState['services'], fallbackService: string, fallbackModel?: string, reason?: string): void {
    const pipeline = this.activePipelines.get(sessionId);
    if (!pipeline || !pipeline.services[serviceType]) {
      console.warn(`⚠️ [PIPELINE] Service ${serviceType} not found for session ${sessionId}`);
      return;
    }

    const service = pipeline.services[serviceType]!;
    service.endTime = Date.now();
    service.duration = service.endTime - service.startTime;
    service.status = 'fallback';
    service.service = fallbackService;
    service.model = fallbackModel;
    service.error = reason;

    console.log(`🔄 [PIPELINE] ${serviceType.toUpperCase()} fallback: ${fallbackService}${fallbackModel ? ` (${fallbackModel})` : ''} - ${reason}`);
  }

  /**
   * Mark a service as failed
   */
  markFailed(sessionId: string, serviceType: keyof PipelineState['services'], error: string): void {
    const pipeline = this.activePipelines.get(sessionId);
    if (!pipeline || !pipeline.services[serviceType]) {
      console.warn(`⚠️ [PIPELINE] Service ${serviceType} not found for session ${sessionId}`);
      return;
    }

    const service = pipeline.services[serviceType]!;
    service.endTime = Date.now();
    service.duration = service.endTime - service.startTime;
    service.status = 'failed';
    service.error = error;

    console.log(`❌ [PIPELINE] ${serviceType.toUpperCase()} failed: ${service.service} - ${error}`);
  }

  /**
   * Complete the entire pipeline and generate summary
   */
  completePipeline(sessionId: string): PipelineState | null {
    const pipeline = this.activePipelines.get(sessionId);
    if (!pipeline) {
      console.warn(`⚠️ [PIPELINE] Session ${sessionId} not found`);
      return null;
    }

    pipeline.endTime = Date.now();
    pipeline.totalDuration = pipeline.endTime - pipeline.startTime;

    // Generate comprehensive summary
    this.generatePipelineSummary(pipeline);

    // Clean up
    this.activePipelines.delete(sessionId);
    
    return pipeline;
  }

  /**
   * Generate accurate pipeline summary based on actual service usage
   */
  private generatePipelineSummary(pipeline: PipelineState): void {
    const { sessionId, totalDuration, services, metadata } = pipeline;

    console.error(`\n🎯 ========== VOICE PIPELINE SUMMARY [${sessionId}] ==========`);
    console.error(`⏰ Pipeline End Time: ${new Date().toISOString()}`);
    console.error(`🔢 Session ID: ${sessionId}`);
    console.error(`👤 User ID: ${metadata.userId || 'Unknown'}`);
    console.error(`📝 Input Type: ${metadata.inputType || 'Unknown'}`);
    
    console.error(`\n⏱️ DETAILED TIMING BREAKDOWN:`);
    console.error(`  🚀 Total Pipeline Time: ${totalDuration}ms`);
    
    if (services.stt) {
      console.error(`  🎤 Speech-to-Text: ${services.stt.duration || 0}ms`);
    }
    if (services.ai) {
      console.error(`  🤖 AI Generation: ${services.ai.duration || 0}ms`);
    }
    if (services.tts) {
      console.error(`  🔊 Text-to-Speech: ${services.tts.duration || 0}ms`);
    }

    console.error(`\n🤖 ACTUAL MODELS & SERVICES USED:`);
    
    if (services.stt) {
      const sttInfo = services.stt.model ? `${services.stt.service} (${services.stt.model})` : services.stt.service;
      console.error(`  🎤 Speech-to-Text: ${sttInfo}`);
    }
    
    if (services.ai) {
      const aiInfo = services.ai.model ? `${services.ai.service} (${services.ai.model})` : services.ai.service;
      console.error(`  🧠 AI Generation: ${aiInfo}`);
    }
    
    if (services.tts) {
      const ttsInfo = services.tts.model ? `${services.tts.service} (${services.tts.model})` : services.tts.service;
      console.error(`  🔊 Text-to-Speech: ${ttsInfo}`);
    }
    
    if (services.vectorSearch) {
      console.error(`  🗂️ Vector Search: ${services.vectorSearch.service}`);
    }
    
    if (services.database) {
      console.error(`  💾 Database: ${services.database.service}`);
    }

    console.error(`\n⚠️ SERVICE STATUS:`);
    
    if (services.stt) {
      const status = services.stt.status === 'success' ? '✅ PRIMARY' : 
                    services.stt.status === 'fallback' ? '❌ FALLBACK' : '❌ FAILED';
      console.error(`  🎤 STT: ${status} (${services.stt.service})`);
    }
    
    if (services.ai) {
      const status = services.ai.status === 'success' ? '✅ PRIMARY' : 
                    services.ai.status === 'fallback' ? '❌ FALLBACK' : '❌ FAILED';
      console.error(`  🧠 AI: ${status} (${services.ai.service})`);
    }
    
    if (services.tts) {
      const status = services.tts.status === 'success' ? '✅ PRIMARY' : 
                    services.tts.status === 'fallback' ? '❌ FALLBACK' : '❌ FAILED';
      console.error(`  🔊 TTS: ${status} (${services.tts.service})`);
    }

    console.error(`\n📈 PERFORMANCE METRICS:`);
    console.error(`  ⚡ Speed Score: ${totalDuration! < 3000 ? 'EXCELLENT' : totalDuration! < 5000 ? 'GOOD' : totalDuration! < 8000 ? 'FAIR' : 'NEEDS IMPROVEMENT'}`);
    console.error(`  🎯 Target Time: <3000ms (Current: ${totalDuration}ms)`);
    console.error(`  🏆 Time vs Target: ${totalDuration! < 3000 ? `✅ ${3000 - totalDuration!}ms under target` : `⚠️ ${totalDuration! - 3000}ms over target`}`);

    console.error(`\n🔍 BOTTLENECK ANALYSIS:`);
    
    const steps = [
      { name: 'Speech-to-Text', time: services.stt?.duration || 0, target: 800, status: services.stt?.status },
      { name: 'AI Generation', time: services.ai?.duration || 0, target: 1500, status: services.ai?.status },
      { name: 'Text-to-Speech', time: services.tts?.duration || 0, target: 600, status: services.tts?.status }
    ];

    steps.forEach(step => {
      if (step.time > 0) {
        const timeStatus = step.time <= step.target ? '✅' : '⚠️';
        const serviceStatus = step.status === 'success' ? '(Primary)' : 
                             step.status === 'fallback' ? '(Fallback)' : '(Failed)';
        const variance = step.time - step.target;
        console.error(`  ${timeStatus} ${step.name}: ${step.time}ms ${serviceStatus} (target: ${step.target}ms, ${variance > 0 ? `+${variance}ms over` : `${Math.abs(variance)}ms under`})`);
      }
    });

    console.error(`\n🎯 OVERALL SYSTEM STATUS:`);
    const fallbackCount = Object.values(services).filter(s => s?.status === 'fallback').length;
    const failedCount = Object.values(services).filter(s => s?.status === 'failed').length;
    const totalServices = Object.values(services).filter(s => s !== undefined).length;
    
    if (failedCount > 0) {
      console.error(`  ❌ ${failedCount} SERVICE(S) FAILED`);
    } else if (fallbackCount > 0) {
      console.error(`  ⚠️ ${fallbackCount} FALLBACK(S) ACTIVE`);
    } else {
      console.error(`  ✅ ALL SERVICES OPTIMAL`);
    }
    
    console.error(`  🚀 Primary Models: ${totalServices - fallbackCount - failedCount}/${totalServices} working`);
    console.error(`  ⏱️ Speed Rating: ${totalDuration! < 3000 ? '🟢 EXCELLENT' : totalDuration! < 5000 ? '🟡 GOOD' : totalDuration! < 8000 ? '🟠 FAIR' : '🔴 NEEDS IMPROVEMENT'}`);

    console.error(`\n========================================\n`);
  }

  /**
   * Get current pipeline state (for debugging)
   */
  getPipelineState(sessionId: string): PipelineState | undefined {
    return this.activePipelines.get(sessionId);
  }

  /**
   * Get all active pipelines (for monitoring)
   */
  getActivePipelines(): Map<string, PipelineState> {
    return new Map(this.activePipelines);
  }
}

// Export singleton instance for CommonJS compatibility
const pipelineTracker = PipelineTracker.getInstance();

module.exports = {
  PipelineTracker,
  pipelineTracker
};