import React, { useState, useMemo, useEffect, useCallback } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { useStore } from "@/lib/store";

const LOCAL_TRANS: any = {
  en: {
    incomeLabel: "Income / Salary",
    addIncome: "Add Income",
    sourcePlaceholder: "Note / Source (e.g. Salary, Rent)",
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
    sourcePlaceholder: "Note / Kaha se aaya?",
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


/**
 * KharchaTrackerAdvanced
 * -----------------------
 * Full "advanced" Billgst Kharcha Tracker: fixed monthly expenses, donut
 * breakdown, AI-style spending suggestions, savings goal with streak,
 * month-over-month comparison + bar chart, WhatsApp share, per-category
 * budget alerts, yearly projection, achievement badges, a day-wise
 * expense heatmap, and PDF/Excel export.
 *
 * IMPORTANT: This version uses 100% inline styles (no Tailwind classes).
 * If your app's Tailwind build doesn't scan this file, the earlier
 * version rendered unstyled (white background, invisible text). Inline
 * styles always work regardless of your CSS setup, so this is the safe
 * drop-in version.
 *
 * INTEGRATION
 * - npm install xlsx
 * - No localStorage is used. Pass `initialData` to hydrate from your
 *   backend and `onChange` to receive the full state on every update so
 *   you can persist it via your own API.
 */

const PALETTE = ["#f97316", "#ec4899", "#22d3ee", "#4ade80", "#a78bfa", "#eab308", "#f43f5e", "#38bdf8", "#fb923c", "#2dd4bf"];
const IDEAL_PCT_OF_INCOME: Record<string, number> = { default: 15, sip: 15, loan: 20, "home expense": 20, rent: 25, "electricity & water": 8 };

function colorFor(category: string, known: string[]) {
  const idx = known.indexOf(category);
  return PALETTE[idx % PALETTE.length];
}
function formatINR(n: number | string) {
  return "₹" + Math.round(Number(n) || 0).toLocaleString("en-IN");
}
function monthKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
function monthLabel(key: string) {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
}
function daysInMonth(key: string) {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m, 0).getDate();
}
function idealPctFor(category: string) {
  return IDEAL_PCT_OF_INCOME[category.toLowerCase()] ?? IDEAL_PCT_OF_INCOME.default;
}
function uid() {
  return crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random());
}

// ---- design tokens (all colors live here — edit these to reskin the whole thing) ----
const T = {
  bg: "#0b1224",
  card: "#111a30",
  cardBorder: "rgba(255,255,255,0.06)",
  fieldBg: "#0f1730",
  fieldBorder: "rgba(255,255,255,0.12)",
  text: "#f5f6fa",
  textDim: "rgba(245,246,250,0.55)",
  textFaint: "rgba(245,246,250,0.35)",
  amber: "#f5b301",
  amberSoft: "rgba(245,179,1,0.15)",
  emerald: "#34d399",
  emeraldSoft: "rgba(52,211,153,0.15)",
  rose: "#fb7185",
  roseSoft: "rgba(251,113,133,0.15)",
  gradFrom: "#6366f1",
  gradTo: "#a855f7",
};

// ---- reusable inline style objects ----
const S: Record<string, React.CSSProperties> = {
  page: { background: T.bg, color: T.text, padding: 16, display: "flex", flexDirection: "column", gap: 20, borderRadius: 16, fontFamily: "inherit", boxSizing: "border-box" },
  card: { background: T.card, border: `1px solid ${T.cardBorder}`, borderRadius: 18, padding: 20 },
  cardTitle: { fontSize: 14, fontWeight: 600, margin: 0, color: T.text },
  cardSubtitle: { fontSize: 12, color: T.textDim, margin: "4px 0 16px 0", lineHeight: 1.4 },
  input: {
    width: "100%",
    boxSizing: "border-box",
    background: T.fieldBg,
    border: `1px solid ${T.fieldBorder}`,
    borderRadius: 12,
    padding: "12px 16px",
    fontSize: 14,
    color: T.text,
    outline: "none",
    colorScheme: "dark",
  },
  row: { display: "flex", gap: 12 },
  col: { display: "flex", flexDirection: "column", gap: 12 },
  goldBtn: { background: T.amber, color: "#171100", fontWeight: 700, border: "none", borderRadius: 12, padding: "0 24px", cursor: "pointer", fontSize: 14 },
  gradientBtn: {
    width: "100%",
    background: `linear-gradient(90deg, ${T.gradFrom}, ${T.gradTo})`,
    color: "#fff",
    fontWeight: 700,
    border: "none",
    borderRadius: 12,
    padding: "13px 0",
    cursor: "pointer",
    fontSize: 14,
    textAlign: "center",
  },
  outlineBtn: { width: "100%", background: "#1a2340", border: `1px solid ${T.fieldBorder}`, color: T.text, borderRadius: 12, padding: "11px 0", fontSize: 13, fontWeight: 500, cursor: "pointer" },
  smallDelete: { color: T.rose, fontSize: 12, background: "none", border: "none", cursor: "pointer", padding: 0 },
};

