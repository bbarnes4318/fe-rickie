import { test, mock } from 'node:test';
import assert from 'node:assert';
import express from 'express';
import pg from 'pg';
import puppeteer from 'puppeteer';

// Set test environment flags immediately
process.env.NODE_ENV = 'test';
process.env.AMERICAN_AMICABLE_AGENT_ID = '0001163940';
process.env.AMERICAN_AMICABLE_PASSWORD = 'test-password';
process.env.AMERICAN_AMICABLE_SIGNATURE_NAME = 'Test Agent';
process.env.DATABASE_URL = 'postgresql://localhost:5432/mock';

// Mock the pg Pool prototype before importing db or routes
mock.method(pg.Pool.prototype, 'query', async (queryText, values) => {
  return { 
    rows: [{ now: new Date() }], 
    rowCount: 1 
  };
});

// Import router after mocks and environment variables are set
import router from '../server/routes/automation.js';
import { activeJobs } from '../server/services/automation/jobStore.js';

// 2. Mock puppeteer launch
mock.method(puppeteer, 'launch', async () => {
  return {
    newPage: async () => ({
      setViewport: async () => {},
      goto: async () => {},
      waitForSelector: async () => {},
      type: async () => {},
      click: async () => {},
      select: async () => {},
      waitForNavigation: async () => {},
      evaluate: async (fn, ...args) => {
        // If we are evaluating a cell's textContent in selectAgent
        if (args.length > 0 && typeof args[0] === 'object' && args[0].isMockCell) {
          return '0001163940 - Test Agent';
        }
        
        const fnStr = fn.toString();
        
        // Mock application number extraction
        if (fnStr.includes('spanAppNumber') || fnStr.includes('AppNumberLabel') || fnStr.includes('M?00')) {
          return 'M001234567';
        }
        
        // Mock product selection success
        if (fnStr.includes('Senior Choice (FE 50-85)') || fnStr.includes('ProductMenu')) {
          return { success: true };
        }
        
        // Mock bank validation
        if (fnStr.includes('btValidateBankInfo') || fnStr.includes('IsValidatedBankInfo')) {
          return { funcResult: false, isValidated: true, message: 'Successful' };
        }
        
        // Mock agent statement continue click
        if (fnStr.includes('btnContinue') || fnStr.includes('__EVENTTARGET')) {
          return { success: true };
        }

        return { success: true };
      },
      $: async () => ({
        click: async () => {},
      }),
      $$: async (selector) => {
        if (selector === 'td.dataItem') {
          return [{ isMockCell: true, click: async () => {} }];
        }
        return [];
      },
      $$eval: async () => ['https://www.insuranceapplication.com/cgi/webappmobile/demo'],
      url: () => 'https://www.insuranceapplication.com/cgi/webappmobile/signatureoptions',
      title: async () => 'Signature Options',
      screenshot: async () => {},
      browser: () => ({
        once: () => {}
      }),
    }),
    close: async () => {},
  };
});

// 3. Create a test server
const app = express();
app.use(express.json());
app.use('/api/automation', router);

test('RPA Automation routes integration', async (t) => {
  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api/automation`;

  const validPayload = {
    firstName: 'Sarah',
    lastName: 'Williams',
    dob: '1970-05-15',
    gender: 'Male',
    tobacco: false,
    state: 'Illinois',
    address: '123 Main St',
    city: 'Chicago',
    zip: '60601',
    phone: '555-123-4567',
    weight: 180,
    plan: 'Level',
    faceAmount: 10000,
    primaryBenName: 'Jane Williams',
    primaryBenRel: 'Spouse',
    bankName: 'Chase',
    bankCityState: 'Chicago, IL',
    draftSchedule: 'ss_payment',
    draftDate: '15',
    routing: '021000021',
    accountNum: '12345678',
    accountType: 'Checking',
  };

  await t.test('POST /run-carrier-app with missing fields returns 400 Bad Request', async () => {
    const res = await fetch(`${baseUrl}/run-carrier-app`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName: 'Sarah' }) // missing fields
    });
    
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.ok(data.errors.length > 0);
  });

  await t.test('POST /run-carrier-app with valid payload returns jobId immediately', async () => {
    const res = await fetch(`${baseUrl}/run-carrier-app`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validPayload)
    });
    
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.jobId);
    
    const jobId = data.jobId;
    
    // Verify job is stored in memory
    const job = activeJobs.get(jobId);
    assert.ok(job);
    assert.ok(job.status === 'queued' || job.status === 'in_progress' || job.status === 'completed');

    // Wait for the async job execution to finish in background
    await new Promise((resolve) => setTimeout(resolve, 100));
    
    const completedJob = activeJobs.get(jobId);
    assert.strictEqual(completedJob.status, 'completed');
    assert.strictEqual(completedJob.applicationNumber, 'M001234567');
  });

  await t.test('GET /result/:jobId returns pending or completed state', async () => {
    // Start a new job
    const resStart = await fetch(`${baseUrl}/run-carrier-app`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validPayload)
    });
    const startData = await resStart.json();
    const jobId = startData.jobId;

    // Get immediate result (should be in_progress, queued, or completed)
    const resResult = await fetch(`${baseUrl}/result/${jobId}`);
    const resultData = await resResult.json();
    assert.ok(resultData.status === 'queued' || resultData.status === 'in_progress' || resultData.status === 'completed');

    // Wait for job to finish
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Get final result (should be completed)
    const resResultFinal = await fetch(`${baseUrl}/result/${jobId}`);
    const finalData = await resResultFinal.json();
    assert.strictEqual(finalData.status, 'completed');
    assert.strictEqual(finalData.applicationNumber, 'M001234567');
  });

  await t.test('GET /status/:jobId SSE connection streams events', async () => {
    // Start a new job
    const resStart = await fetch(`${baseUrl}/run-carrier-app`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validPayload)
    });
    const startData = await resStart.json();
    const jobId = startData.jobId;

    // Connect to SSE stream
    const resSSE = await fetch(`${baseUrl}/status/${jobId}`);
    assert.strictEqual(resSSE.status, 200);
    assert.strictEqual(resSSE.headers.get('content-type'), 'text/event-stream');

    const reader = resSSE.body.getReader();
    const { value } = await reader.read();
    const text = new TextDecoder().decode(value);
    
    // Should have emitted at least one sse status event
    assert.ok(text.startsWith('data:'));
    assert.ok(text.includes(jobId));
  });

  // Clean up
  server.close();
});
