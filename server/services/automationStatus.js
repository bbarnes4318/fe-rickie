// Automation Status Event Emitter
// Used to stream real-time status updates to the frontend via SSE

import { EventEmitter } from 'events';

// Global event emitter for automation status
export const automationEvents = new EventEmitter();

// Store for active job statuses
export const activeJobs = new Map();

// Generate unique job ID
export const generateJobId = () => {
  return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Emit status update for a job
export const emitStatus = (jobId, step, totalSteps, status, message) => {
  const update = {
    jobId,
    step,
    totalSteps,
    status, // 'pending' | 'in_progress' | 'completed' | 'failed'
    message,
    timestamp: new Date().toISOString()
  };
  
  // Store latest status
  let jobStatus = activeJobs.get(jobId) || { steps: [] };
  jobStatus.steps.push(update);
  jobStatus.currentStatus = status;
  jobStatus.lastUpdate = update;
  activeJobs.set(jobId, jobStatus);
  
  // Emit to all listeners
  automationEvents.emit('status', update);
  console.log(`[Status] Job ${jobId}: Step ${step}/${totalSteps} - ${message}`);
  
  return update;
};

// Get all status updates for a job
export const getJobStatus = (jobId) => {
  return activeJobs.get(jobId) || null;
};

// Clean up old jobs (call periodically)
export const cleanupOldJobs = () => {
  const oneHourAgo = Date.now() - (60 * 60 * 1000);
  for (const [jobId, job] of activeJobs) {
    if (job.lastUpdate && new Date(job.lastUpdate.timestamp).getTime() < oneHourAgo) {
      activeJobs.delete(jobId);
    }
  }
};

// Cleanup every 30 minutes
setInterval(cleanupOldJobs, 30 * 60 * 1000);
