const translate = require('translate-google');
const fs = require('fs');
const langs = ["en", "hi", "gu", "mr", "ta", "te", "bn", "kn", "ml", "pa"];

const base = {
  startDate: "Start Date", endDate: "End Date", resetMonth: "Reset to This Month",
  incomeSalary: "Income / Salary", addIncome: "Add Income", incomeLabel: "Income", kharchaLabel: "Kharcha", bachatLabel: "Bachat",
  spentPct: "spent", savedPct: "saved",
  addExpenseTitle: "Add New Expense", categoryPlaceholder: "Type or select category", amountPlaceholder: "Amount", addExpenseBtn: "+ Add Expense",
  fixedExpenseTitle: "Fixed Monthly Expenses", fixedExpenseSub: "Set fixed expenses like shop rent, electricity bill once, they will be added automatically every month",
  namePlaceholder: "Name (e.g., Shop Rent)", addFixedBtn: "+ Add Fixed Expense", addAllFixed: "Add all fixed expenses to this month",
  donutTitle: "Where is the money going",
  aiTitle: "AI Suggestions", aiSub: "Where you are spending more, where to cut down",
  aiHighSpend: "Highest spendings here", aiCutDown: "Where to cut down and save",
  goalTitle: "Savings goal", goalSub: "Set your target here", goalPlaceholder: "How much to save this month", setGoal: "Set Goal",
  savedSoFar: "Saved so far:", goalIs: "Goal:", goalHit: "Congratulations! Goal achieved",
  monthlyComp: "Monthly comparison", savingStreak: "Saving Streak (months)", diffLastMonth: "Difference from Last Month", lastMonthExpense: "Last month's expense",
  chartTitle: "Expense chart", chartSub: "Touch/Hover bars to see the exact amount",
  budgetTitle: "Budget alert", budgetSub: "Set budget for category, get warned at 80%", setBudget: "Set Budget",
  yearlyProjTitle: "Yearly projection (Total Savings this year)", yearlyProjSub: "At this rate, you can save this much in a year",
  achievementsTitle: "Achievements", achievementsSub: "Set your Goal amount (above) to unlock!",
  heatmapTitle: "Day-wise expense — Click to filter", low: "Low", high: "High",
  expenseListTitle: "Expenses for selected dates", noExpenses: "No expenses found for selected dates",
  reportTitle: "Download Report", reportSub: "Detailed expense report in PDF or Excel",
  excelBtn: "Excel Download", pdfBtn: "Download PDF Report", whatsappBtn: "Share on WhatsApp",
  remove: "Remove", delete: "Delete", incomeListTitle: "Added Incomes", addAllIncome: "Add all fixed incomes"
};

async function run() {
  const S_T = {};
  for (const lang of langs) {
    S_T[lang] = {};
    if (lang === 'en') {
      S_T[lang] = base;
      continue;
    }
    for (const key in base) {
      try {
        const res = await translate(base[key], {to: lang});
        S_T[lang][key] = res;
      } catch (e) {
        S_T[lang][key] = base[key];
      }
    }
    console.log(`Translated ${lang}`);
  }
  fs.writeFileSync('kharcha_translations.json', JSON.stringify(S_T, null, 2));
  console.log("Done");
}
run();
