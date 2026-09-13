import io

with io.open('app/dashboard/reports/page.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

missing_vars = """
    --white: #ffffff;
    --faint: #f5f7fd;
    --indigo: #4f46e5;
    --indigo-soft: rgba(79,70,229,0.1);
    --green: #10b981;
    --green-soft: rgba(16,185,129,0.1);
    --amber: #f59e0b;
    --amber-soft: rgba(245,158,11,0.1);
    --orange: #f97316;
    --shadow: 0 2px 16px rgba(11,15,30,0.07), 0 1px 4px rgba(11,15,30,0.04);
"""

# Insert missing vars into :root
root_end = text.find('}', text.find(':root'))
text = text[:root_end] + missing_vars + text[root_end:]

# Fix layout
text = text.replace('max-width:412px;', 'max-width:1200px;')

old_kpi = """  .kpi-grid{
    display:grid;
    grid-template-columns:1fr 1fr;
    gap:10px;
    margin-bottom:22px;
  }"""
new_kpi = """  .kpi-grid{
    display:grid;
    grid-template-columns: repeat(4, 1fr);
    gap:10px;
    margin-bottom:22px;
  }
  @media(max-width: 900px) {
    .kpi-grid { grid-template-columns: repeat(2, 1fr); }
  }"""
text = text.replace(old_kpi, new_kpi)

with io.open('app/dashboard/reports/page.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Patched correctly")
