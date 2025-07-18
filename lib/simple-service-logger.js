/**
 * Simple Service Logger - Manual tracking for voice pipeline services
 * This provides immediate visibility into which services are actually being used
 */

class SimpleServiceLogger {
  constructor() {
    this.timings = new Map(); // Store timings for each session
  }

  static getInstance() {
    if (!SimpleServiceLogger.instance) {
      SimpleServiceLogger.instance = new SimpleServiceLogger();
    }
    return SimpleServiceLogger.instance;
  }

  static logServiceStart(serviceType, serviceName, model = '', sessionId = null) {
    const timestamp = new Date().toISOString();
    const startTime = Date.now();
    const modelInfo = model ? ` (${model})` : '';
    
    // Store timing data
    if (sessionId) {
      const logger = SimpleServiceLogger.getInstance();
      if (!logger.timings.has(sessionId)) {
        logger.timings.set(sessionId, {});
      }
      logger.timings.get(sessionId)[serviceType] = {
        serviceName,
        model,
        startTime,
        status: 'primary'
      };
    }
    
    console.error(`⏱️ [${serviceType.toUpperCase()}] STARTED: ${serviceName}${modelInfo} at ${timestamp}`);
  }

  static logServiceSuccess(serviceType, serviceName, duration, details = '', sessionId = null) {
    const timestamp = new Date().toISOString();
    const detailsInfo = details ? ` - ${details}` : '';
    
    // Update timing data
    if (sessionId) {
      const logger = SimpleServiceLogger.getInstance();
      const sessionData = logger.timings.get(sessionId);
      if (sessionData && sessionData[serviceType]) {
        sessionData[serviceType].duration = duration;
        sessionData[serviceType].endTime = Date.now();
        sessionData[serviceType].details = details;
      }
    }
    
    console.error(`✅ [${serviceType.toUpperCase()}] SUCCESS: ${serviceName} completed in ${duration}ms${detailsInfo} at ${timestamp}`);
  }

  static logServiceFallback(serviceType, primaryService, fallbackService, reason, sessionId = null) {
    const timestamp = new Date().toISOString();
    
    // Update timing data for fallback
    if (sessionId) {
      const logger = SimpleServiceLogger.getInstance();
      const sessionData = logger.timings.get(sessionId);
      if (sessionData && sessionData[serviceType]) {
        sessionData[serviceType].serviceName = fallbackService;
        sessionData[serviceType].status = 'fallback';
        sessionData[serviceType].fallbackReason = reason;
      }
    }
    
    console.error(`🔄 [${serviceType.toUpperCase()}] FALLBACK: ${primaryService} → ${fallbackService} (${reason}) at ${timestamp}`);
  }

  static logServiceFailed(serviceType, serviceName, error) {
    const timestamp = new Date().toISOString();
    console.error(`❌ [${serviceType.toUpperCase()}] FAILED: ${serviceName} - ${error} at ${timestamp}`);
  }

