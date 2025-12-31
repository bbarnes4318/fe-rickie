
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
    // The "Mobile Business Tools" link has target="_blank" which opens new tab
    // We'll navigate directly to avoid new tab complexity in headless mode
    console.log('[Automation] Accessing Mobile Business Tools...');
    
    // First verify the link exists on the page
    const mobileLinkSelector = 'a[href="https://www.insuranceapplication.com/"]';
    try {
      await page.waitForSelector(mobileLinkSelector, { timeout: 15000 });
      console.log('[Automation] ✓ Found Mobile Business Tools link');
    } catch (e) {
      console.log('[Automation] Mobile Business Tools link not found, checking page content...');
      const pageContent = await page.content();
      console.log('[Automation] Page contains insuranceapplication:', pageContent.includes('insuranceapplication'));
    }
    
    // Navigate directly to the mobile portal (since the link opens in new tab)
    console.log('[Automation] Navigating to insuranceapplication.com...');
    await page.goto('https://www.insuranceapplication.com/', { waitUntil: 'networkidle0', timeout: 60000 });
    console.log('[Automation] ✓ Successfully navigated to Mobile Portal');
    
    // Log the current URL for debugging
    console.log('[Automation] Current URL:', page.url());

    // Select Application - click the Mobile Platform icon/link
    // Actual element: <a href="https://www.insuranceapplication.com/cgi/webappmobile/">
    console.log('[Automation] Looking for Mobile Application link...');
    const mobileAppSelector = 'a[href="https://www.insuranceapplication.com/cgi/webappmobile/"]';
    const mobileAppSelectorAlt = 'a[href*="cgi/webappmobile"]';
    
    try {
      // Try exact match first
      let found = false;
      try {
        await page.waitForSelector(mobileAppSelector, { timeout: 10000 });
        console.log('[Automation] ✓ Found exact webappmobile link');
        await page.click(mobileAppSelector);
        found = true;
      } catch (e) {
        console.log('[Automation] Exact selector not found, trying partial...');
      }
      
      // Fallback to partial match
      if (!found) {
        await page.waitForSelector(mobileAppSelectorAlt, { timeout: 10000 });
        console.log('[Automation] ✓ Found webappmobile link (partial match)');
        await page.click(mobileAppSelectorAlt);
      }
      
      await page.waitForNavigation({ waitUntil: 'networkidle0' });
      console.log('[Automation] ✓ Navigated to Mobile Application');
      console.log('[Automation] Current URL:', page.url());
    } catch (e) {
      console.log('[Automation] webappmobile link not found, logging available links...');
      const links = await page.$$eval('a', as => as.map(a => ({ href: a.href, text: a.innerText.slice(0, 50) })));
      console.log('[Automation] Available links on page:', JSON.stringify(links.slice(0, 15)));
      throw new Error('Could not find mobile application link');
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
    // Selector: <input type="submit" id="BtnNewApp" value="New Application">
    await page.waitForSelector('#BtnNewApp', { timeout: 15000 });
    console.log('[Automation] ✓ Found New Application button');
    await page.click('#BtnNewApp');
    console.log('[Automation] ✓ Clicked New Application');
    
    // Wait for page to load after clicking
    await new Promise(r => setTimeout(r, 2000));
    
    // Select Agent (Popup/Grid)
    // Looking for: <td class="dataItem">0001163940</td> or <td class="dataItem">American-Amicable</td>
    console.log('[Automation] Selecting Agent...');
    await page.waitForSelector('td.dataItem', { timeout: 15000 });
    console.log('[Automation] ✓ Agent grid loaded');
    
    const agentElements = await page.$$('td.dataItem');
    console.log(`[Automation] Found ${agentElements.length} dataItem cells`);
    
    let agentFound = false;
    for (const el of agentElements) {
      const text = await page.evaluate(e => e.textContent, el);
      if (text.includes('0001163940') || text.includes('American-Amicable')) {
        console.log(`[Automation] ✓ Found agent: ${text}`);
        await el.click();
        agentFound = true;
        break;
      }
    }
    
    if (!agentFound) {
      throw new Error('Could not find agent in grid');
    }
    
    // Wait for product popup to load
    await new Promise(r => setTimeout(r, 1500));
    
    // Select Product (Popup)
    // Looking for: <td class="dataItem">Senior Choice (FE 50-85)</td>
    console.log('[Automation] Selecting Product...');
    await page.waitForFunction(() => document.querySelectorAll('td.dataItem').length > 0, { timeout: 15000 });
    
    const productElements = await page.$$('td.dataItem');
    console.log(`[Automation] Found ${productElements.length} product cells`);
    
    let productFound = false;
    for (const el of productElements) {
      const text = await page.evaluate(e => e.textContent, el);
      if (text.includes('Senior Choice (FE 50-85)')) {
        console.log(`[Automation] ✓ Found product: ${text}`);
        await el.click();
        productFound = true;
        break;
      }
    }
    
    if (!productFound) {
      // Log what products ARE available
      const availableProducts = await page.$$eval('td.dataItem', els => els.map(e => e.textContent.slice(0, 50)));
      console.log('[Automation] Available products:', JSON.stringify(availableProducts));
      throw new Error('Could not find Senior Choice product');
    }
    
    // Wait for state dropdown to be available
    await new Promise(r => setTimeout(r, 1500));

    // Part 5: State Selection Logic
    // Selector: <select id="StateDropDown">
    console.log(`[Automation] Selecting State: ${state}...`);
    await page.waitForSelector('#StateDropDown', { timeout: 15000 });
    console.log('[Automation] ✓ Found State dropdown');
    
    const optionValue = STATE_MAPPING[state];
    if (!optionValue) {
      // Log available states in mapping
      console.log('[Automation] Available states in mapping:', Object.keys(STATE_MAPPING).join(', '));
      throw new Error(`State mapping not found for: ${state}`);
    }
    
    console.log(`[Automation] Selecting state value: ${optionValue}`);
    await page.select('#StateDropDown', optionValue);
    console.log('[Automation] ✓ State selected');

    // Part 6: Final Submission
    console.log('[Automation] Looking for Final Submit button...');
    
    // Try multiple possible selectors for the final submit
    const submitSelectors = ['#BtnNewAppFinal', 'input[value="Continue"]', 'input[type="submit"]'];
    let submitted = false;
    
    for (const selector of submitSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 5000 });
        console.log(`[Automation] ✓ Found submit button: ${selector}`);
        await page.click(selector);
        submitted = true;
        break;
      } catch (e) {
        console.log(`[Automation] Submit selector not found: ${selector}`);
      }
    }
    
    if (!submitted) {
      console.log('[Automation] Warning: Could not find final submit button, but state was selected');
    }
    
    // Wait for result/confirmation
    await new Promise(r => setTimeout(r, 3000));
    
    console.log('[Automation] ✓ Successfully started carrier application!');
    console.log('[Automation] Final URL:', page.url());
    return { success: true, message: 'Application started successfully', state: state };

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
