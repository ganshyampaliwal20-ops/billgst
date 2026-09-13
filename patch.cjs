const fs = require('fs');
let code = fs.readFileSync('f:/bill/phase1_final.tsx', 'utf8');

// 1. Replace income state with incomes array
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

// 2. Update handleAddIncome
code = code.replace(
  /const handleAddIncome = \(\) => {[\s\S]*?setIncomeInput\(""\);\n  };/,
  `const handleAddIncome = () => {
    const val = Number(incomeInput);
    if (!val || val <= 0) return;
    setIncomes((prev: any[]) => [...prev, { id: uid(), source: incomeSource.trim() || 'Income', amount: val, date: incomeDate }]);
    setIncomeInput("");
    setIncomeSource("");
  };
  const handleRemoveIncome = (id: string) => {
    setIncomes((prev: any[]) => prev.filter(i => i.id !== id));
  };`
);

// 3. Update onChange to pass incomes
code = code.replace(
  /onChange\(\{ income, expenses,/g,
  'onChange({ income, incomes, expenses,'
);
code = code.replace(
  /\[income, expenses,/g,
  '[income, incomes, expenses,'
);

// 4. Update Income UI
code = code.replace(
  /<Card title="Income \/ Salary">[\s\S]*?<button onClick={handleAddIncome} style={S\.goldBtn}>Add<\/button>\n        <\/div>/,
  `<Card title="Income / Salary">
        <div style={S.col}>
          <input value={incomeSource} onChange={(e) => setIncomeSource(e.target.value)} placeholder="Income Source (e.g. Salary, Rent)" style={S.input} />
          <input type="number" value={incomeInput} onChange={(e) => setIncomeInput(e.target.value)} placeholder="₹ Amount" style={S.input} />
          <input type="date" value={incomeDate} onChange={(e) => setIncomeDate(e.target.value)} style={S.input} />
          <button onClick={handleAddIncome} style={S.goldBtn}>Add Income</button>
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
                  <button onClick={() => handleRemoveIncome(inc.id)} style={S.smallDelete}>Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}`
);

// 5. Move Expense List
const expenseListRegex = /<Card title="Chuni gayi tareekhon ke kharche">[\s\S]*?<\/Card>/;
const expenseListMatch = code.match(expenseListRegex);
if (expenseListMatch) {
  const expenseListCode = expenseListMatch[0];
  code = code.replace(expenseListCode, ''); 
  
  const addExpenseRegex = /<Card title="Naya kharcha jode">[\s\S]*?<\/Card>/;
  code = code.replace(addExpenseRegex, match => match + '\n\n      ' + expenseListCode);
}

fs.writeFileSync('f:/bill/app/dashboard/kharcha-tracker/KharchaTrackerAdvanced.tsx', code);
