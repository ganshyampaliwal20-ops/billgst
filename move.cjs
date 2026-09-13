const fs = require('fs');
let code = fs.readFileSync('f:/bill/app/dashboard/kharcha-tracker/KharchaTrackerAdvanced.tsx', 'utf8');

const listStart = code.indexOf('<Card title="Is mahine ke kharche">');
if (listStart !== -1) {
  let listEnd = code.indexOf('</Card>', listStart) + 7;
  const listCode = code.substring(listStart, listEnd);
  
  code = code.replace(listCode, '');
  
  const targetStart = code.indexOf("<Card title={t('addExpenseTitle')}>");
  const targetEnd = code.indexOf('</Card>', targetStart) + 7;
  const targetCode = code.substring(targetStart, targetEnd);

  code = code.replace(targetCode, targetCode + '\n\n      ' + listCode);
  
  // also change the static title to translated string for consistency
  code = code.replace(/<Card title="Is mahine ke kharche">/g, "<Card title={t('expenseListTitle')}>");
  
  fs.writeFileSync('f:/bill/app/dashboard/kharcha-tracker/KharchaTrackerAdvanced.tsx', code);
}
