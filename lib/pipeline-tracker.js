/**
 * Pipeline State Tracker - Clean Performance Tracking
 * Simple and accurate service monitoring
 */

class PipelineTracker {
  constructor() {
    this.activePipelines = new Map();
  }

  static getInstance() {
    if (!PipelineTracker.instance) {
      PipelineTracker.instance = new PipelineTracker();
    }
    return PipelineTracker.instance;
  }

  /**
   * Start tracking a new pipeline session
   */
  startPipeline(sessionId, metadata = {}) {
    const pipeline = {
      sessionId,
      startTime: Date.now(),
      services: {},
      metadata
    };
    
    this.activePipelines.set(sessionId, pipeline);
    console.log(`🚀 [PIPELINE] ${sessionId.slice(-8)} started`);
  }

  /**
   * Start tracking a specific service
   */
  startService(sessionId, serviceType, service, model) {
    const pipeline = this.activePipelines.get(sessionId);
    if (!pipeline) return;

    pipeline.services[serviceType] = {
      service,
      model,
      status: 'running',
      startTime: Date.now()
    };
  }

  /**
   * Mark a service as completed successfully
   */
  completeService(sessionId, serviceType) {
    const pipeline = this.activePipelines.get(sessionId);
    if (!pipeline || !pipeline.services[serviceType]) return;

    const service = pipeline.services[serviceType];
    service.endTime = Date.now();
    service.duration = service.endTime - service.startTime;
    service.status = 'success';
  }

  /**
   * Mark a service as using fallback
   */
  markFallback(sessionId, serviceType, fallbackService, fallbackModel, reason) {
    const pipeline = this.activePipelines.get(sessionId);
    if (!pipeline || !pipeline.services[serviceType]) return;

    const service = pipeline.services[serviceType];
    service.endTime = Date.now();
    service.duration = service.endTime - service.startTime;
    service.status = 'fallback';
    service.service = fallbackService;
    service.model = fallbackModel;
    service.error = reason;

    console.warn(`🔄 [${serviceType.toUpperCase()}] Using ${fallbackService} fallback`);
  }

  /**
   * Complete the entire pipeline and generate summary
   */
  completePipeline(sessionId) {
    const pipeline = this.activePipelines.get(sessionId);
    if (!pipeline) return null;

    pipeline.endTime = Date.now();
    pipeline.totalDuration = pipeline.endTime - pipeline.startTime;

    // Clean summary
    this.generateSummary(pipeline);

    // Cleanup
    this.activePipelines.delete(sessionId);
    return pipeline;
  }

  /**
   * Generate clean pipeline summary
   */
  generateSummary(pipeline) {
    const { sessionId, totalDuration, services } = pipeline;
    
    // Service timings
    const stt = services.stt?.duration || 0;
    const ai = services.ai?.duration || 0;
    const tts = services.tts?.duration || 0;

    // Performance score
    const performance = totalDuration <= 3000 ? '🟢 EXCELLENT' : 
                       totalDuration <= 5000 ? '🟡 GOOD' : 
                       totalDuration <= 8000 ? '🟠 FAIR' : '🔴 NEEDS IMPROVEMENT';

    console.log(`\n📊 [SUMMARY] ${sessionId.slice(-8)}`);
    console.log(`⏱️  Total: ${totalDuration}ms | STT: ${stt}ms | AI: ${ai}ms | TTS: ${tts}ms`);
    console.log(`🎯 Performance: ${performance} (target: <3000ms)`);

    // Show any issues
    const failures = Object.entries(services).filter(([_, service]) => service.status !== 'success');
    if (failures.length > 0) {
      failures.forEach(([type, service]) => {
        console.warn(`⚠️ ${type.toUpperCase()}: ${service.status} (${service.service})`);
      });
    }
    console.log(); // Empty line for readability
  }

  /**
   * Get current pipeline state
   */
  getPipelineState(sessionId) {
    return this.activePipelines.get(sessionId);
  }

  /**
   * Get stats
   */
  getStats() {
    return {
      activePipelines: this.activePipelines.size,
      sessionIds: Array.from(this.activePipelines.keys()).map(id => id.slice(-8))
    };
  }
}

// Singleton export
module.exports = PipelineTracker;