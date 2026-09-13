const fs = require('fs');
let code = fs.readFileSync('f:/bill/app/dashboard/kharcha-tracker/KharchaTrackerAdvanced.tsx', 'utf8');

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
  'import { useStore } from "@/lib/store";',
  'import { useStore } from "@/lib/store";\n' + transMap
);
if (!code.includes(transMap)) {
  code = code.replace(
    'import * as XLSX from "xlsx";',
    'import * as XLSX from "xlsx";\nimport { useStore } from "@/lib/store";\n' + transMap
  );
}

// Add hook inside component
code = code.replace(
  'const thisMonth = monthKey();',
  `const language = useStore((state: any) => state.settings?.language) || "hi";
  const t = (key: string) => localT(language, key);
  const thisMonth = monthKey();`
);

// Replace static strings with t()
code = code.replace(/"Income \/ Salary"/g, "{t('incomeLabel')}");
code = code.replace(/>Add Income<\/button>/g, ">{t('addIncome')}</button>");
code = code.replace(/"Income Source \(e\.g\. Salary, Rent\)"/g, "{t('sourcePlaceholder')}");
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
code = code.replace(/>Remove<\/button>/g, ">{t('remove')}</button>");
code = code.replace(/>Delete<\/button>/g, ">{t('delete')}</button>");

fs.writeFileSync('f:/bill/app/dashboard/kharcha-tracker/KharchaTrackerAdvanced.tsx', code);
