import XLSX from 'xlsx';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const workbook = XLSX.readFile(join(__dirname, 'rating.xlsx'));

function formatRates(sheet, sheetName) {
  const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  
  let startRow = 0;
  for(let i=0; i<json.length; i++) {
     if (json[i][0] == 'Age' || typeof json[i][0] === 'number') {
        startRow = i;
        if (json[i][0] == 'Age') startRow++; 
        break;
     }
  }

  // Output as JS Object string
  console.log(`const ${sheetName.replace(/-/g, '_').toUpperCase()}_RATES = {`);
  for(let i = startRow; i < json.length; i++) {
     const row = json[i];
     if (!row || row.length < 5) continue; 
     const age = row[0];
     // Age, MNS, MSm, FNS, FSm
     console.log(`  ${age}: { maleNS: ${row[1]}, maleSm: ${row[2]}, femaleNS: ${row[3]}, femaleSm: ${row[4]} },`);
  }
  console.log('};');
}

const ahlSheets = ['AHL', 'AHL-Graded'];

ahlSheets.forEach(name => {
  console.log(`\n// GENERATED DATA FOR ${name}`);
  formatRates(workbook.Sheets[name], name);
});
