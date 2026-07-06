import { EventEmitter } from 'events';

// Global event emitter for streaming job updates via SSE
export const automationEvents = new EventEmitter();

// In-memory store for active job statuses
export const activeJobs = new Map();

/**
 * Generate a unique Job ID
 * @returns {string}
 */
export const generateJobId = () => {
  return `job_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
};

/**
 * Initialize a job in the store
 * @param {string} jobId
 * @param {object} redactedInput - Redacted summary of applicant details
 * @returns {object} Initialized job object
 */
export const createJob = (jobId, redactedInput = {}) => {
  const job = {
    jobId,
    status: 'queued',
    steps: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    inputSummary: redactedInput,
    result: null,
    error: null,
    applicationNumber: null
  };
  activeJobs.set(jobId, job);
  
  // Emit initial status
  addJobStep(jobId, 0, 12, 'queued', 'Job queued in background');
  return job;
};

/**
 * Add a progressive step update to a job's log
 * @param {string} jobId
 * @param {number} step - Current step index
 * @param {number} totalSteps - Total steps in automation
 * @param {string} status - queued | in_progress | completed | failed
 * @param {string} message - Progress description message
 */
export const addJobStep = (jobId, step, totalSteps, status, message) => {
  const job = activeJobs.get(jobId);
  if (!job) return;

  const timestamp = new Date().toISOString();
  const update = {
    jobId,
    step,
    totalSteps,
    status,
    message,
    timestamp
  };

  job.steps.push(update);
  job.status = status;
  job.updatedAt = timestamp;
  
  if (status === 'completed' && !job.applicationNumber && job.result?.applicationNumber) {
    job.applicationNumber = job.result.applicationNumber;
  }

  activeJobs.set(jobId, job);

  // Emit status change event
  automationEvents.emit(`status:${jobId}`, update);
  automationEvents.emit('status', update); // legacy global support
  
  console.log(`[JobStore] Job ${jobId}: Step ${step}/${totalSteps} (${status}) - ${message}`);
};

/**
 * Complete a job with success results
 * @param {string} jobId
 * @param {object} result - Final result payload
 */
export const completeJob = (jobId, result = {}) => {
  const job = activeJobs.get(jobId);
  if (!job) return;

  job.status = 'completed';
  job.result = result;
  job.applicationNumber = result.applicationNumber || null;
  job.updatedAt = new Date().toISOString();
  activeJobs.set(jobId, job);

  addJobStep(jobId, 12, 12, 'completed', 'Automation completed successfully');
};

/**
 * Fail a job with an error
 * @param {string} jobId
 * @param {string} errorMessage - Redacted error message
 */
export const failJob = (jobId, errorMessage) => {
  const job = activeJobs.get(jobId);
  if (!job) return;

  job.status = 'failed';
  job.error = errorMessage;
  job.updatedAt = new Date().toISOString();
  activeJobs.set(jobId, job);

  addJobStep(jobId, job.steps.length ? job.steps[job.steps.length - 1].step : 0, 12, 'failed', errorMessage);
};

/**
 * Fetch a job from the store
 * @param {string} jobId
 * @returns {object|null} Job object or null if not found
 */
export const getJob = (jobId) => {
  return activeJobs.get(jobId) || null;
};

/**
 * Clean up jobs older than 1 hour
 */
export const cleanupOldJobs = () => {
  const oneHourAgo = Date.now() - (60 * 60 * 1000);
  let count = 0;
  for (const [jobId, job] of activeJobs) {
    if (new Date(job.createdAt).getTime() < oneHourAgo) {
      activeJobs.delete(jobId);
      count++;
    }
  }
  if (count > 0) {
    console.log(`[JobStore] Pruned ${count} old automation jobs from memory`);
  }
};

// Start periodic cleanup (every 10 minutes)
setInterval(cleanupOldJobs, 10 * 60 * 1000);
