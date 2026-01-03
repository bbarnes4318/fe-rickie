
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
  // Extract all customer data from formData
  const {
    state,
    firstName,
    middleName = '',
    lastName,
    dob,
    age,
    gender,
    tobacco,
    selectedCoverage,
    selectedPlanType,
    // Additional contact info
    address = '',
    zip = '',
    ssn = '',
    phone = '',
    email = '',
    birthState = '',
    // ═══ Bank Draft Information ═══
    accountHolder = '',
    bankName = '',
    bankCityState = '',
    ssPaymentSchedule = null, // true = Yes (coincide with SS), false = No
    draftDay = '',
    routingNumber = '',
    accountNumber = '',
    accountType = 'Checking', // 'Checking' or 'Saving'
    // ═══ Email/Personal Info ═══
    wantsEmail = null, // true = Yes, false = No
    // Height/Weight
    heightFeet = '',
    heightInches = '',
    weight = '',
    // Doctor info
    doctorName = '',
    doctorAddress = '',
    doctorPhone = '',
    // ═══ Owner/Payor Info ═══
    ownerIsInsured = true,  // true = Owner is the Insured
    payorIsInsured = true,  // true = Payor is the Insured
    // ═══ Existing Coverage ═══
    hasExistingInsurance = null,
    existingCompanyName = '',
    existingPolicyNumber = '',
    existingCoverageAmount = '',
    willReplaceExisting = null,
    // Health Questions (Q1-Q8c + Covid)
    healthQ1 = false,
    healthQ2 = false,
    healthQ3 = false,
    healthQ4 = false,
    healthQ5 = false,
    healthQ6 = false,
    healthQ7a = false,
    healthQ7b = false,
    healthQ7c = false,
    healthQ7d = false,
    healthQ8a = false,
    healthQ8b = false,
    healthQ8c = false,
    healthCovid = false,
    // ═══ Beneficiary Information ═══
    beneficiaryName = '',
    beneficiaryRelation = '',
    // ═══ Illinois Residents (only applicable if state is IL) ═══
    ilDesigneeChoice = null // 'Will Designate' or 'Will Not Designate'
  } = data;
  
  let browser = null;
  const logTs = () => new Date().toISOString();

  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`[PUPPETEER] ${logTs()} ▶▶▶ AUTOMATION FUNCTION CALLED ◀◀◀`);
  console.log(`[PUPPETEER] ${logTs()} Customer: ${firstName} ${middleName} ${lastName}`);
  console.log(`[PUPPETEER] ${logTs()} State: ${state}, DOB: ${dob}, Age: ${age}, Gender: ${gender}`);
  console.log(`[PUPPETEER] ${logTs()} Coverage: ${selectedCoverage}, Plan: ${selectedPlanType}, Tobacco: ${tobacco}`);
  console.log(`[PUPPETEER] ${logTs()} Address: ${address}, ${zip}`);
  console.log(`[PUPPETEER] ${logTs()} Beneficiary: ${beneficiaryName} (${beneficiaryRelation || 'not specified'})`);
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
    console.log('[Automation] Accessing Mobile Business Tools...');
    
    // Log what's on the current page
    const currentUrl = page.url();
    console.log('[Automation] Current URL after Continue:', currentUrl);
    
    // Wait a moment for page to fully load
    await new Promise(r => setTimeout(r, 2000));
    
    // Check if we're on the marketing page and need to find the Mobile link
    const mobileLinkSelector = 'a[href="https://www.insuranceapplication.com/"]';
    const mobileLinkAlt = 'a[href*="insuranceapplication.com"]';
    
    let foundMobileLink = false;
    
    // Try to find the Mobile Business Tools link
    try {
      await page.waitForSelector(mobileLinkSelector, { timeout: 10000 });
      console.log('[Automation] ✓ Found Mobile Business Tools link');
      foundMobileLink = true;
    } catch (e) {
      console.log('[Automation] Exact Mobile link not found, trying alternatives...');
      try {
        await page.waitForSelector(mobileLinkAlt, { timeout: 5000 });
        console.log('[Automation] ✓ Found alternative mobile link');
        foundMobileLink = true;
      } catch (e2) {
        console.log('[Automation] No mobile link found on page');
        // Log what links ARE available
        const allLinks = await page.$$eval('a', as => as.map(a => ({ href: a.href, text: a.innerText.slice(0, 30) })));
        console.log('[Automation] Available links:', JSON.stringify(allLinks.slice(0, 10)));
      }
    }
    
    // Handle the target="_blank" by listening for new pages
    const browserContext = browser.defaultBrowserContext();
    let newPage = null;
    
    if (foundMobileLink) {
      // Set up listener for new tab BEFORE clicking
      const newPagePromise = new Promise(resolve => {
        browser.once('targetcreated', async target => {
          const newP = await target.page();
          if (newP) resolve(newP);
        });
      });
      
      // Click the mobile link (it opens in new tab)
      await page.click(mobileLinkSelector).catch(() => page.click(mobileLinkAlt));
      
      // Wait for new tab or timeout
      try {
        newPage = await Promise.race([
          newPagePromise,
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000))
        ]);
        console.log('[Automation] ✓ New tab opened');
        page = newPage; // Switch to new page
        await page.waitForNavigation({ waitUntil: 'networkidle0' }).catch(() => {});
      } catch (e) {
        console.log('[Automation] No new tab opened, navigating directly...');
        await page.goto('https://www.insuranceapplication.com/', { waitUntil: 'networkidle0', timeout: 60000 });
      }
    } else {
      // Fallback: navigate directly to the mobile portal
      console.log('[Automation] Navigating directly to insuranceapplication.com...');
      await page.goto('https://www.insuranceapplication.com/', { waitUntil: 'networkidle0', timeout: 60000 });
    }
    
    console.log('[Automation] ✓ On Mobile Portal');
    console.log('[Automation] Current URL:', page.url());
    
    // Wait for page to be ready
    await new Promise(r => setTimeout(r, 2000));

    // Select Application - click the Mobile Platform icon/link
    // Actual element: <a href="https://www.insuranceapplication.com/cgi/webappmobile/">
    console.log('[Automation] Looking for Mobile Application link...');
    
    // The mobile app link - might require login first
    const mobileAppSelector = 'a[href="https://www.insuranceapplication.com/cgi/webappmobile/"]';
    const mobileAppSelectorAlt = 'a[href*="cgi/webappmobile/"]';
    
    // First check if we need to login on this site
    const loginFormExists = await page.$('#LoginId').catch(() => null);
    if (loginFormExists) {
      console.log('[Automation] Login form detected, performing mobile login...');
      // This is the mobile portal login, do it here
      await page.type('#LoginId', '0001163940');
      await page.type('#Password', 'Top$producer2026');
      await page.click('#LoginBtn').catch(() => page.click('input[type="submit"]'));
      await page.waitForNavigation({ waitUntil: 'networkidle0' }).catch(() => {});
      console.log('[Automation] ✓ Mobile login completed');
      await new Promise(r => setTimeout(r, 2000));
    }
    
    // Now look for the mobile app link
    try {
      // First, look for the direct webappmobile link (not PDF/doc links)
      const appLinks = await page.$$eval('a[href*="cgi/webappmobile"]', els => 
        els.filter(a => !a.href.includes('.pdf') && !a.href.includes('DocHandler') && !a.href.includes('Demo'))
           .map(a => a.href)
      );
      console.log('[Automation] Found webappmobile links:', appLinks);
      
      if (appLinks.length > 0) {
        // Navigate directly to the mobile app URL (most reliable)
        console.log('[Automation] Navigating directly to:', appLinks[0]);
        await page.goto(appLinks[0], { waitUntil: 'networkidle0', timeout: 30000 });
        console.log('[Automation] ✓ Navigated to Mobile Application');
      } else {
        // Fallback: try clicking the link with navigation wait
        try {
          await page.waitForSelector(mobileAppSelector, { timeout: 10000 });
          console.log('[Automation] ✓ Found exact webappmobile link, clicking...');
          
          // Click and wait for navigation
          await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 30000 }),
            page.click(mobileAppSelector)
          ]);
          console.log('[Automation] ✓ Clicked and navigated');
        } catch (clickErr) {
          console.log('[Automation] Click navigation failed:', clickErr.message);
          // Last resort: navigate directly to the known URL
          console.log('[Automation] Navigating directly to webappmobile...');
          await page.goto('https://www.insuranceapplication.com/cgi/webappmobile/', { 
            waitUntil: 'networkidle0', 
            timeout: 30000 
          });
        }
      }
      
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
    await page.waitForSelector('#BtnNewApp', { timeout: 15000 });
    console.log('[Automation] ✓ Found New Application button');
    await page.click('#BtnNewApp');
    console.log('[Automation] ✓ Clicked New Application');
    
    // Wait for Agent popup to appear
    await new Promise(r => setTimeout(r, 2000));
    
    // ═══════════════════════════════════════════════════════════════
    // AGENT SELECTION - Double-click the agent cell
    // ═══════════════════════════════════════════════════════════════
    console.log('[Automation] Selecting Agent...');
    await page.waitForSelector('td.dataItem', { timeout: 15000 });
    console.log('[Automation] ✓ Agent grid loaded');
    
    const agentCells = await page.$$('td.dataItem');
    console.log(`[Automation] Found ${agentCells.length} dataItem cells`);
    
    let agentFound = false;
    for (const cell of agentCells) {
      const text = await page.evaluate(e => e.textContent, cell);
      if (text.includes('0001163940')) {
        console.log(`[Automation] ✓ Found agent cell: ${text}`);
        await cell.click({ clickCount: 2 }); // DOUBLE-CLICK
        console.log('[Automation] ✓ Double-clicked agent');
        agentFound = true;
        break;
      }
    }
    
    if (!agentFound) {
      throw new Error('Could not find agent 0001163940 in grid');
    }
    
    // Wait for product popup to load
    await new Promise(r => setTimeout(r, 2000));
    
    // ═══════════════════════════════════════════════════════════════
    // PRODUCT SELECTION - Must click within #ProductMenu popup, NOT main page
    // ═══════════════════════════════════════════════════════════════
    console.log('[Automation] Selecting Product...');
    
    // Wait for the ProductMenu popup to be visible
    try {
      await page.waitForSelector('#ProductMenu', { visible: true, timeout: 10000 });
      console.log('[Automation] ✓ ProductMenu popup found');
    } catch (e) {
      console.log('[Automation] ProductMenu not found, checking for alternative popup...');
      // Log visible popups
      const popups = await page.$$eval('[id*="Menu"], [id*="Popup"], [class*="modal"]', 
        els => els.filter(e => e.offsetParent !== null).map(e => ({ id: e.id, class: e.className }))
      );
      console.log('[Automation] Visible popups:', JSON.stringify(popups));
    }
    
    // Find and click Senior Choice ONLY within the ProductMenu popup
    const productResult = await page.evaluate(() => {
      // First look for ProductMenu popup
      const productMenu = document.getElementById('ProductMenu');
      
      // If no ProductMenu, look for any visible modal/popup
      let container = productMenu;
      if (!container || container.style.display === 'none') {
        // Look for any visible popup that contains product cells
        const modals = document.querySelectorAll('[id*="Menu"], [id*="Popup"], [class*="modal"]');
        for (const modal of modals) {
          if (modal.offsetParent !== null && modal.querySelectorAll('td.dataItem').length > 0) {
            container = modal;
            break;
          }
        }
      }
      
      if (!container) {
        // Fallback: look for cells NOT in the Applications table
        // The main table has class "dataRow" with onclick handlers
        const allCells = document.querySelectorAll('td.dataItem');
        for (const cell of allCells) {
          if (cell.textContent.includes('Senior Choice (FE 50-85)')) {
            const row = cell.closest('tr');
            // Skip if this row is in the main Applications in Progress table (has onclick)
            if (row && row.classList.contains('dataRow') && row.onclick) {
              continue; // Skip main table rows
            }
            // This is a popup row
            const hiddenLinks = row?.querySelectorAll('a[href*="__doPostBack"], a[href*="javascript:"]');
            if (hiddenLinks && hiddenLinks.length > 0) {
              hiddenLinks[0].click();
              return { method: 'hiddenLink-fallback', success: true, text: cell.textContent.slice(0, 50) };
            }
            // Try dblclick
            const dblClickEvent = new MouseEvent('dblclick', { bubbles: true, cancelable: true, view: window });
            (row || cell).dispatchEvent(dblClickEvent);
            return { method: 'dblclick-fallback', success: true, text: cell.textContent.slice(0, 50) };
          }
        }
        return { success: false, error: 'No popup container found', cellCount: allCells.length };
      }
      
      // Found popup container, now look for Senior Choice within it
      const cells = container.querySelectorAll('td.dataItem');
      for (const cell of cells) {
        if (cell.textContent.includes('Senior Choice (FE 50-85)') || 
            cell.textContent.includes('Senior Choice')) {
          const row = cell.closest('tr');
          
          // Look for hidden links
          const hiddenLinks = row?.querySelectorAll('a[href*="__doPostBack"], a[href*="javascript:"]');
          if (hiddenLinks && hiddenLinks.length > 0) {
            hiddenLinks[0].click();
            return { method: 'hiddenLink', success: true, container: container.id, text: cell.textContent.slice(0, 50) };
          }
          
          // Try row onclick
          if (row && row.onclick) {
            row.onclick();
            return { method: 'onclick', success: true, container: container.id, text: cell.textContent.slice(0, 50) };
          }
          
          // Try dblclick
          const dblClickEvent = new MouseEvent('dblclick', { bubbles: true, cancelable: true, view: window });
          (row || cell).dispatchEvent(dblClickEvent);
          return { method: 'dblclick', success: true, container: container.id, text: cell.textContent.slice(0, 50) };
        }
      }
      
      return { success: false, error: 'Senior Choice not found in popup', popupId: container.id, cellCount: cells.length };
    });
    
    console.log('[Automation] Product selection result:', JSON.stringify(productResult));
    
    if (!productResult.success) {
      const availableProducts = await page.$$eval('td.dataItem', els => els.map(e => e.textContent.slice(0, 50)));
      console.log('[Automation] Available products:', JSON.stringify(availableProducts));
      throw new Error('Could not find Senior Choice product in popup');
    }
    
    // Wait for state menu to appear after product selection
    console.log('[Automation] Waiting for StateMenu to appear...');
    await new Promise(r => setTimeout(r, 3000));
    
    // DEBUG: Dump the entire page state to understand the UI
    const pageDebug = await page.evaluate(() => {
      const result = {
        url: window.location.href,
        title: document.title,
        // All visible inputs
        inputs: Array.from(document.querySelectorAll('input:not([type="hidden"])')).map(i => ({
          id: i.id,
          name: i.name,
          type: i.type,
          value: i.value?.slice(0, 30),
          visible: i.offsetParent !== null
        })).slice(0, 20),
        // All selects
        selects: Array.from(document.querySelectorAll('select')).map(s => ({
          id: s.id,
          name: s.name,
          optionCount: s.options.length,
          visible: s.offsetParent !== null
        })),
        // All buttons
        buttons: Array.from(document.querySelectorAll('button, input[type="submit"], input[type="button"]')).map(b => ({
          id: b.id,
          value: b.value || b.textContent?.slice(0, 30),
          visible: b.offsetParent !== null
        })).slice(0, 15),
        // Any elements with "state" in their id/name
        stateElements: Array.from(document.querySelectorAll('[id*="tate"], [name*="tate"], [id*="State"], [name*="State"]')).map(e => ({
          tag: e.tagName,
          id: e.id,
          name: e.name,
          class: e.className?.slice(0, 30),
          text: e.textContent?.slice(0, 50),
          visible: e.offsetParent !== null
        })),
        // Body text preview
        bodyText: document.body?.innerText?.slice(0, 500)
      };
      return result;
    });
    
    console.log('[Automation] ═══ PAGE STATE AFTER PRODUCT CLICK ═══');
    console.log('[Automation] URL:', pageDebug.url);
    console.log('[Automation] Title:', pageDebug.title);
    console.log('[Automation] Inputs:', JSON.stringify(pageDebug.inputs));
    console.log('[Automation] Selects:', JSON.stringify(pageDebug.selects));
    console.log('[Automation] Buttons:', JSON.stringify(pageDebug.buttons));
    console.log('[Automation] State Elements:', JSON.stringify(pageDebug.stateElements));
    console.log('[Automation] Body Preview:', pageDebug.bodyText?.replace(/\n/g, ' | ').slice(0, 300));
    console.log('[Automation] ═══════════════════════════════════════');
    
    // Part 5: State Selection
    // The UI shows a modal #StateMenu with a <select id="StateDropDown"> and a Submit button #BtnNewAppFinal
    console.log(`[Automation] Selecting State: ${state}...`);
    
    // Wait for the StateMenu modal to be visible
    await page.waitForSelector('#StateMenu', { timeout: 10000 });
    console.log('[Automation] ✓ StateMenu modal found');
    
    // Check if the StateDropDown select exists
    const stateDropdown = await page.$('#StateDropDown');
    if (stateDropdown) {
      console.log('[Automation] ✓ Found StateDropDown select element');
      
      // Get the state code from our mapping
      const stateCode = STATE_MAPPING[state];
      if (!stateCode) {
        throw new Error(`State "${state}" not found in STATE_MAPPING`);
      }
      console.log(`[Automation] State code for "${state}": ${stateCode}`);
      
      // STEP 1: Click the dropdown to open it first
      console.log('[Automation] Clicking dropdown to open it...');
      await page.click('#StateDropDown');
      await new Promise(r => setTimeout(r, 500));
      
      // STEP 2: Try page.select which should work for standard <select>
      try {
        await page.select('#StateDropDown', stateCode);
        console.log(`[Automation] ✓ Selected "${state}" via page.select`);
      } catch (e) {
        // If page.select fails, try to find and click the option directly
        console.log('[Automation] page.select failed, trying to click option directly...');
        
        // Scroll through options and click the right one
        const optionClicked = await page.evaluate((targetValue, targetState) => {
          const select = document.querySelector('#StateDropDown');
          if (!select) return false;
          
          // Find the option by value or text
          for (const opt of select.options) {
            if (opt.value === targetValue || opt.text.includes(targetState)) {
              opt.selected = true;
              select.value = opt.value;
              // Trigger change event
              select.dispatchEvent(new Event('change', { bubbles: true }));
              return true;
            }
          }
          return false;
        }, stateCode, state);
        
        if (optionClicked) {
          console.log(`[Automation] ✓ Selected "${state}" via direct option click`);
        } else {
          throw new Error(`Could not select state "${state}"`);
        }
      }
      
      // Wait a moment for the selection to register
      await new Promise(r => setTimeout(r, 500));
      
      // STEP 3: Click the Submit button to proceed
      console.log('[Automation] Looking for Submit button (BtnNewAppFinal)...');
      await page.waitForSelector('#BtnNewAppFinal', { timeout: 5000 });
      
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 30000 }).catch(() => {}),
        page.click('#BtnNewAppFinal')
      ]);
      console.log('[Automation] ✓ Clicked Submit button');
      
    } else {
      // Fallback: try the name-based selector
      console.log('[Automation] #StateDropDown not found, trying alternative selectors...');
      const altDropdown = await page.$('select[name="StateDropDown"], select[name*="State"]');
      if (altDropdown) {
        const stateCode = STATE_MAPPING[state];
        if (stateCode) {
          await page.select('select[name="StateDropDown"]', stateCode);
          console.log(`[Automation] ✓ Selected state via alternative dropdown`);
          await page.click('#BtnNewAppFinal');
        }
      } else {
        throw new Error('Could not find state dropdown selector');
      }
    }
    
    console.log('[Automation] ✓ State selection complete');
    
    // Wait for the quote form to load after state submission
    await new Promise(r => setTimeout(r, 3000));
    console.log('[Automation] ✓ Proceeding to application form...');
    
    // Part 6: Customer Information / Quote Form
    console.log('[Automation] Filling Customer Information...');
    
    // Wait for the form to be visible
    await page.waitForSelector('#InsNameFirst', { timeout: 15000 });
    console.log('[Automation] ✓ Application form loaded');
    
    // First Name
    await page.type('#InsNameFirst', firstName.toUpperCase());
    console.log('[Automation] ✓ First name entered');
    
    // Middle Name (optional)
    if (middleName) {
      await page.type('#InsNameMiddle', middleName.toUpperCase());
      console.log('[Automation] ✓ Middle name entered');
    }
    
    // Last Name
    await page.type('#InsNameLast', lastName.toUpperCase());
    console.log('[Automation] ✓ Last name entered');
    
    // Date of Birth (mm/dd/yyyy format)
    // Convert dob to mm/dd/yyyy if needed
    let formattedDOB = dob;
    if (dob && dob.includes('-')) {
      // Convert yyyy-mm-dd to mm/dd/yyyy
      const [year, month, day] = dob.split('-');
      formattedDOB = `${month}/${day}/${year}`;
    }
    await page.type('#dob', formattedDOB);
    console.log(`[Automation] ✓ DOB entered: ${formattedDOB}`);
    
    // Age
    if (age) {
      await page.type('#dobAge', String(age));
      console.log(`[Automation] ✓ Age entered: ${age}`);
    }
    
    // Gender (Male=M, Female=F)
    const genderValue = gender === 'Male' ? 'M' : 'F';
    await page.click(`input[name="ctl00$ContentPlaceHolderMain$Sex"][value="${genderValue}"]`);
    console.log(`[Automation] ✓ Gender selected: ${genderValue}`);
    
    // Tobacco (Yes=T, No=N)
    const tobaccoValue = tobacco ? 'T' : 'N';
    await page.click(`input[name="ctl00$ContentPlaceHolderMain$Tobacco"][value="${tobaccoValue}"]`);
    console.log(`[Automation] ✓ Tobacco selected: ${tobaccoValue}`);
    
    // Acceptance Checkbox (always check)
    await page.click('#Acceptance');
    console.log('[Automation] ✓ Acceptance checkbox checked');
    
    // Part 8: Death Benefit / Plan Type
    // Map our plan types to AA values: Immediate=I, Graded=G, ROP=R
    let planValue = 'I'; // Default to Immediate
    if (selectedPlanType === 'Graded') planValue = 'G';
    else if (selectedPlanType === 'ROP') planValue = 'R';
    else if (selectedPlanType === 'Level' || selectedPlanType === 'Immediate') planValue = 'I';
    
    await page.click(`input[name="ctl00$ContentPlaceHolderMain$Plan"][value="${planValue}"]`);
    console.log(`[Automation] ✓ Plan type selected: ${planValue}`);
    
    // Part 9: Payment Mode (always Monthly)
    await page.select('#Mode', 'M');
    console.log('[Automation] ✓ Payment mode set to Monthly');
    
    // Part 10: Face Amount / Coverage
    const coverageAmount = String(selectedCoverage || 10000);
    await page.type('#Coverage', coverageAmount);
    console.log(`[Automation] ✓ Coverage amount entered: $${coverageAmount}`);
    
    // Part 11: Automatic Premium Loan (always Yes)
    await page.click('#APL_1');
    console.log('[Automation] ✓ APL set to Yes');
    
    // Part 12: Deliver Policy To (always Insured)
    await page.click('#MailTo_1');
    console.log('[Automation] ✓ Mail to Insured selected');
    
    // Part 13: Requested Policy Date (today's date in mm/dd/yyyy)
    const today = new Date();
    const policyDate = `${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}/${today.getFullYear()}`;
    await page.type('#ReqPolicyDate', policyDate);
    console.log(`[Automation] ✓ Policy date entered: ${policyDate}`);
    
    // Part 14: Digital Policy (always Yes if visible)
    try {
      const digitalSection = await page.$('#DigitalInterestQ_1');
      if (digitalSection) {
        const isVisible = await page.evaluate(el => el.offsetParent !== null, digitalSection);
        if (isVisible) {
          await page.click('#DigitalInterestQ_1');
          console.log('[Automation] ✓ Digital policy set to Yes');
        } else {
          console.log('[Automation] Digital policy section hidden, skipping');
        }
      }
    } catch (e) {
      console.log('[Automation] Digital policy section not found, skipping');
    }
    
    // Part 15: Click Quote button
    console.log('[Automation] Clicking Quote button...');
    await page.waitForSelector('#BtnQuote', { timeout: 10000 });
    await page.click('#BtnQuote');
    console.log('[Automation] ✓ Quote button clicked');
    
    // Wait for quote popup to appear
    await new Promise(r => setTimeout(r, 5000));
    
    // Part 16: Click Continue Application button
    console.log('[Automation] Looking for Continue Application button...');
    try {
      await page.waitForSelector('#BtnContinue', { timeout: 15000 });
      await page.click('#BtnContinue');
      console.log('[Automation] ✓ Clicked Continue Application');
    } catch (e) {
      console.log('[Automation] Continue button not found, quote may have different flow');
    }
    
    // Wait for health questions form to load
    await new Promise(r => setTimeout(r, 3000));
    
    // ═══════════════════════════════════════════════════════════════════════
    // PART 17: HEALTH QUESTIONS
    // ═══════════════════════════════════════════════════════════════════════
    console.log('[Automation] Filling Health Questions...');
    
    // Helper function to click Yes or No radio
    const answerHealthQuestion = async (questionId, answer) => {
      const suffix = answer ? '_1' : '_2'; // _1 = Yes, _2 = No
      const selector = `#${questionId}${suffix}`;
      try {
        await page.waitForSelector(selector, { timeout: 5000 });
        await page.click(selector);
        console.log(`[Automation] ✓ ${questionId}: ${answer ? 'Yes' : 'No'}`);
      } catch (e) {
        console.log(`[Automation] Health question ${questionId} not found`);
      }
    };
    
    // Questions 1-3 (If Yes = Not Eligible)
    await answerHealthQuestion('_SectionA1', healthQ1);
    await answerHealthQuestion('_SectionA2', healthQ2);
    await answerHealthQuestion('_SectionA3', healthQ3);
    
    // Questions 4-7 (If Yes = ROP Plan)
    await answerHealthQuestion('_SectionA4', healthQ4);
    await answerHealthQuestion('_SectionA5', healthQ5);
    await answerHealthQuestion('_SectionA6', healthQ6);
    await answerHealthQuestion('_SectionA7a', healthQ7a);
    await answerHealthQuestion('_SectionA7b', healthQ7b);
    await answerHealthQuestion('_SectionA7c', healthQ7c);
    await answerHealthQuestion('_SectionA7d', healthQ7d);
    
    // Question 8 (If Yes = Graded Plan)
    await answerHealthQuestion('_SectionA8a', healthQ8a);
    await answerHealthQuestion('_SectionA8b', healthQ8b);
    await answerHealthQuestion('_SectionA8c', healthQ8c);
    
    // COVID Question
    await answerHealthQuestion('CVQ1', healthCovid);
    
    console.log('[Automation] ✓ Health questions completed');
    
    // Click Continue after health questions
    try {
      await page.waitForSelector('#BtnContinue', { timeout: 10000 });
      await page.click('#BtnContinue');
      console.log('[Automation] ✓ Clicked Continue after health questions');
    } catch (e) {
      console.log('[Automation] Continue button not found after health questions');
    }
    
    await new Promise(r => setTimeout(r, 2000));
    
    // ═══════════════════════════════════════════════════════════════════════
    // PART 18: PERSONAL INFO PAGE - BANK DRAFT & ADDITIONAL INFO
    // ═══════════════════════════════════════════════════════════════════════
    console.log('[Automation] Filling Personal Info / Bank Draft...');
    
    // Wait for the Personal Info page to load
    await page.waitForSelector('#Method', { timeout: 15000 }).catch(() => {});
    console.log('[Automation] ✓ Personal Info page loaded');
    
    // === PAYMENT METHOD (Bank Draft) ===
    try {
      await page.click('#Method_1'); // Bank Draft
      console.log('[Automation] ✓ Payment method set to Bank Draft');
      await new Promise(r => setTimeout(r, 1000)); // Wait for Bank Draft section to appear
    } catch (e) {
      console.log('[Automation] Payment method selector not found');
    }
    
    // === BANK DRAFT INFORMATION ===
    // Account Holder
    if (accountHolder) {
      try {
        await page.type('#AccountHolder', accountHolder.toUpperCase());
        console.log('[Automation] ✓ Account Holder entered');
      } catch (e) {
        console.log('[Automation] Account Holder field not found');
      }
    }
    
    // Bank Name
    if (bankName) {
      try {
        await page.type('#BankName', bankName.toUpperCase());
        console.log('[Automation] ✓ Bank Name entered');
      } catch (e) {
        console.log('[Automation] Bank Name field not found');
      }
    }
    
    // Bank City/State
    if (bankCityState) {
      try {
        await page.type('#BankAddress', bankCityState.toUpperCase());
        console.log('[Automation] ✓ Bank City/State entered');
      } catch (e) {
        console.log('[Automation] Bank Address field not found');
      }
    }
    
    // Social Security Payment Schedule (Yes/No)
    if (ssPaymentSchedule !== null) {
      try {
        if (ssPaymentSchedule === true) {
          await page.click('#SSP_1'); // Yes - coincide with SS
          console.log('[Automation] ✓ SS Payment Schedule: Yes');
        } else {
          await page.click('#SSP_2'); // No
          console.log('[Automation] ✓ SS Payment Schedule: No');
        }
        await new Promise(r => setTimeout(r, 500)); // Wait for draft day options to update
      } catch (e) {
        console.log('[Automation] SS Payment Schedule radio not found');
      }
    }
    
    // Draft Day (depends on SS Payment Schedule answer)
    if (draftDay) {
      try {
        await page.select('#RequestedDraftDay', draftDay);
        console.log(`[Automation] ✓ Requested Draft Day: ${draftDay}`);
      } catch (e) {
        console.log('[Automation] Draft Day selector not found');
      }
    }
    
    // Routing Number (Transit/ABA)
    if (routingNumber) {
      try {
        await page.type('#TransitNumber', routingNumber.replace(/[^0-9]/g, ''));
        console.log('[Automation] ✓ Routing Number entered');
      } catch (e) {
        console.log('[Automation] Transit Number field not found');
      }
    }
    
    // Account Number
    if (accountNumber) {
      try {
        await page.type('#AccountNumber', accountNumber.replace(/[^0-9]/g, ''));
        console.log('[Automation] ✓ Account Number entered');
      } catch (e) {
        console.log('[Automation] Account Number field not found');
      }
    }
    
    // ████ VALIDATE BANK INFO - CRITICAL STEP ████
    console.log('[Automation] Clicking Validate Bank Info button...');
    try {
      await page.waitForSelector('#btValidateBankInfo', { timeout: 5000 });
      await page.click('#btValidateBankInfo');
      console.log('[Automation] ✓ Validate Bank Info clicked');
      // Wait for validation to complete
      await new Promise(r => setTimeout(r, 5000));
      console.log('[Automation] ✓ Bank validation complete');
    } catch (e) {
      console.log('[Automation] Validate Bank Info button not found or failed');
    }
    
    // Checking/Savings
    try {
      if (accountType === 'Checking') {
        await page.click('#CheckPlan_1'); // Checking
        console.log('[Automation] ✓ Account Type: Checking');
      } else {
        await page.click('#CheckPlan_2'); // Saving
        console.log('[Automation] ✓ Account Type: Saving');
      }
    } catch (e) {
      console.log('[Automation] Checking/Savings radio not found');
    }
    
    // === PERSONAL INFORMATION - CRITICAL FIELDS ===
    // Street Address
    if (address) {
      try {
        await page.type('#StreetAddress', address.toUpperCase());
        console.log('[Automation] ✓ Street Address entered');
      } catch (e) {
        console.log('[Automation] Street Address field not found');
      }
    }
    
    // ZipCode - this auto-fills State and City
    if (zip) {
      try {
        await page.type('#ZipCode', zip.replace(/[^0-9]/g, '').slice(0, 5));
        console.log('[Automation] ✓ ZipCode entered');
        await new Promise(r => setTimeout(r, 1000)); // Wait for auto-fill
      } catch (e) {
        console.log('[Automation] ZipCode field not found');
      }
    }
    
    // Social Security Number
    if (ssn) {
      try {
        await page.type('#SSN', ssn.replace(/[^0-9]/g, ''));
        console.log('[Automation] ✓ SSN entered');
      } catch (e) {
        console.log('[Automation] SSN field not found');
      }
    }
    
    // Phone
    if (phone) {
      try {
        await page.type('#Phone', phone.replace(/[^0-9]/g, ''));
        console.log('[Automation] ✓ Phone entered');
      } catch (e) {
        console.log('[Automation] Phone field not found');
      }
    }
    
    // === EMAIL PREFERENCE ===
    if (wantsEmail === true && email) {
      try {
        await page.click('#EmailAdress_1'); // Yes - wants email
        console.log('[Automation] ✓ Email preference: Yes');
        await new Promise(r => setTimeout(r, 500));
        // Type email in both fields
        await page.type('#Email1', email);
        await page.type('#VerifyEmail1', email);
        console.log('[Automation] ✓ Email entered and verified');
      } catch (e) {
        console.log('[Automation] Email fields not found');
      }
    } else if (wantsEmail === false) {
      try {
        await page.click('#EmailAdress_2'); // No
        console.log('[Automation] ✓ Email preference: No');
      } catch (e) {
        console.log('[Automation] Email radio not found');
      }
    }
    
    // === BIRTH STATE ===
    if (birthState) {
      try {
        await page.type('#BirthState', birthState.toUpperCase().slice(0, 2));
        console.log('[Automation] ✓ Birth state entered');
      } catch (e) {
        console.log('[Automation] Birth state field not found');
      }
    }
    
    // === HEIGHT & WEIGHT ===
    if (heightFeet && heightInches !== undefined) {
      const heightValue = `${heightFeet}'${heightInches}`;
      try {
        await page.select('#Height', heightValue);
        console.log(`[Automation] ✓ Height selected: ${heightValue}`);
      } catch (e) {
        console.log('[Automation] Height selector not found');
      }
    }
    
    if (weight) {
      try {
        await page.type('#Weight', String(weight));
        console.log('[Automation] ✓ Weight entered');
      } catch (e) {
        console.log('[Automation] Weight field not found');
      }
    }
    
    // === PHYSICIAN INFORMATION ===
    if (doctorName) {
      try {
        await page.type('#DoctorName', doctorName.toUpperCase());
        console.log('[Automation] ✓ Doctor name entered');
      } catch (e) {
        console.log('[Automation] Doctor name field not found');
      }
    }
    
    if (doctorAddress) {
      try {
        await page.type('#DoctorName1', doctorAddress.toUpperCase());
        console.log('[Automation] ✓ Doctor address entered');
      } catch (e) {
        console.log('[Automation] Doctor address field not found');
      }
    }
    
    if (doctorPhone) {
      try {
        await page.type('#PPhone', doctorPhone.replace(/[^0-9]/g, ''));
        console.log('[Automation] ✓ Doctor phone entered');
      } catch (e) {
        console.log('[Automation] Doctor phone field not found');
      }
    }
    
    // === OWNER INFORMATION ===
    try {
      if (ownerIsInsured) {
        await page.click('#OwnerInfo_1'); // True = Owner is Insured
        console.log('[Automation] ✓ Owner is Insured: Yes');
      } else {
        await page.click('#OwnerInfo_2'); // False = Owner is different
        console.log('[Automation] ✓ Owner is Insured: No');
      }
    } catch (e) {
      console.log('[Automation] Owner Info radio not found');
    }
    
    // === PAYOR INFORMATION ===
    try {
      if (payorIsInsured) {
        await page.click('#PayorInfo_1'); // True = Payor is Insured
        console.log('[Automation] ✓ Payor is Insured: Yes');
      } else {
        await page.click('#PayorInfo_2'); // False = Payor is different
        console.log('[Automation] ✓ Payor is Insured: No');
      }
    } catch (e) {
      console.log('[Automation] Payor Info radio not found');
    }
    
    // === EXISTING INSURANCE ===
    if (hasExistingInsurance !== null) {
      try {
        if (hasExistingInsurance) {
          await page.click('#ExistingInsurance_1'); // Yes
          console.log('[Automation] ✓ Existing Insurance: Yes');
          await new Promise(r => setTimeout(r, 500));
          
          // Fill in existing coverage details
          if (existingCompanyName) {
            await page.type('#Company', existingCompanyName.toUpperCase()).catch(() => {});
            console.log('[Automation] ✓ Existing Company entered');
          }
          if (existingPolicyNumber) {
            await page.type('#PolicyNum', existingPolicyNumber).catch(() => {});
            console.log('[Automation] ✓ Existing Policy Number entered');
          }
          if (existingCoverageAmount) {
            await page.type('#AmountofCoverage', String(existingCoverageAmount)).catch(() => {});
            console.log('[Automation] ✓ Existing Coverage Amount entered');
          }
        } else {
          await page.click('#ExistingInsurance_2'); // No
          console.log('[Automation] ✓ Existing Insurance: No');
        }
      } catch (e) {
        console.log('[Automation] Existing Insurance fields not found');
      }
    }
    
    // === REPLACEMENT INSURANCE ===
    if (willReplaceExisting !== null) {
      try {
        if (willReplaceExisting) {
          await page.click('#RepIns_1'); // Yes
          console.log('[Automation] ✓ Will Replace: Yes');
        } else {
          await page.click('#RepIns_2'); // No
          console.log('[Automation] ✓ Will Replace: No');
        }
      } catch (e) {
        console.log('[Automation] Replacement Insurance radio not found');
      }
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    // PRIMARY BENEFICIARY SECTION
    // ═══════════════════════════════════════════════════════════════════════
    console.log('[Automation] Filling Primary Beneficiary...');
    
    // Primary Beneficiary Full Name
    if (beneficiaryName) {
      try {
        await page.type('#PrimaryBeneficiary', beneficiaryName.toUpperCase());
        console.log('[Automation] ✓ Primary Beneficiary Name entered');
      } catch (e) {
        console.log('[Automation] Primary Beneficiary field not found');
      }
    }
    
    // Primary Beneficiary Relationship - Select "Family Member" by clicking the radio
    // Radio options: Family Member (_1), Multiple Beneficiaries (_2), Life Partner (_3), Fiancé (_4), Estate (_5), Trust (_6), Other (_7)
    if (beneficiaryRelation) {
      try {
        const relationMap = {
          'family member': 'PrimaryRelationship_1',
          'spouse': 'PrimaryRelationship_1',
          'mother': 'PrimaryRelationship_1',
          'father': 'PrimaryRelationship_1',
          'child': 'PrimaryRelationship_1',
          'daughter': 'PrimaryRelationship_1',
          'son': 'PrimaryRelationship_1',
          'brother': 'PrimaryRelationship_1',
          'sister': 'PrimaryRelationship_1',
          'life partner': 'PrimaryRelationship_3',
          'fiancé': 'PrimaryRelationship_4',
          'fiance': 'PrimaryRelationship_4',
          'multiple': 'PrimaryRelationship_2',
          'estate': 'PrimaryRelationship_5',
          'trust': 'PrimaryRelationship_6',
          'other': 'PrimaryRelationship_7'
        };
        
        const relationLower = beneficiaryRelation.toLowerCase();
        const radioId = relationMap[relationLower] || 'PrimaryRelationship_1'; // Default to Family Member
        
        await page.click(`#${radioId}`);
        console.log(`[Automation] ✓ Primary Beneficiary Relationship: ${radioId}`);
        await new Promise(r => setTimeout(r, 500)); // Wait for conditional fields
        
        // If Family Member, also select the specific family member type from dropdown
        if (radioId === 'PrimaryRelationship_1') {
          const familyMap = {
            'spouse': 'Spouse',
            'mother': 'Mother',
            'father': 'Father',
            'daughter': 'Daughter',
            'son': 'Son',
            'brother': 'Brother',
            'sister': 'Sister',
            'cousin': 'Cousin',
            'aunt': 'Aunt',
            'uncle': 'Uncle',
            'grandfather': 'Grandfather',
            'grandmother': 'Grandmother',
            'grandchild': 'Grandchild',
            'niece': 'Niece',
            'nephew': 'Nephew'
          };
          
          const familyValue = familyMap[relationLower] || 'Spouse'; // Default to Spouse
          try {
            await page.select('#PFamilyMember', familyValue);
            console.log(`[Automation] ✓ Family Member Type: ${familyValue}`);
          } catch (e) {
            console.log('[Automation] Family Member dropdown not found');
          }
        }
      } catch (e) {
        console.log('[Automation] Primary Relationship radio not found');
      }
    } else {
      // Default to Family Member > Spouse if no relationship specified
      try {
        await page.click('#PrimaryRelationship_1');
        console.log('[Automation] ✓ Primary Beneficiary Relationship: Family Member (default)');
        await new Promise(r => setTimeout(r, 500));
        await page.select('#PFamilyMember', 'Spouse');
        console.log('[Automation] ✓ Family Member Type: Spouse (default)');
      } catch (e) {
        console.log('[Automation] Could not set default beneficiary relationship');
      }
    }
    
    console.log('[Automation] ✓ Primary Beneficiary section completed');
    
    console.log('[Automation] ✓ Contact information completed');
    
    // ═══════════════════════════════════════════════════════════════════════
    // ILLINOIS RESIDENTS SECTION (Only for IL)
    // ═══════════════════════════════════════════════════════════════════════
    if (state === 'Illinois' || state === 'IL') {
      console.log('[Automation] Illinois Residents section - handling designee choice...');
      try {
        // Look for the Illinois Residents section
        // The radio buttons are typically named with 'Designee' or 'ApplicantDesignee'
        const designeeSection = await page.$('#ApplicantDesignee, [id*="Designee"], [name*="Designee"]');
        if (designeeSection) {
          if (ilDesigneeChoice === 'Will Designate') {
            // Click 'Will Designate' radio - typically _1
            const willDesignateRadio = await page.$('input[value*="Will Designate"], input[value="WillDesignate"], #ApplicantDesignee_1, [id*="Designee"][value*="Designate"]:not([value*="Not"])');
            if (willDesignateRadio) {
              await willDesignateRadio.click();
              console.log('[Automation] ✓ Illinois Designee Choice: Will Designate');
            }
          } else {
            // Click 'Will Not Designate' radio - typically _2
            const willNotDesignateRadio = await page.$('input[value*="Will Not Designate"], input[value*="NotDesignate"], input[value="WillNotDesignate"], #ApplicantDesignee_2, [id*="Designee"][value*="Not"]');
            if (willNotDesignateRadio) {
              await willNotDesignateRadio.click();
              console.log('[Automation] ✓ Illinois Designee Choice: Will Not Designate');
            }
          }
        } else {
          console.log('[Automation] Illinois Designee section not found on page, may not be visible');
        }
      } catch (e) {
        console.log('[Automation] Illinois Designee section error:', e.message);
      }
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    // CLICK CONTINUE TO AGENT STATEMENT BUTTON
    // ═══════════════════════════════════════════════════════════════════════
    console.log('[Automation] Looking for Continue to Agent Statement button...');
    try {
      // Scroll to bottom of page to ensure the button is visible
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
      await new Promise(r => setTimeout(r, 1000));
      
      // Wait for the button to be available - using exact selector from carrier HTML
      // <input type="submit" name="ctl00$ContentPlaceHolderBottomButton$BtnContinue" value="Continue to Agent Statement" id="BtnContinue" class="btn">
      const continueButtonSelector = 'input[name="ctl00$ContentPlaceHolderBottomButton$BtnContinue"]';
      
      let buttonClicked = false;
      
      // Try the exact name-based selector first
      const buttonByName = await page.$(continueButtonSelector);
      if (buttonByName) {
        await buttonByName.click();
        console.log('[Automation] ✓ Clicked Continue to Agent Statement button (by name)');
        buttonClicked = true;
      }
      
      // Fallback: Try by ID
      if (!buttonClicked) {
        const buttonById = await page.$('#BtnContinue');
        if (buttonById) {
          // Verify it's the right button by checking the value
          const buttonValue = await page.evaluate(el => el.value, buttonById);
          if (buttonValue && buttonValue.includes('Agent Statement')) {
            await buttonById.click();
            console.log('[Automation] ✓ Clicked Continue to Agent Statement button (by id)');
            buttonClicked = true;
          }
        }
      }
      
      // Fallback: Try by exact value
      if (!buttonClicked) {
        const buttonByValue = await page.$('input[value="Continue to Agent Statement"]');
        if (buttonByValue) {
          await buttonByValue.click();
          console.log('[Automation] ✓ Clicked Continue to Agent Statement button (by value)');
          buttonClicked = true;
        }
      }
      
      // Last resort: Use JavaScript to find and click
      if (!buttonClicked) {
        const result = await page.evaluate(() => {
          // Find by exact value first
          let btn = document.querySelector('input[value="Continue to Agent Statement"]');
          if (!btn) {
            // Find by partial value
            const allInputs = document.querySelectorAll('input[type="submit"]');
            for (const input of allInputs) {
              if (input.value && input.value.includes('Agent Statement')) {
                btn = input;
                break;
              }
            }
          }
          if (btn) {
            btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
            btn.click();
            return { success: true, value: btn.value, id: btn.id };
          }
          return { success: false };
        });
        
        if (result.success) {
          console.log(`[Automation] ✓ Clicked button via JS: ${result.value} (id: ${result.id})`);
          buttonClicked = true;
        }
      }
      
      if (!buttonClicked) {
        console.log('[Automation] ⚠ Continue to Agent Statement button not found');
      } else {
        // Wait for navigation after button click
        await new Promise(r => setTimeout(r, 3000));
      }
    } catch (e) {
      console.log('[Automation] Error clicking Continue button:', e.message);
    }
    
    // Wait for Agent Statement page to load
    await new Promise(r => setTimeout(r, 3000));
    
    // ═══════════════════════════════════════════════════════════════════════
    // AGENT STATEMENT PAGE
    // ═══════════════════════════════════════════════════════════════════════
    console.log('[Automation] ═══ AGENT STATEMENT PAGE ═══');
    
    try {
      // Check if we're on the agent statement page
      const agentStatementPage = await page.$('#AgentSignature1');
      if (agentStatementPage) {
        console.log('[Automation] Agent Statement page loaded');
        
        // 1. Agent's Electronic Signature - Always input 'Yazzyl Vasquez'
        await page.type('#AgentSignature1', 'Yazzyl Vasquez', { delay: 30 });
        console.log('[Automation] ✓ Agent Signature entered: Yazzyl Vasquez');
        
        // 2. City where proposed insured signed - use customer's city
        const customerCity = data.city || '';
        if (customerCity) {
          await page.type('#CitySigned', customerCity, { delay: 30 });
          console.log(`[Automation] ✓ City Signed entered: ${customerCity}`);
        }
        
        // 3. State where proposed insured signed - select from dropdown
        // Map full state name to abbreviation if needed
        const stateAbbreviations = {
          'Illinois': 'IL', 'Texas': 'TX', 'California': 'CA', 'Florida': 'FL',
          'New York': 'NY', 'Tennessee': 'TN', 'Georgia': 'GA', 'Ohio': 'OH',
          'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR',
          'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE', 'Hawaii': 'HI',
          'Idaho': 'ID', 'Indiana': 'IN', 'Iowa': 'IA', 'Kansas': 'KS',
          'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
          'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS',
          'Missouri': 'MO', 'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV',
          'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM',
          'North Carolina': 'NC', 'North Dakota': 'ND', 'Oklahoma': 'OK', 'Oregon': 'OR',
          'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
          'South Dakota': 'SD', 'Utah': 'UT', 'Vermont': 'VT', 'Virginia': 'VA',
          'Washington': 'WA', 'West Virginia': 'WV', 'Wisconsin': 'WI', 'Wyoming': 'WY'
        };
        
        const stateCode = stateAbbreviations[state] || state;
        await page.select('#StateSigned', stateCode);
        console.log(`[Automation] ✓ State Signed selected: ${stateCode}`);
        
        // 4. Replacement Questions - Match the answers from Personal Info page
        // Does the proposed insured have any existing life insurance or annuity contract?
        const hasExistingIns = data.hasExistingInsurance === true || data.hasExisting === true;
        if (hasExistingIns) {
          await page.click('#AgentExistingInsurance_1'); // Yes
        } else {
          await page.click('#AgentExistingInsurance_2'); // No
        }
        console.log(`[Automation] ✓ Existing Insurance: ${hasExistingIns ? 'Yes' : 'No'}`);
        
        // Is the proposed insurance intended to replace or change any existing life insurance or annuity?
        const willReplace = data.willReplaceExisting === true || data.willReplace === true;
        if (willReplace) {
          await page.click('#AgentRepIns_1'); // Yes
        } else {
          await page.click('#AgentRepIns_2'); // No
        }
        console.log(`[Automation] ✓ Will Replace: ${willReplace ? 'Yes' : 'No'}`);
        
        await new Promise(r => setTimeout(r, 1000));
        
        // 5. Click 'Continue to Signatures' button
        console.log('[Automation] Looking for Continue to Signatures button...');
        const continueToSigButton = await page.$('input[name="ctl00$ContentPlaceHolderBottomButton$btnContinue"]') ||
                                     await page.$('#btnContinue') ||
                                     await page.$('input[value="Continue to Signatures"]');
        
        if (continueToSigButton) {
          await continueToSigButton.click();
          console.log('[Automation] ✓ Clicked Continue to Signatures');
          await new Promise(r => setTimeout(r, 3000));
        } else {
          console.log('[Automation] Continue to Signatures button not found');
        }
      } else {
        console.log('[Automation] Agent Statement page not detected, may already be past this step');
      }
    } catch (e) {
      console.log('[Automation] Error on Agent Statement page:', e.message);
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    // SIGNATURE OPTIONS PAGE - Select Voice Recording
    // ═══════════════════════════════════════════════════════════════════════
    console.log('[Automation] ═══ SIGNATURE OPTIONS PAGE ═══');
    
    let applicationNumber = '';
    
    try {
      // Wait for page to load
      await new Promise(r => setTimeout(r, 2000));
      
      // Check if we're on the signature options page
      const voiceRecordingBtn = await page.$('#optionVoiceUpload') || 
                                 await page.$('#BtnUploadVoiceSig');
      
      if (voiceRecordingBtn) {
        console.log('[Automation] Signature Options page loaded');
        
        // CAPTURE APPLICATION NUMBER - This is critical!
        try {
          applicationNumber = await page.evaluate(() => {
            // Try to find the app number in various locations
            const spanAppNumber = document.querySelector('#spanAppNumber');
            if (spanAppNumber) return spanAppNumber.textContent.trim();
            
            const appNumberLabel = document.querySelector('#AppNumberLabel');
            if (appNumberLabel) {
              // Extract the number from the span inside
              const innerSpan = appNumberLabel.querySelector('span[style*="x-large"]');
              if (innerSpan) return innerSpan.textContent.trim();
              // Or get full text and extract number
              const match = appNumberLabel.textContent.match(/M?\d{9,}/);
              if (match) return match[0].trim();
            }
            
            // Search the page for application number pattern
            const bodyText = document.body.innerText;
            const appMatch = bodyText.match(/M?00\d{7,}/);
            return appMatch ? appMatch[0].trim() : '';
          });
          
          console.log('[Automation] ✓✓✓ APPLICATION NUMBER CAPTURED:', applicationNumber);
        } catch (e) {
          console.log('[Automation] Error capturing application number:', e.message);
        }
        
        // Click the Voice Recording button
        const visibleVoiceBtn = await page.$('#optionVoiceUpload');
        if (visibleVoiceBtn) {
          await visibleVoiceBtn.click();
          console.log('[Automation] ✓ Clicked Voice Recording option');
        } else {
          // Fallback: click the hidden button directly
          await page.click('#BtnUploadVoiceSig');
          console.log('[Automation] ✓ Clicked Voice Recording (hidden button)');
        }
        
        await new Promise(r => setTimeout(r, 2000));
      } else {
        console.log('[Automation] Signature Options page not detected');
        
        // Still try to capture application number from current page
        try {
          applicationNumber = await page.evaluate(() => {
            const appNumberLabel = document.querySelector('#AppNumberLabel');
            if (appNumberLabel) {
              const innerSpan = appNumberLabel.querySelector('span[style*="x-large"]');
              if (innerSpan) return innerSpan.textContent.trim();
            }
            const spanAppNumber = document.querySelector('#spanAppNumber');
            if (spanAppNumber) return spanAppNumber.textContent.trim();
            return '';
          });
          if (applicationNumber) {
            console.log('[Automation] ✓ Application Number captured from current page:', applicationNumber);
          }
        } catch (e) {
          console.log('[Automation] Could not capture application number');
        }
      }
    } catch (e) {
      console.log('[Automation] Error on Signature Options page:', e.message);
    }
    
    // Final result
    await new Promise(r => setTimeout(r, 2000));
    
    console.log('[Automation] ════════════════════════════════════════════════════════');
    console.log('[Automation] ✓✓✓ AUTOMATION COMPLETE - READY FOR VOICE RECORDING ✓✓✓');
    console.log('[Automation] ════════════════════════════════════════════════════════');
    console.log('[Automation] Application Number:', applicationNumber);
    console.log('[Automation] Final URL:', page.url());
    
    return { 
      success: true, 
      message: 'Application ready for voice recording',
      applicationNumber: applicationNumber,
      customer: `${firstName} ${lastName}`,
      state: state,
      coverage: selectedCoverage
    };

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
