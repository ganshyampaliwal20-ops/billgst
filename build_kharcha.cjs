const fs = require('fs');
let code = fs.readFileSync('f:/bill/phase1_final.tsx', 'utf8');

// 1. Add translations map
const transMap = `
const LOCAL_TRANS: any = {
  en: {
    incomeLabel: "Income / Salary",
    addIncome: "Add Income",
    sourcePlaceholder: "Income Source (e.g. Salary)",
    addExpenseTitle: "Add New Expense",
    categoryPlaceholder: "Category",
    amountPlaceholder: "₹ Amount",
    addExpenseBtn: "Add Expense",
    fixedExpenseTitle: "Fixed Monthly Expenses",
    addFixedBtn: "+ Add Fixed Expense",
    donutTitle: "Where is the money going?",
    aiTitle: "✨ AI Suggestions",
    goalTitle: "Savings Goal",
    monthlyComp: "Monthly Comparison",
    chartTitle: "📊 Expense Chart",
    budgetTitle: "🔔 Budget Alert",
    yearlyProjTitle: "Yearly Projection",
    achievementsTitle: "Achievements",
    heatmapTitle: "📅 Day-wise Expense",
    expenseListTitle: "Expenses for selected dates",
    reportTitle: "📄 Download Report",
    remove: "Remove",
    delete: "Delete"
  },
  hi: {
    incomeLabel: "Income / Salary",
    addIncome: "Add",
    sourcePlaceholder: "Income Source",
    addExpenseTitle: "Naya kharcha jode",
    categoryPlaceholder: "Category",
    amountPlaceholder: "₹ Amount",
    addExpenseBtn: "Add",
    fixedExpenseTitle: "Fixed mahine ke kharche",
    addFixedBtn: "+ Add Fixed Kharcha",
    donutTitle: "Paisa kahan ja raha hai",
    aiTitle: "✨ AI Suggestions",
    goalTitle: "Savings goal",
    monthlyComp: "Monthly comparison",
    chartTitle: "📊 Kharcha chart",
    budgetTitle: "🔔 Budget alert",
    yearlyProjTitle: "Yearly projection (Is saal ki total bachat)",
    achievementsTitle: "Achievements",
    heatmapTitle: "📅 Din ke hisaab se kharcha",
    expenseListTitle: "Chuni gayi tareekhon ke kharche",
    reportTitle: "📄 Report download karein",
    remove: "Remove",
    delete: "Delete"
  }
};
function localT(lang: string, key: string) {
  if (LOCAL_TRANS[lang] && LOCAL_TRANS[lang][key]) return LOCAL_TRANS[lang][key];
  if (LOCAL_TRANS['hi'] && LOCAL_TRANS['hi'][key]) return LOCAL_TRANS['hi'][key];
  return key;
}
`;

// Inject useStore and localT
code = code.replace(
  'import * as XLSX from "xlsx";',
  'import * as XLSX from "xlsx";\nimport { useStore } from "@/lib/store";\n' + transMap
);

// Add language hook
code = code.replace(
  'const thisMonth = monthKey();',
  `const language = useStore((state: any) => state.settings?.language) || "hi";
  const t = (key: string) => localT(language, key);
  const thisMonth = monthKey();`
);

// 2. Replace income state with incomes array
code = code.replace(
  'const [income, setIncome] = useState(initialData.income ?? 0);',
  `const todayDate = new Date();
  const [incomes, setIncomes] = useState<any[]>(
    initialData.incomes ?? (initialData.income && initialData.income > 0 ? [{ id: uid(), source: "Initial Balance", amount: initialData.income, date: todayDate.toISOString().slice(0, 10) }] : [])
  );
  const [incomeSource, setIncomeSource] = useState("");
  const [incomeDate, setIncomeDate] = useState(new Date().toISOString().slice(0, 10));
  const income = incomes.reduce((s, i) => s + Number(i.amount || 0), 0);`
);