  static logPipelineSummary(sessionId) {
    const logger = SimpleServiceLogger.getInstance();
    const timingData = logger.timings.get(sessionId);
    
    console.error(`\n🎯 ========== DETAILED PIPELINE SUMMARY [${sessionId}] ==========`);
    console.error(`⏰ Summary Time: ${new Date().toISOString()}`);
    
    if (!timingData) {
      console.error(`⚠️ No timing data available for session ${sessionId}`);
      console.error(`========================================\n`);
      return;
    }
    
    // Calculate total pipeline time
    const allStartTimes = Object.values(timingData).map(s => s.startTime).filter(Boolean);
    const allEndTimes = Object.values(timingData).map(s => s.endTime).filter(Boolean);
    const pipelineStart = Math.min(...allStartTimes);
    const pipelineEnd = Math.max(...allEndTimes);
    const totalPipelineTime = pipelineEnd - pipelineStart;
    
    console.error(`\n⏱️ DETAILED TIMING BREAKDOWN:`);
    console.error(`  🚀 Total Pipeline Time: ${totalPipelineTime}ms`);
    
    if (timingData.stt) {
      console.error(`  🎤 Speech-to-Text: ${timingData.stt.duration || 0}ms`);
    }
    if (timingData.ai) {
      console.error(`  🤖 AI Generation: ${timingData.ai.duration || 0}ms`);
    }
    if (timingData.tts) {
      console.error(`  🔊 Text-to-Speech: ${timingData.tts.duration || 0}ms`);
    }
    
    console.error(`\n🤖 ACTUAL MODELS & SERVICES USED:`);
    
    if (timingData.stt) {
      const modelInfo = timingData.stt.model ? ` (${timingData.stt.model})` : '';
      console.error(`  🎤 Speech-to-Text: ${timingData.stt.serviceName}${modelInfo}`);
    }
    if (timingData.ai) {
      const modelInfo = timingData.ai.model ? ` (${timingData.ai.model})` : '';
      console.error(`  🧠 AI Generation: ${timingData.ai.serviceName}${modelInfo}`);
    }
    if (timingData.tts) {
      const modelInfo = timingData.tts.model ? ` (${timingData.tts.model})` : '';
      console.error(`  🔊 Text-to-Speech: ${timingData.tts.serviceName}${modelInfo}`);
    }
    
    console.error(`\n⚠️ SERVICE STATUS:`);
    
    let primaryCount = 0;
    let fallbackCount = 0;
    let totalServices = 0;
    
    if (timingData.stt) {
      totalServices++;
      if (timingData.stt.status === 'primary') {
        console.error(`  🎤 STT: ✅ PRIMARY (${timingData.stt.serviceName}) - ${timingData.stt.duration}ms`);
        primaryCount++;
      } else {
        console.error(`  🎤 STT: ❌ FALLBACK (${timingData.stt.serviceName}) - ${timingData.stt.duration}ms`);
        fallbackCount++;
      }
    }
    
    if (timingData.ai) {
      totalServices++;
      if (timingData.ai.status === 'primary') {
        console.error(`  🧠 AI: ✅ PRIMARY (${timingData.ai.serviceName}) - ${timingData.ai.duration}ms`);
        primaryCount++;
      } else {
        console.error(`  🧠 AI: ❌ FALLBACK (${timingData.ai.serviceName}) - ${timingData.ai.duration}ms`);
        fallbackCount++;
      }
    }
    
    if (timingData.tts) {
      totalServices++;
      if (timingData.tts.status === 'primary') {
        console.error(`  🔊 TTS: ✅ PRIMARY (${timingData.tts.serviceName}) - ${timingData.tts.duration}ms`);
        primaryCount++;
      } else {
        console.error(`  🔊 TTS: ❌ FALLBACK (${timingData.tts.serviceName}) - ${timingData.tts.duration}ms`);
        fallbackCount++;
      }
    }
    
    console.error(`\n📈 PERFORMANCE METRICS:`);
    const speedScore = totalPipelineTime < 3000 ? 'EXCELLENT' : 
                      totalPipelineTime < 5000 ? 'GOOD' : 
                      totalPipelineTime < 8000 ? 'FAIR' : 'NEEDS IMPROVEMENT';
    console.error(`  ⚡ Speed Score: ${speedScore}`);
    console.error(`  🎯 Target Time: <3000ms (Current: ${totalPipelineTime}ms)`);
    console.error(`  🏆 Time vs Target: ${totalPipelineTime < 3000 ? `✅ ${3000 - totalPipelineTime}ms under target` : `⚠️ ${totalPipelineTime - 3000}ms over target`}`);
    
    console.error(`\n🔍 BOTTLENECK ANALYSIS:`);
    const services = [
      { name: 'Speech-to-Text', time: timingData.stt?.duration || 0, target: 800, status: timingData.stt?.status },
      { name: 'AI Generation', time: timingData.ai?.duration || 0, target: 1500, status: timingData.ai?.status },
      { name: 'Text-to-Speech', time: timingData.tts?.duration || 0, target: 600, status: timingData.tts?.status }
    ];
    
    services.forEach(service => {
      if (service.time > 0) {
        const timeStatus = service.time <= service.target ? '✅' : '⚠️';
        const serviceStatus = service.status === 'primary' ? '(Primary)' : '(Fallback)';
        const variance = service.time - service.target;
        console.error(`  ${timeStatus} ${service.name}: ${service.time}ms ${serviceStatus} (target: ${service.target}ms, ${variance > 0 ? `+${variance}ms over` : `${Math.abs(variance)}ms under`})`);
      }
    });
    
    console.error(`\n🎯 OVERALL SYSTEM STATUS:`);
    console.error(`  🚀 Primary Models: ${primaryCount}/${totalServices} working`);
    console.error(`  ⚠️ Fallbacks Used: ${fallbackCount}/${totalServices}`);
    
    if (fallbackCount === 0) {
      console.error(`  ✅ ALL SERVICES OPTIMAL`);
    } else {
      console.error(`  ⚠️ ${fallbackCount} FALLBACK(S) ACTIVE`);
    }
    
    const speedRating = totalPipelineTime < 3000 ? '🟢 EXCELLENT' : 
                       totalPipelineTime < 5000 ? '🟡 GOOD' : 
                       totalPipelineTime < 8000 ? '🟠 FAIR' : '🔴 NEEDS IMPROVEMENT';
    console.error(`  ⏱️ Speed Rating: ${speedRating}`);
    
    console.error(`========================================\n`);
    
    // Clean up timing data
    logger.timings.delete(sessionId);
  }
}

module.exports = { SimpleServiceLogger };