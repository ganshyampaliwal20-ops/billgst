const fs = require('fs');
let code = fs.readFileSync('f:/bill/app/dashboard/kharcha-tracker/KharchaTrackerAdvanced.tsx', 'utf8');

const tIndex = code.indexOf('function localT');
const prefix = code.substring(0, tIndex);
const suffix = code.substring(tIndex);

// Replace ALL {t('key')} in prefix with "key" (to fix the broken dictionary)
// Actually wait, I don't want "key", I want the ORIGINAL VALUE!
// The English dict got English keys, but the Hindi dict got Hindi keys!
// It's easier to just REPLACE the whole LOCAL_TRANS block!

const newDict = `const LOCAL_TRANS: any = {
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
};`;

code = code.replace(/const LOCAL_TRANS: any = \{[\s\S]*?\n\};\n/, newDict + '\n');
fs.writeFileSync('f:/bill/app/dashboard/kharcha-tracker/KharchaTrackerAdvanced.tsx', code);
