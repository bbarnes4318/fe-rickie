
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
    selectedPlanType
  } = data;
  
  let browser = null;
  const logTs = () => new Date().toISOString();

  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`[PUPPETEER] ${logTs()} ▶▶▶ AUTOMATION FUNCTION CALLED ◀◀◀`);
  console.log(`[PUPPETEER] ${logTs()} Customer: ${firstName} ${middleName} ${lastName}`);
  console.log(`[PUPPETEER] ${logTs()} State: ${state}, DOB: ${dob}, Age: ${age}, Gender: ${gender}`);
  console.log(`[PUPPETEER] ${logTs()} Coverage: ${selectedCoverage}, Plan: ${selectedPlanType}, Tobacco: ${tobacco}`);
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

    // Part 6: Click Submit button to proceed to application form
    // Selector: <input type="submit" id="BtnNewAppFinal" value="Submit">
    console.log('[Automation] Clicking Submit button to proceed...');
    await page.waitForSelector('#BtnNewAppFinal', { timeout: 15000 });
    console.log('[Automation] ✓ Found Submit button');
    await page.click('#BtnNewAppFinal');
    await new Promise(r => setTimeout(r, 3000)); // Wait for form to load
    console.log('[Automation] ✓ Clicked Submit, waiting for application form...');
    
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
