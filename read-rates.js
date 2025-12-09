// Temporary script to read the rating.xlsx file and extract rate data
import XLSX from 'xlsx';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const workbook = XLSX.readFile(join(__dirname, 'rating.xlsx'));

console.log('=== Sheet Names ===');
console.log(workbook.SheetNames);

console.log('\n=== Key Sheet ===');
const keySheet = workbook.Sheets['Key'];
if (keySheet) {
  console.log('B1:', keySheet['B1']?.v);
  console.log('C1:', keySheet['C1']?.v);
  console.log('D1:', keySheet['D1']?.v);
  console.log('E1:', keySheet['E1']?.v);
  console.log('B2:', keySheet['B2']?.v);
  console.log('C2:', keySheet['C2']?.v);
  console.log('D2:', keySheet['D2']?.v);
  console.log('E2:', keySheet['E2']?.v);
  console.log('B3:', keySheet['B3']?.v);
  console.log('C3:', keySheet['C3']?.v);
  console.log('D3:', keySheet['D3']?.v);
  console.log('E3:', keySheet['E3']?.v);
  console.log('\nFull Key data:');
  console.log(XLSX.utils.sheet_to_json(keySheet, { header: 1 }));
}

function printSheet(name) {
  const sheet = workbook.Sheets[name];
  if (sheet) {
    console.log(`\n=== ${name} Sheet ===`);
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    // Print all rows for TransAmerica, otherwise 20
    const maxRows = name === 'TransAmerica' ? data.length : 20;
    console.log(`First ${maxRows} rows:`);
    for (let i = 0; i < Math.min(maxRows, data.length); i++) {
      console.log(`Row ${i + 1}:`, data[i]);
    }
    console.log(`Total rows: ${data.length}`);
  }
}

printSheet('aflac');
printSheet('SBLI');
printSheet('CICA');
printSheet('gtl');
printSheet('TransAmerica');
printSheet('Transamerica');
