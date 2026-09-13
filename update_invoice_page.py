import re

with open('app/dashboard/invoices/new/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

replacements = [
    (r'<div className="qa-title">USB Scanner</div>', r'<div className="qa-title">{t.usbScanner || \'USB Scanner\'}</div>'),
    (r'<div className="qa-title">Camera</div>', r'<div className="qa-title">{t.camera || \'Camera\'}</div>'),
    (r'<div className="qa-title">Inventory</div>', r'<div className="qa-title">{t.inventory || \'Inventory\'}</div>'),
    (r'Select Customer \(\+ New\)', r'{t.selectCustomer || \'Select Customer (+ New)\'}')
]

for old, new in replacements:
    code = re.sub(old, new, code)

with open('app/dashboard/invoices/new/page.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
