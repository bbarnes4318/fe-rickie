
import puppeteer from 'puppeteer';

const STATE_MAPPING = {
  "Alaska": "AASCAKSM0010001163940",
  "Alabama": "AASCALSM0010001163940",
  "Arkansas": "AASCARSM0010001163940",
  "Arizona": "AASCAZSM0010001163940",
  "California": "AASCCASM0010001163940",
  "Colorado": "AASCCOSM0010001163940",
  "Connecticut": "AASCCTSM0010001163940",
  "District of Columbia": "AASCDCSM0010001163940",
  "Delaware": "AASCDESM0010001163940",
  "Florida": "AASCFLSM0010001163940",
  "Georgia": "AASCGASM0010001163940",
  "Hawaii": "AASCHISM0010001163940",
  "Idaho": "AASCIDSM0010001163940",
  "Illinois": "AASCILSM0010001163940",
  "Indiana": "AASCINSM0010001163940",
  "Kansas": "AASCKSSM0010001163940",
  "Kentucky": "AASCKYSM0010001163940",
  "Louisiana": "AASCLASM0010001163940",
  "Maryland": "AASCMDSM0010001163940",
  "Maine": "AASCMESM0010001163940",
  "Minnesota": "AASCMNSM0010001163940",
  "Missouri": "AASCMOSM0010001163940",
  "Mississippi": "AASCMSSM0010001163940",
  "North Carolina": "AASCNCSM0010001163940",
  "North Dakota": "AASCNDSM0010001163940",
  "Nebraska": "AASCNESM0010001163940",
  "New Mexico": "AASCNMSM0010001163940",
  "Nevada": "AASCNVSM0010001163940",
  "Ohio": "AASCOHSM0010001163940",
  "Oklahoma": "AASCOKSM0010001163940",
  "Oregon": "AASCORSM0010001163940",
  "Pennsylvania": "AASCPASM0010001163940",
  "South Carolina": "AASCSCSM0010001163940",
  "South Dakota": "AASCSDSM0010001163940",
  "Tennessee": "AASCTNSM0010001163940",
  "Texas": "AASCTXSM0010001163940",
  "Utah": "AASCUTSM0010001163940",
  "Virginia": "AASCVASM0010001163940",
  "Washington": "AASCWASM0010001163940",
  "Wisconsin": "AASCWISM0010001163940",
  "West Virginia": "AASCWVSM0010001163940",
  "Wyoming": "AASCWYSM0010001163940"
};

