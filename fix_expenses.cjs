const fs = require('fs');
let c = fs.readFileSync('f:/bill/app/dashboard/kharcha-tracker/KharchaTrackerAdvanced.tsx', 'utf8');

if (!c.includes('const filteredExpenses = useMemo')) {
  c = c.replace(
    'const [expenses, setExpenses] = useState<any[]>(initialData.expenses ?? []);',
    'const [expenses, setExpenses] = useState<any[]>(initialData.expenses ?? []);\n  const filteredExpenses = useMemo(() => expenses.filter((e: any) => e.date >= startDate && e.date <= endDate), [expenses, startDate, endDate]);'
  );
}

// ALSO, remove filteredIncomes so old incomes don't disappear on date change!
c = c.replace(/const filteredIncomes = useMemo\(\(\) => \{[\s\S]*?return incomes\.filter\(i => i\.date >= startDate && i\.date <= endDate\);\n  \}, \[incomes, startDate, endDate\]\);\n  const income = filteredIncomes\.reduce\(\(s, i\) => s \+ Number\(i\.amount \|\| 0\), 0\);/g, 'const income = incomes.reduce((s, i) => s + Number(i.amount || 0), 0);');

fs.writeFileSync('f:/bill/app/dashboard/kharcha-tracker/KharchaTrackerAdvanced.tsx', c);