export default function KharchaTrackerAdvanced({ initialData = {} as any, onChange = (d: any) => {}, whatsappNumber = "" }) {
  const language = useStore((state: any) => state.settings?.language) || "hi";
  const t = (key: string) => localT(language, key);
  const thisMonth = monthKey();

  const todayDate = new Date();
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
  
  const [startDate, setStartDate] = useState(startOfMonth.toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(today.toISOString().slice(0, 10));
  const [showCustomDate, setShowCustomDate] = useState(false);
  
  const [incomes, setIncomes] = useState<any[]>(
    initialData.incomes ?? (initialData.income && initialData.income > 0 ? [{ id: uid(), source: "Initial Balance", amount: initialData.income, date: todayDate.toISOString().slice(0, 10) }] : [])
  );
  const [incomeSource, setIncomeSource] = useState("");
  const [incomeDate, setIncomeDate] = useState(new Date().toISOString().slice(0, 10));
  const income = incomes.reduce((s, i) => s + Number(i.amount || 0), 0);
  const [incomeInput, setIncomeInput] = useState("");
  const [expenses, setExpenses] = useState<any[]>(initialData.expenses ?? []);
  const filteredExpenses = useMemo(() => expenses.filter((e: any) => e.date >= startDate && e.date <= endDate), [expenses, startDate, endDate]);
  const [fixedExpenses, setFixedExpenses] = useState<any[]>(initialData.fixedExpenses ?? []);
  const [budgets, setBudgets] = useState<Record<string, number>>(initialData.budgets ?? {});
  const [savingGoal, setSavingGoal] = useState(initialData.savingGoal ?? 0);
  const [savingGoalInput, setSavingGoalInput] = useState("");
  const [monthlyHistory, setMonthlyHistory] = useState<any[]>(initialData.monthlyHistory ?? []);
  const [selectedHeatmapDate, setSelectedHeatmapDate] = useState<string | null>(null);
  const [lastMonthExpense, setLastMonthExpense] = useState(initialData.lastMonthExpense ?? 0);

  const [newCategory, setNewCategory] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newDate, setNewDate] = useState(new Date().toISOString().slice(0, 10));
  const [fixedName, setFixedName] = useState("");
  const [fixedAmount, setFixedAmount] = useState("");
  const [budgetCategory, setBudgetCategory] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [budgetWarning, setBudgetWarning] = useState<any>(null);

  const totalSpent = useMemo(() => expenses.reduce((s, e) => s + Number(e.amount || 0), 0), [expenses]);
  const saved = Math.max(income - totalSpent, 0);
  const spentPct = income > 0 ? Math.min(Math.round((totalSpent / income) * 100), 100) : 0;

  const categories = useMemo(() => {
    const set = new Set([...Object.keys(budgets), ...filteredExpenses.map((e) => e.category)]);
    return Array.from(set);
  }, [budgets, expenses]);

  const categoryTotals = useMemo(() => {
    const map: Record<string, number> = {};
    filteredExpenses.forEach((e) => (map[e.category] = (map[e.category] || 0) + Number(e.amount || 0)));
    return map;
  }, [expenses]);

  const sortedCategories = useMemo(() => Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]), [categoryTotals]);

  const savingGoalPct = savingGoal > 0 ? Math.min(Math.round((saved / savingGoal) * 100), 100) : 0;
  const diffFromLastMonth = lastMonthExpense > 0 ? lastMonthExpense - totalSpent : null;

  const savingStreak = useMemo(() => {
    const months = [...monthlyHistory, { month: thisMonth, saved }];
    let streak = 0;
    for (let i = months.length - 1; i >= 0; i--) {
      if (months[i].saved > 0) streak++;
      else break;
    }
    return streak;
  }, [monthlyHistory, thisMonth, saved]);

  const yearlyProjection = saved * 12;

  const dayWise = useMemo(() => {
    const totalDays = daysInMonth(thisMonth);
    const map = Array.from({ length: totalDays }, (_, i) => ({ day: i + 1, total: 0 }));
    filteredExpenses.forEach((e) => {
      if (e.date && e.date.slice(0, 7) === thisMonth) {
        const day = Number(e.date.slice(8, 10));
        if (map[day - 1]) map[day - 1].total += Number(e.amount || 0);
      }
    });
    return map;
  }, [expenses, thisMonth]);
  const maxDay = Math.max(...dayWise.map((d) => d.total), 1);

  const achievements = useMemo(
    () => [
      { key: "first", label: "Pehli Entry", icon: "🌱", unlocked: expenses.length >= 1 },
      { key: "five", label: "5 Entries", icon: "📊", unlocked: expenses.length >= 5 },
      { key: "cats", label: "3+ Category", icon: "📁", unlocked: categories.length >= 3 },
      { key: "streak", label: "Bachat Streak", icon: "🔥", unlocked: savingStreak >= 2 },
      { key: "goal", label: "Goal Hit", icon: "🎯", unlocked: savingGoal > 0 && saved >= savingGoal },
      { key: "smart", label: "Smart Saver", icon: "💎", unlocked: income > 0 && saved / income >= 0.3 },
    ],
    [expenses.length, categories.length, savingStreak, savingGoal, saved, income]
  );

  useEffect(() => {
    onChange({ income, incomes, expenses, fixedExpenses, budgets, savingGoal, monthlyHistory, lastMonthExpense });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [income, incomes, expenses, fixedExpenses, budgets, savingGoal, monthlyHistory, lastMonthExpense]);

  const handleAddIncome = () => {
    const val = Number(incomeInput);
    if (!val || val <= 0) return;
    setIncomes((prev: any[]) => [...prev, { id: uid(), source: incomeSource.trim() || t('incomeLabel'), amount: val, date: incomeDate }]);
    setIncomeInput("");
    setIncomeSource("");
  };
  const handleRemoveIncome = (id: string) => {
    setIncomes((prev: any[]) => prev.filter(i => i.id !== id));
  };

  const checkBudget = (category: string, spentInCategory: number) => {
    const limit = budgets[category];
    if (!limit) return null;
    const pct = (spentInCategory / limit) * 100;
    if (pct >= 100) return { level: "over", message: `${category} ka budget cross ho gaya! (${formatINR(spentInCategory)} / ${formatINR(limit)})` };
    if (pct >= 80) return { level: "near", message: `${category} budget ke 80% tak pahunch gaye ho.` };
    return null;
  };

  const handleAddExpense = () => {
    const amount = Number(newAmount);
    if (!newCategory.trim() || !amount || amount <= 0) return;
    const entry = { id: uid(), category: newCategory.trim(), amount, date: newDate };
    setExpenses((prev) => [...prev, entry]);
    const newTotal = (categoryTotals[entry.category] || 0) + amount;
    setBudgetWarning(checkBudget(entry.category, newTotal));
    setNewCategory("");
    setNewAmount("");
  };

  const handleDeleteExpense = (id: string) => setExpenses((prev) => prev.filter((e) => e.id !== id));

  const handleAddFixed = () => {
    const amount = Number(fixedAmount);
    if (!fixedName.trim() || !amount || amount <= 0) return;
    setFixedExpenses((prev) => [...prev, { id: uid(), name: fixedName.trim(), amount }]);
    setFixedName("");
    setFixedAmount("");
  };

  const handleApplyFixedToThisMonth = () => {
    if (fixedExpenses.length === 0) return;
    const already = new Set(expenses.filter((e) => e.date.slice(0, 7) === thisMonth).map((e) => e.category));
    const today = new Date().toISOString().slice(0, 10);
    const toAdd = fixedExpenses.filter((f) => !already.has(f.name));
    if (toAdd.length === 0) return;
    setExpenses((prev) => [...prev, ...toAdd.map((f) => ({ id: uid(), category: f.name, amount: f.amount, date: today }))]);
  };

  const handleRemoveFixed = (id: string) => setFixedExpenses((prev) => prev.filter((f) => f.id !== id));

  const handleSetGoal = () => {
    const val = Number(savingGoalInput);
    if (!val || val <= 0) return;
    setSavingGoal(val);
    setSavingGoalInput("");
  };

  const handleSetBudget = () => {
    const val = Number(budgetAmount);
    if (!budgetCategory.trim() || !val || val <= 0) return;
    setBudgets((prev) => ({ ...prev, [budgetCategory.trim()]: val }));
    setBudgetCategory("");
    setBudgetAmount("");
  };

  const handleWhatsAppShare = () => {
    const text =
      `💰 Kharcha Tracker — ${monthLabel(thisMonth)}\n` +
      `Income: ${formatINR(income)}\n` +
      `Spent: ${formatINR(totalSpent)}\n` +
      `Saved: ${formatINR(saved)}\n` +
      (savingGoal > 0 ? `Goal: ${formatINR(savingGoal)} (${savingGoalPct}% achieved)\n` : "") +
      `Sent via Billgst Kharcha Tracker`;
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`, "_blank");
  };

  const exportExcel = useCallback(() => {
    const wb = XLSX.utils.book_new();
    const summary = XLSX.utils.aoa_to_sheet([
      ["Kharcha Tracker Summary", monthLabel(thisMonth)],
      [],
      ["Income", income],
      ["Total Spent", totalSpent],
      ["Saved", saved],
      ["Saving Goal", savingGoal],
      ["Yearly Projection", yearlyProjection],
    ]);
    XLSX.utils.book_append_sheet(wb, summary, "Summary");
    const rows = [["Category", "Amount", "Date"]];
    filteredExpenses.forEach((e) => rows.push([e.category, e.amount, e.date]));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), "Expenses");
    XLSX.writeFile(wb, `kharcha-tracker-${thisMonth}.xlsx`);
  }, [income, totalSpent, saved, savingGoal, yearlyProjection, expenses, thisMonth]);

  const exportPDF = useCallback(() => {
    const rows = filteredExpenses.map((e) => `<tr><td>${e.category}</td><td>${formatINR(e.amount)}</td><td>${e.date}</td></tr>`).join("");
    const html = `<html><head><title>Kharcha Tracker</title><style>
      body{font-family:Arial,sans-serif;padding:24px;color:#111}
      .summary span{display:inline-block;margin-right:24px;font-size:14px}
      table{width:100%;border-collapse:collapse}
      th,td{border:1px solid #ccc;padding:8px;font-size:13px;text-align:left}
      th{background:#f2f2f2}</style></head><body>
      <h1>Kharcha Tracker — ${monthLabel(thisMonth)}</h1>
      <div class="summary">
        <span><b>Income:</b> ${formatINR(income)}</span>
        <span><b>Spent:</b> ${formatINR(totalSpent)}</span>
        <span><b>Saved:</b> ${formatINR(saved)}</span>
      </div>
      <table><thead><tr><th>Category</th><th>Amount</th><th>Date</th></tr></thead>
      <tbody>${rows}</tbody></table></body></html>`;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    win.print();
  }, [expenses, income, totalSpent, saved, thisMonth]);

  return (
    <div style={S.page}>
      {/* Income */}
      <Card title="This month's income / salary">
        <div style={S.row}>
          <input type="number" value={incomeInput} onChange={(e) => setIncomeInput(e.target.value)} placeholder="₹ Enter amount" style={{ ...S.input, flex: 1 }} />
          <button onClick={handleAddIncome} style={S.goldBtn}>Add</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginTop: 20, textAlign: "center" }}>
          <Stat label="Income" value={formatINR(income)} color={T.amber} />
          <Stat label="Kharcha" value={formatINR(totalSpent)} color={T.rose} />
          <Stat label="Bachat" value={formatINR(saved)} color={T.emerald} />
        </div>
        <SegmentedBar segments={sortedCategories.map(([cat, val]) => ({ value: val as number, color: colorFor(cat, categories) }))} total={income || totalSpent || 1} />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: T.textDim, marginTop: 4 }}>
          <span>{spentPct}% kharch hua</span>
          <span>{100 - spentPct}% bacha</span>
        </div>
      </Card>

      {/* Add expense */}
      <Card title={t('addExpenseTitle')}>
        <div style={S.col}>
          <input value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="Type or select category" style={S.input} />
          <input type="number" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} placeholder="₹ Amount" style={S.input} />
          <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} style={S.input} />
          <button onClick={handleAddExpense} style={S.gradientBtn}>+ Add Kharcha</button>
        </div>
      </Card>

      <Card title={t('expenseListTitle')}>
        {filteredExpenses.length === 0 ? (
          <p style={{ fontSize: 14, color: T.textDim, margin: 0 }}>Abhi koi kharcha add nahi hua.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {filteredExpenses.map((e) => (
              <div key={e.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: T.fieldBg, borderRadius: 12, padding: "10px 16px", fontSize: 14 }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 500 }}>{e.category}</p>
                  <p style={{ margin: 0, fontSize: 12, color: T.textFaint }}>{e.date}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span>{formatINR(e.amount)}</span>
                  <button onClick={() => handleDeleteExpense(e.id)} style={S.smallDelete}>{t('delete')}</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {budgetWarning && (
        <div style={{ borderRadius: 12, padding: "12px 16px", fontSize: 13, background: budgetWarning.level === "over" ? T.roseSoft : T.amberSoft, color: budgetWarning.level === "over" ? T.rose : T.amber, border: `1px solid ${budgetWarning.level === "over" ? "rgba(251,113,133,0.3)" : "rgba(245,179,1,0.3)"}` }}>
          {budgetWarning.message}
        </div>
      )}

      {/* Fixed expenses */}
      <Card title="🔁 Fixed mahine ke kharche" subtitle="Set fixed expenses like shop rent, electricity bill once, they will be added automatically every month">
        <div style={S.col}>
          <input value={fixedName} onChange={(e) => setFixedName(e.target.value)} placeholder="Name (e.g., Shop Rent)" style={S.input} />
          <input type="number" value={fixedAmount} onChange={(e) => setFixedAmount(e.target.value)} placeholder="₹ Amount" style={S.input} />
          <button onClick={handleAddFixed} style={S.gradientBtn}>+ Add Fixed Expense</button>
          {fixedExpenses.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 8 }}>
              {fixedExpenses.map((f) => (
                <div key={f.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: T.fieldBg, borderRadius: 12, padding: "10px 16px", fontSize: 14 }}>
                  <span>{f.name} — {formatINR(f.amount)}</span>
                  <button onClick={() => handleRemoveFixed(f.id)} style={S.smallDelete}>Remove</button>
                </div>
              ))}
              <button onClick={handleApplyFixedToThisMonth} style={S.outlineBtn}>Add all fixed expenses to this month</button>
            </div>
          )}
        </div>
      </Card>

      {/* Donut breakdown */}
      {sortedCategories.length > 0 && (
        <Card title="Where is the money going">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Donut segments={sortedCategories.map(([cat, val]) => ({ value: val as number, color: colorFor(cat, categories) }))} total={totalSpent} centerLabel={formatINR(totalSpent)} centerSub="Total Kharcha" />
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "8px 16px", marginTop: 20, fontSize: 13 }}>
              {sortedCategories.map(([cat, val]) => (
                <span key={cat} style={{ display: "flex", alignItems: "center", gap: 6, color: T.textDim }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: colorFor(cat, categories) }} />
                  {cat} · {Math.round(((val as number) / totalSpent) * 100)}%
                </span>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 20 }}>
            {sortedCategories.map(([cat, val]) => (
              <div key={cat}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                  <span>{cat}</span>
                  <span>{formatINR(val as number)} <span style={{ color: T.textFaint }}>{Math.round(((val as number) / totalSpent) * 100)}%</span></span>
                </div>
                <ProgressBar pct={Math.round(((val as number) / totalSpent) * 100)} color={colorFor(cat, categories)} />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* AI Suggestions */}
      {sortedCategories.length > 0 && income > 0 && (
        <Card title="✨ AI Suggestions" subtitle="Where you are spending more, where to cut down">
          <p style={{ fontSize: 11, letterSpacing: 0.5, textTransform: "uppercase", color: T.textFaint, marginBottom: 12 }}>📈 Sabse zyada kharcha yahan</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {sortedCategories.slice(0, 3).map(([cat, val], idx) => {
              const pctOfIncome = Math.round(((val as number) / income) * 100);
              return (
                <div key={cat} style={{ display: "flex", alignItems: "flex-start", gap: 12, background: T.fieldBg, borderRadius: 12, padding: "12px 16px" }}>
                  <span style={{ width: 24, height: 24, minWidth: 24, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", background: T.amber, color: "#171100", fontSize: 12, fontWeight: 700 }}>{idx + 1}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>{cat}</p>
                    <p style={{ margin: "2px 0 0 0", fontSize: 12, color: T.textDim }}>Total kharche ka {Math.round(((val as number) / totalSpent) * 100)}% · Income ka {pctOfIncome}%</p>
                  </div>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{formatINR(val as number)}</span>
                </div>
              );
            })}
          </div>
          <p style={{ fontSize: 11, letterSpacing: 0.5, textTransform: "uppercase", color: T.textFaint, margin: "20px 0 12px 0" }}>📉 Yahan kam karke bacha sakte hain</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {sortedCategories.slice(0, 3).map(([cat, val]) => {
              const idealPct = idealPctFor(cat);
              const currentPct = Math.round(((val as number) / income) * 100);
              const canSave = Math.max(((currentPct - idealPct) / 100) * income, 0);
              return (
                <div key={cat} style={{ background: T.fieldBg, borderRadius: 12, padding: "12px 16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 14, fontWeight: 500 }}>{cat}</span>
                    {canSave > 0 && <span style={{ fontSize: 11, background: T.emeraldSoft, color: T.emerald, padding: "4px 10px", borderRadius: 999 }}>~{formatINR(canSave)} bach sakte hain</span>}
                  </div>
                  <p style={{ margin: "6px 0 0 0", fontSize: 12, color: T.textDim, lineHeight: 1.5 }}>
                    Abhi income ka <b>{currentPct}%</b> ja raha hai, ideal range ~{idealPct}% tak hai. Is category ka kharcha track karte rahein.
                  </p>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Saving goal */}
      <Card title={t('goalTitle')}>
        <div style={S.row}>
          <input type="number" value={savingGoalInput} onChange={(e) => setSavingGoalInput(e.target.value)} placeholder="How much to save this month" style={{ ...S.input, flex: 1 }} />
          <button onClick={handleSetGoal} style={S.goldBtn}>Set Goal</button>
        </div>
        {savingGoal > 0 && (
          <div style={{ marginTop: 16 }}>
            <ProgressBar pct={savingGoalPct} color={savingGoalPct >= 100 ? T.emerald : T.amber} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginTop: 8, color: T.textDim }}>
              <span>Saved so far: <b style={{ color: T.amber }}>{formatINR(saved)}</b></span>
              <span>Goal: <b style={{ color: T.amber }}>{formatINR(savingGoal)}</b></span>
            </div>
            {saved >= savingGoal && (
              <div style={{ marginTop: 12, background: T.emeraldSoft, border: "1px solid rgba(52,211,153,0.3)", color: T.emerald, fontSize: 13, borderRadius: 12, padding: "10px 16px" }}>
                🎉 Badhai ho! Goal achieve kar liya
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Monthly comparison */}
      <Card title={t('monthlyComp')}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, textAlign: "center" }}>
          <div style={{ background: T.fieldBg, borderRadius: 12, padding: "16px 0" }}>
            <p style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>🔥 {savingStreak}</p>
            <p style={{ margin: "4px 0 0 0", fontSize: 12, color: T.textDim }}>Saving Streak (months)</p>
          </div>
          <div style={{ background: T.fieldBg, borderRadius: 12, padding: "16px 0" }}>
            <p style={{ margin: 0, fontSize: 24, fontWeight: 700, color: diffFromLastMonth == null ? T.textFaint : diffFromLastMonth >= 0 ? T.emerald : T.rose }}>
              {diffFromLastMonth == null ? "—" : `${diffFromLastMonth >= 0 ? "-" : "+"}${formatINR(Math.abs(diffFromLastMonth))}`}
            </p>
            <p style={{ margin: "4px 0 0 0", fontSize: 12, color: T.textDim }}>Difference from Last Month</p>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, fontSize: 14 }}>
          <span style={{ color: T.textDim }}>Last month's expense</span>
          <input
            type="number"
            defaultValue={lastMonthExpense || ""}
            onBlur={(e) => setLastMonthExpense(Number(e.target.value) || 0)}
            style={{ ...S.input, width: 128 }}
          />
        </div>
        {diffFromLastMonth != null && (
          <div style={{ marginTop: 16, fontSize: 13, borderRadius: 12, padding: "12px 16px", background: diffFromLastMonth >= 0 ? T.emeraldSoft : T.roseSoft, color: diffFromLastMonth >= 0 ? T.emerald : T.rose, border: `1px solid ${diffFromLastMonth >= 0 ? "rgba(52,211,153,0.3)" : "rgba(251,113,133,0.3)"}` }}>
            {diffFromLastMonth >= 0
              ? `✅ Is mahine aapne pichle mahine se ${formatINR(diffFromLastMonth)} kam kharcha kiya — badhiya ja rahe ho!`
              : `⚠️ Is mahine aapne pichle mahine se ${formatINR(Math.abs(diffFromLastMonth))} zyada kharcha kiya.`}
          </div>
        )}
      </Card>

      {/* Spending trend chart */}
      <Card title={t('chartTitle')} subtitle="Pichle mahino ke mukable is mahine ka kharcha">
        <MonthlyBarChart data={[...monthlyHistory, { month: thisMonth, income, spent: totalSpent }]} />
        <div style={{ display: "flex", gap: 16, marginTop: 12, fontSize: 12, color: T.textDim }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: "#ec4899" }} /> Kharcha</span>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: "#22d3ee" }} /> Income</span>
        </div>
      </Card>

      {/* WhatsApp share */}
      <Card title="Share your savings" subtitle="Send a summary of savings to your family or yourself on WhatsApp">
        <button onClick={handleWhatsAppShare} style={{ width: "100%", background: "#22c55e", color: "#06210f", fontWeight: 700, border: "none", borderRadius: 12, padding: "13px 0", fontSize: 14, cursor: "pointer" }}>
          📤 WhatsApp Par Share Karein
        </button>
      </Card>

      {/* Budget alert */}
      <Card title={t('budgetTitle')} subtitle="Set budget for category, get warned at 80%">
        <div style={S.col}>
          <input value={budgetCategory} onChange={(e) => setBudgetCategory(e.target.value)} placeholder="Category" list="tracker-categories" style={S.input} />
          <datalist id="tracker-categories">
            {categories.map((c) => <option key={c} value={c} />)}
          </datalist>
          <input type="number" value={budgetAmount} onChange={(e) => setBudgetAmount(e.target.value)} placeholder="₹ Budget" style={S.input} />
          <button onClick={handleSetBudget} style={S.gradientBtn}>Set Budget</button>
        </div>
        {categories.filter((c) => budgets[c]).length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 20 }}>
            {categories.filter((c) => budgets[c]).map((cat) => {
              const spent = categoryTotals[cat] || 0;
              const limit = budgets[cat];
              const pct = Math.min(Math.round((spent / limit) * 100), 100);
              const over = spent >= limit;
              const near = !over && spent / limit >= 0.8;
              return (
                <div key={cat}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                    <span>{cat}</span>
                    <span style={{ color: T.textDim }}>{formatINR(spent)} / {formatINR(limit)}</span>
                  </div>
                  <ProgressBar pct={pct} thin color={over ? T.rose : near ? T.amber : T.emerald} />
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Yearly projection */}
      <Card title="Yearly projection">
        <p style={{ fontSize: 32, fontWeight: 700, color: T.amber, textAlign: "center", margin: 0 }}>{formatINR(yearlyProjection)}</p>
        <p style={{ fontSize: 13, color: T.textDim, textAlign: "center", margin: "4px 0 0 0" }}>At this rate, you can save this much in a year</p>
        <div style={{ marginTop: 16, background: T.fieldBg, border: `1px solid ${T.fieldBorder}`, borderRadius: 12, padding: "12px 16px", fontSize: 13, color: T.textDim, lineHeight: 1.5 }}>
          {formatINR(yearlyProjection)} — itne mein aap naya investment ya bada saving goal poora kar sakte hain!
        </div>
      </Card>

      {/* Achievements */}
      <Card title={t('achievementsTitle')}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
          {achievements.map((a) => (
            <div key={a.key} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", borderRadius: 12, padding: "20px 8px", border: `1px solid ${a.unlocked ? "rgba(245,179,1,0.5)" : T.fieldBorder}`, background: a.unlocked ? T.amberSoft : T.fieldBg, opacity: a.unlocked ? 1 : 0.4 }}>
              <span style={{ fontSize: 22, marginBottom: 8 }}>{a.icon}</span>
              <span style={{ fontSize: 11, fontWeight: 500 }}>{a.label}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Day-wise heatmap */}
      <Card title={`📅 Din-wise kharcha — ${monthLabel(thisMonth)}`}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 6 }}>
          {dayWise.map(({ day, total }) => {
            const intensity = total === 0 ? 0 : Math.ceil((total / maxDay) * 3);
            const bg = [T.fieldBg, "#312e81", "#4338ca", T.amber][intensity];
            const fg = intensity === 3 ? "#171100" : T.text;
            const dayDateStr = `${thisMonth}-${pad(day)}`;
            return (
              <div 
                key={day} 
                onClick={() => setSelectedHeatmapDate(selectedHeatmapDate === dayDateStr ? null : dayDateStr)}
                title={formatINR(total)} 
                style={{ aspectRatio: "1", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, background: selectedHeatmapDate === dayDateStr ? T.gold : bg, color: selectedHeatmapDate === dayDateStr ? "#000" : fg, cursor: "pointer", border: selectedHeatmapDate === dayDateStr ? "2px solid #fff" : "none" }}
              >
                {day}
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 16, fontSize: 12, color: T.textDim }}>
          <span>Low</span>
          {[T.fieldBg, "#312e81", "#4338ca", T.amber].map((c) => (
            <span key={c} style={{ width: 16, height: 16, borderRadius: 4, background: c }} />
          ))}
          <span>High</span>
        </div>
        {selectedHeatmapDate && (
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${T.fieldBorder}` }}>
            <p style={{ margin: "0 0 12px 0", fontSize: 14, fontWeight: 600, color: T.text }}>Kharche for {selectedHeatmapDate}:</p>
            {expenses.filter((e: any) => e.date === selectedHeatmapDate).length === 0 ? (
              <p style={{ fontSize: 12, color: T.textDim }}>No kharcha on this date.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {expenses.filter((e: any) => e.date === selectedHeatmapDate).map((e: any) => (
                  <div key={e.id} style={{ display: "flex", justifyContent: "space-between", background: "rgba(255,255,255,0.05)", padding: "8px 12px", borderRadius: 8, fontSize: 13 }}>
                    <span>{e.category}</span>
                    <span style={{ color: T.rose }}>{formatINR(e.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Expense list */}
      

      {/* Report download */}
      <Card title={t('reportTitle')} subtitle="Full month's account in a PDF report — for your record or CA">
        <div style={S.row}>
          <button onClick={exportExcel} style={{ flex: 1, background: T.emeraldSoft, border: "1px solid rgba(52,211,153,0.3)", color: T.emerald, borderRadius: 12, padding: "13px 0", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
            Excel Download
          </button>
          <button onClick={exportPDF} style={{ ...S.gradientBtn, flex: 1 }}>⬇️ PDF Report Download Karein</button>
        </div>
      </Card>
    </div>
  );
}

// ---- building blocks ----
function Card({ title, subtitle, children }: any) {
  return (
    <div style={S.card}>
      <p style={S.cardTitle}>{title}</p>
      {subtitle ? <p style={S.cardSubtitle}>{subtitle}</p> : <div style={{ marginBottom: 16 }} />}
      {children}
    </div>
  );
}
function Stat({ label, value, color }: any) {
  return (
    <div>
      <p style={{ margin: 0, fontSize: 24, fontWeight: 700, color }}>{value}</p>
      <p style={{ margin: "4px 0 0 0", fontSize: 12, color: T.textDim }}>{label}</p>
    </div>
  );
}
function ProgressBar({ pct, color = T.amber, thin = false }: any) {
  return (
    <div style={{ width: "100%", background: "rgba(255,255,255,0.06)", borderRadius: 999, overflow: "hidden", height: thin ? 6 : 10 }}>
      <div style={{ height: "100%", width: `${pct}%`, background: color, transition: "width 0.3s" }} />
    </div>
  );
}
function SegmentedBar({ segments, total }: any) {
  return (
    <div style={{ width: "100%", height: 10, background: "rgba(255,255,255,0.06)", borderRadius: 999, overflow: "hidden", display: "flex" }}>
      {segments.map((s: any, i: number) => (
        <div key={i} style={{ width: `${(s.value / total) * 100}%`, background: s.color }} />
      ))}
    </div>
  );
}
function Donut({ segments, total, centerLabel, centerSub }: any) {
  let cumulative = 0;
  const gradientParts = segments.map((s: any) => {
    const start = (cumulative / total) * 360;
    cumulative += s.value;
    const end = (cumulative / total) * 360;
    return `${s.color} ${start}deg ${end}deg`;
  });
  return (
    <div style={{ width: 192, height: 192, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: `conic-gradient(${gradientParts.join(",")})` }}>
      <div style={{ width: 128, height: 128, borderRadius: "50%", background: T.card, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 20, fontWeight: 700 }}>{centerLabel}</span>
        <span style={{ fontSize: 12, color: T.textDim, marginTop: 4 }}>{centerSub}</span>
      </div>
    </div>
  );
}
function MonthlyBarChart({ data }: any) {
  const [activeChartPop, setActiveChartPop] = React.useState<number | null>(null);
  const width = 320;
  const height = 180;
  const padding = { top: 10, right: 10, bottom: 24, left: 36 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const maxVal = Math.max(...data.flatMap((d: any) => [d.spent, d.income]), 1);
  const groupW = chartW / data.length;
  const barW = Math.min(groupW / 3, 18);
  const yTicks = 4;

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", minWidth: Math.max(width, data.length * 70), background: T.fieldBg, borderRadius: 12 }}>
        {Array.from({ length: yTicks + 1 }, (_, i) => {
          const y = padding.top + (chartH / yTicks) * i;
          const val = Math.round(maxVal - (maxVal / yTicks) * i);
          return (
            <g key={i}>
              <line x1={padding.left} x2={width - padding.right} y1={y} y2={y} stroke="rgba(255,255,255,0.08)" />
              <text x={padding.left - 6} y={y + 3} textAnchor="end" fontSize="8" fill="rgba(255,255,255,0.45)">
                {val >= 1000 ? `${Math.round(val / 1000)}k` : val}
              </text>
            </g>
          );
        })}
        {data.map((d: any, i: number) => {
          const groupX = padding.left + i * groupW;
          const spentH = (d.spent / maxVal) * chartH;
          const incomeH = (d.income / maxVal) * chartH;
          const label = /^\d{4}-\d{2}$/.test(d.month) ? monthLabel(d.month) : d.month;
          return (
            <g key={i} onClick={() => setActiveChartPop(activeChartPop === i ? null : i)} style={{ cursor: "pointer" }}>
              <rect x={groupX + groupW / 2 - barW - 2} y={padding.top + chartH - spentH} width={barW} height={Math.max(spentH, 0)} rx="3" fill="#ec4899" />
              <rect x={groupX + groupW / 2 + 2} y={padding.top + chartH - incomeH} width={barW} height={Math.max(incomeH, 0)} rx="3" fill="#22d3ee" />
              <text x={groupX + groupW / 2} y={height - 6} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.5)">
                {label}
              </text>
              {activeChartPop === i && (
                <g>
                  <rect x={groupX + groupW / 2 - 40} y={height - 70} width={80} height={40} rx={4} fill="#1e293b" stroke="#334155" />
                  <text x={groupX + groupW / 2} y={height - 54} textAnchor="middle" fontSize="10" fill="#ec4899">Kharcha: {formatINR(d.spent)}</text>
                  <text x={groupX + groupW / 2} y={height - 40} textAnchor="middle" fontSize="10" fill="#22d3ee">Income: {formatINR(d.income)}</text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}