// 3. Update handleAddIncome
code = code.replace(
  /const handleAddIncome = \(\) => {[\s\S]*?setIncomeInput\(""\);\n  };/,
  `const handleAddIncome = () => {
    const val = Number(incomeInput);
    if (!val || val <= 0) return;
    setIncomes((prev: any[]) => [...prev, { id: uid(), source: incomeSource.trim() || t('incomeLabel'), amount: val, date: incomeDate }]);
    setIncomeInput("");
    setIncomeSource("");
  };
  const handleRemoveIncome = (id: string) => {
    setIncomes((prev: any[]) => prev.filter(i => i.id !== id));
  };`
);

// 4. Update onChange to pass incomes
code = code.replace(
  /onChange\(\{ income, expenses,/g,
  'onChange({ income, incomes, expenses,'
);
code = code.replace(
  /\[income, expenses,/g,
  '[income, incomes, expenses,'
);

// 5. Update Income UI
code = code.replace(
  /<Card title="Income \/ Salary">[\s\S]*?<button onClick={handleAddIncome} style={S\.goldBtn}>Add<\/button>\n        <\/div>/,
  `<Card title={t('incomeLabel')}>
        <div style={S.col}>
          <input value={incomeSource} onChange={(e) => setIncomeSource(e.target.value)} placeholder={t('sourcePlaceholder')} style={S.input} />
          <input type="number" value={incomeInput} onChange={(e) => setIncomeInput(e.target.value)} placeholder={t('amountPlaceholder')} style={S.input} />
          <input type="date" value={incomeDate} onChange={(e) => setIncomeDate(e.target.value)} style={S.input} />
          <button onClick={handleAddIncome} style={S.goldBtn}>{t('addIncome')}</button>
        </div>

        {incomes.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
            {incomes.map((inc) => (
              <div key={inc.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: T.fieldBg, borderRadius: 12, padding: "10px 16px", fontSize: 14 }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 500 }}>{inc.source}</p>
                  <p style={{ margin: 0, fontSize: 12, color: T.textFaint }}>{inc.date}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span>{formatINR(inc.amount)}</span>
                  <button onClick={() => handleRemoveIncome(inc.id)} style={S.smallDelete}>{t('remove')}</button>
                </div>
              </div>
            ))}
          </div>
        )}`
);

// 6. Move Expense List
const expenseListRegex = /<Card title="Chuni gayi tareekhon ke kharche">[\s\S]*?<\/Card>/;
const expenseListMatch = code.match(expenseListRegex);
if (expenseListMatch) {
  const expenseListCode = expenseListMatch[0];
  code = code.replace(expenseListCode, ''); 
  
  const addExpenseRegex = /<Card title="Naya kharcha jode">[\s\S]*?<\/Card>/;
  code = code.replace(addExpenseRegex, match => match + '\n\n      ' + expenseListCode);
}

// 7. Apply string replacements for translated keys
// (Carefully checking that we don't double replace)
code = code.replace(/"Naya kharcha jode"/g, "{t('addExpenseTitle')}");
code = code.replace(/"Fixed mahine ke kharche"/g, "{t('fixedExpenseTitle')}");
code = code.replace(/"Paisa kahan ja raha hai"/g, "{t('donutTitle')}");
code = code.replace(/"Savings goal"/g, "{t('goalTitle')}");
code = code.replace(/"Monthly comparison"/g, "{t('monthlyComp')}");
code = code.replace(/"📊 Kharcha chart"/g, "{t('chartTitle')}");
code = code.replace(/"🔔 Budget alert"/g, "{t('budgetTitle')}");
code = code.replace(/"Yearly projection \(Is saal ki total bachat\)"/g, "{t('yearlyProjTitle')}");
code = code.replace(/"Achievements"/g, "{t('achievementsTitle')}");
code = code.replace(/"📄 Report download karein"/g, "{t('reportTitle')}");
code = code.replace(/"Chuni gayi tareekhon ke kharche"/g, "{t('expenseListTitle')}");

// Special replacements
code = code.replace(/>\+ Add Fixed Kharcha<\/button>/g, ">{t('addFixedBtn')}</button>");
code = code.replace(/>Delete<\/button>/g, ">{t('delete')}</button>");

fs.writeFileSync('f:/bill/app/dashboard/kharcha-tracker/KharchaTrackerAdvanced.tsx', code);
