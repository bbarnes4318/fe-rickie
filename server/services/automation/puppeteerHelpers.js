import fs from 'fs';
import path from 'path';

/**
 * Wait for a selector and click it
 * @param {object} page - Puppeteer page
 * @param {string} selector - CSS selector
 * @param {number} timeout - Timeout in ms (default 10000)
 */
export const waitAndClick = async (page, selector, timeout = 10000) => {
  await page.waitForSelector(selector, { timeout });
  await page.click(selector);
};

/**
 * Wait for a selector and type text into it
 * @param {object} page - Puppeteer page
 * @param {string} selector - CSS selector
 * @param {string} text - Text to type
 * @param {number} delay - Delay between keystrokes in ms (default 10)
 */
export const safeType = async (page, selector, text, delay = 10) => {
  await page.waitForSelector(selector, { timeout: 10000 });
  await page.type(selector, String(text), { delay });
};

/**
 * Click a text box 3 times to select all text, clear it, and type new text
 * @param {object} page - Puppeteer page
 * @param {string} selector - CSS selector
 * @param {string} text - Text to type
 * @param {number} delay - Delay between keystrokes in ms (default 10)
 */
export const clearAndType = async (page, selector, text, delay = 10) => {
  await page.waitForSelector(selector, { timeout: 10000 });
  await page.click(selector, { clickCount: 3 });
  await page.keyboard.press('Backspace');
  await page.type(selector, String(text), { delay });
};

/**
 * Select option in dropdown by value or text
 * @param {object} page - Puppeteer page
 * @param {string} selector - CSS selector
 * @param {string} valueOrText - Value or label of option
 */
export const selectByValueOrText = async (page, selector, valueOrText) => {
  await page.waitForSelector(selector, { timeout: 10000 });
  
  // Try standard page.select by value
  try {
    const val = String(valueOrText);
    await page.select(selector, val);
    return;
  } catch (e) {
    // If that fails, try using page.evaluate to find the option matching the text
  }

  const found = await page.evaluate((sel, matchText) => {
    const select = document.querySelector(sel);
    if (!select) return false;
    const cleanMatch = String(matchText).trim().toLowerCase();
    
    for (const opt of select.options) {
      if (opt.value.trim().toLowerCase() === cleanMatch || 
          opt.text.trim().toLowerCase() === cleanMatch || 
          opt.text.toLowerCase().includes(cleanMatch)) {
        opt.selected = true;
        select.value = opt.value;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      }
    }
    return false;
  }, selector, valueOrText);

  if (!found) {
    throw new Error(`Could not find option matching "${valueOrText}" in dropdown "${selector}"`);
  }
};

/**
 * Select a radio button and dispatch correct change/input events
 * @param {object} page - Puppeteer page
 * @param {string} selector - CSS selector
 */
export const clickRadioWithEvents = async (page, selector) => {
  await page.waitForSelector(selector, { timeout: 10000 });
  await page.evaluate((sel) => {
    const radio = document.querySelector(sel);
    if (radio) {
      radio.checked = true;
      radio.click();
      radio.dispatchEvent(new Event('change', { bubbles: true }));
      radio.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }, selector);
};

/**
 * Wait for navigation or timeout gracefully
 * @param {object} page - Puppeteer page
 * @param {number} timeout - Timeout in ms (default 30000)
 */
export const waitForNavigationOrTimeout = async (page, timeout = 30000) => {
  await page.waitForNavigation({ waitUntil: 'networkidle0', timeout }).catch(() => {
    // Ignore timeout gracefully
  });
};

/**
 * Capture screenshot and save it to screenshots/ folder
 * @param {object} page - Puppeteer page
 * @param {string} name - Screenshot label
 * @returns {string|null} Path to saved screenshot or null if failed
 */
export const captureDebugSnapshot = async (page, name) => {
  try {
    const sanitizedName = String(name).replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `${sanitizedName}_${Date.now()}.png`;
    const screenshotsDir = path.join(process.cwd(), 'screenshots');
    
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }
    
    const screenshotPath = path.join(screenshotsDir, filename);
    await page.screenshot({ path: screenshotPath });
    console.log(`[PuppeteerHelpers] Debug snapshot captured: ${screenshotPath}`);
    return screenshotPath;
  } catch (e) {
    console.error(`[PuppeteerHelpers] Failed to capture debug snapshot:`, e.message);
    return null;
  }
};
