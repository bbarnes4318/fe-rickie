
import express from 'express';
import { runAmericanAmicableAutomation } from '../services/americanAmicable.js';
import { automationEvents, generateJobId, getJobStatus, emitStatus } from '../services/automationStatus.js';

const router = express.Router();

// ═══════════════════════════════════════════════════════════════════════════
// SSE ENDPOINT - GET /api/automation/status/:jobId
// Streams real-time automation status updates to the frontend
// ═══════════════════════════════════════════════════════════════════════════
router.get('/status/:jobId', (req, res) => {
  const { jobId } = req.params;
  console.log(`[SSE] Client connected for job: ${jobId}`);
  
  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();
  
  // Send initial connection message
  res.write(`data: ${JSON.stringify({ type: 'connected', jobId })}\n\n`);
  
  // Send any existing status updates for this job
  const existingStatus = getJobStatus(jobId);
  if (existingStatus && existingStatus.steps) {
    for (const step of existingStatus.steps) {
      res.write(`data: ${JSON.stringify(step)}\n\n`);
    }
  }
  
  // Listen for new status updates
  const onStatus = (update) => {
    if (update.jobId === jobId) {
      res.write(`data: ${JSON.stringify(update)}\n\n`);
      
      // Close connection when job is finished
      if (update.status === 'completed' || update.status === 'failed') {
        setTimeout(() => res.end(), 1000);
      }
    }
  };
  
  automationEvents.on('status', onStatus);
  
  // Clean up on client disconnect
  req.on('close', () => {
    console.log(`[SSE] Client disconnected for job: ${jobId}`);
    automationEvents.off('status', onStatus);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// AUTOMATION ROUTE - POST /api/automation/run-carrier-app
// Now returns jobId immediately for SSE subscription
// ═══════════════════════════════════════════════════════════════════════════
router.post('/run-carrier-app', async (req, res) => {
  const ts = new Date().toISOString();
  const jobId = generateJobId();
  
  // AGGRESSIVE LOGGING - FIRST THING
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`[AUTOMATION] ${ts} ▶▶▶ REQUEST RECEIVED ◀◀◀ JobID: ${jobId}`);
  console.log(`[AUTOMATION] ${ts} Request Body:`, JSON.stringify(req.body));
  console.log('═══════════════════════════════════════════════════════════════');
  
  const { state } = req.body;

  if (!state) {
    console.warn(`[AUTOMATION] ${ts} ⚠️ MISSING STATE IN REQUEST`);
    return res.status(400).json({ success: false, error: 'State is required', jobId });
  }

  // Emit initial status
  emitStatus(jobId, 0, 12, 'in_progress', 'Starting automation...');
  
  console.log(`[AUTOMATION] ${ts} ✓ State received: "${state}" - Starting automation...`);
  
  try {
    // Pass the FULL request body (all customer data) AND jobId to the automation
    const result = await runAmericanAmicableAutomation(req.body, jobId);
    
    console.log(`[AUTOMATION] ${new Date().toISOString()} Automation completed:`, JSON.stringify(result));
    
    if (result.success) {
      console.log(`[AUTOMATION] ${new Date().toISOString()} ✅ SUCCESS - Sending response`);
      emitStatus(jobId, 12, 12, 'completed', 'Application submitted successfully!');
      res.json({ ...result, jobId });
    } else {
      console.log(`[AUTOMATION] ${new Date().toISOString()} ❌ FAILED - ${result.error}`);
      emitStatus(jobId, result.failedAtStep || 0, 12, 'failed', result.error);
      res.status(500).json({ ...result, jobId });
    }
  } catch (error) {
    console.error(`[AUTOMATION] ${new Date().toISOString()} 💥 EXCEPTION:`, error.message);
    console.error(`[AUTOMATION] Stack:`, error.stack);
    emitStatus(jobId, 0, 12, 'failed', error.message);
    res.status(500).json({ success: false, error: error.message, jobId });
  }
});

// Also add a GET endpoint for testing
router.get('/test', (req, res) => {
  console.log(`[AUTOMATION] ${new Date().toISOString()} TEST ENDPOINT HIT`);
  res.json({ status: 'Automation route is working', timestamp: new Date().toISOString() });
});

export default router;
