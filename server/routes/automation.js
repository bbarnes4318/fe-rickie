import express from 'express';
import { runAmericanAmicableAutomation } from '../services/americanAmicable.js';
import { validateAndNormalizePayload } from '../services/automation/normalization.js';
import { createJob, getJob, addJobStep, completeJob, failJob, automationEvents } from '../services/automation/jobStore.js';
import { redactPayload, safeLog } from '../services/automation/redaction.js';
import pool from '../db.js';

const router = express.Router();

// ═══════════════════════════════════════════════════════════════════════════
// POST /api/automation/run-carrier-app
// ═══════════════════════════════════════════════════════════════════════════
router.post('/run-carrier-app', async (req, res) => {
  const ts = new Date().toISOString();
  
  // Safe logging of incoming request
  safeLog(`[Automation] ${ts} POST Request Received`, req.body);
  
  // 1. Perform Payload Validation & Normalization
  const validation = validateAndNormalizePayload(req.body);
  if (!validation.isValid) {
    console.warn(`[Automation] ${ts} ⚠️ Payload validation failed:`, validation.errors);
    return res.status(400).json({ 
      success: false, 
      error: 'Validation failed before starting automation', 
      errors: validation.errors 
    });
  }

  const { normalized } = validation;
  
  // 2. Generate jobId and initialize job store state
  const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const redactedInput = redactPayload(normalized);
  createJob(jobId, redactedInput);
  
  console.log(`[Automation] Created job ${jobId} for applicant ${normalized.firstName} ${normalized.lastName}`);

  // 3. Launch Puppeteer process ASYNCHRONOUSLY
  // We do NOT await this promise, returning HTTP response immediately
  runAmericanAmicableAutomation(normalized, jobId)
    .then(async (result) => {
      if (result.success) {
        completeJob(jobId, result);
        
        // Persist carrier application number to Postgres DB if appId exists
        if (normalized.appId) {
          try {
            await pool.query(`
              UPDATE applications 
              SET carrier_application_number = $1,
                  automation_status = $2,
                  automation_completed_at = NOW(),
                  updated_at = NOW()
              WHERE app_id = $3
            `, [result.applicationNumber, 'completed', normalized.appId]);
            console.log(`[Automation] Persisted application number ${result.applicationNumber} for AppID ${normalized.appId}`);
          } catch (dbError) {
            console.error(`[Automation] Failed to persist completion for AppID ${normalized.appId}:`, dbError.message);
          }
        }
      } else {
        const errMsg = result.error || 'Unknown automation failure';
        failJob(jobId, errMsg);
        
        // Persist failure to Postgres DB if appId exists
        if (normalized.appId) {
          try {
            await pool.query(`
              UPDATE applications 
              SET automation_status = $1,
                  automation_error = $2,
                  automation_completed_at = NOW(),
                  updated_at = NOW()
              WHERE app_id = $3
            `, ['failed', errMsg, normalized.appId]);
            console.log(`[Automation] Persisted failed status for AppID ${normalized.appId}`);
          } catch (dbError) {
            console.error(`[Automation] Failed to persist failure for AppID ${normalized.appId}:`, dbError.message);
          }
        }
      }
    })
    .catch(async (err) => {
      const errMsg = err.message || 'Automation crashed';
      failJob(jobId, errMsg);
      
      // Persist exception to Postgres DB if appId exists
      if (normalized.appId) {
        try {
          await pool.query(`
            UPDATE applications 
            SET automation_status = $1,
                automation_error = $2,
                automation_completed_at = NOW(),
                updated_at = NOW()
            WHERE app_id = $3
          `, ['failed', errMsg, normalized.appId]);
        } catch (dbError) {
          console.error(`[Automation] Failed to persist exception for AppID ${normalized.appId}:`, dbError.message);
        }
      }
    });

  // 4. Return success immediately with jobId
  res.json({ success: true, jobId });
});

// ═══════════════════════════════════════════════════════════════════════════
// GET /api/automation/status/:jobId
// ═══════════════════════════════════════════════════════════════════════════
router.get('/status/:jobId', (req, res) => {
  const { jobId } = req.params;
  const job = getJob(jobId);

  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  // Set SSE Headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  // Write historical updates to client immediately
  job.steps.forEach((step) => {
    res.write(`data: ${JSON.stringify(step)}\n\n`);
  });

  // If job is already complete or failed, close the connection
  if (job.status === 'completed' || job.status === 'failed') {
    res.end();
    return;
  }

  // Subscribe to updates for this jobId
  const onStatusUpdate = (update) => {
    if (res.writableEnded) return;
    res.write(`data: ${JSON.stringify(update)}\n\n`);
    
    if (update.status === 'completed' || update.status === 'failed') {
      cleanup();
    }
  };

  const cleanup = () => {
    automationEvents.removeListener(`status:${jobId}`, onStatusUpdate);
    res.end();
  };

  automationEvents.on(`status:${jobId}`, onStatusUpdate);

  // Remove listener on client disconnect
  req.on('close', () => {
    cleanup();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// GET /api/automation/result/:jobId
// ═══════════════════════════════════════════════════════════════════════════
router.get('/result/:jobId', (req, res) => {
  const { jobId } = req.params;
  const job = getJob(jobId);

  if (!job) {
    return res.status(404).json({ success: false, error: 'Job not found' });
  }

  res.json({
    jobId: job.jobId,
    status: job.status,
    steps: job.steps,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
    applicationNumber: job.applicationNumber,
    result: job.result,
    error: job.error
  });
});

// GET endpoint for testing
router.get('/test', (req, res) => {
  res.json({ status: 'Automation route is working', timestamp: new Date().toISOString() });
});

export default router;
