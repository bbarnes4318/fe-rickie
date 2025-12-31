
import express from 'express';
import { runAmericanAmicableAutomation } from '../services/americanAmicable.js';

const router = express.Router();

// POST /api/automation/run-carrier-app
router.post('/run-carrier-app', async (req, res) => {
  const { state } = req.body;

  if (!state) {
    return res.status(400).json({ success: false, error: 'State is required' });
  }

  // Run asynchronously without blocking response? 
  // User asked to "simultaneously complete", meaning it runs in background.
  // However, usually we want to know if it started successfully.
  // Since Puppeteer can take 10-20 seconds, we should verify start.
  
  try {
    // We await the whole process or just the kickoff?
    // Given the flow is "Start Application", it's finite.
    const result = await runAmericanAmicableAutomation({ state });
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error('Automation route error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;