export const runAmericanAmicableAutomation = async (data) => {
  const { state } = data;
  let browser = null;
  const logTs = () => new Date().toISOString();

  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`[PUPPETEER] ${logTs()} ▶▶▶ AUTOMATION FUNCTION CALLED ◀◀◀`);
  console.log(`[PUPPETEER] ${logTs()} Input data:`, JSON.stringify(data));
  console.log(`[PUPPETEER] ${logTs()} State: ${state}`);
  console.log('═══════════════════════════════════════════════════════════════');

  try {
    console.log(`[PUPPETEER] ${logTs()} Launching browser...`);
    
    // Use system Chromium in Docker/production, bundled Chrome locally
    const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || null;
    console.log(`[PUPPETEER] ${logTs()} Executable path: ${executablePath || 'Using bundled Chrome'}`);
    
    browser = await puppeteer.launch({
      headless: "new",
      executablePath: executablePath,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-software-rasterizer',
        '--single-process'
      ]
    });
    console.log(`[PUPPETEER] ${logTs()} ✓ Browser launched successfully`);

    const page = await browser.newPage();
    
    // Set viewport for consistent rendering
    await page.setViewport({ width: 1280, height: 800 });

    // Part 1: Initial Authentication
    console.log('[Automation] Navigating to Agent Login...');
    await page.goto('https://www.americanamicable.com/v4/AgentLogin.php', { waitUntil: 'networkidle0' });

    // Agent Login
    await page.waitForSelector('#user');
    await page.type('#user', '0001163940');
    await page.type('#password', 'Top$producer2026');
    
    await Promise.all([
      page.click('input[type="submit"][value="Submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle0' })
    ]);

    // Continue Screen
    console.log('[Automation] Clicking Continue...');
    // Try both selectors mentioned
    try {
      await page.waitForSelector('img[src="images/continue.png"]', { timeout: 5000 });
      await Promise.all([
        page.click('img[src="images/continue.png"]'),
        page.waitForNavigation({ waitUntil: 'networkidle0' })
      ]);
    } catch (e) {
      console.log('[Automation] Continue image not found, checking for link...');
      await page.waitForSelector('a[href*="/Marketing/area/A"]');
      await Promise.all([
        page.click('a[href*="/Marketing/area/A"]'),
        page.waitForNavigation({ waitUntil: 'networkidle0' })
      ]);
    }

    // Part 2: Access Mobile Portal
    console.log('[Automation] Accessing Mobile Tools...');
    
    // Try multiple selector strategies
    let foundMobileLink = false;
    const mobileSelectors = [
      'a[href="https://www.insuranceapplication.com/"]',
      'a[href*="insuranceapplication.com"]',
      'a[href*="webappmobile"]',
      'a:has-text("Mobile")',
      'a:has-text("Application")'
    ];
    
    for (const selector of mobileSelectors.slice(0, 3)) { // Only use href-based selectors for waitForSelector
      try {
        console.log(`[Automation] Trying selector: ${selector}`);
        await page.waitForSelector(selector, { timeout: 10000 });
        console.log(`[Automation] Found: ${selector}`);
        foundMobileLink = true;
        break;
      } catch (e) {
        console.log(`[Automation] Selector not found: ${selector}`);
      }
    }
    
    // Navigate directly to the application portal
    console.log('[Automation] Navigating directly to insuranceapplication.com...');
    await page.goto('https://www.insuranceapplication.com/', { waitUntil: 'networkidle0', timeout: 60000 });
    console.log('[Automation] Successfully navigated to Mobile Portal');

    // Select Application
    console.log('[Automation] Selecting Mobile Application...');
    try {
      await page.waitForSelector('a[href*="webappmobile"]', { timeout: 15000 });
      await page.click('a[href*="webappmobile"]');
      await page.waitForNavigation({ waitUntil: 'networkidle0' });
    } catch (e) {
      console.log('[Automation] webappmobile link not found, trying alternative...');
      // Try to find any link with "mobile" in it
      const links = await page.$$eval('a', as => as.map(a => ({ href: a.href, text: a.innerText })));
      console.log('[Automation] Available links:', JSON.stringify(links.slice(0, 10)));
      throw new Error('Could not find mobile application link. Available links logged.');
    }

    // Part 3: Mobile Application Authentication
    console.log('[Automation] Mobile Login...');
    await page.waitForSelector('#LoginId');
    await page.type('#LoginId', '0001163940');
    await page.type('#Password', 'Top$producer2026');
    
    await Promise.all([
      page.click('#LoginBtn'),
      page.waitForNavigation({ waitUntil: 'networkidle0' })
    ]);

    // Part 4: Start New Application
    console.log('[Automation] Starting New Application...');
    await page.waitForSelector('#BtnNewApp');
    await page.click('#BtnNewApp');
    
    // Select Agent (Popup/Grid)
    console.log('[Automation] Selecting Agent...');
    // Need to wait for the grid to appear. It might be an AJAX load.
    await page.waitForSelector('td.dataItem');
    // Using XPath to find text content
    const agentElements = await page.$$('td.dataItem');
    for (const el of agentElements) {
      const text = await page.evaluate(e => e.textContent, el);
      if (text.includes('0001163940')) {
        await el.click();
        break;
      }
    }
    
    // Select Product (Popup)
    console.log('[Automation] Selecting Product...');
    // Wait for product list (might be dynamic)
    await page.waitForFunction(() => document.querySelectorAll('td.dataItem').length > 0);
    const productElements = await page.$$('td.dataItem');
    for (const el of productElements) {
      const text = await page.evaluate(e => e.textContent, el);
      if (text.includes('Senior Choice (FE 50-85)')) {
        await el.click();
        break;
      }
    }

    // Part 5: State Selection Logic
    console.log(`[Automation] Selecting State: ${state}...`);
    await page.waitForSelector('#StateDropDown');
    
    const optionValue = STATE_MAPPING[state];
    if (!optionValue) {
      throw new Error(`State mapping not found for: ${state}`);
    }

    await page.select('#StateDropDown', optionValue);

    // Part 6: Final Submission
    console.log('[Automation] Final Submission...');
    await page.waitForSelector('#BtnNewAppFinal');
    await page.click('#BtnNewAppFinal');
    
    // Wait for result/confirmation
    // Assuming successful submission leads to a new page or shows a success message
    await new Promise(r => setTimeout(r, 2000)); // Creating a small buffer

    console.log('[Automation] Successfully started carrier application!');
    return { success: true, message: 'Application started successfully' };

  } catch (error) {
    console.error('[Automation] Error:', error);
    // Capture screenshot on failure
    if (browser) {
      try {
        const pages = await browser.pages();
        if (pages.length > 0) {
          await pages[0].screenshot({ path: 'automation-error.png' });
        }
      } catch (e) {
        console.error('Failed to capture error screenshot', e);
      }
    }
    return { success: false, error: error.message };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};
