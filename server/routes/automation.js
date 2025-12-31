
import express from 'express';
import { runAmericanAmicableAutomation } from '../services/americanAmicable.js';

const router = express.Router();

// ═══════════════════════════════════════════════════════════════════════════
// AUTOMATION ROUTE - POST /api/automation/run-carrier-app
// ═══════════════════════════════════════════════════════════════════════════
router.post('/run-carrier-app', async (req, res) => {
  const ts = new Date().toISOString();
  
  // AGGRESSIVE LOGGING - FIRST THING
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`[AUTOMATION] ${ts} ▶▶▶ REQUEST RECEIVED ◀◀◀`);
  console.log(`[AUTOMATION] ${ts} Request Body:`, JSON.stringify(req.body));
  console.log(`[AUTOMATION] ${ts} Headers:`, JSON.stringify(req.headers));
  console.log('═══════════════════════════════════════════════════════════════');
  
  const { state } = req.body;

  if (!state) {
    console.warn(`[AUTOMATION] ${ts} ⚠️ MISSING STATE IN REQUEST`);
    return res.status(400).json({ success: false, error: 'State is required' });
  }

  console.log(`[AUTOMATION] ${ts} ✓ State received: "${state}" - Starting automation...`);
  
  try {
    // Pass the FULL request body (all customer data) to the automation
    const result = await runAmericanAmicableAutomation(req.body);
    
    console.log(`[AUTOMATION] ${new Date().toISOString()} Automation completed:`, JSON.stringify(result));
    
    if (result.success) {
      console.log(`[AUTOMATION] ${new Date().toISOString()} ✅ SUCCESS - Sending response`);
      res.json(result);
    } else {
      console.log(`[AUTOMATION] ${new Date().toISOString()} ❌ FAILED - ${result.error}`);
      res.status(500).json(result);
    }
  } catch (error) {
    console.error(`[AUTOMATION] ${new Date().toISOString()} 💥 EXCEPTION:`, error.message);
    console.error(`[AUTOMATION] Stack:`, error.stack);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Also add a GET endpoint for testing
router.get('/test', (req, res) => {
  console.log(`[AUTOMATION] ${new Date().toISOString()} TEST ENDPOINT HIT`);
  res.json({ status: 'Automation route is working', timestamp: new Date().toISOString() });
});

export default router;
