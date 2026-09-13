import io

with io.open('app/dashboard/reports/page.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Make the app container expand to full dashboard width, not a tiny 412px phone column
text = text.replace('max-width:412px;', 'max-width:1200px;')

# Make the KPI grid responsive: 4 columns on desktop, 2 on mobile
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

# Make bottom-grid responsive: 2 columns on desktop, 1 on mobile
text = text.replace('grid-template-columns: 1fr;', 'grid-template-columns: 1.2fr 1fr;')
if '@media(max-width:768px)' not in text:
    text = text.replace('grid-template-columns: 1.2fr 1fr;', 'grid-template-columns: 1.2fr 1fr; }\n@media(max-width:768px){ .bottom-grid{grid-template-columns:1fr} }')

with io.open('app/dashboard/reports/page.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Made layout responsive for desktop")
