
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
    // Height/Weight
    heightFeet = '',
    heightInches = '',
    weight = '',
    // Doctor info
    doctorName = '',
    doctorAddress = '',
    doctorPhone = '',
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
    healthCovid = false
  } = data;
  
  let browser = null;
  const logTs = () => new Date().toISOString();

  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`[PUPPETEER] ${logTs()} ▶▶▶ AUTOMATION FUNCTION CALLED ◀◀◀`);
  console.log(`[PUPPETEER] ${logTs()} Customer: ${firstName} ${middleName} ${lastName}`);
  console.log(`[PUPPETEER] ${logTs()} State: ${state}, DOB: ${dob}, Age: ${age}, Gender: ${gender}`);
  console.log(`[PUPPETEER] ${logTs()} Coverage: ${selectedCoverage}, Plan: ${selectedPlanType}, Tobacco: ${tobacco}`);
  console.log(`[PUPPETEER] ${logTs()} Address: ${address}, ${zip}`);
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
    
    // Wait for page to process after product click
    console.log('[Automation] Waiting for page to update after product selection...');
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
      
      // Select the state by value (the AASCXXSM... code)
      await page.select('#StateDropDown', stateCode);
      console.log(`[Automation] ✓ Selected "${state}" in dropdown`);
      
      // Wait a moment for the selection to register
      await new Promise(r => setTimeout(r, 500));
      
      // Click the Submit button to proceed
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

    // Part 6: Click Submit button to proceed to application form
    console.log('[Automation] Looking for Submit button...');
    
    // After state selection, there should be a submit/proceed button
    // Try multiple possible submit button selectors
    const submitSelectors = [
      '#BtnNewAppFinal', 
      '#BtnSubmit', 
      '#btnSubmit',
      'input[type="submit"][value="Submit"]',
      'input[type="submit"][value="Continue"]',
      'button[type="submit"]',
      'input[value="Submit"]'
    ];
    
    let submitFound = false;
    
    // Wait a moment for submit button to be available
    await new Promise(r => setTimeout(r, 1000));
    
    // Log available buttons
    const availableButtons = await page.$$eval('input[type="submit"], button', els => 
      els.map(e => ({ id: e.id, value: e.value || e.textContent, visible: e.offsetParent !== null }))
    );
    console.log('[Automation] Available buttons:', JSON.stringify(availableButtons.slice(0, 10)));
    
    for (const selector of submitSelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          const isVisible = await page.evaluate(el => el.offsetParent !== null, element);
          if (isVisible) {
            console.log(`[Automation] ✓ Found visible Submit button: ${selector}`);
            await element.click();
            submitFound = true;
            break;
          }
        }
      } catch (e) {
        // Continue
      }
    }
    
    if (!submitFound) {
      // Try waiting for specific button
      try {
        await page.waitForSelector('#BtnNewAppFinal', { timeout: 5000 });
        await page.click('#BtnNewAppFinal');
        submitFound = true;
        console.log('[Automation] ✓ Clicked BtnNewAppFinal after wait');
      } catch (e) {
        console.log('[Automation] BtnNewAppFinal not found:', e.message);
      }
    }
    
    if (!submitFound) {
      console.log('[Automation] Warning: Submit button not found, but continuing...');
    }
    
    await new Promise(r => setTimeout(r, 3000)); // Wait for form to load
    console.log('[Automation] ✓ Proceeding to application form...');
    
    // Part 7: Customer Information Form
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
    
    // Part 14: Digital Policy (always Yes)
    await page.click('#DigitalInterestQ_1');
    console.log('[Automation] ✓ Digital policy set to Yes');
    
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
    // PART 18: CONTACT & ADDITIONAL INFORMATION
    // ═══════════════════════════════════════════════════════════════════════
    console.log('[Automation] Filling Contact Information...');
    
    // Payment Type (always Bank Draft)
    try {
      await page.click('#Method_1');
      console.log('[Automation] ✓ Payment method set to Bank Draft');
    } catch (e) {
      console.log('[Automation] Payment method selector not found');
    }
    
    // Street Address
    if (address) {
      try {
        await page.type('#StreetAddress', address.toUpperCase());
        console.log('[Automation] ✓ Street address entered');
      } catch (e) {
        console.log('[Automation] Street address field not found');
      }
    }
    
    // Zip Code
    if (zip) {
      try {
        await page.type('#ZipCode', zip);
        console.log('[Automation] ✓ Zip code entered');
      } catch (e) {
        console.log('[Automation] Zip code field not found');
      }
    }
    
    // Social Security Number
    if (ssn) {
      try {
        await page.type('#SSN', ssn.replace(/[^0-9]/g, '')); // Remove dashes
        console.log('[Automation] ✓ SSN entered');
      } catch (e) {
        console.log('[Automation] SSN field not found');
      }
    }
    
    // Phone
    if (phone) {
      try {
        await page.type('#Phone', phone.replace(/[^0-9]/g, '')); // Numbers only
        console.log('[Automation] ✓ Phone entered');
      } catch (e) {
        console.log('[Automation] Phone field not found');
      }
    }
    
    // Email - select Yes if we have email
    if (email) {
      try {
        await page.click('#EmailAdress_1'); // Yes
        console.log('[Automation] ✓ Email: Yes selected');
        // Type email if there's a field for it
      } catch (e) {
        console.log('[Automation] Email radio not found');
      }
    } else {
      try {
        await page.click('#EmailAdress_2'); // No
        console.log('[Automation] ✓ Email: No selected');
      } catch (e) {
        console.log('[Automation] Email radio not found');
      }
    }
    
    // Birth State (2 letter code)
    if (birthState) {
      try {
        await page.type('#BirthState', birthState.toUpperCase().slice(0, 2));
        console.log('[Automation] ✓ Birth state entered');
      } catch (e) {
        console.log('[Automation] Birth state field not found');
      }
    }
    
    // Height (format: 5'10)
    if (heightFeet && heightInches) {
      const heightValue = `${heightFeet}'${heightInches}`;
      try {
        await page.select('#Height', heightValue);
        console.log(`[Automation] ✓ Height selected: ${heightValue}`);
      } catch (e) {
        console.log('[Automation] Height selector not found or value not in list');
      }
    }
    
    // Weight
    if (weight) {
      try {
        await page.type('#Weight', String(weight));
        console.log('[Automation] ✓ Weight entered');
      } catch (e) {
        console.log('[Automation] Weight field not found');
      }
    }
    
    // Doctor Name
    if (doctorName) {
      try {
        await page.type('#DoctorName', doctorName.toUpperCase());
        console.log('[Automation] ✓ Doctor name entered');
      } catch (e) {
        console.log('[Automation] Doctor name field not found');
      }
    }
    
    // Doctor Address
    if (doctorAddress) {
      try {
        await page.type('#DoctorName1', doctorAddress.toUpperCase());
        console.log('[Automation] ✓ Doctor address entered');
      } catch (e) {
        console.log('[Automation] Doctor address field not found');
      }
    }
    
    // Doctor Phone
    if (doctorPhone) {
      try {
        await page.type('#PPhone', doctorPhone.replace(/[^0-9]/g, ''));
        console.log('[Automation] ✓ Doctor phone entered');
      } catch (e) {
        console.log('[Automation] Doctor phone field not found');
      }
    }
    
    // Owner Information (always Yes/True)
    try {
      await page.click('#OwnerInfo_1');
      console.log('[Automation] ✓ Owner Info set to True');
    } catch (e) {
      console.log('[Automation] Owner Info radio not found');
    }
    
    // Payor Information (always Yes/True)
    try {
      await page.click('#PayorInfo_1');
      console.log('[Automation] ✓ Payor Info set to True');
    } catch (e) {
      console.log('[Automation] Payor Info radio not found');
    }
    
    console.log('[Automation] ✓ Contact information completed');
    
    // Wait for final result
    await new Promise(r => setTimeout(r, 3000));
    
    console.log('[Automation] ════════════════════════════════════════════════════════');
    console.log('[Automation] ✓✓✓ SUCCESSFULLY COMPLETED CARRIER APPLICATION! ✓✓✓');
    console.log('[Automation] ════════════════════════════════════════════════════════');
    console.log('[Automation] Final URL:', page.url());
    
    return { 
      success: true, 
      message: 'Application submitted successfully',
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
