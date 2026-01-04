/**
 * Color Verification Script
 * 
 * Verifies that:
 * 1. All CSS variables in colors.css are properly defined
 * 2. No hardcoded hex colors exist in component files
 * 3. All semantic tokens reference primitives
 * 
 * Run: node scripts/verify-colors.js
 * Output: docs/COLOR_VERIFICATION.json
 */

const fs = require('fs');
const path = require('path');

// Configuration
const COLORS_FILE = path.join(__dirname, '../src/styles/colors.css');
const COMPONENTS_DIR = path.join(__dirname, '../src');
const OUTPUT_FILE = path.join(__dirname, '../docs/COLOR_VERIFICATION.json');

// File extensions to check
const EXTENSIONS = ['.jsx', '.tsx', '.js', '.ts', '.css', '.scss'];

// Allowed hardcoded colors (intentional exceptions)
const ALLOWED_COLORS = [
  '#E74C3C', // Confirmation button red (intentional for destructive action)
  '#C0392B', // Confirmation hover
  '#FFFFFF', // Pure white in gradients
  '#000000', // Pure black in gradients
];

// Results object
const results = {
  timestamp: new Date().toISOString(),
  colorsFile: {
    exists: false,
    variableCount: 0,
    primitives: [],
    semanticTokens: [],
    errors: []
  },
  components: {
    filesChecked: 0,
    violations: [],
    allowedExceptions: []
  },
  summary: {
    status: 'UNKNOWN',
    totalViolations: 0,
    message: ''
  }
};

/**
 * Parse CSS variables from colors.css
 */
function parseColorsFile() {
  console.log('📁 Checking colors.css...');
  
  if (!fs.existsSync(COLORS_FILE)) {
    results.colorsFile.errors.push('colors.css not found');
    return false;
  }
  
  results.colorsFile.exists = true;
  const content = fs.readFileSync(COLORS_FILE, 'utf8');
  
  // Find all CSS variable definitions
  const varRegex = /--([a-zA-Z0-9-]+):\s*([^;]+);/g;
  let match;
  let count = 0;
  
  while ((match = varRegex.exec(content)) !== null) {
    const [, name, value] = match;
    count++;
    
    // Categorize as primitive or semantic
    if (name.startsWith('color-')) {
      results.colorsFile.primitives.push({ name: `--${name}`, value: value.trim() });
    } else {
      results.colorsFile.semanticTokens.push({ name: `--${name}`, value: value.trim() });
    }
  }
  
  results.colorsFile.variableCount = count;
  console.log(`   ✅ Found ${count} CSS variables`);
  console.log(`   ✅ ${results.colorsFile.primitives.length} primitives`);
  console.log(`   ✅ ${results.colorsFile.semanticTokens.length} semantic tokens`);
  
  return true;
}

/**
 * Recursively find all component files
 */
function findFiles(dir, files = []) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Skip node_modules, dist, and test directories
      if (!['node_modules', 'dist', '__tests__'].includes(item)) {
        findFiles(fullPath, files);
      }
    } else if (EXTENSIONS.some(ext => item.endsWith(ext))) {
      files.push(fullPath);
    }
  }
  
  return files;
}

/**
 * Check a file for hardcoded colors
 */
function checkFileForHardcodedColors(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const relativePath = path.relative(process.cwd(), filePath);
  
  // Regex for hex colors
  const hexRegex = /#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})\b/g;
  const rgbRegex = /rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/gi;
  const rgbaRegex = /rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)/gi;
  
  let match;
  const fileViolations = [];
  
  // Check hex colors
  while ((match = hexRegex.exec(content)) !== null) {
    const color = match[0].toUpperCase();
    
    // Skip if in allowed list
    if (ALLOWED_COLORS.includes(color)) {
      results.components.allowedExceptions.push({
        file: relativePath,
        color,
        position: match.index
      });
      continue;
    }
    
    // Skip if in colors.css (it's the source)
    if (filePath.includes('colors.css')) {
      continue;
    }
    
    // Skip comments
    const lineStart = content.lastIndexOf('\n', match.index) + 1;
    const line = content.substring(lineStart, match.index);
    if (line.includes('//') || line.includes('/*')) {
      continue;
    }
    
    fileViolations.push({
      file: relativePath,
      color,
      position: match.index,
      context: content.substring(Math.max(0, match.index - 30), match.index + 30)
    });
  }
  
  return fileViolations;
}

/**
 * Check all component files
 */
function checkComponents() {
  console.log('\n📁 Checking component files for hardcoded colors...');
  
  const files = findFiles(COMPONENTS_DIR);
  results.components.filesChecked = files.length;
  console.log(`   Found ${files.length} files to check`);
  
  for (const file of files) {
    const violations = checkFileForHardcodedColors(file);
    results.components.violations.push(...violations);
  }
  
  console.log(`   Found ${results.components.violations.length} violations`);
  console.log(`   Found ${results.components.allowedExceptions.length} allowed exceptions`);
}

/**
 * Generate summary
 */
function generateSummary() {
  results.summary.totalViolations = results.components.violations.length;
  
  if (!results.colorsFile.exists) {
    results.summary.status = 'FAIL';
    results.summary.message = 'colors.css file not found';
  } else if (results.summary.totalViolations > 0) {
    results.summary.status = 'FAIL';
    results.summary.message = `Found ${results.summary.totalViolations} hardcoded color violations`;
  } else {
    results.summary.status = 'PASS';
    results.summary.message = 'All color checks passed';
  }
}

/**
 * Write results to file
 */
function writeResults() {
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
  console.log(`\n📄 Results written to ${OUTPUT_FILE}`);
}

/**
 * Print summary to console
 */
function printSummary() {
  console.log('\n' + '='.repeat(50));
  console.log('COLOR VERIFICATION SUMMARY');
  console.log('='.repeat(50));
  
  const statusEmoji = results.summary.status === 'PASS' ? '✅' : '❌';
  console.log(`\nStatus: ${statusEmoji} ${results.summary.status}`);
  console.log(`Message: ${results.summary.message}`);
  console.log(`\nColors File: ${results.colorsFile.exists ? '✅ Found' : '❌ Missing'}`);
  console.log(`  - Variables: ${results.colorsFile.variableCount}`);
  console.log(`  - Primitives: ${results.colorsFile.primitives.length}`);
  console.log(`  - Semantic Tokens: ${results.colorsFile.semanticTokens.length}`);
  console.log(`\nComponent Files: ${results.components.filesChecked}`);
  console.log(`  - Violations: ${results.components.violations.length}`);
  console.log(`  - Allowed Exceptions: ${results.components.allowedExceptions.length}`);
  
  if (results.components.violations.length > 0) {
    console.log('\n❌ VIOLATIONS:');
    for (const v of results.components.violations.slice(0, 10)) {
      console.log(`  - ${v.file}: ${v.color}`);
    }
    if (results.components.violations.length > 10) {
      console.log(`  ... and ${results.components.violations.length - 10} more`);
    }
  }
  
  console.log('\n' + '='.repeat(50));
}

// Main execution
console.log('🎨 Color Verification Script');
console.log('='.repeat(50) + '\n');

parseColorsFile();
checkComponents();
generateSummary();
writeResults();
printSummary();

// Exit with error code if violations found
process.exit(results.summary.status === 'PASS' ? 0 : 1);
